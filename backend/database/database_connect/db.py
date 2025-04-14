import psycopg2  # Assuming you're using PostgreSQL; modify if using a different database
from database_data import DB_USER, DB_PASSWORD, DB_HOST, DB_PORT  # Import DB credentials from the `database_data.py` file

def get_db_connection():
    # Connect to the database using the credentials from `database_data.py`
    conn = psycopg2.connect(
        dbname="kinoverse_db",  # Replace with your actual database name
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    return conn
