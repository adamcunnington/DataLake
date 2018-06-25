from azure.mgmt import containerinstance
from msrestazure import azure_exceptions

from titan import app, models
import titan


def _get_client():
    credentials, subscription_id = app.get_security_context()
    return containerinstance.ContainerInstanceManagementClient(credentials, subscription_id)


def _clean_up_containers(flask_app):
    client = _get_client()
    resource_group_name = flask_app.config["TITAN_AZURE_CONTAINER_RSG_NAME"]
    running_container_groups = [row["ExecutionContainerGroupName"] for row in models.get_running_container_groups()]
    for partial_container_group in client.container_groups.list():
        container_group = client.container_groups.get(resource_group_name, partial_container_group.name)
        if container_group.instance_view.state != "Running":
            flask_app.logger.info("Deleting terminated container group; %s" % partial_container_group.name)
            client.container_groups.delete(resource_group_name, partial_container_group.name)
        else:
            if partial_container_group.name not in running_container_groups:
                flask_app.logger.warning("Killing and deleting container group; %s. This container should have "
                                         "finished as the log entry is complete. If this persists, check the acquire "
                                         "program for bugs that could be causing the code to hang."
                                         % partial_container_group.name)
                client.container_groups.delete(resource_group_name, partial_container_group.name)


def _clean_up_logs(flask_app):
    client = _get_client()
    resource_group_name = flask_app.config["TITAN_AZURE_CONTAINER_RSG_NAME"]
    for running_container_group in models.get_running_container_groups():
        execution_key = running_container_group["ExecutionKey"]
        container_group_name = running_container_group["ExecutionContainerGroupName"]
        state = None
        try:
            container_group = client.container_groups.get(resource_group_name, container_group_name)
            state = container_group.instance_view.state
        except azure_exceptions.CloudError:
            pass
        if state is None or state != "Running":
            models.end_execution_log(execution_key, "Container instance was terminated but log entry was incomplete.")


def _kill_long_running_containers(flask_app):
    # TODO: Need to work out how to deal with this. There are timeout parameters for an acquire and an extract but there
    # could be x acquires. I think we need an overarching timeout. Either that or we don't kill but we send structured
    # log data which appinsights can send an alert off so we can review manually
    pass


def _process_queue(flask_app):
    with flask_app.app_context():
        for execution in models.get_queue():
            rows = models.get_scheduled_execution(execution["ScheduledExecutionKey"])
            app.execute(app.format_execution(rows))


def main():
    flask_app = titan.create_app("orchestrate")
    flask_app.logger.info("Orchestrator started")
    flask_app.logger.info("Cleaning up completed container instances...")
    # _clean_up_containers(flask_app)
    flask_app.logger.info("Checking for long-running container instances")
    # _kill_long_running_containers(flask_app)
    flask_app.logger.info("Checking for uncompleted logs")
    # _clean_up_logs(flask_app)
    flask_app.logger.info("Processing queue...")
    # _process_queue(flask_app)
    flask_app.logger.info("Orchestrator ended")
