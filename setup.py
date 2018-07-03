import setuptools


setuptools.setup(
    name="Titan",
    author="Adam Cunnington",
    license="MIT",
    packages=setuptools.find_packages(),
    install_requires=[
        "applicationinsights",
        "azure-common",
        "azure-mgmt-containerinstance",
        "azure-mgmt-resource",
        "azure-storage-blob",
        "click",
        "flask",
        "flask_sqlalchemy",
        "msrestazure",
        "pyodbc",
        "python-dotenv",
        "sqlalchemy",
        "wrapt"
    ],
    entry_points={
        "console_scripts": [
            "execute = titan.scripts.execute:main",
            "orchestrate = titan.scripts.orchestrate:main",
            "register = titan.scripts.register:main",
            "azuresql = titan.extract.azuresql:main"
        ]
    }
)
