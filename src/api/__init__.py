from flask import Blueprint
from flask_cors import CORS
from celery import Celery

# Create the Blueprint for the API
api = Blueprint('api', __name__)

# Enable CORS for the API blueprint
CORS(api, resources={r"/api/*": {"origins": "https://shiny-broccoli-q79pvgr4wqp72qx9-3000.app.github.dev"}})

# Make sure routes only import what is necessary to avoid circular imports
from . import routes

# Export the `api` blueprint for use in the main application
__all__ = ['api']

# def make_celery(app):
#     celery = Celery(app.import_name, broker=app.config['CELERY_BROKER_URL'])
#     celery.conf.update(app.config)
#     return celery

# # In your app initialization:
# celery = make_celery(app)