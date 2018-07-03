import datetime

from azure.mgmt import containerinstance

from titan import app, models
import titan


def _clean_up(flask_app):
    prefix = flask_app.config["TITAN_AZURE_CONTAINER_NAME"]
    rsg_name = flask_app.config["TITAN_AZURE_CONTAINER_RSG_NAME"]
    with flask_app.app_context():
        client = containerinstance.ContainerInstanceManagementClient(*app.get_security_context())
        logged_container_groups = {row["ExecutionContainerGroupName"]: {"ExecutionKey": row["ExecutionKey"]}
                                   for row in models.get_running_container_groups()}
        azure_container_groups = {cg.name: {"State": client.container_groups.get(rsg_name, cg.name).instance_view.state}
                                  for cg in client.container_groups.list() if cg.name.startswith(prefix)}
        all_container_groups = logged_container_groups.copy()
        for k, v in azure_container_groups.items():
            all_container_groups.setdefault(k, {}).update(v)
        for name, details in all_container_groups.items():
            execution_key = details.get("ExecutionKey")
            state = details.get("State")
            if state is None:
                flask_app.logger.error("The log entry (ExecutionKey: %s) for container group, %s has a status of "
                                       "\"Running\" despite the container group no longer running. Ending the log "
                                       "entry now with a \"Failed\" status." % (execution_key, name))
                models.end_execution_log(execution_key, "Titan's Orchestrator has failed this log entry as it was "
                                         "incomplete despite the container group no longer running.")
            elif state == "Running":
                if execution_key is None:
                    flask_app.logger.error("The container group, %s is still running despite the log entry reporting a "
                                           "completed status. Terminating and deleting the container group now. If "
                                           "this issue persists, there may be a bug stopping the container from "
                                           "completing." % name)
                    client.container_groups.delete(rsg_name, name)
                else:
                    timeout_seconds = flask_app.config["TITAN_EXECUTION_TIMEOUT_SECONDS"]
                    start_time_stamp = models.get_execution(execution_key)[0]["ExecutionStartTime"]
                    start_time = datetime.datetime.strptime(start_time_stamp, "%Y-%m-%d %H:%M%S")
                    if (datetime.datetime.utcnow() - start_time).total_seconds() >= timeout_seconds:
                        flask_app.logger.critical("Container group, %s has been running for more than the timeout "
                                                  "threshold of %s seconds. Please investigate immediately and "
                                                  "manually terminate the instance if required." % name)
            elif state in ("Terminated", "Failed", "Succeeded"):  # check on exact possible values
                if execution_key is None:
                    flask_app.logger.info("Deleting terminated container group %s." % name)
                    client.container_groups.delete(rsg_name, name)


def _process_queue(flask_app):
    with flask_app.app_context():
        for execution in models.get_queue():
            rows = models.get_scheduled_execution(execution["ScheduledExecutionKey"])
            app.execute(app.format_execution(rows))


def main():
    flask_app = titan.create_app("orchestrate")
    flask_app.logger.info("Orchestrator started")
    flask_app.logger.info("Performing clean up tasks...")
    try:
        _clean_up(flask_app)
    except Exception as error:
        flask_app.logger.info("Error encountered whilst performing clean up tasks.")
        flask_app.logger.exception(str(error))
    flask_app.logger.info("Processing queue...")
    _process_queue(flask_app)
    flask_app.logger.info("Orchestrator ended")
