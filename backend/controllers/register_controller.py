from flask import Blueprint, request, jsonify
from services.auth_service import register_user
from repositories.users_repository import check_user_exists

bp = Blueprint('register', __name__, url_prefix='/api')

# Rejestracja
@bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        email = data.get("email")
        name = data.get("name")
        surname = data.get("surname")
        password = data.get("password")
        confirm_password = data.get("confirm_password")
        role = data.get("role", "USER")  # Domyślnie "USER" jeśli brak roli

        # Sprawdzanie czy hasła są takie same
        if password != confirm_password:
            return jsonify({"error": "Hasła muszą się zgadzać"}), 400

        # Sprawdzenie, czy użytkownik już istnieje
        user_exists = check_user_exists(email)
        if user_exists:
            return jsonify({"error": "Użytkownik z tym emailem już istnieje"}), 400

        # Rejestracja użytkownika
        result = register_user(email, name, surname, password, role)

        if "error" in result:
            return jsonify(result), 400

        return jsonify({"message": "Użytkownik zarejestrowany pomyślnie"}), 201

    except Exception as e:
        print(f"Błąd rejestracji: {e}")
        return jsonify({"error": "Wewnętrzny błąd serwera"}), 500
