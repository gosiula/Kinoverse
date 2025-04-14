from database.database_connect.db import get_db_connection

# Funkcja do pobrania zajętych miejsc dla danego seansu
def fetch_occupied_seats(showing_id):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        query = """
            SELECT s.id, s.row, s.number
            FROM Seats s
            JOIN Tickets t ON s.id = t.SeatsID
            JOIN Orders o ON t.OrdersID = o.id
            WHERE o.showingID = %s
        """
        cur.execute(query, (showing_id,))
        seats = cur.fetchall()

        if not seats:
            print(f"Brak zajętych miejsc dla showingID = {showing_id}")
        return [{"id": row[0], "row": row[1], "number": row[2]} for row in seats]

    except Exception as e:
        print(f"Błąd zapytania: {e}")
        return []

    finally:
        cur.close()
        conn.close()

