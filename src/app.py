# import os
# from flask import Flask, jsonify, url_for, send_from_directory, request
# from flask_migrate import Migrate
# from flask_jwt_extended import JWTManager
# from flask_cors import CORS
# from dotenv import load_dotenv

# from api.extensions import db, socketio  # Import extensions
# from api.utils import APIException, generate_sitemap  # Import utilities
# from api.routes import api  # Import the API blueprint
# from api.models import db
# from api.admin import setup_admin

# load_dotenv()

# # Initialize Flask app
# app = Flask(__name__)

# # Configurations
# app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///app.db')
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')

# # Initialize extensions with the app
# db.init_app(app)
# socketio.init_app(app, cors_allowed_origins="*")  # Allow CORS for SocketIO
# jwt = JWTManager(app)
# CORS(app)

# # Initialize migrations
# Migrate(app, db)
# setup_admin(app)
# # Register blueprints
# app.register_blueprint(api, url_prefix='/api')

# # Error handling for APIException
# @app.errorhandler(APIException)
# def handle_api_exception(error):
#     return jsonify(error.to_dict()), error.status_code

# ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
# static_file_dir = os.path.join(os.path.dirname(
#     os.path.realpath(__file__)), '../public/')

# @app.route('/')
# def sitemap():
#     if ENV == "development":
#         return generate_sitemap(app)
#     return send_from_directory(static_file_dir, 'index.html')

# # any other endpoint will try to serve it like a static file
# @app.route('/<path:path>', methods=['GET'])
# def serve_any_other_file(path):
#     if not os.path.isfile(os.path.join(static_file_dir, path)):
#         path = 'index.html'
#     response = send_from_directory(static_file_dir, path)
#     response.cache_control.max_age = 0  # avoid cache memory
#     return response

# # Health Check Endpoint
# @app.route('/health', methods=['GET'])
# def health_check():
#     return jsonify({"status": "ok", "message": "Server is running"}), 200

# # Run the app
# if __name__ == '__main__':
#     socketio.run(app, debug=True)

# --------------------------------------------
import os
from flask import Flask, jsonify, send_from_directory, request
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv

from api.extensions import db, socketio  # Import extensions
from api.utils import APIException, generate_sitemap  # Import utilities
from api.routes import api  # Import the API blueprint
from api.admin import setup_admin  # Import admin setup function


load_dotenv()

app = Flask(__name__)

# Configurations
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')

# Initialize extensions
db.init_app(app)
migrate = Migrate(app, db)  # Migrate setup
socketio.init_app(app, cors_allowed_origins="*")
jwt = JWTManager(app)
CORS(app)

# Import and setup admin after initializing the database
from api.admin import setup_admin  # Import after db.init_app(app)
setup_admin(app)

# Register API blueprint
app.register_blueprint(api, url_prefix='/api')

@app.errorhandler(APIException)
def handle_api_exception(error):
    return jsonify(error.to_dict()), error.status_code

@app.route('/')
def sitemap():
    return generate_sitemap(app)

if __name__ == '__main__':
    socketio.run(app, debug=True)


# import os
# from flask import Flask 
# from flask_migrate import Migrate
# from flask_jwt_extended import JWTManager
# from flask_cors import CORS
# from dotenv import load_dotenv

# from api.extensions import db, socketio
# from api.models import *  # Import all models
# from api import api  # Import the blueprint

# load_dotenv()

# def create_app():
#     app = Flask(__name__)
    
#     # Configurations
#     app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///app.db')
#     app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
#     app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')

#     # Initialize extensions
#     db.init_app(app)
#     migrate = Migrate(app, db)
#     jwt = JWTManager(app)
#     CORS(app)
#     socketio.init_app(app, cors_allowed_origins="*")

#     # Register blueprint
#     app.register_blueprint(api, url_prefix='/api')

#     # Import and setup admin after initializing database
#     from api.admin import setup_admin
#     setup_admin(app)

#     return app

# app = create_app()

# if __name__ == '__main__':
#     socketio.run(app, debug=True)