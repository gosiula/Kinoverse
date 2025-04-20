from database.database_connect.db import get_db_connection
from strategies.ticket_factory import get_price_strategy

# Finalizacja zamówienia
def set_order_email_and_status(order_id, email):
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

        cur.execute("""
            UPDATE Orders
            SET mail = %s, payed = TRUE
            WHERE ID = %s
        """, (email, order_id))

        conn.commit()
        return True

    except Exception as e:
        print(f"Błąd aktualizacji zamówienia: {e}")
        return False

    finally:
        cur.close()
        conn.close()


def add_snacks_to_order(order_id, snack_quantities):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Jeżeli nie przesłano przekąsek – inicjalizujemy pusty słownik
        if not isinstance(snack_quantities, dict):
            snack_quantities = {}

        # Sprawdź, czy zamówienie nadal jest ważne
        cur.execute("""
            SELECT s.data_time 
            FROM Showings s
            JOIN Orders o ON s.ID = o.showingID
            WHERE o.ID = %s AND s.data_time > NOW()
        """, (order_id,))
        
        if not cur.fetchone():
            print("Nie można dodać przekąsek – seans w przeszłości")
            return False

        # Usuwamy wszystkie istniejące przekąski
        cur.execute("""
            DELETE FROM Order_snacks 
            WHERE OrdersID = %s
        """, (order_id,))

        if not snack_quantities:
            conn.commit()
            return True

        # Dodaj nowe przekąski (jeśli jakiekolwiek są)
        for snack_name, quantity in snack_quantities.items():
            if quantity <= 0 or quantity > 50:
                raise ValueError(f"Nieprawidłowa ilość przekąski: {snack_name}")

            cur.execute("SELECT ID FROM Snacks WHERE name = %s", (snack_name,))
            snack_id_row = cur.fetchone()
            if not snack_id_row:
                raise ValueError(f"Brak przekąski: {snack_name}")
            snack_id = snack_id_row[0]

            cur.execute("""
                INSERT INTO Order_snacks (OrdersID, SnacksID, quantity)
                VALUES (%s, %s, %s)
            """, (order_id, snack_id, quantity))

        conn.commit()
        return True

    except Exception as e:
        print(f"Błąd dodawania przekąsek: {e}")
        return False

    finally:
        cur.close()
        conn.close()


# Pobranie typu seansu
def get_showing_type(showing_id):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT type FROM Showings WHERE ID = %s", (showing_id,))
        row = cur.fetchone()
        return row[0] if row else None
    finally:
        cur.close()
        conn.close()


# Stworzenie zamówienia dla szkoły
def create_school_order(showing_id):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # 1. Tworzymy zamówienie
        cur.execute("""
            INSERT INTO Orders (showingID, payed)
            VALUES (%s, FALSE)
            RETURNING ID
        """, (showing_id,))
        new_order_id = cur.fetchone()[0]

        # 2. Pobieramy Screening room ID
        cur.execute("""
            SELECT Screening_roomsID FROM Showings WHERE ID = %s
        """, (showing_id,))
        room_row = cur.fetchone()
        if not room_row:
            raise ValueError("Brak sali dla seansu")
        room_id = room_row[0]

        # 3. Pobieramy wszystkie Seats z tej sali
        cur.execute("""
            SELECT ID FROM Seats WHERE Screening_roomID = %s
        """, (room_id,))
        seat_rows = cur.fetchall()
        if not seat_rows:
            raise ValueError("Brak miejsc w sali")

        # 4. Pobieramy wszystkie ceny biletów i pojemność sali
        cur.execute("""
            SELECT sp.normal, sp.reduced, sp.senior, sp.school, sr.capacity
            FROM Showings s
            JOIN Showing_prices sp ON s.Showing_pricesID = sp.ID
            JOIN Screening_rooms sr ON s.Screening_roomsID = sr.ID
            WHERE s.ID = %s
        """, (showing_id,))
        row = cur.fetchone()
        if not row:
            raise ValueError("Brak danych o cenach lub pojemności sali")

        normal_price, reduced_price, senior_price, school_price, capacity = row
        
        # Tworzymy słownik cen zgodny z oczekiwaniami strategii
        price_dict = {
            'normal': normal_price,
            'reduced': reduced_price,
            'senior': senior_price,
            'school': school_price
        }
        
        # Pobieramy strategię dla biletu szkolnego
        school_strategy = get_price_strategy('school')
        
        # Obliczamy cenę biletu przy użyciu strategii
        ticket_price = school_strategy.get_price(price_dict, capacity)

        # 5. Dodajemy bilety dla wszystkich miejsc
        for seat_row in seat_rows:
            seat_id = seat_row[0]
            cur.execute("""
                INSERT INTO Tickets (type, price, OrdersID, SeatsID)
                VALUES ('school', %s, %s, %s)
            """, (ticket_price, new_order_id, seat_id))

        conn.commit()
        return new_order_id

    except Exception as e:
        print(f"Błąd tworzenia zamówienia szkoły: {e}")
        conn.rollback()
        return None

    finally:
        cur.close()
        conn.close()

