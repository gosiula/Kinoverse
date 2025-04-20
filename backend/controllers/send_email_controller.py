# # controllers/finalize_order_and_send_email_controller.py
# from flask import Blueprint, request, jsonify
# from services.send_email_service import handle_finalize_order_and_send_email

# bp = Blueprint('finalize_order_and_send_email', __name__)

# @bp.route('/finalize_order_and_send_email', methods=['POST', 'OPTIONS'])
# def finalize_order_and_send_email_endpoint():
#     if request.method == 'OPTIONS':
#         # Handle preflight request
#         response = jsonify({'status': 'success'})
#         response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
#         response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
#         response.headers.add('Access-Control-Allow-Methods', 'POST')
#         return response
        
#     try:
#         data = request.json
#         order_id = data.get('orderId')
#         email = data.get('email')
        
#         if not order_id or not email:
#             return jsonify({'error': 'Brak wymaganych danych'}), 400
            
#         result = handle_finalize_order_and_send_email(order_id, email)
        
#         if 'error' in result:
#             return jsonify(result), 400
            
#         return jsonify(result), 200
        
#     except Exception as e:
#         print(f"Error processing request: {e}")
#         return jsonify({'error': f'Wystąpił błąd podczas przetwarzania żądania: {str(e)}'}), 500