from flask import Blueprint, jsonify
from services.cities_service import get_available_cities

bp = Blueprint('cities', __name__, url_prefix='/api')

# Zwracanie dostępnych miast
@bp.route("/cities", methods=["GET"])
def get_cities():
    cities = get_available_cities()
    if cities:
        return jsonify(cities)
    else:
        return jsonify({"error": "Nie udało się pobrać miast"}), 200
