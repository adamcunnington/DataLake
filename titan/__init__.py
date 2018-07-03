import os

from applicationinsights.flask import ext
import dotenv
import flask

from titan import api, app, config, models
from titan.api import decorators, views


def create_app(source="webserver"):
    flask_app = flask.Flask("titan", instance_relative_config=True)
    flask_app.json_encoder = decorators.JSONEncoder

    dotenv.load_dotenv(os.path.join(flask_app.instance_path, "..", "config.env"))
    environment = os.environ.get("TITAN_CONFIG_ENVIRONMENT")
    flask_app.config.from_object(config.CONFIGURATIONS[environment])
    flask_app.config.from_pyfile("%s.py" % environment, silent=True)
    flask_app.config.from_envvar("TITAN_CONFIG_OVERRIDE_PATH", silent=True)

    ext.AppInsights(flask_app)
    flask_app.logger.debug("Enabling Azure Application Insights log stream from app")
    flask_app.logger.info("App object created from %s" % source)
    flask_app.logger.debug("Configuration loaded using environment: %s" % environment)

    flask_app.register_blueprint(api.api_blueprint, url_prefix="/api")
    models.db.init_app(flask_app)

    return flask_app
