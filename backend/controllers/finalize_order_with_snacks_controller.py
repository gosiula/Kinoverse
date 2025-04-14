from flask import Blueprint, request, jsonify
from services.finalize_order_facade import OrderFinalizationFacade

bp = Blueprint("finalize_order_with_snacks", __name__, url_prefix="/api")

# Finalizacja wydarzenia (UŻYCIE STRATEGII I FABRYKI DO BILETÓW, 
# FABRYKI DO TYPÓW BILETÓW
# ORAZ DEKORATORA DO PRZEKĄSEK
# I FASADY JAKO CAŁOŚĆ LOGIKI FINALIZACJI ZAMÓWIENIA)
@bp.route("/finalize_order_with_snacks", methods=["POST"])
def finalize_order():
    try:
        data = request.get_json()
        email = data.get("mail")
        showing_id = data.get("showingId")
        order_id = data.get("orderId")
        snack_quantities = data.get("snack_quantities", {})

        if not showing_id or not email:
            return jsonify({"error": "Brakujące dane"}), 400

        success, new_order_id = OrderFinalizationFacade.finalize_order(
            showing_id, email, snack_quantities, order_id
        )

        if success:
            return jsonify({
                "message": "Zamówienie zrealizowane",
                "orderId": new_order_id
            }), 200
        else:
            return jsonify({"error": "Błąd podczas realizacji zamówienia"}), 500

    except Exception as e:
        print(f"Błąd kończenia zamówienia: {e}")
        return jsonify({"error": "Wewnętrzny błąd serwera"}), 500
