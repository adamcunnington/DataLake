import json
import os

from azure.storage import blob

import titan


class AcquireProgram(object):
    def __init__(self):
        self._app = titan.create_app()
        self._append_service = blob.AppendBlobService(account_name=self._app.config["TITAN_AZURE_BLOB_ACCOUNT_NAME"],
                                                    sas_token=self._app.config["TITAN_AZURE_BLOB_SAS_TOKEN"])
        self._block_service = blob.BlockBlobService(account_name=self._app.config["TITAN_AZURE_BLOB_ACCOUNT_NAME"],
                                                   sas_token=self._app.config["TITAN_AZURE_BLOB_SAS_TOKEN"])
        self.container_name = self._app.config["TITAN_AZURE_BLOB_CONTAINER_NAME"]
        self._data = json.loads(os.getenv("TITAN_STDIN"))["execution"]
        self._blob_prefix = "/".join((self._data["ExecutionClientName"], self._data["ExecutionDataSourceName"],
                                      self._data["DataSetName"], self._data["ExecutionLoadDate"],
                                      self._data["ExecutionVersion"]))
        self._file_name_format = "{TITAN_DATA_SET_NAME}_{TITAN_LOAD_DATE}.csv"
        self.logger = self._app.logger

    def get_blob_name(self, name_format=None, **params):
        if name_format is None:
            name_format = self._file_name_format
        return self._blob_prefix + "/" + name_format.format(**self._data, **params)

    def append_blob_from_bytes(self, bytes, blob_name=None, count=None):
        if blob_name is None:
            blob_name = self.get_blob_name()
        self.logger.info("Appending bytes to blob, %s" % blob_name)
        self._append_service.append_blob_from_bytes(self.container_name, blob_name, bytes, count=count)

    def create_blob_from_stream(self, stream, blob_name=None, count=None):
        if blob_name is None:
            blob_name = self.get_blob_name()
        self.logger.info("Uploading file, %s, to blob storage" % blob_name)
        self._block_service.create_blob_from_stream(self.container_name, blob_name, stream, count=count)
