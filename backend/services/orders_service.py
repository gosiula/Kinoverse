from repositories.orders_repository import check_order_exists, create_order, update_order_showing, delete_tickets, add_tickets_with_seats
from database.database_connect.db import get_db_connection
from repositories.orders_repository import fetch_order_details
from repositories.orders_repository import fetch_orders_by_showing_id
from repositories.orders_repository import find_order_by_id, delete_order
from repositories.orders_repository import fetch_showings_by_email_and_date
from repositories.orders_repository import fetch_showings_by_email_and_date
from repositories.orders_repository import update_order_email, update_order_snacks, update_order_tickets, is_order_editable

def process_order_edit(order_id, email, ticket_quantities, snack_quantities):
    try:
        if not is_order_editable(order_id):
            print("Seans w przeszłości lub nie istnieje.")
            return False

        if not update_order_email(order_id, email):
            return False

        if not update_order_tickets(order_id, ticket_quantities):
            return False

        if not update_order_snacks(order_id, snack_quantities):
            return False

        return True
    except Exception as e:
        print(f"Błąd w service: {e}")
        return False


def get_user_showings_data(email, start_date, end_date):
    showings_data = fetch_showings_by_email_and_date(email, start_date, end_date)

    if not showings_data:
        return []

    results = []

    for showing in showings_data:
        normal = showing[9]
        reduced = showing[10]
        senior = showing[11]
        school = showing[12]

        normal_price = showing[17] or 0
        reduced_price = showing[18] or 0
        senior_price = showing[19] or 0
        school_price = showing[20] or 0

        # Obliczanie ceny za bilety
        ticket_total = (
            normal * normal_price +
            reduced * reduced_price +
            senior * senior_price +
            (school_price if school > 0 else 0)
        )

        snack_total = showing[15] or 0
        total_amount = ticket_total + snack_total

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
                "normal": normal,
                "reduced": reduced,
                "senior": senior,
                "school": school,
            },
            "snack_summary": showing[13],
            "total_amount": round(total_amount, 2),
            "seat_locations": showing[16].split(', ') if showing[16] else []
        }
        results.append(showing_data)

    return results


def delete_order_if_authorized(order_id, auth_header):
    try:
        delete_order(order_id)
        return True, "Zamówienie zostało usunięte", 200

    except Exception as e:
        print(f"Błąd podczas usuwania zamówienia: {e}")
        return False, "Wystąpił błąd serwera", 500


# Pobieranie zamówień do seansu
def get_orders_for_showing(showing_id):
    return fetch_orders_by_showing_id(showing_id)


def get_order_details(order_id):
    return fetch_order_details(order_id)


def update_or_create_order(order_id, showing_id, seats, types, mail=''):
    try:
        # Sprawdź czy zamówienie istnieje
        order_exists = check_order_exists(order_id)
        
        if order_exists:
            # Aktualizacja istniejącego zamówienia
            update_success = update_order_showing(order_id, showing_id)
            if not update_success:
                return {"error": "Nie udało się zaktualizować danych zamówienia"}
                
            # Usuń istniejące bilety
            delete_success = delete_tickets(order_id)
            if not delete_success:
                return {"error": "Nie udało się usunąć starych biletów"}
        else:
            # Stworzenie nowego zamówienia
            new_id = create_order(mail, showing_id)
            if not new_id:
                return {"error": "Nie udało się utworzyć nowego zamówienia"}
            
            order_id = new_id
        
        # Dodaj bilety z wybranymi miejscami
        ticket_success = add_tickets_with_seats(order_id, showing_id, seats, types)
        if not ticket_success:
            return {"error": "Nie udało się dodać biletów"}
        
        # Pobierz datę utworzenia zamówienia
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT created_at FROM Orders WHERE ID = %s", (order_id,))
        created_at = cur.fetchone()
        
        return {
            "id": order_id,
            "created_at": created_at[0] if created_at else None,
            "message": "Zamówienie zaktualizowane pomyślnie" if order_exists else "Utworzono nowe zamówienie"
        }
        
    except Exception as e:
        print(f"Błąd w serwisie zamówień: {e}")
        return {"error": str(e)}
