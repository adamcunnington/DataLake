import collections
import importlib

from sqlalchemy import exc
import flask

from titan import api, app, models
from titan.api import decorators


def _nested_default_dict():
    # This allows an arbitrary amount of nested default dicts
    return collections.defaultdict(_nested_default_dict)


@api.api_blueprint.route("/executions/", methods=["POST"])
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
                "AcquireProgramHelp": row["AcquireProgramHelp"],
                "Options": []
            }
        option_name = row["AcquireProgramOptionName"]
        if option_name is not None:
            acquire_programs[key]["Options"].append({
                "AcquireProgramOptionName": option_name,
                "AcquireProgramOptionRequired": row["AcquireProgramOptionRequired"],
                "AcquireProgramOptionType": row["AcquireProgramOptionType"],
                "AcquireProgramOptionHelp": row["AcquireProgramOptionHelp"]
            })
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
            "ExecutionContainerGroupName": arbitrary_row["ExecutionContainerGroupName"],
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
            "Options": []
        } if extract_key is not None else {}
    }
    acquires = {}
    acquire_options = {}
    extract_options = {}
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
                    "Options": []
                }
            acquire_option_name = row["ScheduledAcquireOptionName"]
            if acquire_option_name is not None:
                acquire_option = acquire_options.get(acquire_option_name)
                if acquire_option is None:
                    acquire_option = acquire_options[acquire_option_name] = {
                        "ScheduledAcquireOptionName": acquire_option_name,
                        "ScheduledAcquireOptionValue": row["ScheduledAcquireOptionValue"]
                    }
                    acquire["Options"].append(acquire_option)
        extract_option_name = row["ScheduledExtractOptionName"]
        if extract_option_name is not None:
            extract_option = extract_options.get(extract_option_name)
            if extract_option is None:
                extract_options[extract_option_name] = {
                    "ScheduledExtractOptionName": extract_option_name,
                    "ScheduledExtractOptionValue": row["ScheduledExtractOptionValue"]
                }
    details["acquires"].extend(acquires.values())
    details["extract"]["Options"].extend(extract_options.values())
    return {"data": details}


@api.api_blueprint.route("/executions/", methods=["GET"])
@decorators.to_json
def get_executions():
    params = {}
    for k in ("end_date", "page_number", "page_size", "load_date_count"):
        value = flask.request.args.get(k)
        if value is not None:
            params[k] = value
    executions = models.get_executions(**params)
    data = _nested_default_dict()
    for row in executions:
        client = data[row["ExecutionClientName"]]
        data_source = client[row["ExecutionDataSourceName"]]
        data_set = data_source[row["ExecutionDataSetName"]]
        details = {}
        for key in ("ExecutionKey", "AcquireProgramKey", "AcquireStartTime", "AcquireStatus", "ExtractStartTime",
                    "ExtractStatus"):
            details[key] = row[key]
        data_set[row["ExecutionLoadDate"]] = details
    return {"data": data}


@api.api_blueprint.route("/extract-programs/", methods=["GET"])
@decorators.to_json
def get_extract_programs():
    response = {"data": []}
    for python_name, friendly_name in (("azuresql", "Azure SQL"), ):
        program = importlib.import_module("titan.extract.%s" % python_name)
        response["data"].append({
            "ExtractProgramPythonName": python_name,
            "ExtractProgramFriendlyName": friendly_name,
            "ExtractProgramHelp": program.main.help,
            "Options": [
                {
                    "ExtractProgramOptionName": max(option.opts, key=len),
                    "ExtractProgramOptionRequired": option.required,
                    "ExtractProgramOptionType": option.type.name,
                    "ExtractProgramOptionHelp": option.help
                }
                for option in program.main.params
            ]
        })
    return response


@api.api_blueprint.route("/schedules/<int:key>", methods=["GET"])
@decorators.to_json
def get_scheduled_execution(key):
    rows = models.get_scheduled_execution(key)
    arbitrary_row = rows[0]
    print(dict(arbitrary_row))
    scheduled_extract_destination = arbitrary_row["ScheduledExtractDestination"]
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
        },
        "acquires": [],
        "extract": {
            "ScheduledExtractDestination": scheduled_extract_destination,
            "Options": []
        } if scheduled_extract_destination is not None else {}
    }
    acquires = {}
    acquire_options = {}
    extract_options = {}
    for row in rows:
        scheduled_acquire_name = row["ScheduledAcquireName"]
        if scheduled_acquire_name is not None:
            acquire = acquires.get(scheduled_acquire_name)
            if acquire is None:
                acquire = acquires[scheduled_acquire_name] = {
                    "ScheduledAcquireName": scheduled_acquire_name,
                    "Options": []
                }
            acquire_option_name = row["ScheduledAcquireOptionName"]
            if acquire_option_name is not None:
                acquire_option = acquire_options.get(acquire_option_name)
                if acquire_option is None:
                    acquire_option = acquire_options[acquire_option_name] = {
                        "ScheduledAcquireOptionName": acquire_option_name,
                        "ScheduledAcquireOptionValue": row["ScheduledAcquireOptionValue"]
                    }
                    acquire["Options"].append(acquire_option)
        extract_option_name = row["ScheduledExtractOptionName"]
        if extract_option_name is not None:
            extract_option = extract_options.get(extract_option_name)
            if extract_option is None:
                 extract_options[extract_option_name] = {
                    "ScheduledExtractOptionName": extract_option_name,
                    "ScheduledExtractOptionValue": row["ScheduledExtractOptionValue"]
                }
    details["acquires"].extend(acquires.values())
    details["extract"]["Options"].extend(extract_options.values())
    return {"data": details}


@api.api_blueprint.route("/schedules/", methods=["GET"])
@decorators.to_json
def get_scheduled_executions():
    params = {}
    for k in ("page_number", "page_size"):
        value = flask.request.args.get(k)
        if value is not None:
            params[k] = value
    return {"data": [dict(row) for row in models.get_scheduled_executions(**params)]}


@api.api_blueprint.route("/schedules/", methods=["POST"])
@decorators.to_json
def insert_scheduled_execution():
    data = flask.request.get_json(force=True).get("data", {})
    execution = data.get("execution", {})
    acquires = data.get("acquires", [])
    extract = data.get("extract", {})
    try:
        with models.db.engine.begin() as transaction:
            result, _ = models.insert_scheduled_execution(transaction, execution, extract)
            scheduled_execution_key = result["ScheduledExecutionKey"]
            for acquire in acquires:
                acquire["ScheduledExecutionKey"] = scheduled_execution_key
                _, _ = models.insert_scheduled_acquire(transaction, acquire)
    except exc.SQLAlchemyError as error:
        return {"error": {"code": error.code, "message": str(error)}}, 400, None
    return {}, 201, None


@api.api_blueprint.route("/executions/retry", methods=["POST"])
@decorators.to_json
def retry_executions():
    invalid_keys = []
    valid_execution_details = []
    for key in flask.request.get_json(force=True)["data"]:
        rows = models.get_execution(key)
        if rows:
            valid_execution_details.append(rows)
        else:
            invalid_keys.append(key)
    if invalid_keys:
        return {"error": {"message": "the following keys are invalid as no execution details could be located: %s" %
                invalid_keys}}, 400, None
    for rows in valid_execution_details:
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
    try:
        with models.db.engine.begin() as transaction:
            result, _ = models.update_scheduled_execution(transaction, execution, extract)
            _ = models.delete_scheduled_acquires(transaction, params)
            for acquire in acquires:
                acquire.update(params)
                _, _ = models.insert_scheduled_acquire(transaction, acquire)
    except exc.SQLAlchemyError as error:
        return {"error": {"code": error.code, "message": str(error)}}, 400, None
    return {}, 201, None
