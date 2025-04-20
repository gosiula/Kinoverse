from flask import Blueprint, jsonify, request
from services.showings_service import get_showing_details

bp = Blueprint('showing_details', __name__, url_prefix='/api')

# Informacje o danym seansie
@bp.route("/showing_details/<int:showing_id>", methods=["GET"])
def get_showing(showing_id):
    if showing_id < 0:
        return jsonify({"error": "showing_id musi być nieujemną liczbą całkowitą"}), 400
        
    showing_details = get_showing_details(showing_id)

    if "error" not in showing_details:
        return jsonify(showing_details)
    else:
        return jsonify(showing_details), 200