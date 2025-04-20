from database.database_connect.db import get_db_connection
from collections import defaultdict
import base64
from datetime import datetime

# Funkcja do pobierania wszytskich pokazów normalnych po dacie
def fetch_showings_by_filters(date, cinema_id):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        query = """
            SELECT 
                s.ID,               -- ID seansu
                s.data_time,        -- Data i godzina seansu
                s.language,         -- Język seansu
                f.ID,               -- ID filmu
                f.name,             -- Nazwa filmu
                f.description,      -- Opis filmu
                f.photo             -- Zdjęcie filmu
            FROM Showings s
            JOIN Films f ON s.FilmID = f.ID
            JOIN Screening_rooms sr ON s.Screening_roomsID = sr.ID
            JOIN Cinemas c ON sr.CinemasID = c.ID
            WHERE DATE(s.data_time) = %s
              AND s.type = %s
              AND c.ID = %s
        """
        cur.execute(query, (date, "normal", cinema_id))
        rows = cur.fetchall()

        films_showings = defaultdict(list)

        for row in rows:
            showing = {
                "id": row[0],
                "hour": row[1].time().isoformat(timespec='minutes'),
                "language": row[2],
            }
            film_id = row[3]
            film_name = row[4]
            film_description = row[5]
            film_photo = base64.b64encode(row[6]).decode('utf-8') if row[6] else None
            
            films_showings[film_id, film_name, film_description, film_photo].append(showing)

        result = []
        for (film_id, film_name, film_description, film_photo), showings in films_showings.items():
            showings_sorted = sorted(showings, key=lambda x: x["hour"])

            result.append({
                "film_id": film_id,
                "name": film_name,
                "description": film_description,
                "photo": film_photo,
                "date": date,
                "showings": showings_sorted
            })

        return result
    except Exception as e:
        print(f"Błąd zapytania: {e}")
        return []
    finally:
        cur.close()
        conn.close()


# Funkcja do pobierania wszystkich pokazów typu "school" po dacie
def fetch_showings_for_school(date, cinema_id):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        query = """
            SELECT 
                s.ID,               -- ID seansu
                s.data_time,        -- Data i godzina seansu
                s.language,         -- Język seansu
                f.ID,               -- ID filmu
                f.name,             -- Nazwa filmu
                f.description,      -- Opis filmu
                f.photo             -- Zdjęcie filmu
            FROM Showings s
            JOIN Films f ON s.FilmID = f.ID
            JOIN Screening_rooms sr ON s.Screening_roomsID = sr.ID
            JOIN Cinemas c ON sr.CinemasID = c.ID
            WHERE DATE(s.data_time) = %s
              AND s.type = %s
              AND c.ID = %s
        """
        cur.execute(query, (date, "school", cinema_id))
        rows = cur.fetchall()

        films_showings = defaultdict(list)

        for row in rows:
            showing = {
                "id": row[0],
                "hour": row[1].time().isoformat(timespec='minutes'),
                "language": row[2],
            }
            film_id = row[3]
            film_name = row[4]
            film_description = row[5]
            film_photo = base64.b64encode(row[6]).decode('utf-8') if row[6] else None
            
            films_showings[film_id, film_name, film_description, film_photo].append(showing)

        result = []
        for (film_id, film_name, film_description, film_photo), showings in films_showings.items():
            showings_sorted = sorted(showings, key=lambda x: x["hour"])

            result.append({
                "film_id": film_id,
                "name": film_name,
                "description": film_description,
                "photo": film_photo,
                "date": date,
                "showings": showings_sorted
            })

        return result
    except Exception as e:
        print(f"Błąd zapytania: {e}")
        return []
    finally:
        cur.close()
        conn.close()



# Pobieranie typu seansu
def fetch_showing_type_by_id(showing_id):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT type FROM Showings WHERE ID = %s", (showing_id,))
        row = cur.fetchone()
        return row[0] if row else None
    except Exception as e:
        print(f"Błąd pobierania typu: {e}")
        return None
    finally:
        cur.close()
        conn.close()

# Pobieranie informacji o normalnym seansie
def fetch_normal_showing_details_by_id(showing_id):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        query = """
        SELECT 
            f.name AS film_name,
            c.name AS cinema_name,
            c.address AS cinema_address,
            sr.capacity AS capacity,
            sr.name AS screening_room_name,
            s.data_time AS showing_time,
            s.language AS showing_language,
            sr.ID AS screening_room_id,
            s.Showing_pricesID AS showing_prices_id
        FROM Showings s
        JOIN Films f ON s.FilmID = f.ID
        JOIN Screening_rooms sr ON s.Screening_roomsID = sr.ID
        JOIN Cinemas c ON sr.CinemasID = c.ID
        WHERE s.ID = %s;
        """
        cur.execute(query, (showing_id,))
        row = cur.fetchone()

        if row:
            film_name, cinema_name, cinema_address, capacity, screening_room_name, showing_time, showing_language, screening_room_id, showing_prices_id = row

            # Zapytanie o ceny biletów
            price_query = """
            SELECT normal, reduced, senior, school
            FROM Showing_prices
            WHERE ID = %s;
            """
            cur.execute(price_query, (showing_prices_id,))
            price_row = cur.fetchone()

            if price_row:
                normal_price, reduced_price, senior_price, school_price = price_row
            else:
                normal_price = reduced_price = senior_price = school_price = None

            # Zapytanie o liczbę zajętych miejsc
            occupied_query = """
            SELECT COUNT(DISTINCT t.SeatsID)
            FROM Tickets t
            JOIN Orders o ON t.OrdersID = o.ID
            WHERE o.showingID = %s;
            """
            cur.execute(occupied_query, (showing_id,))
            occupied_seats = cur.fetchone()[0]

            empty_seats = capacity - occupied_seats

            result = {
                "film_name": film_name,
                "cinema_name": cinema_name,
                "cinema_address": cinema_address,
                "capacity": capacity,
                "screening_room_name": screening_room_name,
                "empty_seats": empty_seats,
                "showing_time": showing_time.strftime("%Y-%m-%d %H:%M:%S"),
                "showing_language": showing_language,
                "prices": {
                    "normal": normal_price,
                    "reduced": reduced_price,
                    "senior": senior_price,
                    "school": school_price
                }
            }
            return result
        else:
            return None

    except Exception as e:
        print(f"Błąd zapytania: {e}")
        return None
    finally:
        cur.close()
        conn.close()


# Pobieranie informacji o seansie szkolnym
def fetch_school_showing_details_by_id(showing_id):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        query = """
        SELECT 
            c.name AS cinema_name,
            c.address AS cinema_address,
            sr.name AS screening_room_name,
            s.data_time AS showing_time,
            s.language AS showing_language,
            sr.capacity,
            sp.school
        FROM Showings s
        JOIN Screening_rooms sr ON s.Screening_roomsID = sr.ID
        JOIN Cinemas c ON sr.CinemasID = c.ID
        JOIN Showing_prices sp ON s.Showing_pricesID = sp.ID
        WHERE s.ID = %s;
        """
        cur.execute(query, (showing_id,))
        row = cur.fetchone()

        if not row:
            return None

        (cinema_name, cinema_address, screening_room_name,
         showing_time, showing_language, capacity, school_price) = row

        cur.execute("SELECT name, price FROM Snacks;")
        snacks = [{"name": name, "price": float(price)} for name, price in cur.fetchall()]

        return {
            "cinema_name": cinema_name,
            "cinema_address": cinema_address,
            "screening_room_name": screening_room_name,
            "showing_time": showing_time.strftime("%Y-%m-%d %H:%M:%S"),
            "showing_language": showing_language,
            "capacity": capacity,
            "price": school_price,
            "snacks": snacks
        }

    except Exception as e:
        print(f"Błąd szkolnego zapytania: {e}")
        return None
    finally:
        cur.close()
        conn.close()
