# # utils/email_utils.py
# import yagmail
# from email_data import EMAIL_USER, EMAIL_PASSWORD

# def send_confirmation_email(email_data):
#     receiver_email = email_data["email"]
#     subject = email_data["subject"]
#     body = email_data["body"]
    
#     # Create HTML content
#     html_content = f"""
#     <html>
#     <head>
#         <style>
#             body {{ font-family: Arial, sans-serif; color: #333; }}
#             .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
#             .header {{ background-color: #191C49; color: white; padding: 15px; text-align: center; }}
#             .content {{ padding: 20px; }}
#             .footer {{ background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; }}
#         </style>
#     </head>
#     <body>
#         <div class="container">
#             <div class="header">
#                 <h1>Potwierdzenie zamówienia</h1>
#             </div>
#             <div class="content">
#                 <p>Dziękujemy za złożenie zamówienia!</p>
#                 <p>{body}</p>
#                 <p>Życzymy udanego seansu!</p>
#             </div>
#             <div class="footer">
#                 <p>To jest automatyczna wiadomość, prosimy na nią nie odpowiadać.</p>
#             </div>
#         </div>
#     </body>
#     </html>
#     """
    
#     try:
#         # Initialize yagmail SMTP connection
#         yag = yagmail.SMTP(EMAIL_USER, EMAIL_PASSWORD)
        
#         # Send email
#         yag.send(
#             to=receiver_email,
#             subject=subject,
#             contents=[body, html_content]  # Send both plain text and HTML
#         )
        
#         print(f"Email sent successfully to {receiver_email}!")
#         return True
#     except Exception as e:
#         print(f"Failed to send email: {e}")
#         return False