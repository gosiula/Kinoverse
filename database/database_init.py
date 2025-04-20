import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
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

# Tworzenie tabel
cur.execute("""
CREATE TABLE Users (
    ID SERIAL PRIMARY KEY,
    mail VARCHAR(255) UNIQUE,
    name VARCHAR(100),
    surname VARCHAR(100),
    password VARCHAR(255),
    role VARCHAR(50)
);

CREATE TABLE Films (
    ID SERIAL PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    photo BYTEA
);

CREATE TABLE Showing_prices (
    ID SERIAL PRIMARY KEY,
    normal NUMERIC,
    reduced NUMERIC,
    senior NUMERIC,
    school NUMERIC
);

CREATE TABLE Cinemas (
    ID SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE,
    city VARCHAR(100),
    address VARCHAR(255)
);

CREATE TABLE Screening_rooms (
    ID SERIAL PRIMARY KEY,
    name VARCHAR(100),
    capacity INTEGER,
    CinemasID INTEGER REFERENCES Cinemas(ID)
);

CREATE TABLE Showings (
    ID SERIAL PRIMARY KEY,
    data_time TIMESTAMP,
    language VARCHAR(50),
    type VARCHAR(50),
    FilmID INTEGER REFERENCES Films(ID),
    Showing_pricesID INTEGER REFERENCES Showing_prices(ID),
    Screening_roomsID INTEGER REFERENCES Screening_rooms(ID)
);

CREATE TABLE Seats (
    ID SERIAL PRIMARY KEY,
    row VARCHAR(10),
    number INTEGER,
    Screening_roomID INTEGER REFERENCES Screening_rooms(ID)
);

CREATE TABLE Orders (
    ID SERIAL PRIMARY KEY,
    mail VARCHAR(255),
    showingID INTEGER REFERENCES Showings(ID),
    payed BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Tickets (
    ID SERIAL PRIMARY KEY,
    type VARCHAR(50),
    price NUMERIC,
    OrdersID INTEGER REFERENCES Orders(ID) ON DELETE CASCADE,
    SeatsID INTEGER REFERENCES Seats(ID)
);

CREATE TABLE Snacks (
    ID SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE,
    cathegory VARCHAR(50),
    price NUMERIC
);

CREATE TABLE Order_snacks (
    ID SERIAL PRIMARY KEY,
    quantity INTEGER,
    OrdersID INTEGER REFERENCES Orders(ID) ON DELETE CASCADE,
    SnacksID INTEGER REFERENCES Snacks(ID)
);
""")

# Tworzenie triggera, który usuwa powiązane rekordy w Orders po usunięciu rekordu z Showings
cur.execute("""
CREATE OR REPLACE FUNCTION delete_orders_for_showing() 
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM Orders WHERE showingID = OLD.ID;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;
""")

cur.execute("""
CREATE TRIGGER delete_orders_for_showing
AFTER DELETE ON Showings
FOR EACH ROW
EXECUTE FUNCTION delete_orders_for_showing();
""")

# Tworzenie triggera, który usuwa powiązane rekordy w Showings po usunięciu rekordu z Films
cur.execute("""
CREATE OR REPLACE FUNCTION delete_showings_for_film() 
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM Showings WHERE FilmID = OLD.ID;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;
""")

cur.execute("""
CREATE TRIGGER delete_showings_for_film
AFTER DELETE ON Films
FOR EACH ROW
EXECUTE FUNCTION delete_showings_for_film();
""")

# Tworzenie triggera, który usuwa powiązane rekordy w Showings po usunięciu rekordu z Showing_prices
cur.execute("""
CREATE OR REPLACE FUNCTION delete_showings_for_showing_price() 
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM Showings WHERE Showing_pricesID = OLD.ID;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;
""")

cur.execute("""
CREATE TRIGGER delete_showings_for_showing_price
AFTER DELETE ON Showing_prices
FOR EACH ROW
EXECUTE FUNCTION delete_showings_for_showing_price();
""")

# Tworzenie triggera, który usuwa powiązane rekordy w Seats i Showings po usunięciu rekordu z Screening_rooms
cur.execute("""
CREATE OR REPLACE FUNCTION delete_seats_and_showings_for_screening_room() 
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM Seats WHERE Screening_roomID = OLD.ID;
    DELETE FROM Showings WHERE Screening_roomsID = OLD.ID;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;
""")

cur.execute("""
CREATE TRIGGER delete_seats_and_showings_for_screening_room
AFTER DELETE ON Screening_rooms
FOR EACH ROW
EXECUTE FUNCTION delete_seats_and_showings_for_screening_room();
""")

# Tworzenie triggera, który usuwa powiązane rekordy w Screening_rooms po usunięciu rekordu z Cinemas
cur.execute("""
CREATE OR REPLACE FUNCTION delete_screening_rooms_for_cinema() 
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM Screening_rooms WHERE CinemasID = OLD.ID;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;
""")

cur.execute("""
CREATE TRIGGER delete_screening_rooms_for_cinema
AFTER DELETE ON Cinemas
FOR EACH ROW
EXECUTE FUNCTION delete_screening_rooms_for_cinema();
""")

# Tworzenie triggera, który usuwa powiązane rekordy w Tickets po usunięciu rekordu z Seats
cur.execute("""
CREATE OR REPLACE FUNCTION delete_tickets_for_seat() 
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM Tickets WHERE SeatsID = OLD.ID;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;
""")

cur.execute("""
CREATE TRIGGER delete_tickets_for_seat
AFTER DELETE ON Seats
FOR EACH ROW
EXECUTE FUNCTION delete_tickets_for_seat();
""")

# Tworzenie triggera, który usuwa powiązane rekordy w Tickets i Order_snacks po usunięciu rekordu z Orders
cur.execute("""
CREATE OR REPLACE FUNCTION delete_tickets_and_order_snacks_for_order() 
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM Tickets WHERE OrdersID = OLD.ID;
    DELETE FROM Order_snacks WHERE OrdersID = OLD.ID;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;
""")

cur.execute("""
CREATE TRIGGER delete_tickets_and_order_snacks_for_order
AFTER DELETE ON Orders
FOR EACH ROW
EXECUTE FUNCTION delete_tickets_and_order_snacks_for_order();
""")

# Tworzenie triggera, który usuwa powiązane rekordy w Order_snacks po usunięciu rekordu z Snacks
cur.execute("""
CREATE OR REPLACE FUNCTION delete_order_snacks_for_snack() 
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM Order_snacks WHERE SnacksID = OLD.ID;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;
""")

cur.execute("""
CREATE TRIGGER delete_order_snacks_for_snack
AFTER DELETE ON Snacks
FOR EACH ROW
EXECUTE FUNCTION delete_order_snacks_for_snack();
""")

conn.commit()
cur.close()
conn.close()

print("Baza danych Kinoverse została utworzona wraz z tabelami.")
