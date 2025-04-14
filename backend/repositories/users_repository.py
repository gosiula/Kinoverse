from database.database_connect.db import get_db_connection

# Pobranie informacji o użytkowniku do logowania
def get_user_by_email(email):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT ID, mail, name, surname, password, role
            FROM Users
            WHERE mail = %s
        """, (email,))
        result = cur.fetchone()
        if result:
            return {
                "id": result[0],
                "mail": result[1],
                "name": result[2],
                "surname": result[3],
                "password": result[4],
                "role": result[5]
            }
        return None
    finally:
        cur.close()
        conn.close()

from database.database_connect.db import get_db_connection


# Sprawdzanie czy użytkownik istnieje
def check_user_exists(email):
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Sprawdzamy, czy użytkownik o tym adresie e-mail już istnieje w bazie
        cur.execute("SELECT mail FROM Users WHERE mail = %s", (email,))
        existing_user = cur.fetchone()

        # Jeśli użytkownik istnieje, zwracamy True, w przeciwnym razie False
        if existing_user:
            return True
        else:
            return False

    except Exception as e:
        print(f"Błąd sprawdzania istnienia użytkownika: {e}")
        return False  # Zwracamy False w przypadku błędu, aby nie blokować rejestracji

    finally:
        cur.close()
        conn.close()


# Dodanie użytkownika do bazy
def add_user_to_db(email, name, surname, hashed_password, role):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Sprawdzenie, czy użytkownik już istnieje
        cur.execute("SELECT mail FROM Users WHERE mail = %s", (email,))
        existing_user = cur.fetchone()
        if existing_user:
            return None  # Użytkownik już istnieje

        # Dodanie nowego użytkownika
        cur.execute("""
            INSERT INTO Users (mail, name, surname, password, role)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING ID
        """, (email, name, surname, hashed_password, role))

        user_id = cur.fetchone()[0]
        conn.commit()
        return user_id

    except Exception as e:
        print(f"Błąd dodawania użytkownika: {e}")
        conn.rollback()
        return None

    finally:
        cur.close()
        conn.close()