from repositories.seats_repository import fetch_occupied_seats

def get_occupied_seats_for_showing(showing_id):
    return fetch_occupied_seats(showing_id)
