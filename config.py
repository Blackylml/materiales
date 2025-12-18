import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

class Config:
    # Configuración general
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'clave-secreta-predeterminada'
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max upload

    # Configuración SQL Server Local
    SQLSERVER_LOCAL = {
        'driver': 'ODBC Driver 17 for SQL Server',
        'server': os.environ.get('SQLSERVER_LOCAL_SERVER') or 'SERV_SYSTEM',
        'database': os.environ.get('SQLSERVER_LOCAL_DB') or 'RecibosMateriaPrima',
        'username': os.environ.get('SQLSERVER_LOCAL_USER') or 'sa',
        'password': os.environ.get('SQLSERVER_LOCAL_PASSWORD') or 'fami123.',
        'charset': 'UTF-8'
    }
    driver_param = SQLSERVER_LOCAL['driver'].replace(' ', '+')
    SQLALCHEMY_DATABASE_URI = (
        f"mssql+pyodbc://{SQLSERVER_LOCAL['username']}:{SQLSERVER_LOCAL['password']}"
        f"@{SQLSERVER_LOCAL['server']}/{SQLSERVER_LOCAL['database']}?driver={driver_param}"
    )
    # Configuración SQL Server de Producción
    SQLSERVER_PROD = {
        'driver': 'ODBC Driver 17 for SQL Server',
        'server': os.environ.get('SQLSERVER_PROD_SERVER') or 'SERV_SYSTEM',
        'database': os.environ.get('SQLSERVER_PROD_DB') or 'dbProyectManagement',
        'username': os.environ.get('SQLSERVER_PROD_USER') or 'sa',
        'password': os.environ.get('SQLSERVER_PROD_PASSWORD') or 'fami123.',
        'charset': 'UTF-8'
    }

    # Configuración SSH
    SSH_CONFIG = {
        'host': os.environ.get('SSH_HOST') or '216.238.83.71',
        'port': int(os.environ.get('SSH_PORT') or 22),
        'username': os.environ.get('SSH_USERNAME') or 'Administrador',
        'password': os.environ.get('SSH_PASSWORD') or 'f4m1s42021.,',
        'local_port': int(os.environ.get('SSH_LOCAL_PORT') or 3050),
        'remote_host': os.environ.get('SSH_REMOTE_HOST') or 'localhost',
        'remote_port': int(os.environ.get('SSH_REMOTE_PORT') or 3050)
    }
    
    # Configuración Firebird
    FIREBIRD_CONFIG = {
        'host': os.environ.get('FIREBIRD_HOST') or 'localhost',
        'database': os.environ.get('FIREBIRD_DB') or 'C:\\Microsip datos\\FAMISA 2021.FDB',
        'user': os.environ.get('FIREBIRD_USER') or 'SYSDBA',
        'password': os.environ.get('FIREBIRD_PASSWORD') or 'masterkey',
        'charset': 'UTF8',
        'port': 3050
    }

