from flask import Blueprint, request, jsonify
from utils.auth_utils import decode_jwt_token
from services.orders_service import get_user_showings_data

bp = Blueprint('my_showings', __name__, url_prefix='/api')

# Zwraca wszystkie seanse użytkownika z danego przedziału czasowego
@bp.route("/my_showings", methods=["POST"])
def get_user_showings():
    data = request.get_json()
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Brak lub nieprawidłowy nagłówek autoryzacji"}), 401

    try:
        token = auth_header.split(" ")[1]
        payload = decode_jwt_token(token)
    except Exception:
        return jsonify({"error": "Nieprawidłowy token"}), 401

    email = data.get("email")
    start_date = data.get("start_date")
    end_date = data.get("end_date")

    if not all([email, start_date, end_date]):
        return jsonify({"error": "Brak wymaganych danych (email, start_date, end_date)"}), 400

    try:
        results = get_user_showings_data(email, start_date, end_date)
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

