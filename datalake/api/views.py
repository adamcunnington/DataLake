import importlib

import flask

from datalake import api, app, models
from datalake.api import decorators


@api.api_blueprint.route("/execute", methods=["POST"])
@decorators.to_json
def execute():
    data = flask.request.get_json(force=True).get("data", {"execution": {}, "acquires": [], "extract": {}})
    app.execute(data)
    return {}, 201, None


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
            acquire_programs[key]["Options"].append({
                "AcquireProgramOptionName": option_name,
                "AcquireProgramOptionRequired": row["AcquireProgramOptionRequired"]}
            )
    return {"data": list(acquire_programs.values())}


@api.api_blueprint.route("/executions/<int:key>", methods=["GET"])
@decorators.to_json
def get_execution(key):
    rows = models.get_execution(key)
    arbitrary_row = rows[0]
    extract_key = arbitrary_row["ExtractKey"]
    details = {
        "execution": {
            "ExecutionKey": arbitrary_row["ExecutionKey"],
            "ScheduledExecutionKey": arbitrary_row["ScheduledExecutionKey"],
            "ExecutionScheduledTime": arbitrary_row["ExecutionScheduledTime"],
            "ExecutionStartTime": arbitrary_row["ExecutionStartTime"],
            "ExecutionEndTime": arbitrary_row["ExecutionEndTime"],
            "ExecutionSuccessful": arbitrary_row["ExecutionSuccessful"],
            "ExecutionClientName": arbitrary_row["ExecutionClientName"],
            "ExecutionDataSourceName": arbitrary_row["ExecutionDataSourceName"],
            "ExecutionDataSetName": arbitrary_row["ExecutionDataSetName"],
            "ExecutionLoadDate": arbitrary_row["ExecutionLoadDate"],
            "ExecutionVersion": arbitrary_row["ExecutionVersion"],
            "ExecutionUser": arbitrary_row["ExecutionUser"],
            "AcquireProgramKey": arbitrary_row["AcquireProgramKey"],
            "AcquireProgramFriendlyName": arbitrary_row["AcquireProgramFriendlyName"]
        },
        "acquires": [],
        "extract": {
            "ExtractKey": extract_key,
            "ExtractDestination": arbitrary_row["ExtractDestination"],
            "ExtractStartTime": arbitrary_row["ExtractStartTime"],
            "ExtractEndTime": arbitrary_row["ExtractEndTime"],
            "ExtractStatus": arbitrary_row["ExtractStatus"],
            "ExtractErrorMessage": arbitrary_row["ExtractErrorMessage"],
            "Options": {}
        } if extract_key is not None else {}
    }
    acquires = {}
    for row in rows:
        acquire_key = row["AcquireKey"]
        if acquire_key is not None:
            acquire = acquires.get(acquire_key)
            if acquire is None:
                acquires[acquire_key] = {
                    "AcquireKey": row["AcquireKey"],
                    "AcquireStartTime": row["AcquireStartTime"],
                    "AcquireEndTime": row["AcquireEndTime"],
                    "AcquireStatus": row["AcquireStatus"],
                    "AcquireErrorMessage": row["AcquireErrorMessage"],
                    "Options": {}
                }
            acquire_option_name = row.get("AcquireOptionName")
            if acquire_option_name is not None:
                acquire["Options"][acquire_option_name] = row["AcquireOptionValue"]
        extract_option_name = row.get("ExtractOptionName")
        if extract_option_name is not None:
            details["extract"]["Options"][extract_option_name] = row["ExtractOptionValue"]
    details["acquires"].extend(acquires.values())
    return {"data": details}


@api.api_blueprint.route("/executions/", methods=["GET"])
@decorators.to_json
def get_executions():
    params = {}
    for k in ("end_date", "page_number", "page_size", "load_date_count"):
        value = flask.request.args.get(k)
        if k is not None:
            params[k] = value
    return {"data": [dict(row) for row in models.get_executions(**params)]}


@api.api_blueprint.route("/extract-programs/", methods=["GET"])
@decorators.to_json
def get_extract_programs():
    response = {"data": []}
    for python_name, friendly_name in (("extract-azure-sql", "Azure SQL"), ):
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


@api.api_blueprint.route("/schedules/<int:key>", metods=["GET"])
@decorators.to_json
def get_scheduled_execution(key):
    rows = models.get_scheduled_execution(key)
    arbitrary_row = rows[0]
    scheduled_extract_key = arbitrary_row["ScheduledExtractKey"]
    details = {
        "execution": {
            "ScheduledExecutionKey": arbitrary_row["ScheduledExecutionKey"],
            "ScheduledExecutionName": arbitrary_row["ScheduledExecutionName"],
            "ScheduledExecutionNextScheduled": arbitrary_row["ScheduledExecutionNextScheduled"],
            "ScheduledExecutionScheduleEnd": arbitrary_row["ScheduledExecutionScheduleEnd"],
            "ScheduledExecutionClientName": arbitrary_row["ScheduledExecutionClientName"],
            "ScheduledExecutionDataSourceName": arbitrary_row["ScheduledExecutionDataSourceName"],
            "ScheduledExecutionDataSetName": arbitrary_row["ScheduledExecutionDataSetName"],
            "ScheduledExecutionNextLoadDate": arbitrary_row["ScheduledExecutionNextLoadDate"],
            "ScheduledExecutionEnabled": arbitrary_row["ScheduledExecutionEnabled"],
            "ScheduledExecutionUser": arbitrary_row["ScheduledExecutionUser"],
            "ScheduledIntervalKey": arbitrary_row["ScheduledIntervalKey"],
            "ScheduledIntervalMI": arbitrary_row["ScheduledIntervalMI"],
            "ScheduledIntervalHH": arbitrary_row["ScheduledIntervalHH"],
            "ScheduledIntervalDD": arbitrary_row["ScheduledIntervalDD"],
            "ScheduledMondayEnabled": arbitrary_row["ScheduledMondayEnabled"],
            "ScheduledTuesdayEnabled": arbitrary_row["ScheduledTuesdayEnabled"],
            "ScheduledWednesdayEnabled": arbitrary_row["ScheduledWednesdayEnabled"],
            "ScheduledThursdayEnabled": arbitrary_row["ScheduledThursdayEnabled"],
            "ScheduledFridayEnabled": arbitrary_row["ScheduledFridayEnabled"],
            "ScheduledSaturdayEnabled": arbitrary_row["ScheduledSaturdayEnabled"],
            "ScheduledSundayEnabled": arbitrary_row["ScheduledSundayEnabled"],
            "AcquireProgramKey": arbitrary_row["AcquireProgramKey"],
            "AcquireProgramFriendlyName": arbitrary_row["AcquireProgramFriendlyName"],
            "Status": arbitrary_row["Status"]
        },
        "acquires": [],
        "extract": {
            "ScheduledExtractKey": scheduled_extract_key,
            "ScheduledExtractDestination": arbitrary_row["ScheduledExtractDestination"],
            "Options": {}
        } if scheduled_extract_key is not None else {}
    }
    acquires = {}
    for row in rows:
        acquire_key = row["AcquireKey"]
        if acquire_key is not None:
            acquire = acquires.get(acquire_key)
            if acquire is None:
                acquires[acquire_key] = {
                    "ScheduledAcquireKey": row["ScheduledAcquireKey"],
                    "ScheduledAcquireName": row["ScheduledAcquireName"],
                    "Options": {}
                }
            acquire_option_name = row.get("ScheduledAcquireOptionName")
            if acquire_option_name is not None:
                acquire["Options"][acquire_option_name] = row["ScheduledAcquireOptionValue"]
        extract_option_name = row.get("ScheduledExtractOptionName")
        if extract_option_name is not None:
            details["extract"]["Options"][extract_option_name] = row["ScheduledExtractOptionValue"]
    details["acquires"].extend(acquires.values())
    return {"data": details}


@api.api_blueprint.route("/schedules/", methods=["GET"])
@decorators.to_json
def get_scheduled_executions():
    params = {}
    for k in ("page_number", "page_size"):
        value = flask.request.args.get(k)
        if k is not None:
            params[k] = value
    return {"data": [dict(row) for row in models.get_scheduled_executions(**params)]}


@api.api_blueprint.route("/schedules/", methods=["POST"])
@decorators.to_json
def insert_scheduled_execution():
    data = flask.request.get_json(force=True).get("data", {})
    execution = data.get("execution", {})
    acquires = data.get("acquires", [])
    extract = data.get("extract", {})
    with models.db.engine.begin() as transaction:
        result, _ = models.insert_scheduled_execution(transaction, execution, extract)
        scheduled_execution_key = result["ScheduledExecutionKey"]
        for acquire in acquires:
            acquire["ScheduledExecutionKey"] = scheduled_execution_key
            _, _ = models.insert_scheduled_acquire(transaction, acquire)
    return {}, 201, None


@api.api_blueprint.route("/executions/retry", methods=["POST"])
@decorators.to_json
def retry_executions():
    # TODO: What if one or more of the keys are invalid? Not needed if just the web front end passing in data.
    for key in flask.request.get_json(force=True)["data"]:
        rows = models.get_execution(key)
        if rows:
            app.execute(app.format_execution(rows))
    return {}, 201, None


@api.api_blueprint.route("/schedules/<int:key>", methods=["PUT"])
@decorators.to_json
def update_scheduled_execution(key):
    data = flask.request.get_json(force=True).get("data", {})
    params = {"ScheduledExecutionKey": key}
    execution = data.get("execution", {})
    execution.update(params)
    acquires = data.get("acquires", [])
    extract = data.get("extract", {})
    with models.db.engine.begin() as transaction:
        result, _ = models.update_scheduled_execution(transaction, execution, extract)
        _ = models.delete_scheduled_acquires(transaction, params)
        for acquire in acquires:
            acquire.update(params)
            _, _ = models.insert_scheduled_acquire(transaction, acquire)
    return {}, 201, None
