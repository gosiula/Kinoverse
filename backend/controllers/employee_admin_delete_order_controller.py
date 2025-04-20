from flask import Blueprint, request, jsonify
from utils.auth_utils import decode_jwt_token
from services.orders_service import delete_order_if_authorized

bp = Blueprint("employee_admin_delete_order", __name__, url_prefix="/api")

# Endpoint do usuwania zamówienia po ID dla EMPLOYEE lub ADMIN
@bp.route("/employee_admin_delete_order/<int:order_id>", methods=["DELETE"])
def delete_order(order_id):
    # Sprawdzenie, czy liczba nie jest ujemna
    if order_id < 0:
        return jsonify({"error": "order_id musi być nieujemną liczbą całkowitą"}), 400

    auth_header = request.headers.get("Authorization")

    # Sprawdzanie czy jest autoryzacja
    if not auth_header:
        return jsonify({"error": "Brak nagłówka Authorization"}), 401

    try:
        token = auth_header.split(" ")[1] if auth_header.startswith("Bearer ") else auth_header
        user_data = decode_jwt_token(token)
        role = user_data.get("role")

        # Sprawdzanie, czy poprawna rola
        if role not in ["EMPLOYEE", "ADMIN"]:
            return jsonify({"error": "Brak uprawnień"}), 403

        # Usuwanie zamówienia
        success, message, status = delete_order_if_authorized(order_id, auth_header)

        response = jsonify({"message": message})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        return response, status

    except Exception as e:
        return jsonify({"error": str(e)}), 500
