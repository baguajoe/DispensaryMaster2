from flask import Flask, send_from_directory, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from api.routes import api
from api.utils import generate_sitemap
from api.models import db
import os

# Initialize JWT Manager
jwt = JWTManager()

def create_app():
    """
    Flask application factory.
    Creates and configures the Flask application.
    """
    ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
    static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../public/')

    app = Flask(__name__)

    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite3'  # Replace with your actual database URI
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # Replace with a secure random key in production
    app.config['CORS_HEADERS'] = 'Content-Type'

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})  # Allow CORS for API routes

    # Register Blueprints
    try:

        app.register_blueprint(api, url_prefix='/api')
    except ImportError as e:
        print(f"Error importing routes: {e}")
        raise

    # Error Handling
    @app.errorhandler(404)
    def not_found_error(error):
        return {"error": "Resource not found"}, 404

    @app.errorhandler(500)
    def internal_error(error):
        return {"error": "Internal server error"}, 500
    
    @app.route('/')
    def sitemap():
        if ENV == "development":
            return generate_sitemap(app)
        return send_from_directory(static_file_dir, 'index.html')

    # any other endpoint will try to serve it like a static file
    @app.route('/<path:path>', methods=['GET'])
    def serve_any_other_file(path):
        if not os.path.isfile(os.path.join(static_file_dir, path)):
            path = 'index.html'
        response = send_from_directory(static_file_dir, path)
        response.cache_control.max_age = 0  # avoid cache memory
        return response

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)  # Enable debug mode for development; disable in production
