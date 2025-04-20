# import psycopg2
# from database.database_connect.db import get_db_connection

# def fetch_order_details_by_id(order_id):
#     conn = get_db_connection()
#     cur = conn.cursor()
    
#     try:
#         query = """
#         SELECT 
#             s.data_time,
#             f.name AS film_name
#         FROM Orders o
#         JOIN Showings s ON o.showingID = s.ID
#         JOIN Films f ON s.FilmID = f.ID
#         WHERE o.ID = %s;
#         """
#         cur.execute(query, (order_id,))
#         return cur.fetchone()  # Zwraca pojedynczy wiersz z danymi

#     except Exception as e:
#         print(f"Błąd podczas pobierania szczegółów zamówienia: {e}")
#         return None
#     finally:
#         cur.close()
#         conn.close()
