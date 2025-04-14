from flask import Blueprint, request, jsonify
from services.showings_service import get_showings_for_user
from utils.auth_utils import decode_jwt_token
from datetime import datetime

bp = Blueprint('my_showings', __name__, url_prefix='/api')

# Seanse danego użytkownika
@bp.route("/my_showings", methods=["POST"])
def get_showings():
    data = request.get_json()
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Brak lub nieprawidłowy nagłówek autoryzacji"}), 401

    token = auth_header.split(" ")[1]

    try:
        payload = decode_jwt_token(token)
        user_email = payload.get("mail")
        if not user_email:
            return jsonify({"error": "Token nie zawiera adresu e-mail"}), 401
    except ValueError as e:
        return jsonify({"error": str(e)}), 401

    email = data.get("email")
    start_date = data.get("start_date")
    end_date = data.get("end_date")

    if not email or not start_date or not end_date:
        return jsonify({"error": "Brakuje wymaganych parametrów"}), 400

    if user_email != email:
        return jsonify({"error": "Email niezgodny z tokenem"}), 403

    try:
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        end_dt = datetime.strptime(end_date, "%Y-%m-%d")
        if end_dt < start_dt:
            return jsonify({"error": "Data końcowa nie może być przed datą początkową"}), 400
    except ValueError:
        return jsonify({"error": "Nieprawidłowy format daty – oczekiwano YYYY-MM-DD"}), 400

    showings = get_showings_for_user(email, start_date, end_date)

    if showings:
        return jsonify(showings), 200
    else:
        return jsonify({"error": "Nie znaleziono żadnych seansów"}), 404
