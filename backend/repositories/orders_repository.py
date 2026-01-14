from database.database_connect.db import get_db_connection
from strategies.ticket_factory import get_price_strategy

def is_order_editable(order_id):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT s.data_time 
            FROM Showings s
            JOIN Orders o ON s.ID = o.showingID
            WHERE o.ID = %s AND s.data_time > NOW()
        """, (order_id,))
        return cur.fetchone() is not None
    finally:
        cur.close()
        conn.close()


def update_order_email(order_id, email):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT 1
            FROM Showings s
            JOIN Orders o ON s.ID = o.showingID
            WHERE o.ID = %s AND s.data_time > NOW()
        """, (order_id,))

        if not cur.fetchone():
            return False

        cur.execute("""
            UPDATE Orders SET mail = %s, payed = TRUE
            WHERE ID = %s
        """, (email, order_id))

        conn.commit()
        return True
    except Exception as e:
        print(f"Błąd update_order_email: {e}")
        conn.rollback()
        return False
    finally:
        cur.close()
        conn.close()


def update_order_snacks(order_id, snack_quantities):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT 1
            FROM Showings s
            JOIN Orders o ON s.ID = o.showingID
            WHERE o.ID = %s AND s.data_time > NOW()
        """, (order_id,))
        if not cur.fetchone():
            return False

        cur.execute("DELETE FROM Order_snacks WHERE OrdersID = %s", (order_id,))

        for snack_name, quantity in (snack_quantities or {}).items():
            if quantity <= 0 or quantity > 50:
                return False

            cur.execute("SELECT ID FROM Snacks WHERE name = %s", (snack_name,))
            snack_row = cur.fetchone()
            if not snack_row:
                return False

            snack_id = snack_row[0]
            cur.execute("""
                INSERT INTO Order_snacks (OrdersID, SnacksID, quantity)
                VALUES (%s, %s, %s)
            """, (order_id, snack_id, quantity))

        conn.commit()
        return True
    except Exception as e:
        print(f"Błąd update_order_snacks: {e}")
        conn.rollback()
        return False
    finally:
        cur.close()
        conn.close()



def update_order_tickets(order_id, ticket_quantities):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # sprawdź czy seans przyszły + pobierz typ seansu
        cur.execute("""
            SELECT s.type
            FROM Showings s
            JOIN Orders o ON s.ID = o.showingID
            WHERE o.ID = %s AND s.data_time > NOW()
        """, (order_id,))
        row = cur.fetchone()
        if not row:
            return False

        showing_type = row[0]

        # Dla SCHOOL nie zmieniamy biletów tutaj
        # (bo to ma być cała sala, i łatwo to zepsuć edycją normal/reduced/senior)
        if showing_type == "school":
            return True

        # --- NORMAL: aktualizujemy bilety wg kluczy normal/reduced/senior ---
        tq = ticket_quantities or {}
        total_new = int(tq.get("normal", 0)) + int(tq.get("reduced", 0)) + int(tq.get("senior", 0))

        # pobierz istniejące bilety w tym orderze
        cur.execute("SELECT ID FROM Tickets WHERE OrdersID = %s ORDER BY ID", (order_id,))
        existing = [r[0] for r in cur.fetchall()]

        # dopasuj ilość biletów (usuń / dodaj)
        if len(existing) > total_new:
            to_delete = existing[total_new:]
            for ticket_id in to_delete:
                cur.execute("DELETE FROM Tickets WHERE ID = %s", (ticket_id,))
            existing = existing[:total_new]

        elif len(existing) < total_new:
            missing = total_new - len(existing)
            for _ in range(missing):
                cur.execute("""
                    INSERT INTO Tickets (type, price, OrdersID)
                    VALUES ('normal', 0, %s)
                    RETURNING ID
                """, (order_id,))
                existing.append(cur.fetchone()[0])

        # teraz ustaw typy + ceny (ceny docelowo weź z Showing_prices, ale tu minimalnie)
        idx = 0
        def apply_type(ticket_type, count, price):
            nonlocal idx
            for _ in range(count):
                ticket_id = existing[idx]
                cur.execute("""
                    UPDATE Tickets SET type = %s, price = %s
                    WHERE ID = %s
                """, (ticket_type, price, ticket_id))
                idx += 1

        apply_type("normal", int(tq.get("normal", 0)), 15.0)
        apply_type("reduced", int(tq.get("reduced", 0)), 10.0)
        apply_type("senior", int(tq.get("senior", 0)), 10.0)

        conn.commit()
        return True

    except Exception as e:
        print(f"Błąd update_order_tickets: {e}")
        conn.rollback()
        return False
    finally:
        cur.close()
        conn.close()


def fetch_showings_by_email_and_date(email, start_date, end_date):
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        query = """
        SELECT 
            s.data_time,
            sr.name AS screening_room_name,
            c.name AS cinema_name,
            c.address,
            s.language,
            s.type,
            sr.capacity,
            s.ID,
            f.name AS film_name,
            COUNT(CASE WHEN t.type = 'normal' THEN 1 END) AS normal_count,
            COUNT(CASE WHEN t.type = 'reduced' THEN 1 END) AS reduced_count,
            COUNT(CASE WHEN t.type = 'senior' THEN 1 END) AS senior_count,
            COUNT(CASE WHEN t.type = 'school' THEN 1 END) AS school_count,
            COALESCE(snack_summary_data.snack_summary, 'Brak przekąsek') AS snack_summary,
            COALESCE(SUM(CASE WHEN t.type != 'school' THEN t.price ELSE 0 END), 0) AS ticket_total_excl_school,
            COALESCE(snack_summary_data.total_snacks_price, 0) AS snack_total,
            STRING_AGG(DISTINCT s_seats.row || s_seats.number, ', ') AS seat_locations,
            MAX(CASE WHEN t.type = 'normal' THEN t.price END) AS normal_price,
            MAX(CASE WHEN t.type = 'reduced' THEN t.price END) AS reduced_price,
            MAX(CASE WHEN t.type = 'senior' THEN t.price END) AS senior_price,
            MAX(CASE WHEN t.type = 'school' THEN t.price END) AS school_price
        FROM Orders o
        JOIN Showings s ON o.showingID = s.ID
        JOIN Films f ON s.FilmID = f.ID
        JOIN Screening_rooms sr ON s.Screening_roomsID = sr.ID
        JOIN Cinemas c ON sr.CinemasID = c.ID
        LEFT JOIN Tickets t ON t.OrdersID = o.ID
        LEFT JOIN Seats s_seats ON t.SeatsID = s_seats.ID
        LEFT JOIN (
            SELECT 
                os.OrdersID,
                SUM(sn.price * os.quantity) AS total_snacks_price,
                STRING_AGG(sn.name || ' (' || os.quantity || ' szt.)', ', ') AS snack_summary
            FROM Order_snacks os
            JOIN Snacks sn ON sn.ID = os.SnacksID
            GROUP BY os.OrdersID
        ) AS snack_summary_data ON snack_summary_data.OrdersID = o.ID
        WHERE o.mail = %s
          AND s.data_time BETWEEN %s AND %s
        GROUP BY s.data_time, sr.name, c.name, c.address, s.language, s.type, sr.capacity, s.ID, f.name, snack_summary_data.snack_summary, snack_summary_data.total_snacks_price
        ORDER BY s.data_time;
        """
        cur.execute(query, (email, start_date, end_date))
        return cur.fetchall()

    except Exception as e:
        print(f"Błąd podczas pobierania seansów użytkownika: {e}")
        return []
    finally:
        cur.close()
        conn.close()



def find_order_by_id(order_id):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT id FROM Orders WHERE id = %s", (order_id,))
        return cur.fetchone()
    except Exception as e:
        print(f"Błąd zapytania: {e}")
        return None
    finally:
        cur.close()
        conn.close()


def delete_order(order_id):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT s.data_time 
            FROM Showings s
            JOIN Orders o ON s.ID = o.showingID
            WHERE o.ID = %s AND s.data_time > NOW()
        """, (order_id,))
        
        if not cur.fetchone():
            raise ValueError("Seans nie istnieje lub jest w przeszłości")
            return False

        cur.execute("DELETE FROM Orders WHERE id = %s", (order_id,))
        conn.commit()
    except Exception as e:
        print(f"Błąd podczas usuwania: {e}")
    finally:
        cur.close()
        conn.close()


def fetch_orders_by_showing_id(showing_id):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        query = """
        SELECT 
            o.ID AS order_id,
            o.mail,
            o.payed,
            COUNT(t.ID) AS ticket_count,
            STRING_AGG(DISTINCT t.type, ', ') AS ticket_types,
            0 AS tickets_price,
            COALESCE(snacks_data.total_snacks_price, 0) AS snacks_price,
            COALESCE(snacks_data.snack_summary, 'Brak przekąsek.') AS snack_summary,
            sr.name AS screening_room_name
        FROM Orders o
        JOIN Showings s ON o.showingID = s.ID
        JOIN Films f ON s.FilmID = f.ID
        JOIN Screening_rooms sr ON s.Screening_roomsID = sr.ID
        JOIN Cinemas c ON sr.CinemasID = c.ID
        LEFT JOIN Tickets t ON t.OrdersID = o.ID
        LEFT JOIN Users u ON o.mail = u.mail
        LEFT JOIN (
            SELECT 
                os.OrdersID,
                SUM(sn.price * os.quantity) AS total_snacks_price,
                STRING_AGG(sn.name || ' (' || os.quantity || ' szt.)', ', ') AS snack_summary
            FROM Order_snacks os
            JOIN Snacks sn ON sn.ID = os.SnacksID
            GROUP BY os.OrdersID
        ) snacks_data ON snacks_data.OrdersID = o.ID
        WHERE s.ID = %s
        GROUP BY o.ID, o.mail, o.payed, sr.name, snacks_data.total_snacks_price, snacks_data.snack_summary
        ORDER BY o.ID;
        """
        cur.execute(query, (showing_id,))
        rows = cur.fetchall()

        result = []
        for row in rows:
            order_id = row[0]

            # Pobierz miejsca
            seats_query = """
            SELECT s.row, s.number
            FROM Tickets t
            JOIN Seats s ON t.SeatsID = s.ID
            WHERE t.OrdersID = %s
            ORDER BY s.row, s.number;
            """
            cur.execute(seats_query, (order_id,))
            seats_rows = cur.fetchall()
            seat_list = [f"{seat[0]}{seat[1]}" for seat in seats_rows]

            # Pobierz bilety (do przeliczenia ceny)
            cur.execute("""
                SELECT type, price FROM Tickets WHERE OrdersID = %s
            """, (order_id,))
            ticket_prices = cur.fetchall()

            total_ticket_price = 0.0
            seen_school = False
            for ticket_type, price in ticket_prices:
                if ticket_type == 'school':
                    if not seen_school:
                        total_ticket_price += float(price)
                        seen_school = True
                else:
                    total_ticket_price += float(price)

            ticket_summary_query = """
                SELECT type, COUNT(*) 
                FROM Tickets 
                WHERE OrdersID = %s 
                GROUP BY type
            """
            cur.execute(ticket_summary_query, (order_id,))
            ticket_summary_rows = cur.fetchall()

            ticket_summary = {
                "normal": 0,
                "reduced": 0,
                "school": 0,
                "senior": 0
            }

            for ticket_type, count in ticket_summary_rows:
                if ticket_type in ticket_summary:
                    ticket_summary[ticket_type] = count

            result.append({
                "order_id": order_id,
                "mail": row[1],
                "payed": row[2],
                "occupied_seats": seat_list,
                "seats_formatted": ", ".join(seat_list),
                "ticket_count": row[3],
                "ticket_types": row[4].split(', ') if row[5] else [],
                "ticket_summary": ticket_summary,
                "tickets_price": round(total_ticket_price, 2),
                "snacks_price": float(row[6]),
                "snacks": row[7] if row[7] else "Brak przekąsek.",
                "total_price": round(total_ticket_price + float(row[6]), 2),
                "screening_room_name": row[8]
            })

        return result

    except Exception as e:
        print(f"Błąd podczas pobierania zamówień: {e}")
        return []
    finally:
        cur.close()
        conn.close()


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
        cur.execute("""
            SELECT s.data_time 
            FROM Showings s
            JOIN Orders o ON s.ID = o.showingID
            WHERE o.ID = %s AND s.data_time > NOW()
        """, (order_id,))
        
        if not cur.fetchone():
            raise ValueError("Seans nie istnieje lub jest w przeszłości")
            return False

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
        cur.execute("""
            SELECT s.data_time 
            FROM Showings s
            JOIN Orders o ON s.ID = o.showingID
            WHERE o.ID = %s AND s.data_time > NOW()
        """, (order_id,))
        
        if not cur.fetchone():
            raise ValueError("Seans nie istnieje lub jest w przeszłości")
            return False

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
        cur.execute("""
            SELECT s.data_time 
            FROM Showings s
            JOIN Orders o ON s.ID = o.showingID
            WHERE o.ID = %s AND s.data_time > NOW()
        """, (order_id,))
        
        if not cur.fetchone():
            raise ValueError("Seans nie istnieje lub jest w przeszłości")
            return False
            
        # Pobierz ceny biletów dla danego seansu
        cur.execute("""
            SELECT sp.normal, sp.reduced, sp.senior, sp.school 
            FROM Showings s
            JOIN Showing_prices sp ON s.Showing_pricesID = sp.ID
            WHERE s.ID = %s
        """, (showing_id,))
        
        prices = cur.fetchone()
        if not prices:
            raise Exception("Nie znaleziono cen dla tego seansu")
        
        normal_price, reduced_price, senior_price, school_price = prices
        
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
            'reduced': reduced_price,
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
                SELECT s.ID 
                FROM Seats s
                WHERE s.row = %s AND s.number = %s AND s.Screening_roomID = %s
                FOR UPDATE
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
                   s.data_time, f.name as film_name, s.language, s.type, sr.name as screening_room_name,
                   c.name as cinema_name, c.address, c.city, s.ID as showing_id, sr.capacity
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
        
        # 4. Pobierz przekąski zamówione przez użytkownika
        ordered_snacks_query = """
            SELECT s.ID, s.name, s.cathegory, s.price, os.quantity
            FROM Order_snacks os
            JOIN Snacks s ON os.SnacksID = s.ID
            WHERE os.OrdersID = %s
        """
        cur.execute(ordered_snacks_query, (order_id,))
        ordered_snacks_results = cur.fetchall()
        
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
            "type": order_result[8],
            "screening_room_name": order_result[9],
            "cinema": {
                "name": order_result[10],
                "address": order_result[11],
                "city": order_result[12]
            },
            "showing_id": order_result[13],
            "capacity": order_result[14]
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
                "type": snack[2],
                "price": float(snack[3])
            })
        
        ordered_snacks_data = []
        for snack in ordered_snacks_results:
            ordered_snacks_data.append({
                "id": snack[0],
                "name": snack[1],
                "type": snack[2],
                "price": float(snack[3]),
                "quantity": snack[4]
            })
        
        tickets_total = sum(ticket["price"] for ticket in tickets_data)
        snacks_total = sum(snack["price"] * snack["quantity"] for snack in ordered_snacks_data)
        order_total = tickets_total + snacks_total
        
        return {
            "order": order_data,
            "tickets": tickets_data,
            "snacks": snacks_data, 
            "ordered_snacks": ordered_snacks_data,
            "summary": {
                "tickets_total": tickets_total,
                "snacks_total": snacks_total,
                "order_total": order_total
            }
        }
        
    except Exception as e:
        print(f"Błąd pobierania podsumowania zamówienia: {e}")
        return None
        
    finally:
        cur.close()
        conn.close()
