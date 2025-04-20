from flask import Blueprint, request, jsonify
from services.orders_service import update_or_create_order

bp = Blueprint('order_reserved', __name__, url_prefix='/api')

# Rezeruje miejsca i tworzy nieopłacone zamówienie (UŻYCIE STRATEGII I FABRYKI DO BILETÓW)
@bp.route("/order_reserved/<int:order_id>", methods=["PUT"])
def update_reserved_order(order_id):
    try:
        # Sprawdzenie, czy liczba nie jest ujemna
        if order_id < 0:
            return jsonify({"error": "order_id musi być nieujemną liczbą całkowitą"}), 400
        
        data = request.json
        if not data:
            return jsonify({"error": "Brak danych w żądaniu"}), 400
            
        showing_id = data.get('showingID')
        types = data.get('types')
        seats = data.get('seats')
        mail = data.get('mail', '')
        print(types)
        
        if not showing_id or not types or not seats:
            return jsonify({"error": "Brakujące dane: showingID, types lub seats"}), 400
            
        result = update_or_create_order(order_id, showing_id, seats, types, mail)
        
        if 'error' in result:
            return jsonify({"error": result['error']}), 500
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Błąd podczas przetwarzania zamówienia: {e}")
        return jsonify({"error": str(e)}), 500