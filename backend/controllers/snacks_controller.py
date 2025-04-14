from flask import Blueprint, jsonify
from services.snacks_service import get_available_snacks

bp = Blueprint('snacks', __name__, url_prefix='/api')

# Pobieranie dostępnych przekąsek
@bp.route('/snacks', methods=['GET'])
def fetch_snack_options():
    try:
        snacks_data = get_available_snacks()
        return jsonify(snacks_data), 200
    except Exception as e:
        print(f"Błąd pobierania przekąsek: {e}")
        return jsonify({"error": "Nie udało się pobrać danych o przekąskach"}), 500
