
from repositories.users_repository import get_user_by_email
from utils.auth_utils import verify_password, create_jwt_token, hash_password
from repositories.users_repository import add_user_to_db

# Logowanie
def login_user(email, password):
    # Pobranie danych użytkownika
    user = get_user_by_email(email)
    if not user:
        return {"error": "Nieprawidłowy email lub hasło"}

    # Sprawdzenie poprawności hasła
    if not verify_password(password, user["password"]):
        return {"error": "Nieprawidłowy email lub hasło"}

    # Utworzenie tokenu
    token = create_jwt_token(user["id"], user["role"], user["mail"])
    return {
        "token": token,
        "role": user["role"],
        "mail": user["mail"],
    }

# Rejestracja
def register_user(email, name, surname, password, role):
    try:
        # Hashowanie hasła
        hashed_password = hash_password(password)
        
        # Dodanie użytkownika do bazy
        user_id = add_user_to_db(email, name, surname, hashed_password, role)

        if not user_id:
            return {"error": "Wystąpił problem podczas rejestracji"}

        return {"message": "Użytkownik zarejestrowany"}

    except Exception as e:
        print(f"Błąd rejestracji: {e}")
        return {"error": "Wewnętrzny błąd serwera"}
