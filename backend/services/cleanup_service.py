import threading
import time
from database.database_connect.db import get_db_connection

def cleanup_unpaid_orders():
    while True:
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            
            # Usuń bilety powiązane z nieopłaconymi zamówieniami starszymi niż 10 minut
            cur.execute("""
                DELETE FROM Tickets
                WHERE OrdersID IN (
                    SELECT id FROM Orders
                    WHERE payed = false AND created_at < NOW() - INTERVAL '10 minutes'
                )
            """)
            
            # Usuń przekąski powiązane z nieopłaconymi zamówieniami starszymi niż 10 minut
            cur.execute("""
                DELETE FROM Order_snacks
                WHERE OrdersID IN (
                    SELECT id FROM Orders
                    WHERE payed = false AND created_at < NOW() - INTERVAL '10 minutes'
                )
            """)
            
            # Usuń nieopłacone zamówienia starsze niż 10 minut
            cur.execute("""
                DELETE FROM Orders
                WHERE payed = false AND created_at < NOW() - INTERVAL '10 minutes'
            """)
            
            conn.commit()
            cur.close()
            conn.close()
            
        except Exception as e:
            print(f"Błąd podczas czyszczenia nieopłaconych zamówień: {e}")
        
        # Uruchom ponownie za 30 sekund
        time.sleep(30)

def start_cleanup_thread():
    cleanup_thread = threading.Thread(target=cleanup_unpaid_orders, daemon=True)
    cleanup_thread.start()
    print("Wątek czyszczenia nieopłaconych zamówień został uruchomiony (10 minut na rezerwację)")