from database.database_connect.db import get_db_connection

# Funkcja pobierająca przekąski
def fetch_snacks_grouped():
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        query = """
            SELECT ID, name, cathegory, price
            FROM Snacks
        """
        cur.execute(query)
        rows = cur.fetchall()

        snacks = []
        for row in rows:
            snacks.append({
                "id": row[0],
                "name": row[1],
                "cathegory": row[2],
                "price": float(row[3])
            })

        return snacks

    finally:
        cur.close()
        conn.close()
