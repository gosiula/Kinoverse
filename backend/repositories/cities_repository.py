from database.database_connect.db import get_db_connection

# Funkcja do pobierania miast
def fetch_cities():
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT DISTINCT ON (name) id, name FROM Cinemas")

        cities = cur.fetchall()

        cities_list = [{"id": row[0], "name": row[1]} for row in cities]
        return cities_list

    except Exception as e:
        print(f"Błąd zapytania: {e}")
        return []
    finally:
        cur.close()
        conn.close()
