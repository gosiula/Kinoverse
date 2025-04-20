from flask import Blueprint, request, jsonify
from utils.auth_utils import decode_jwt_token
from services.orders_service import get_orders_for_showing

bp = Blueprint('employee_admin_orders', __name__, url_prefix='/api')

# Wyświetlanie zamówień dla EMPLOYEE i ADMIN
@bp.route("/employee_admin_orders", methods=["GET"])
def get_showing_orders():       
    auth_header = request.headers.get("Authorization")
    showing_id = request.args.get("showing_id")

    # Jeżeli brak autoryzacji, zwracamy błąd
    if not all([auth_header, showing_id]):
        return jsonify({"error": "Brak wymaganych parametrów: Authorization, showing_id"}), 400

    try:
        token = auth_header.split(" ")[1] if auth_header.startswith("Bearer ") else auth_header
        user_data = decode_jwt_token(token)
        role = user_data.get("role")

        # Sprawdzenie czy jest odpowiednia rola
        if role not in ["EMPLOYEE", "ADMIN"]:
            return jsonify({"error": "Brak uprawnień"}), 403

        # Pobranie zamówień
        orders = get_orders_for_showing(showing_id)
        
        response = jsonify(orders)
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        return response

    except Exception as e:
        return jsonify({"error": str(e)}), 500