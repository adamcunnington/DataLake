import json
import os

from azure.storage import blob

import datalake


class AcquireProgram(object):
    def __init__(self):
        self._app = datalake.create_app()
        self._blob_service = blob.BlockBlobService(account_name=self._app.config["DATALAKE_AZURE_BLOB_ACCOUNT_NAME"],
                                                   sas_token=self._app.config["DATALAKE_AZURE_BLOB_SAS_TOKEN"])
        self._data = json.loads(os.getenv("DATALAKE_STDIN"))["execution"]
        self._blob_prefix = "/".join((self._data["ExecutionClientName"], self._data["ExecutionDataSourceName"],
                                      self._data["DataSetName"], self._data["ExecutionLoadDate"],
                                      self._data["ExecutionVersion"]))
        self.file_name_format = "{DATALAKE_DATA_SET_NAME}_{DATALAKE_LOAD_DATE}"
        self.logger = self._app.logger

    def create_blob_from_stream(self, stream, count=None, **file_name_params):
        blob_name = self._blob_prefix + "/" + self.file_name_format.format(**self._data, **file_name_params)
        self.logger.info("Uploading file, %s, to blob storage" % blob_name)
        self._blob_service.create_blob_from_stream(self._app.config["DATALAKE_AZURE_BLOB_CONTAINER_NAME"], blob_name,
                                                   stream, count=count)
