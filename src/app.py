# from flask import Flask, send_from_directory, url_for
# from flask_sqlalchemy import SQLAlchemy
# from flask_cors import CORS
# from flask_jwt_extended import JWTManager
# from api.routes import api
# from api.utils import generate_sitemap
# from api.models import db
# import os

# # Initialize JWT Manager
# jwt = JWTManager()

# def create_app():
#     """
#     Flask application factory.
#     Creates and configures the Flask application.
#     """
#     ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
#     static_file_dir = os.path.join(os.path.dirname(
#     os.path.realpath(__file__)), '../public/')

#     app = Flask(__name__)

#     # Configuration
#     app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite3'  # Replace with your actual database URI
#     app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
#     app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # Replace with a secure random key in production
#     app.config['CORS_HEADERS'] = 'Content-Type'

#     # Initialize extensions
#     db.init_app(app)
#     jwt.init_app(app)
#     CORS(app, resources={r"/api/*": {"origins": "*"}})  # Allow CORS for API routes

#     # Register Blueprints
#     try:

#         app.register_blueprint(api, url_prefix='/api')
#     except ImportError as e:
#         print(f"Error importing routes: {e}")
#         raise

#     # Error Handling
#     @app.errorhandler(404)
#     def not_found_error(error):
#         return {"error": "Resource not found"}, 404

#     @app.errorhandler(500)
#     def internal_error(error):
#         return {"error": "Internal server error"}, 500
    
#     @app.route('/')
#     def sitemap():
#         if ENV == "development":
#             return generate_sitemap(app)
#         return send_from_directory(static_file_dir, 'index.html')

#     # any other endpoint will try to serve it like a static file
#     @app.route('/<path:path>', methods=['GET'])
#     def serve_any_other_file(path):
#         if not os.path.isfile(os.path.join(static_file_dir, path)):
#             path = 'index.html'
#         response = send_from_directory(static_file_dir, path)
#         response.cache_control.max_age = 0  # avoid cache memory
#         return response

#     return app


# if __name__ == '__main__':
#     app = create_app()
#     app.run(debug=True)  # Enable debug mode for development; disable in production


"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from api.utils import APIException, generate_sitemap
from api.models import db
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from flask_jwt_extended import JWTManager

# from models import Person

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../public/')
app = Flask(__name__)
app.url_map.strict_slashes = False

app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 7*24*60*60*52
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
JWTManager(app)

# database condiguration
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

# add the admin
setup_admin(app)

# add the admin
setup_commands(app)

# Add all endpoints form the API with a "api" prefix
app.register_blueprint(api, url_prefix='/api')

# Handle/serialize errors like a JSON object


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# generate sitemap with all your endpoints


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


# this only runs if `$ python src/main.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))