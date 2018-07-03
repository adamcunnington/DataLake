import flask
import markupsafe

from titan import app
import titan


flask_app = titan.create_app()


@flask_app.route("/")
def index():
    return flask.redirect("/monitoring")


@flask_app.route("/monitoring")
def monitoring():
    return flask.render_template("monitoring.html", access_token=app.get_id_token())


@flask_app.route("/monitoring/executions/<int:execution_key>")
def monitoring_execution(execution_key):
    data = {"executionKey": execution_key}
    return flask.render_template("execution.html", access_token=app.get_id_token(), data=markupsafe.Markup(data))


@flask_app.route("/schedules")
def schedules():
    return flask.render_template("schedules.html", access_token=app.get_id_token())


@flask_app.route("/schedules/<int:schedule_key>")
def schedule_details(schedule_key):
    data = {"scheduleKey": schedule_key}
    return flask.render_template("schedule.html", access_token=app.get_id_token(), data=markupsafe.Markup(data))


@flask_app.route("/schedules/add")
def schedule_add():
    return flask.render_template("schedule.html", access_token=app.get_id_token(), data=markupsafe.Markup({}))


@flask_app.route("/adhoc")
def adhoc():
    data = {}
    schedule_id = flask.request.args.get("schedule")
    if schedule_id is not None:
        data["scheduleId"] = int(schedule_id)
    return flask.render_template("adhoc.html", access_token=app.get_id_token(), data=markupsafe.Markup(data))


@flask_app.errorhandler(404)
def resource_not_found(_):
    return flask.render_template("404.html")


@flask_app.errorhandler(500)
def internal_server_error(_):
    return flask.render_template("500.html")
