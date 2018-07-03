import json
import os
import posixpath
import uuid

from azure.storage import blob
import click
import sqlalchemy

from titan import app
import titan


class BlobsNotFoundError(Exception):
    """No blobs were found for the given extract details."""


_EXTRACT_KEY_COLUMN_NAME = "ExtractKey"   # is not escaped so must not include single quote


def _generate_sql_text(blobs, replace, credential_name, blob_key, data_source_name, blob_location,view_name, schema,
                       table_name_without_schema, table_name, code_page, text_qualifier, field_delimiter, row_delimiter,
                       extract_key):
    # We don't care about SQL injection risk as we are connecting to db's that the user provides the connection string
    # of. If they wanted to do harm, they could do it anyway.
    # We also have to create a 'temporary' (create before and delete after) view that sits on top of the underlying
    # table because the source won't contain the extract key.
    pre_text = f"""
        IF EXISTS(SELECT * FROM sys.external_data_sources WHERE name = N'{data_source_name}')
            DROP EXTERNAL DATA SOURCE [{data_source_name}];
            
        IF EXISTS(SELECT * FROM sys.database_credentials WHERE name = N'{credential_name}')
            DROP DATABASE SCOPED CREDENTIAL [{credential_name}];
        
        CREATE DATABASE SCOPED CREDENTIAL [{credential_name}]
        WITH IDENTITY = 'SHARED ACCESS SIGNATURE', SECRET = N'{blob_key}';
        
        CREATE EXTERNAL DATA SOURCE [{data_source_name}]
        WITH (
            TYPE = BLOB_STORAGE,
            LOCATION = N'{blob_location}',
            CREDENTIAL = [{credential_name}]
        );"""

    main_text = f"""    
        BEGIN TRANSACTION
        
        DECLARE @SQL NVARCHAR(MAX) = 'CREATE VIEW {view_name} AS SELECT ' + (
            SELECT STRING_AGG('[' + COLUMN_NAME + ']', ',') WITHIN GROUP (ORDER BY ORDINAL_POSITION)
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = N'{schema}'
                AND TABLE_NAME = N'{table_name_without_schema}'
                AND COLUMN_NAME <> '{_EXTRACT_KEY_COLUMN_NAME}'
            GROUP BY TABLE_NAME
        ) + ' FROM [{table_name}]';
    
        EXEC(@SQL);
    """
    if replace:
        main_text += f"""
            TRUNCATE TABLE [{table_name}];
        """
    for index, blob in enumerate(blobs):
        blob_name = blob.name.replace("'", "''")
        main_text += f"""
            BULK INSERT {view_name}
            FROM N'{blob_name}'
            WITH (
                CODEPAGE = N'{code_page}',
                DATA_SOURCE = '{data_source_name}',
                FIELDQUOTE = N'{text_qualifier}',
                FIELDTERMINATOR = N'{field_delimiter}',
                FIRSTROW = 2,
                FORMAT = N'CSV',
                MAXERRORS = 1,
                ROWTERMINATOR = N'{row_delimiter}',
                TABLOCK
            );
        """
    main_text += f"""
        UPDATE [{table_name}]
        SET [{_EXTRACT_KEY_COLUMN_NAME}] = {extract_key}
        WHERE [{_EXTRACT_KEY_COLUMN_NAME}] IS NULL;
        
        DROP VIEW {view_name};
        COMMIT TRANSACTION
    """
    return pre_text, main_text


@click.command()
@click.option("-s", "--connection-string", help="The pyodbc connection string to be used to connect to the Azure SQL "
              "database.", required=True)
@click.option("-t", "--table-name", help="The name of the table to bulk insert data into. Can include schema.",
              required=True)
@click.option("-a", "--replace", type=bool, default=False, help="Whether or not the extract table contents will be "
              "replaced or appended to. Defaults to False (appended to).")
@click.option("-f", "--field-delimiter", default=",", help="The delimiter character(s) to split columns / fields by."
              "Defaults to ,")
@click.option("-r", "--row-delimiter", default="0x0a", help="The delimiter character(s) to split rows by. Defaults to "
              "line feed character (\n) expressed as a hex value to get around Microsoft bug. For the same reason, if "
              "file ends with carraige return and line feed, pass \n, not \r\n as \n is interpreted as both.")
@click.option("-q", "--text-qualifier", default="\"", help="The text qualifier / field quote character. Defaults to \"")
@click.option("-p", "--code_page", default=65001, help="The code page used to interpret the character set for text "
              "fields. Defaults to 65001.")
@click.option("-c", "--credential-name", default="TitanBlobStorageCredential", help="The name of the credential "
              "object to be created on the database (if not already existing) to be used to connect to the azure blob "
              "storage. Defaults to TitanBlobStorageCredential.")
@click.option("-d", "--data-source-name", default="TitanBlobStorage", help="The name of the data source object to "
              "be created on the database (if not already existing) to be used to connect to the azure blob storage."
              "Defaults to TitanBlobStorage.")
def main(connection_string, table_name, replace, field_delimiter, row_delimiter, text_qualifier, code_page,
         credential_name, data_source_name):
    """Initial a BULK INSERT transaction from the Azure SQL database to retrieve files from Titan's Blob storage.

    If there are multiple files, the BULK INSERTs will be wrapped inside of a single transaction.

    """
    flask_app = titan.create_app("azuresql")
    container_name = flask_app.config["TITAN_AZURE_BLOB_CONTAINER_NAME"]
    blob_location = posixpath.join(flask_app.config["TITAN_AZURE_BLOB_ENDPOINT"], container_name)
    sas_token = flask_app.config["TITAN_AZURE_BLOB_SAS_TOKEN"]
    service = blob.BlockBlobService(account_name=flask_app.config["TITAN_AZURE_BLOB_ACCOUNT_NAME"], sas_token=sas_token)
    data = json.loads(os.getenv("TITAN_STDIN"))
    extract_key = data["extract"]["ExtractKey"]
    execution = data["execution"]
    blob_prefix = posixpath.join(execution["ExecutionClientName"], execution["ExecutionDataSourceName"],
                                 execution["ExecutionDataSetName"], execution["ExecutionLoadDate"],
                                 execution["ExecutionVersion"])
    if "." in table_name:
        schema, table_name_without_schema = table_name.split(".")
    else:
        schema, table_name_without_schema = "dbo", table_name
    view_name = "[%s].[%s_%s]" % (schema, table_name_without_schema, uuid.uuid4())
    blobs = list(app.list_blobs(service, container_name, blob_prefix))
    if not blobs:
        raise BlobsNotFoundError("No blobs were found @ the prefix; %s" % blob_prefix)
    flask_app.logger.info("Building SQL text...")
    blob_key = sas_token[1:] if next(iter(sas_token), None) == "?" else sas_token  # needed because silly microsoft
    # Manual escaping for now
    blob_key = blob_key.replace("'", "''")
    table_name_without_schema = table_name_without_schema.replace("'", "''")
    text_qualifier = text_qualifier.replace("'", "''")
    # End Manual escaping
    sql_texts = _generate_sql_text(blobs, replace,
                                   credential_name=credential_name, blob_key=blob_key,
                                   data_source_name=data_source_name, blob_location=blob_location, view_name=view_name,
                                   schema=schema, table_name_without_schema=table_name_without_schema,
                                   table_name=table_name, code_page=code_page, text_qualifier=text_qualifier,
                                   field_delimiter=field_delimiter, row_delimiter=row_delimiter,
                                   extract_key=extract_key)
    db = sqlalchemy.create_engine(connection_string)
    flask_app.logger.info("Extracting data to database...")
    for sql_text in sql_texts:
        db.engine.execute(sqlalchemy.text(sql_text).execution_options(autocommit=True))
