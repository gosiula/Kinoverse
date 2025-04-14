from repositories.showings_repository import fetch_showings_by_filters, fetch_showings_for_school
from repositories.showings_repository import fetch_normal_showing_details_by_id, fetch_school_showing_details_by_id, fetch_showing_type_by_id

def showings_factory(show_type):
    # Funkcja fabryki, która wybiera odpowiednią metodę w zależności od typu
    if show_type == "normal":
        return fetch_showings_by_filters
    elif show_type == "school":
        return fetch_showings_for_school
    else:
        raise ValueError(f"Nieobsługiwany typ pokazu: {show_type}")


from repositories.showings_repository import fetch_showings_by_email_and_date


# Pobiera seanse dla danego użytkownika
def get_showings_for_user(email, start_date, end_date):
    showings_data = fetch_showings_by_email_and_date(email, start_date, end_date)
    
    if not showings_data:
        return []

    results = []
    
    for showing in showings_data:
        showing_data = {
            "showing_datetime": showing[0],
            "screening_room_name": showing[1],
            "cinema_name": showing[2],
            "cinema_address": showing[3],
            "language": showing[4],
            "showing_type": showing[5],
            "room_capacity": showing[6],
            "film_name": showing[8],
            "ticket_summary": {
                "normal": showing[9],
                "reduced": showing[10],
                "senior": showing[11],
                "school": showing[12],
            },
            "snack_summary": showing[13],
            "total_amount": showing[14] + showing[15],
            "seat_locations": showing[16].split(', ') if showing[16] else []
        }
        results.append(showing_data)

    return results


# Fabryka wybierająca odpowiednią funkcję repozytorium
def showing_details_factory(show_type):
    if show_type == "normal":
        return fetch_normal_showing_details_by_id
    elif show_type == "school":
        return fetch_school_showing_details_by_id
    else:
        raise ValueError(f"Unsupported show type: {show_type}")


def get_showing_details(showing_id):
    # Najpierw pobieramy typ pokazu
    show_type = fetch_showing_type_by_id(showing_id)

    if not show_type:
        return {"error": "Nie znaleziono typu dla danego seansu"}

    # Wybieramy odpowiednią funkcję
    fetch_func = showing_details_factory(show_type)

    # Pobieramy dane
    result = fetch_func(showing_id)
    return result if result else {"error": "Nie znaleziono seansu o podanym ID"}

