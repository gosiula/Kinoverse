from database.database_connect.db import get_db_connection
from strategies.ticket_factory import get_price_strategy


# Sprawdzenie, czy zamówienie istnieje
def check_order_exists(order_id):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT COUNT(*) FROM Orders WHERE ID = %s", (order_id,))
        count = cur.fetchone()[0]
        return count > 0
    except Exception as e:
        print(f"Błąd podczas sprawdzania zamówienia: {e}")
        return False
    finally:
        cur.close()
        conn.close()


# Tworzenie zamówienia
def create_order(mail, showing_id):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO Orders (mail, showingID, payed) VALUES (%s, %s, FALSE) RETURNING ID",
            (mail, showing_id)
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        return new_id
    except Exception as e:
        conn.rollback()
        print(f"Błąd podczas tworzenia zamówienia: {e}")
        return None
    finally:
        cur.close()
        conn.close()


# Aktualizacja zamówienia
def update_order_showing(order_id, showing_id):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "UPDATE Orders SET showingID = %s, created_at = CURRENT_TIMESTAMP WHERE ID = %s",
            (showing_id, order_id)
        )
        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        print(f"Błąd podczas aktualizacji zamówienia: {e}")
        return False
    finally:
        cur.close()
        conn.close()


# Usuwanie biletów
def delete_tickets(order_id):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM Tickets WHERE OrdersID = %s", (order_id,))
        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        print(f"Błąd podczas usuwania biletów: {e}")
        return False
    finally:
        cur.close()
        conn.close()


# Dodawanie biletów z miejscami
def add_tickets_with_seats(order_id, showing_id, seats, types):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Pobierz ceny biletów dla danego seansu
        cur.execute("""
            SELECT sp.normal, sp.child, sp.senior, sp.school 
            FROM Showings s
            JOIN Showing_prices sp ON s.Showing_pricesID = sp.ID
            WHERE s.ID = %s
        """, (showing_id,))
        
        prices = cur.fetchone()
        if not prices:
            raise Exception("Nie znaleziono cen dla tego seansu")
        
        normal_price, child_price, senior_price, school_price = prices
        
        # Pobierz ID sali dla tego seansu
        cur.execute("""
            SELECT Screening_roomsID 
            FROM Showings 
            WHERE ID = %s
        """, (showing_id,))
        room_id = cur.fetchone()[0]
        
        # Pobierz pojemność sali
        cur.execute("""
            SELECT capacity 
            FROM Screening_rooms 
            WHERE ID = %s
        """, (room_id,))
        room_capacity = cur.fetchone()[0]
        
        # Stwórz słownik cen
        price_dict = {
            'normal': normal_price,
            'reduced': child_price,
            'senior': senior_price,
            'school': school_price
        }
        
        # Dodaj nowe bilety
        for index, seat in enumerate(seats):
            row = seat.get('row')
            number = seat.get('number')
            
            if not row or not number:
                raise Exception(f"Brakujące dane miejsca: {seat}")
            
            # Znajdź ID miejsca na podstawie jego rzędu i numeru
            cur.execute("""
                SELECT ID 
                FROM Seats 
                WHERE row = %s AND number = %s AND Screening_roomID = %s
            """, (row, number, room_id))
            
            seat_result = cur.fetchone()
            if not seat_result:
                raise Exception(f"Nie znaleziono miejsca o rzędzie {row} i numerze {number} w sali {room_id}")
                
            seat_id = seat_result[0]
            
            key = str(index)
            ticket_type = types.get(key, "normal")
            
            # Wybieramy odpowiednią strategię dla typu biletu
            strategy = get_price_strategy(ticket_type)
            
            # Obliczamy cenę biletu z użyciem strategii
            price = strategy.get_price(price_dict, room_capacity)
            
            # Wstawiamy bilet do bazy
            cur.execute("""
                INSERT INTO Tickets (type, price, OrdersID, SeatsID)
                VALUES (%s, %s, %s, %s)
            """, (ticket_type, price, order_id, seat_id))
        
        conn.commit()
        return True
        
    except Exception as e:
        conn.rollback()
        print(f"Błąd podczas dodawania biletów: {e}")
        return False
        
    finally:
        cur.close()
        conn.close()


# Podsumowanie zamówienia
def fetch_order_details(order_id):
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # 1. Pobierz dane zamówienia wraz z danymi kina i językiem seansu
        order_query = """
            SELECT o.ID, o.mail, o.showingID, o.payed, o.created_at,
                   s.data_time, f.name as film_name, s.language, sr.name as screening_room_name,
                   c.name as cinema_name, c.address, c.city
            FROM Orders o
            JOIN Showings s ON o.showingID = s.ID
            JOIN Films f ON s.FilmID = f.ID
            JOIN Screening_rooms sr ON s.Screening_roomsID = sr.ID
            JOIN Cinemas c ON sr.CinemasID = c.ID
            WHERE o.ID = %s
        """
        cur.execute(order_query, (order_id,))
        order_result = cur.fetchone()
        
        if not order_result:
            return None
        
        # 2. Pobierz wszystkie bilety dla zamówienia
        tickets_query = """
            SELECT t.ID, t.type, t.price, s.row, s.number
            FROM Tickets t
            JOIN Seats s ON t.SeatsID = s.ID
            WHERE t.OrdersID = %s
        """
        cur.execute(tickets_query, (order_id,))
        tickets_results = cur.fetchall()
        
        # 3. Pobierz wszystkie dostępne przekąski z tabeli Snacks
        snacks_query = """
            SELECT ID, name, cathegory, price FROM Snacks
        """
        cur.execute(snacks_query)
        snacks_results = cur.fetchall()
        
        # Przygotuj dane do zwrotu
        order_data = {
            "id": order_result[0],
            "mail": order_result[1],
            "showingID": order_result[2],
            "payed": order_result[3],
            "created_at": order_result[4].isoformat() if order_result[4] else None,
            "showing_datetime": order_result[5].isoformat() if order_result[5] else None,
            "film_name": order_result[6],
            "language": order_result[7],
            "screening_room_name": order_result[8],
            "cinema": {
                "name": order_result[9],
                "address": order_result[10],
                "city": order_result[11]
            }
        }
        
        tickets_data = []
        for ticket in tickets_results:
            tickets_data.append({
                "id": ticket[0],
                "type": ticket[1],
                "price": float(ticket[2]),
                "seat": {
                    "row": ticket[3],
                    "number": ticket[4]
                }
            })
        
        snacks_data = []
        for snack in snacks_results:
            snacks_data.append({
                "id": snack[0],
                "name": snack[1],
                "category": snack[2],
                "price": float(snack[3])
            })
        
        tickets_total = sum(ticket["price"] for ticket in tickets_data)
        
        return {
            "order": order_data,
            "tickets": tickets_data,
            "snacks": snacks_data,
            "summary": {
                "tickets_total": tickets_total,
                "order_total": tickets_total
            }
        }
        
    except Exception as e:
        print(f"Błąd pobierania podsumowania zamówienia: {e}")
        return None
        
    finally:
        cur.close()
        conn.close()
