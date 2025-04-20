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

