from azure.mgmt import containerinstance

from datalake import app, models
import datalake


def _clean_up_containers(flask_app):
    credentials, subscription_id = app.get_security_context()
    client = containerinstance.ContainerInstanceManagementClient(credentials, subscription_id)
    resource_group_name = flask_app.config["DATALAKE_AZURE_CONTAINER_RSG_NAME"]
    for partial_container_group in client.container_groups.list():
        container_group = client.container_groups.get(resource_group_name, partial_container_group.name)
        if container_group.instance_view.state != "Running":
            flask_app.logger.info("Deleting terminated container group; %s" % partial_container_group.name)
            client.container_groups.delete(resource_group_name, partial_container_group.name)


def _clean_up_logs(flask_app):
    pass


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
    flask_app = datalake.create_app("orchestrate")
    flask_app.logger.info("Orchestrator started")
    flask_app.logger.info("Cleaning up completed container instances...")
    _clean_up_containers(flask_app)
    flask_app.logger.info("Checking for long-running container instances")
    _kill_long_running_containers(flask_app)
    flask_app.logger.info("Checking for uncompleted logs")
    _clean_up_logs(flask_app)
    flask_app.logger.info("Processing queue...")
    _process_queue(flask_app)
    flask_app.logger.info("Orchestrator ended")
