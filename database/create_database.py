import psycopg2
import os
import sys
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from database_data import DB_USER, DB_PASSWORD, DB_HOST, DB_PORT 

# Wymuszenie UTF-8 dla stdout (na wszelki wypadek)
sys.stdout.reconfigure(encoding='utf-8')

# Wymuszenie UTF-8 kodowania w systemie Windows (jeśli uruchamiasz z PowerShell lub CMD)
if os.name == 'nt':
    os.system('chcp 65001')

print(f"Connecting to DB with:\n user={DB_USER}\n host={DB_HOST}\n port={DB_PORT}")

# Połączenie do serwera PostgreSQL
conn = psycopg2.connect(
    dbname="postgres",
    user=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST,
    port=DB_PORT
)
conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
cur = conn.cursor()

# Tworzenie bazy danych Kinoverse
cur.execute("DROP DATABASE IF EXISTS kinoverse_db;")
cur.execute("CREATE DATABASE kinoverse_db;")
cur.close()
conn.close()
