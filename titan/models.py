import flask_sqlalchemy
import sqlalchemy


_DEFAULT = object()

db = flask_sqlalchemy.SQLAlchemy()


def _execute_stored_procedure(transaction, name, params=None, output_params=None):
    sql_text = "EXEC %s " % name
    sql_text += ", ".join("@%s=:%s" % (param, param) for param in params)
    if output_params:
        name_types = output_params.items()
        sql_text_prefix = "DECLARE "
        sql_text_prefix += ", ".join("@%s %s" % (name, _type) for name, _type in name_types) + ";"

        sql_text_suffix = ", " if params else ""
        sql_text_suffix += ", ".join("@%s=@%s OUT" % (name, name) for name, _ in name_types) + ";"
        sql_text_suffix += "SELECT "
        sql_text_suffix += ", ".join("@%s AS %s" % (name, name) for name, _ in name_types)

        sql_text = sql_text_prefix + sql_text + sql_text_suffix
    result = transaction.execute(sqlalchemy.text(sql_text), **params)
    return result


def _insert_acquire_program_options(transaction, acquire_program_key, options=()):
    results = []
    output_params = {"AcquireProgramOptionKey": "INT"}
    for option in options:
        option["AcquireProgramKey"] = acquire_program_key
        results.append(_execute_stored_procedure(transaction, "config.SP_InsertAcquireProgramOption", option,
                                                 output_params).fetchone())
    return results


def _insert_scheduled_extract_options(transaction, scheduled_extract_key, options=()):
    results = []
    output_params = {"ScheduledExtractOptionKey": "INT"}
    for option in options:
        option["ScheduledExtractKey"] = scheduled_extract_key
        results.append(_execute_stored_procedure(transaction, "config.SP_InsertScheduledExtractOption", option,
                                                 output_params).fetchone())
    return results


def delete_scheduled_acquires(transaction, scheduled_execution_key):
    output_params = {"ScheduledAcquireDeleteRowCount": "INT",  "ScheduledAcquireOptionDeleteRowCount": "INT"}
    return _execute_stored_procedure(transaction, "config.SP_DeleteScheduledAcquires", scheduled_execution_key,
                                     output_params).fetchone()


def end_acquire_log(key, error_message=None):
    params = {"AcquireKey": key, "AcquireErrorMessage": error_message}
    output_params = {"UpdateRowCount": "INT"}
    with db.engine.begin() as transaction:
        result = _execute_stored_procedure(transaction, "[log].SP_EndAcquireLog", params, output_params).fetchone()
    return result


def end_execution_log(key, error_message=None):
    with db.engine.begin() as transaction:
        result = _execute_stored_procedure(transaction, "[log].SP_EndExecutionLog",
                                           {"ExecutionKey": key, "ExecutionErrorMessage": error_message},
                                           {"ExecutionLogUpdateRowCount": "INT",
                                            "ScheduledExecutionUpdateRowCount": "INT"}).fetchone()
    return result


def end_extract_log(key, error_message=None):
    with db.engine.begin() as transaction:
        result = _execute_stored_procedure(transaction, "[log].SP_EndExtractLog",
                                           {"ExtractKey": key, "ExtractErrorMessage": error_message},
                                           {"UpdateRowCount": "INT"}).fetchone()
    return result


def get_acquire_programs():
    return list(db.engine.execute("SELECT * FROM config.VWAcquirePrograms"))


def get_execution(key):
    return list(db.engine.execute(sqlalchemy.text("SELECT * FROM config.UDF_GetExecution(:key)"), key=key))


def get_executions(end_date=None, page_number=1, page_size=100, load_date_count=5):
    return list(db.engine.execute(sqlalchemy.text("SELECT * FROM config.UDF_GetExecutions(:end_date, :page_number, "
                                                  ":page_size, :load_date_count)"),
                                  end_date=end_date, page_number=page_number, page_size=page_size,
                                  load_date_count=load_date_count))


def get_running_container_groups():
    return list(db.engine.execute("SELECT * FROM [log].VWRunningContainerGroups"))


def get_scheduled_execution(key):
    return list(db.engine.execute(sqlalchemy.text("SELECT * FROM config.UDF_GetScheduledExecution(:key)"), key=key))


def get_scheduled_executions(page_number=1, page_size=100):
    return list(db.engine.execute(sqlalchemy.text("SELECT * FROM config.UDF_GetScheduledExecutions(:page_number, "
                                                  ":page_size)"), page_number=page_number, page_size=page_size))


def get_queue(max_items=None):
    params = {} if max_items is None else {"MaxItems": max_items}
    with db.engine.begin() as transaction:
        return list(_execute_stored_procedure(transaction, "dbo.SP_GetQueue", params))


def insert_acquire_program(acquire_program):
    options = acquire_program.pop("Options", ())
    with db.engine.begin() as transaction:
        result = _execute_stored_procedure(transaction, "config.SP_InsertAcquireProgram", acquire_program,
                                           {"AcquireProgramKey": "INT"}).fetchone()
        option_results = _insert_acquire_program_options(transaction, result["AcquireProgramKey"], options)
    return result, option_results


def insert_scheduled_acquire(transaction, acquire):
    option_results = []
    option_output_params = {"ScheduledAcquireOptionKey": "INT"}
    options = acquire.pop("Options", ())
    result = _execute_stored_procedure(transaction, "config.SP_InsertScheduledAcquire", acquire,
                                       {"ScheduledAcquireKey": "INT"}).fetchone()
    scheduled_acquire_key = result["ScheduledAcquireKey"]
    for option in options:
        option["ScheduledAcquireKey"] = scheduled_acquire_key
        option_results.append(_execute_stored_procedure(transaction, "config.SP_InsertScheduledAcquireOption",
                                                        option, option_output_params).fetchone())
    return result, option_results


def insert_scheduled_execution(transaction, execution, extract):
    execution_output_params = {"ScheduledExecutionKey": "INT", "ScheduledExtractKey": "INT"}
    options = extract.pop("Options", ())
    execution["ScheduledExtractDestination"] = extract.pop("ScheduledExtractDestination")
    result = _execute_stored_procedure(transaction, "config.SP_InsertScheduledExecution", execution,
                                       execution_output_params).fetchone()
    option_results = _insert_scheduled_extract_options(transaction, result["ScheduledExtractKey"], options)
    return result, option_results


def start_acquire_log(acquire):
    option_results = []
    option_output_params = {"AcquireOptionKey": "INT"}
    options = acquire.pop("Options", ())
    with db.engine.begin() as transaction:
        result = _execute_stored_procedure(transaction, "[log].SP_StartAcquireLog", acquire,
                                           {"AcquireKey": "INT"}).fetchone()
        acquire_key = result["AcquireKey"]
        for option in options:
            option["AcquireKey"] = acquire_key
            option_results.append(_execute_stored_procedure(transaction, "[log].SP_InsertAcquireOptionLog",
                                                            option, option_output_params).fetchone())
    return result, option_results


def start_execution_log(execution):
    output_params = {"ExecutionKey": "INT", "ExecutionVersion": "INT"}
    with db.engine.begin() as transaction:
        result = _execute_stored_procedure(transaction, "[log].SP_StartExecutionLog", execution, output_params).fetchone()
    return result


def start_extract_log(extract):
    option_results = []
    option_output_params = {"ExtractOptionKey": "INT"}
    options = extract.pop("Options", ())
    with db.engine.begin() as transaction:
        result = _execute_stored_procedure(transaction, "[log].SP_StartExtractLog", extract,
                                           {"ExtractKey": "INT"}).fetchone()
        extract_key = result["ExtractKey"]
        for option in options:
            option["ExtractKey"] = extract_key
            option_results.append(_execute_stored_procedure(transaction, "[log].SP_InsertExtractOptionLog",
                                                            option, option_output_params).fetchone())
    return result, option_results


def update_acquire_program(acquire_program):
    delete_result = None
    option_results = None
    update_output_params = {"UpdateRowCount": "INT", "DisabledScheduledExecutionsCount": "INT"}
    options = acquire_program.get("Options", _DEFAULT)
    with db.engine.begin() as transaction:
        update_result = _execute_stored_procedure(transaction, "config.SP_UpdateAcquireProgram", acquire_program,
                                                  update_output_params).fetchone()
        if options is not _DEFAULT:
            key_param = {"AcquireProgramKey": acquire_program.get("AcquireProgramKey")}
            delete_result = _execute_stored_procedure(transaction, "config.SP_DeleteAcquireProgramOptions", key_param,
                                                      {"DeleteRowCount": "INT"}).fetchone()
            option_results = _insert_acquire_program_options(transaction, key_param, options)
    return update_result, delete_result, option_results


def update_scheduled_execution(transaction, execution, extract):
    delete_result = None
    option_results = None
    update_output_params = {
        "ScheduledExecutionUpdateRowCount": "INT",
        "ScheduledExtractUpdateRowCount": "INT",
        "ScheduledExtractDeleteRowCount": "INT",
        "ScheduledExtractKey": "INT"
    }
    options = extract.pop("Options", _DEFAULT)
    execution.update(extract)
    result = _execute_stored_procedure(transaction, "config.SP_UpdateScheduledExecution", execution,
                                       update_output_params).fetchone()
    if options is not _DEFAULT:
        key_param = {"ScheduledExtractKey": result["ScheduledExtractKey"]}
        delete_result = _execute_stored_procedure(transaction, "config.SP_DeleteScheduledExtractOptions",
                                                  key_param, {"DeleteRowCount": "INT"}).fetchone()
        option_results = _insert_scheduled_extract_options(transaction, key_param, options)
    return result, delete_result, option_results
