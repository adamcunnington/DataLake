import click
import sqlalchemy

import datalake


@click.command()
@click.option("-s", "--connection-string", help="", required=True)
@click.option("-t", "--table-name", help="", required=True)
@click.option("-a", "--replace", type=bool, default=False, help="")
@click.option("-f", "--field-delimiter", default=",", help="")
@click.option("-r", "--row-delimiter", help="", default="\n")
@click.option("-q", "--text-qualifier", default="\"", help="")
@click.option("-p", "--code_page", default=65001, help="")
@click.option("-c", "--credential-name", default="DataLakeBlobStorageCredential", help="")
@click.option("-d", "--data-source-name", default="DataLakeBlobStorage", help="")
def main(connection_string, table_name, replace, field_delimiter, row_delimiter, text_qualifier, code_page,
         credential_name, data_source_name):
    config = datalake.create_app().config
    db = sqlalchemy.create_engine(connection_string)
    sql_text = """
        IF OBJECT_ID(:credential_name) IS NULL
            CREATE DATABASE SCOPED CREDENTIAL :credential_name 
            WITH IDENTITY = 'SHARED ACCESS SIGNATURE', SECRET = :blob_key;
            
        IF OBJECT_ID(:data_source_name) IS NULL
            CREATE EXTERNAL DATA SOURCE :data_source_name
            WITH (
                TYPE = BLOB_STORAGE,
                LOCATION = :blob_location,
                CREDENTIAL = :credential_name
            );
        
        BEGIN TRANSACTION
    """

    if replace:
        sql_text += """
            TRUNCATE TABLE :table_name;
        """

    params = {}
    for index, file_name in enumerate(_get_blob_files()):
        param_name = "file_name_%s" % index
        params[param_name] = file_name
        sql_text += """
            BULK INSERT :table_name
            FROM :%s
            WITH (
                CODEPAGE = :code_page,
                DATAFILETYPE = 'widechar',
                DATASOURCE = :data_source_name,
                FIELDQUOTE = :text_qualifier,
                FIELDTERMINATOR = :field_delimiter,
                FIRSTROW = 2,
                FORMAT = 'CSV',
                MAXERRORS = 1,
                ROWTERMINATOR = :row_delimiter,
                TABLOCK
            );
        """ % param_name
    sql_text += """
        COMMIT TRANSACTION
    """

    db.engine.execute(sqlalchemy.text(sql_text), table_name=table_name, field_delimiter=field_delimiter,
                      row_delimiter=row_delimiter, text_qualifier=text_qualifier, code_page=code_page,
                      credential_name=credential_name, data_source_name=data_source_name,
                      blob_key=config["DATALAKE_AZURE_BLOB_KEY"], blob_location=config["DATALAKE_AZURE_BLOB_LOCATION"],
                      **params)
