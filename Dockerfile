FROM python:3.6

### APP INSTALLATION ###
WORKDIR /titan/
ADD . /titan/
# System Utilities
RUN apt-get update && \
    apt-get install -y apt-transport-https && \
    rm -rf /var/lib/apt/lists/*
RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add -
RUN curl https://packages.microsoft.com/config/debian/9/prod.list > /etc/apt/sources.list.d/mssql-release.list
# PYODBC dependencies
RUN apt-get update && \
    ACCEPT_EULA=Y apt-get install -y msodbcsql17 unixodbc-dev && \
    rm -rf /var/lib/apt/lists/*
RUN pip install --trusted-host pypi.python.org -r requirements.txt

### APP EXTENSIONS INSTALLATION ###

WORKDIR /acquire-programs/AdWordsReportDownloader/
RUN git clone https://github.com/wmuktapp/Titan-AdWordsReportDownloader.git .
RUN pip install --trusted-host pypi.python.org .

WORKDIR /acquire-programs/DBMReportDownloader/
RUN git clone https://github.com/wmuktapp/Titan-DBMReportDownloader.git .
RUN pip install --trusted-host pypi.python.org -r requirements.txt

WORKDIR /acquire-programs/DCMReportDownloader/
RUN git clone https://github.com/wmuktapp/Titan-DCMReportDownloader.git .
RUN pip install --trusted-host pypi.python.org -r requirements.txt

WORKDIR /acquire-programs/DSReportDownloader/
RUN git clone https://github.com/wmuktapp/Titan-DSReportDownloader.git .
RUN pip install --trusted-host pypi.python.org -r requirements.txt

### CLEAN UP ###
RUN rm -rf /var/tmp/* /tmp/*
