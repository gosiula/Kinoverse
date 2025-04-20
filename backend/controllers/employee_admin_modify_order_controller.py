from flask import Blueprint, request, jsonify
from services.orders_service import process_order_edit
from utils.auth_utils import decode_jwt_token

bp = Blueprint("employee_admin_modify_order", __name__, url_prefix="/api")

# Modyfikacja zamówienia przez EMPLOYEE lub ADMIN
@bp.route("/employee_admin_modify_order", methods=["POST"])
def edit_order():
    try:
        # Jeżeli brak autoryzacji, to dostajemy błąd
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Brak tokena autoryzacyjnego"}), 401

        token = auth_header.split(" ")[1] if auth_header.startswith("Bearer ") else auth_header
        user_data = decode_jwt_token(token)
        role = user_data.get("role")

        # Czy użytkownik ma dobrą rolę
        if role not in ["EMPLOYEE", "ADMIN"]:
            return jsonify({"error": "Brak uprawnień"}), 403

        data = request.get_json()
        order_id = data.get("orderId")
        email = data.get("mail")
        ticket_quantities = data.get("ticket_quantities", {})
        snack_quantities = data.get("snack_quantities", {})

        # Czy poprawne order_id
        if not order_id or not order_id.isdigit() or int(order_id) < 0:
            return jsonify({"error": "Brak wymaganych danych"}), 400

        # Modyfikacja zamówienia
        success = process_order_edit(order_id, email, ticket_quantities, snack_quantities)

        if success:
            return jsonify({"message": "Zamówienie zaktualizowane"}), 200
        else:
            return jsonify({"error": "Nie udało się zaktualizować zamówienia"}), 500

    except Exception as e:
        print(f"Błąd podczas edycji zamówienia: {e}")
        return jsonify({"error": "Wewnętrzny błąd serwera"}), 500
