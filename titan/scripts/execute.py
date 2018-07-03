import os

import json
import subprocess

from titan import models
import titan


def _execute_program(flask_app, program, end_log_function, log_key, options=(), timeout=None):
    error_message = None
    args = [program]
    for item in options:
        args.extend(item.values())
    try:
        subprocess.run(args, stderr=subprocess.PIPE, check=True, timeout=timeout)
    except subprocess.CalledProcessError as called_process_error:
        error_message = "PROGRAM ERROR: %s" % called_process_error.stderr.decode(encoding="utf8")
    except OSError as os_error:
        error_message = "INTERNAL ERROR: %s" % str(os_error)
    except subprocess.TimeoutExpired as timeout_error:
        error_message = "TIMEOUT EXPIRED: %s" % str(timeout_error)
    except Exception as error:
        error_message = "%s: %s" %(type(error).__name__, str(error))
    finally:
        _call_models_function(flask_app, end_log_function, log_key, error_message=error_message)
    return error_message is None


def _call_models_function(flask_app, func, *args, **kwargs):
    with flask_app.app_context():
        return func(*args, **kwargs)


def _process_acquire(flask_app, execution_key, acquire_program, acquire):
    acquire["ExecutionKey"] = execution_key
    acquire_key = _call_models_function(flask_app, models.start_acquire_log, acquire)[0]["AcquireKey"]
    return _execute_program(flask_app, acquire_program, models.end_acquire_log, acquire_key,
                            options=acquire.get("Options", []),
                            timeout=flask_app.config.get("TITAN_ACQUIRE_TIMEOUT_SECONDS"))


def _process_acquires(flask_app, data):
    execution = data["execution"]
    acquire_program_key = execution.get("AcquireProgramKey")
    acquire_programs = {row["AcquireProgramKey"]: row["AcquireProgramPythonName"]
                        for row in _call_models_function(flask_app, models.get_acquire_programs)}
    acquire_program = acquire_programs[acquire_program_key]
    acquires = data["acquires"]
    success_states = set()
    for acquire in acquires:
        success_states.add(_process_acquire(flask_app, execution["ExecutionKey"], acquire_program, acquire=acquire))
    return all(success_states)


def _process_extract(flask_app, execution_key, data):
    extract = data["extract"]
    extract["ExecutionKey"] = execution_key
    extract_key = extract["ExtractKey"] = _call_models_function(flask_app, models.start_extract_log,
                                                                extract)[0]["ExtractKey"]
    os.putenv("TITAN_STDIN", json.dumps(data))  # ExtractKey must be accessible from the extract program
    return _execute_program(flask_app, extract.get("ExtractDestination"), models.end_extract_log, extract_key,
                            options=extract.get("Options", []),
                            timeout=flask_app.config.get("TITAN_EXTRACT_TIMEOUT_SECONDS"))


def main():
    flask_app = titan.create_app("execute")
    data = json.loads(os.getenv("TITAN_STDIN"))
    execution = data["execution"]
    execution_key = execution["ExecutionKey"]
    error = None
    all_acquires_succeeded = True
    try:
        if data.get("acquires"):
            flask_app.logger.info("Processing acquires...")
            all_acquires_succeeded = _process_acquires(flask_app, data)
        if data.get("extract") and all_acquires_succeeded:
            flask_app.logger.info("Processing extract...")
            _process_extract(flask_app, execution_key, data)
    except Exception as exception:
        error = exception
    finally:
        error_message = str(error) if error is not None else None
        _call_models_function(flask_app, models.end_execution_log, execution_key, error_message=error_message)
        flask_app.logger.info("Ending execution log")
        if error is not None:
            raise error
