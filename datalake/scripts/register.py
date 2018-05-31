import click
import importlib

from datalake import models
import datalake


@click.command()
@click.option("-k", "--acquire-program-key", type=int, help="The id (database primary key) of the acquire program to "
              "update. If not provided, the details will be registered as a new acquire program.")
@click.option("-p", "--python-name", help="The name of the python module or package that will be called to execute the "
              "acquire program.", required=True)
@click.option("-f", "--friendly-name", help="A friendly name of the acquire program which will be user-facing and must "
              "be unique across all acquire programs.", required=True)
@click.option("-d", "--data-source-name", help="The name of the data source which must be unique across all acquire "
              "programs. This attribute forms a part of the execution taxonomy.", required=True)
@click.option("-a", "--author", help="The author of the acquire program, assumed to be owner of the maintenance of the "
              "program.", required=True)
@click.option("-e",  "--enabled", is_flag=True)
def main(acquire_program_key, python_name, friendly_name, data_source_name, author, enabled):
    program = importlib.import_module(python_name)
    if program.__package__:
        command = program.__main__.main
    else:
        command = program.main
    flask_app = datalake.create_app("register")
    acquire_program = {
        "AcquireProgramPythonName": python_name,
        "AcquireProgramFriendlyName": friendly_name,
        "AcquireProgramDataSourceName": data_source_name,
        "AcquireProgramAuthor": author,
        "AcquireProgramEnabled": enabled,
        "Options":
            [{
                "AcquireProgramOptionName": max(option.opts, key=len),
                "AcquireProgramOptionRequired": option.required
            } for option in command.params]
    }
    with flask_app.flask_app_context():
        if acquire_program_key is None:
            flask_app.logger.info("Register new acquire program...")
            models.insert_acquire_program(acquire_program)
        else:
            acquire_program["AcquireProgramKey"] = acquire_program_key
            flask_app.logger.info("Updating existing acquire program...")
            models.update_acquire_program(acquire_program)
