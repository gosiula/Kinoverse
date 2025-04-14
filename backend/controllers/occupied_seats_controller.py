from flask import Blueprint, jsonify
from services.seats_service import get_occupied_seats_for_showing

bp = Blueprint('occupied_seats', __name__, url_prefix='/api')

# Zajęte miejsca dla danego seansu
@bp.route("/occupied_seats/<int:showing_id>", methods=["GET"])
def get_occupied_seats(showing_id):
    occupied_seats = get_occupied_seats_for_showing(showing_id)
    if occupied_seats:
        return jsonify(occupied_seats)
    else:
        return jsonify({"error": "Brak zajętych miejsc lub błąd zapytania"}), 200
