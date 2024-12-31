
# import os
# from flask import Flask, jsonify, send_from_directory, request
# from flask_migrate import Migrate
# from flask_jwt_extended import JWTManager
# from flask_cors import CORS
# from dotenv import load_dotenv
# from celery import Celery
# from api.extensions import db, socketio  # Import extensions
# from api.utils import APIException, generate_sitemap  # Import utilities
# from api.routes import api  # Import the API blueprint
# from api.admin import setup_admin  # Import admin setup function
# from api.config import config_by_name

# load_dotenv()

# app = Flask(__name__)
# app.config.from_object(config_by_name["development"])
# # Configurations
# app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///app.db')
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')

# # Initialize extensions
# db.init_app(app)
# migrate = Migrate(app, db)  # Migrate setup
# socketio.init_app(app, cors_allowed_origins="*")
# jwt = JWTManager(app)
# CORS(app)

# # Import and setup admin after initializing the database
# from api.admin import setup_admin  # Import after db.init_app(app)
# setup_admin(app)

# # Register API blueprint
# app.register_blueprint(api, url_prefix='/api')

# def make_celery(app):
#     celery = Celery(app.import_name, broker=app.config['CELERY_BROKER_URL'])
#     celery.conf.update(app.config)
#     return celery

# # In your app initialization:
# celery = make_celery(app)

# @app.errorhandler(APIException)
# def handle_api_exception(error):
#     return jsonify(error.to_dict()), error.status_code

# @app.route('/')
# def sitemap():
#     return generate_sitemap(app)

# if __name__ == '__main__':
#     socketio.run(app, debug=True)


import os
from flask import Flask, jsonify, send_from_directory, request
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv
from celery import Celery
from api.extensions import db, socketio  # Import extensions
from api.utils import APIException, generate_sitemap  # Import utilities
from api.routes import api  # Import the API blueprint
from api.admin import setup_admin  # Import admin setup function
from api.config import config_by_name

load_dotenv()

app = Flask(__name__)
app.config.from_object(config_by_name["development"])
# Configurations
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')

# Initialize extensions
db.init_app(app)
migrate = Migrate(app, db)  # Migrate setup
socketio.init_app(app, cors_allowed_origins="*")  # Initialize SocketIO
jwt = JWTManager(app)
CORS(app)

# Import and setup admin after initializing the database
from api.admin import setup_admin  # Import after db.init_app(app)
setup_admin(app)

# Register API blueprint
app.register_blueprint(api, url_prefix='/api')

def make_celery(app):
    celery = Celery(app.import_name, broker=app.config['CELERY_BROKER_URL'])
    celery.conf.update(app.config)
    return celery

# In your app initialization:
celery = make_celery(app)

@app.errorhandler(APIException)
def handle_api_exception(error):
    return jsonify(error.to_dict()), error.status_code

@app.route('/')
def sitemap():
    return generate_sitemap(app)

# WebSocket Event Handling
@socketio.on('update_inventory')
def handle_inventory_update(data):
    from api.models import Product  # Import models within the function to avoid circular imports
    product = Product.query.get(data['product_id'])
    if product:
        product.current_stock = data['current_stock']
        db.session.commit()
        socketio.emit('inventory_updated', {
            'product_id': product.id,
            'current_stock': product.current_stock
        }, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=True)
