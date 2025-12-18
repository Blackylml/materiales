import sqlite3
import sys
import os
import pyodbc
from datetime import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from config import Config

def migrate_data():
    # Conectar a SQLite
    sqlite_conn = sqlite3.connect('recibos.db')
    sqlite_cursor = sqlite_conn.cursor()
    
    # Obtener nombres de columnas
    sqlite_cursor.execute("PRAGMA table_info(recibos_material)")
    all_columns = [column[1] for column in sqlite_cursor.fetchall()]
    
    # Verificar si hay datos para migrar
    sqlite_cursor.execute("SELECT COUNT(*) FROM recibos_material")
    count = sqlite_cursor.fetchone()[0]
    print(f"Registros encontrados en SQLite: {count}")
    
    if count == 0:
        print("No hay datos para migrar.")
        return

    # Conectar a SQL Server
    conn_str = f"DRIVER={Config.SQLSERVER_LOCAL['driver']};SERVER={Config.SQLSERVER_LOCAL['server']};DATABASE={Config.SQLSERVER_LOCAL['database']};UID={Config.SQLSERVER_LOCAL['username']};PWD={Config.SQLSERVER_LOCAL['password']}"
    sqlserver_conn = pyodbc.connect(conn_str)
    sqlserver_cursor = sqlserver_conn.cursor()

    # Detectar columna IDENTITY
    sqlserver_cursor.execute("""
        SELECT name FROM sys.identity_columns 
        WHERE OBJECT_NAME(object_id) = 'recibos_material'
    """)
    identity_column_row = sqlserver_cursor.fetchone()
    identity_column = identity_column_row[0] if identity_column_row else None

    # Filtrar columnas de SQLite para no incluir la columna IDENTITY
    columns = [col for col in all_columns if col != identity_column]
    column_names = ', '.join(columns)
    placeholders = ', '.join(['?' for _ in columns])

    # Obtener datos sin la columna IDENTITY
    sqlite_cursor.execute(f"SELECT {column_names} FROM recibos_material")
    records = sqlite_cursor.fetchall()

    # Insertar registros en SQL Server
    successful = 0
    failed = 0

    for record in records:
        record = list(record)  # Convertir a lista editable

        # Normaliza campos tipo fecha
        for i, value in enumerate(record):
            if isinstance(value, str):
                try:
                    # Ajusta este formato según cómo vienen tus fechas en SQLite
                    parsed = datetime.strptime(value, "%d/%m/%Y")
                    record[i] = parsed.strftime("%Y-%m-%d")
                except Exception:
                    pass  # No es una fecha o ya está bien, se deja igual

        try:
            sqlserver_cursor.execute(
                f"INSERT INTO recibos_material ({column_names}) VALUES ({placeholders})", record
            )
            successful += 1
        except Exception as e:
            print(f"Error al insertar registro: {e}")
            failed += 1

    # Confirmar cambios y cerrar conexiones
    sqlserver_conn.commit()
    sqlserver_conn.close()
    sqlite_conn.close()
    
    print(f"Migración completada: {successful} registros transferidos, {failed} fallidos.")

if __name__ == "__main__":
    migrate_data()
