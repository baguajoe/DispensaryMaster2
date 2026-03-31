import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
try:
    from flask_limiter import Limiter
    from flask_limiter.util import get_remote_address
    LIMITER_AVAILABLE = True
except ImportError:
    LIMITER_AVAILABLE = False
from flask_login import LoginManager

from api.utils import APIException, generate_sitemap
from api.models import db
from api.extensions import socketio
from api.routes import api
from api.non_medical_routes import non_medical_bp
from api.pos_routes import pos_bp
from api.grow_farms_routes import grow_farms_bp
from api.seed_banks_routes import seed_banks_bp
from api.admin import setup_admin
from api.commands import setup_commands
from dotenv import load_dotenv
load_dotenv()

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../public/')

app = Flask(__name__)
app.url_map.strict_slashes = False

# CORS
CORS(app, resources={r"/api/*": {"origins": "*"}})

# JWT
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 7 * 24 * 60 * 60
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dispensary-secret-key-change-in-prod")
JWTManager(app)

# Flask-Login
app.secret_key = os.getenv("FLASK_SECRET_KEY", "dispensary-flask-secret")
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    from api.models import User
    return User.query.get(int(user_id))

# Database
db_url = os.getenv("DATABASE_URL")
if db_url:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace("postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/dispensary.db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Init extensions
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)
socketio.init_app(app)

# Admin & Commands
setup_admin(app)
setup_commands(app)

# Register Blueprints
app.register_blueprint(api, url_prefix='/api')
app.register_blueprint(non_medical_bp, url_prefix='/api')
app.register_blueprint(pos_bp, url_prefix='/api')
app.register_blueprint(grow_farms_bp, url_prefix='/api')
app.register_blueprint(seed_banks_bp, url_prefix='/api')

# Error handler
@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error"}), 500

# Routes
@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0
    return response

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "BudphoriaPro running"}), 200

# SocketIO events
@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    socketio.run(app, host='0.0.0.0', port=PORT, debug=(ENV == "development"))
