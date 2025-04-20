from flask import Blueprint, jsonify
from services.orders_service import get_order_details

bp = Blueprint('order_summary', __name__, url_prefix='/api')

# Podsumowanie zamówienia
@bp.route("/order_summary/<int:order_id>", methods=["GET"])
def get_order(order_id):
    # Sprawdzenie, czy liczba nie jest ujemna
    if order_id < 0:
        return jsonify({"error": "order_id musi być nieujemną liczbą całkowitą"}), 400

    order_details = get_order_details(order_id)
    if order_details:
        return jsonify(order_details) 
    else:
        return jsonify({"error": "Nie udało się znaleźć zamówienia"}), 404
