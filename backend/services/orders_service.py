from repositories.orders_repository import check_order_exists, create_order, update_order_showing, delete_tickets, add_tickets_with_seats
from database.database_connect.db import get_db_connection
from repositories.orders_repository import fetch_order_details


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
