import psycopg2
import random
import os
from pathlib import Path
import bcrypt
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from datetime import datetime, timedelta
from database_data import DB_USER, DB_PASSWORD, DB_HOST, DB_PORT 

# Połączenie do nowej bazy
conn = psycopg2.connect(
    dbname="kinoverse_db",
    user=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST,
    port=DB_PORT
)
cur = conn.cursor()

# Funkcja do generowania haszowanego hasła
def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Lista miast i przykładowych ulic
cities = ['Warszawa', 'Katowice', 'Gdańsk', 'Wrocław']
streets = {
    'Wrocław': ['Sucha 1'],
    'Warszawa': ['Złota 59'],
    'Katowice': ['3 Maja 30'],
    'Gdańsk': ['Grunwaldzka 141']
}

cinemas = []

# Tworzenie listy kin, przydzielając odpowiednią ulicę do miasta
for city in cities:
    for street in streets[city]:
        cinema_name = f'Kinoverse {city}'
        cinemas.append((cinema_name, city, street))

# Dodawanie kin do bazy danych
for cinema in cinemas:
    cinema_name, city, street = cinema
    cur.execute("""
    INSERT INTO Cinemas (name, city, address)
    VALUES (%s, %s, %s);
    """, (cinema_name, city, street))

# Dodawanie filmów
films = [
    ('Barbie i Podwodna Tajemnica', 'Barbie odkrywa tajemnice podwodnego świata i walczy o ratunek dla swojej przyjaciółki.', 'barbie.png'),
    ('Frozen', 'Frozen to historia o magicznej krainie, gdzie siostry Elsa i Anna przeżywają niesamowite przygody.', 'frozen.png'),
    ('Shrek', 'Shrek to zabawna opowieść o zielonym ogrze, który nie boi się wyzwań i niezwykłych sytuacji.', 'shrek.png'),
    ('Harry Potter', 'Harry Potter to młody czarodziej, który uczęszcza do najbardziej znanej szkoły magii na świecie.', 'harry_potter.png'),
    ('Leon Zawodowiec', 'Leon to profesjonalny zabójca, który nawiązuje nietypową relację z dziewczynką szukającą zemsty.', 'leon.png')
]

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
IMAGES_DIR = BASE_DIR / "images"

for film in films:
    image_path = IMAGES_DIR / film[2]

    with open(image_path, "rb") as f:
        photo_data = f.read()
    cur.execute("""
    INSERT INTO Films (name, description, photo)
    VALUES (%s, %s, %s);
    """, (film[0], film[1], photo_data))

# Dodawanie sal kinowych
rooms = []
for cinema_id in range(1, 5):  # 4 kina
    for i in range(1, 3):  # 2 sale na kino
        capacity = 60 if i == 1 else 80
        room_name = f"sala {i}"
        cur.execute("""
        INSERT INTO Screening_rooms (name, capacity, CinemasID)
        VALUES (%s, %s, %s);
        """, (room_name, capacity, cinema_id))

for room_id in range(1, 9):  # 8 sal
    cur.execute("SELECT capacity FROM Screening_rooms WHERE ID = %s AND capacity = 60;", (room_id,))
    result = cur.fetchone()
    
    if result is not None:
        capacity = 60
    else:
        # Jeśli nie ma sali z pojemnością 60, to możemy założyć, że jest to sala z pojemnością 80
        capacity = 80
    
    rows = 6 if capacity == 60 else 8
    columns = 10
    for row in range(1, rows + 1):
        for column in range(1, columns + 1):
            seat_row = chr(64 + row)
            seat_number = column
            cur.execute("""
            INSERT INTO Seats (row, number, Screening_roomID)
            VALUES (%s, %s, %s);
            """, (seat_row, seat_number, room_id))

def generate_school_price():
    lcm = 240  # najmn. wspólna wielokrotność 60 i 80
    # ceny w groszach: 1200 zł -> 120000 gr, 1500 zł -> 150000 gr
    min_cents = 120000
    max_cents = 150000

    # Znajdź wszystkie groszowe ceny podzielne przez 240 w tym zakresie
    valid_prices = [x for x in range(min_cents, max_cents + 1) if x % lcm == 0]

    # Wybierz losową i zamień na złotówki (z 2 miejscami po przecinku)
    random_price_cents = random.choice(valid_prices)
    return round(random_price_cents / 100, 2)

# Dodawanie cen biletów
for _ in range(5):
    normal_price = random.randint(30, 40)
    reduced_price = normal_price - 10
    senior_price = normal_price - 15
    school_price = generate_school_price()
    cur.execute("""
    INSERT INTO Showing_prices (normal, reduced, senior, school)
    VALUES (%s, %s, %s, %s);
    """, (normal_price, reduced_price, senior_price, school_price))

from datetime import timedelta

# Funkcja generująca losowe godziny seansów, kończące się na 0, 15, 30, 45 minut
def generate_showtimes_for_day(date):
    showtimes = []
    
    # Liczba seansów (do 4-5 powtórzeń)
    number_of_showings = random.randint(4, 5)
    
    # Ustalamy możliwe godziny (na pełne godziny i na minuty 15, 30, 45)
    possible_minutes = [0, 15, 30, 45]

    # Generowanie godzin seansów w przedziale 8:00 - 23:00
    # Losowanie pierwszego seansu (od 8:00 do 21:00)
    start_hour = 8
    end_hour = 23  # Ostatni seans musi kończyć się przed 23:00

    # Pierwszy seans musi być między 8:00 a 21:00 (ze względu na godzinę zakończenia)
    first_showtime = date.replace(hour=random.randint(start_hour, end_hour - 1), minute=random.choice(possible_minutes))
    showtimes.append(first_showtime)
    
    # Losowanie kolejnych seansów
    for _ in range(1, number_of_showings):
        last_showtime = showtimes[-1]
        
        # Dodanie przerwy minimum 2 godziny (od 2 do 3 godzin przerwy)
        next_showtime = last_showtime + timedelta(hours=random.randint(2, 3), minutes=random.choice(possible_minutes))
        
        # Upewniamy się, że godzina nie przekroczy 23:00
        if next_showtime.hour < end_hour and next_showtime.hour > start_hour:
            showtimes.append(next_showtime)
    
    return showtimes


# Dodawanie seansów
start_date = datetime(2026, 1, 1)
end_date = datetime(2026, 2, 1)

# Pętla przez 5 filmów i 8 sal
for film_id in range(1, 6):  # 5 filmów
    for room_id in range(1, 9):  # 8 sal (screening_room_id od 1 do 8)
        # Przechodzimy po każdym dniu od start_date do end_date
        current_date = start_date
        while current_date <= end_date:
            # Generowanie godzin seansów dla danego dnia
            showtimes = generate_showtimes_for_day(current_date)
            
            # Dodajemy seanse do bazy danych
            for showing_time in showtimes:
                language = random.choice(['angielski', 'polski'])
                showing_type = random.choice(['normal', 'school'])
                showing_price_id = random.randint(1, 5)
                
                # Konwertujemy godzinę seansu na timestamp
                cur.execute("""
                INSERT INTO Showings (data_time, language, type, FilmID, Showing_pricesID, Screening_roomsID)
                VALUES (%s, %s, %s, %s, %s, %s);
                """, (showing_time, language, showing_type, film_id, showing_price_id, room_id))
            
            # Przechodzimy do następnego dnia
            current_date += timedelta(days=1)

# Dodawanie przekąsek
snacks = [
    ('Popcorn', 'Jedzenie', random.randint(20, 30)),
    ('Nachosy', 'Jedzenie', random.randint(20, 30)),
    ('Cola', 'Picie', random.randint(20, 30)),
    ('Fanta', 'Picie', random.randint(20, 30)),
    ('Sprite', 'Picie', random.randint(20, 30))
]

for snack in snacks:
    cur.execute("""
    INSERT INTO Snacks (name, cathegory, price)
    VALUES (%s, %s, %s);
    """, (snack[0], snack[1], snack[2]))

# Dodawanie użytkowników
users = [
    ('admin@gmail.com', hash_password('admin'), 'ADMIN'),
    ('employee@gmail.com', hash_password('employee'), 'EMPLOYEE'),
]

for i in range(1, 501):
    email = f'{i}@gmail.com'
    password = '1'
    hashed_password = hash_password(password)
    users.append((email, hashed_password, 'USER'))

for user in users:
    cur.execute("""
    INSERT INTO Users (mail, password, role)
    VALUES (%s, %s, %s);
    """, (user[0], user[1], user[2]))

import faker
fake = faker.Faker('pl_PL')

# Aktualizacja danych użytkowników - losowe imiona i nazwiska
cur.execute("SELECT ID FROM Users WHERE role = 'USER'")
user_ids = [row[0] for row in cur.fetchall()]

for user_id in user_ids:
    name = fake.first_name()
    surname = fake.last_name()
    cur.execute("""
    UPDATE Users
    SET name = %s, surname = %s
    WHERE ID = %s;
    """, (name, surname, user_id))

# Pobieramy wszystkie seanse
cur.execute("SELECT ID, Screening_roomsID FROM Showings ORDER BY ID")
showings = cur.fetchall()

# Zbieramy dostępne miejsca w każdej sali
cur.execute("SELECT ID, Screening_roomID FROM Seats")
seats_by_room = {}
for seat_id, room_id in cur.fetchall():
    seats_by_room.setdefault(room_id, []).append(seat_id)

# Dla każdego użytkownika przypisujemy co kilka seansów zamówienie
user_index = 0
num_users = len(user_ids)

for i, (showing_id, room_id) in enumerate(showings):
    # Pobierz typ seansu i ID cen NA POCZĄTKU (zanim utworzysz order)
    cur.execute("""
        SELECT type, Showing_pricesID FROM Showings WHERE ID = %s
    """, (showing_id,))
    showing_type, showing_prices_id = cur.fetchone()

    # Pobierz ceny z tabeli Showing_prices
    cur.execute("""
        SELECT normal, reduced, senior, school FROM Showing_prices WHERE ID = %s
    """, (showing_prices_id,))
    price_normal, price_reduced, price_senior, price_school = cur.fetchone()

    # ✅ Jeśli seans jest typu school -> 50% szans na wykupienie CAŁEJ sali, 50% nic
    if showing_type == "school":
        buy_entire_room = random.random() < 0.5

        if not buy_entire_room:
            # 50% przypadków: nikt nie kupuje -> brak ordera, brak biletów
            continue

        # Jeśli kupują, to tworzymy order dopiero teraz
        user_id = user_ids[user_index]
        user_index = (user_index + 1) % num_users

        cur.execute("""
            INSERT INTO Orders (mail, showingID, payed, created_at)
            VALUES ((SELECT mail FROM Users WHERE ID = %s), %s, %s, CURRENT_TIMESTAMP)
            RETURNING ID;
        """, (user_id, showing_id, True))
        order_id = cur.fetchone()[0]

        used_seat_ids = set()
        all_seat_ids = seats_by_room[room_id]

        for seat_id in all_seat_ids:
            if seat_id in used_seat_ids:
                continue
            used_seat_ids.add(seat_id)
            cur.execute("""
                INSERT INTO Tickets (type, price, OrdersID, SeatsID)
                VALUES (%s, %s, %s, %s);
            """, ("school", price_school, order_id, seat_id))

        # (opcjonalnie) przekąski też tylko jeśli był order
        if random.random() < 0.6:
            available_snacks = list(range(1, 6))
            random.shuffle(available_snacks)
            num_snacks = random.randint(1, min(3, len(available_snacks)))

            for j in range(num_snacks):
                snack_id = available_snacks[j]
                quantity = random.randint(1, 3)
                cur.execute("""
                    INSERT INTO Order_snacks (quantity, OrdersID, SnacksID)
                    VALUES (%s, %s, %s);
                """, (quantity, order_id, snack_id))

    else:
        # Normalne seanse – zostaje jak było
        user_id = user_ids[user_index]
        user_index = (user_index + 1) % num_users

        cur.execute("""
            INSERT INTO Orders (mail, showingID, payed, created_at)
            VALUES ((SELECT mail FROM Users WHERE ID = %s), %s, %s, CURRENT_TIMESTAMP)
            RETURNING ID;
        """, (user_id, showing_id, True))
        order_id = cur.fetchone()[0]

        seats = random.sample(seats_by_room[room_id], k=random.randint(1, 5))
        used_seat_ids = set()

        for seat_id in seats:
            if seat_id in used_seat_ids:
                continue
            used_seat_ids.add(seat_id)

            ticket_type = random.choice(["normal", "reduced", "senior"])
            ticket_price = {
                "normal": price_normal,
                "reduced": price_reduced,
                "senior": price_senior,
            }[ticket_type]

            cur.execute("""
                INSERT INTO Tickets (type, price, OrdersID, SeatsID)
                VALUES (%s, %s, %s, %s);
            """, (ticket_type, ticket_price, order_id, seat_id))

        if random.random() < 0.6:
            available_snacks = list(range(1, 6))
            random.shuffle(available_snacks)
            num_snacks = random.randint(1, min(3, len(available_snacks)))

            for j in range(num_snacks):
                snack_id = available_snacks[j]
                quantity = random.randint(1, 3)
                cur.execute("""
                    INSERT INTO Order_snacks (quantity, OrdersID, SnacksID)
                    VALUES (%s, %s, %s);
                """, (quantity, order_id, snack_id))


# Zatwierdzanie zmian i zamknięcie połączenia
conn.commit()
cur.close()
conn.close()

print("Baza danych została wypełniona danymi.")
