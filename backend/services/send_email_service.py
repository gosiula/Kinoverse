# # services/send_email_service.py
# from repositories.send_email_repository import fetch_order_details_by_id
# from utils.email_utils import send_confirmation_email

# def handle_finalize_order_and_send_email(order_id, email):
#     # Pobierz szczegóły zamówienia
#     order_details = fetch_order_details_by_id(order_id)
    
#     if not order_details:
#         return {"error": "Brak szczegółów zamówienia"}

#     # Wydobądź szczegóły
#     showing_datetime, film_name = order_details
    
#     # Przygotuj dane do wysłania maila
#     email_data = {
#         "email": email,
#         "subject": "Potwierdzenie zamówienia - Film: " + film_name,
#         "body": f"Potwierdzamy Twoje zamówienie na seans filmu '{film_name}' o godzinie {showing_datetime}.",
#     }

#     # Wyślij e-mail
#     email_sent = send_confirmation_email(email_data)
    
#     if not email_sent:
#         return {"error": "Nie udało się wysłać e-maila"}

#     return {"success": "E-mail wysłany pomyślnie"}