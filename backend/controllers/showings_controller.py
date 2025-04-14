from flask import Blueprint, request, jsonify
from services.showings_service import showings_factory

bp = Blueprint('showings', __name__, url_prefix='/api')

# Pobieranie danych o wszystkich seansach z danego typu (UŻYCIE FABRYKI)
@bp.route("/showings", methods=["GET"])
def get_showings():
    date = request.args.get("date")
    show_type = request.args.get("type")
    cinema_id = request.args.get("cinema_id")

    if not all([date, show_type, cinema_id]):
        return jsonify({"error": "Brak wymaganych parametrów: date, type, cinema_id"}), 400

    try:
        cinema_id = int(cinema_id)
    except ValueError:
        return jsonify({"error": "cinema_id musi być liczbą całkowitą"}), 400

    try:
        # Wybieramy odpowiednią funkcję na podstawie typu pokazu
        fetch_showings = showings_factory(show_type)
        showings = fetch_showings(date, cinema_id)

        # Jeśli mamy jakieś pokazy, zwracamy je w odpowiedzi
        if showings:
            return jsonify(showings)
        else:
            return jsonify({"message": "Brak pokazów dla podanych filtrów"}), 200
    except ValueError as e:
        # Jeśli typ pokazów jest nieobsługiwany, zwracamy błąd
        return jsonify({"error": str(e)}), 400
