from flask import Blueprint, request, jsonify
from services.auth_service import login_user

bp = Blueprint('login', __name__, url_prefix='/api')

# Logowanie
@bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Email i hasło są wymagane"}), 400

        result = login_user(email, password)

        if "error" in result:
            return jsonify(result), 401

        return jsonify(result), 200

    except Exception as e:
        print(f"Błąd logowania: {e}")
        return jsonify({"error": "Wewnętrzny błąd serwera"}), 500
