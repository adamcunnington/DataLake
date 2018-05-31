import setuptools


setuptools.setup(
    name="DataLake",
    author="Adam Cunnington",
    license="MIT",
    packages=setuptools.find_packages(),
    install_requires=[
        "applicationinsights",
        "azure",
        "click",
        "flask",
        "flask_sqlalchemy",
        "pyodbc",
        "python-dotenv",
        "sqlalchemy",
        "wrapt"
    ],
    entry_points={
        "console_scripts": [
            "execute = datalake.scripts.execute:main",
            "orchestrate = datalake.scripts.orchestrate:main",
            "register = datalake.scripts.register:main",
            "extract-azure-sql = datalake.extract.azuresql:main"
        ]
    }
)
