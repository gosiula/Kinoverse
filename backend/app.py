from flask import Flask
from flask_cors import CORS
from controllers.cities_controller import bp as cities_bp
from controllers.showings_controller import bp as showings_bp
from controllers.my_showings_controller import bp as my_showings_bp
from controllers.showing_details_controller import bp as showing_details_bp
from controllers.occupied_seats_controller import bp as occupied_seats_bp
from controllers.order_reserved_controller import bp as order_reserved_bp
from controllers.snacks_controller import bp as snacks_bp
from controllers.order_summary_controller import bp as order_summary_bp
from controllers.finalize_order_with_snacks_controller import bp as finalize_order_with_snacks_bp
from controllers.register_controller import bp as register_bp
from controllers.auth_controller import bp as login_bp
from services.cleanup_service import start_cleanup_thread



def create_app():
    app = Flask(__name__)

    CORS(app, origins=["http://localhost:3000"])

    app.register_blueprint(cities_bp, url_prefix='/api')
    app.register_blueprint(showings_bp, url_prefix='/api')
    app.register_blueprint(my_showings_bp, url_prefix='/api')
    app.register_blueprint(showing_details_bp, url_prefix='/api')
    app.register_blueprint(occupied_seats_bp, url_prefix='/api')
    app.register_blueprint(order_reserved_bp, url_prefix='/api')
    app.register_blueprint(snacks_bp, url_prefix='/api')
    app.register_blueprint(order_summary_bp, url_prefix='/api')
    app.register_blueprint(finalize_order_with_snacks_bp, url_prefix='/api')
    app.register_blueprint(login_bp, url_prefix='/api')
    app.register_blueprint(register_bp, url_prefix='/api')

    # Uruchom wątek czyszczenia przy starcie aplikacji (usuwanie nieopłaconych rezerwacji po 10 minutach)
    start_cleanup_thread()

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
