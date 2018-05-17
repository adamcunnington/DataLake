import importlib

import flask

from datalake import api, app, models
from datalake.api import decorators


_DEFAULT = object()


@api.api_blueprint.route("/schedules/", methods=["POST"])
@decorators.to_json
def create_scheduled_execution():
    data = flask.request.get_json(force=True)
    execution, acquires, extract = data["execution"], data["acquires"], data["extract"]
    params = {}
    for k in ("name", "next_scheduled", "client_name", "data_set_name", "load_date", "enabled", "user", "schedule_end",
              "interval_mi", "interval_hh", "interval_dd", "monday_enabled", "tuesday_enabled", "wednesday_enabled",
              "thursday_enabled", "friday_enabled", "saturday_enabled", "sunday_enabled", "acquire_program_key"):
        value = execution.get(k, _DEFAULT)
        if value is not _DEFAULT:
            params[k] = value
    for k in ("extract_destination", "extract_data_source_name", "extract_options"):
        value = extract.get(k, _DEFAULT)
        if value is not _DEFAULT:
            params[k] = value
    with models.db.engine() as transaction:
        result, _ = models.insert_scheduled_execution(transaction, **params)
        scheduled_execution_key = result["ScheduledExecutionKey"]
        for acquire in acquires:
            models.insert_scheduled_acquire(transaction, scheduled_execution_key, acquire.get("name"),
                                            acquire.get("options"))


@api.api_blueprint.route("/execute", methods=["POST"])
@decorators.to_json
def execute():
    data = flask.request.get_json(force=True)
    app.execute(data)


@api.api_blueprint.route("/acquire-programs/", methods=["GET"])
@decorators.to_json
def get_acquire_programs():
    acquire_programs = {}
    for row in models.get_acquire_programs():
        key = row["AcquireProgramKey"]
        acquire_program = acquire_programs.get(key)
        if acquire_program is None:
            acquire_programs[key] = {
                "AcquireProgramKey": key,
                "AcquireProgramPythonName": row["AcquireProgramPythonName"],
                "AcquireProgramFriendlyName": row["AcquireProgramFriendlyName"],
                "AcquireProgramDataSourceName": row["AcquireProgramDataSourceName"],
                "AcquireProgramEnabled": row["AcquireProgramEnabled"],
                "Options": []
            }
            option_name = row["AcquireProgramOptionName"]
        if option_name is not None:
            acquire_programs[key].append({"AcquireProgramOptionName": option_name,
                                          "AcquireProgramOptionRequired": row["AcquireProgramOptionRequired"]})
    return {"data": acquire_programs.values()}


@api.api_blueprint.route("/executions/", methods=["GET"])
@decorators.to_json
def get_executions():
    params = {}
    for k in ("page_number", "page_size"):
        value = flask.request.args.get(k)
        if k is not None:
            params[k] = value
    result = models.get_executions(**params)


@api.api_blueprint.route("/extension/<int:key>", methods=["GET"])
@decorators.to_json
def get_execution(key):
    result = models.get_execution(key)


@api.api_blueprint.route("/extract-programs/", methods=["GET"])
@decorators.to_json
def get_extract_programs():
    response = {"data": []}
    for python_name, friendly_name in (("extract-azure-sql", "Azure SQL")):
        program = importlib.import_module("datalake.extract.%s" % python_name)
        response["data"].append({
            "ExtractProgramPythonName": python_name,
            "ExtractProgramFriendlyName": friendly_name,
            "Options": [
                {
                    "ExtractProgramOptionName": max(option.opts, key=len),
                    "ExtractProgramOptionRequired": option.required
                }
                for option in program.main.params
            ]
        })
    return response



@api.api_blueprint.route("/schedules/", methods=["GET"])
@decorators.to_json
def get_scheduled_executions():
    params = {}
    for k in ("page_number", "page_size"):
        value = flask.request.args.get(k)
        if k is not None:
            params[k] = value
    result = models.get_scheduled_executions(**params)


@api.api_blueprint.route("/schedules/<int:key>", metods=["GET"])
@decorators.to_json
def get_scheduled_execution(key):
    result = models.get_scheduled_execution(key)


@api.api_blueprint.route("/executions/retry", methods=["POST"])
@decorators.to_json
def retry_executions():
    for key in flask.request.get_json(force=True)["keys"]:
        rows = models.get_execution(key)
        arbitrary_row = rows[0]
        details = {
            "execution": {
                "scheduled_execution_key": arbitrary_row["ScheduledExecutionKey"],
                "acquire_program_key": arbitrary_row["AcquireProgramKey"],
                "client_name": arbitrary_row["ExecutionClientName"],
                "data_source_name": arbitrary_row["ExecutionDataSourceName"],
                "data_set_name": arbitrary_row["ExecutionDataSetName"],
                "load_date": arbitrary_row["ExecutionLoadDate"],
                "ad_hoc_user": arbitrary_row["ExecutionAdHocUser"]
            },
            "acquires": [],
            "extract": {
                "extract_destination": arbitrary_row["ExtractDestination"],
                "options": {}
            } if arbitrary_row["ExtractKey"] is not None else {}
        }
        acquires = {}
        for row in rows:
            acquire_key = row["AcquireKey"]
            if acquire_key is not None:
                acquire = acquires.get(acquire_key)
                if acquire is None:
                    acquires[acquire_key] = {"options": {}}
                    acquire_option_name = row["AcquireOptionName"]
                    if acquire_option_name is not None:
                        acquire["options"][row["AcquireOptionName"]] = row["AcquireOptionValue"]
            extract_option_name = row["ExtractOptionName"]
            if extract_option_name is not None:
                details["extract"]["options"][extract_option_name] = row["ExtractOptionValue"]
        details["acquires"].extend(acquires.values())
        app.execute(details)


@api.api_blueprint.route("/schedules/<int:key>", methods=["PUT"])
@decorators.to_json
def update_scheduled_execution(key):
    data = flask.request.get_json(force=True)
    execution, acquires, extract = data["execution"], data["acquires"], data["extract"]
    params = {}
    for k in ("name", "next_scheduled", "client_name", "data_set_name", "load_date", "enabled", "user", "schedule_end",
              "interval_mi", "interval_hh", "interval_dd", "monday_enabled", "tuesday_enabled", "wednesday_enabled",
              "thursday_enabled", "friday_enabled", "saturday_enabled", "sunday_enabled", "acquire_program_key"):
        value = execution.get(k, _DEFAULT)
        if value is not _DEFAULT:
            params[k] = value
    for k in ("extract_destination", "extract_data_source_name", "extract_options"):
        value = extract.get(k, _DEFAULT)
        if value is not _DEFAULT:
            params[k] = value
    with models.db.engine() as transaction:
        result, _, _ = models.update_scheduled_execution(transaction, key, **params)
        _ = models.delete_scheduled_acquires(transaction, key)
        for acquire in acquires:
            models.insert_scheduled_acquire(transaction, key, acquire.get("name"), acquire.get("options"))
