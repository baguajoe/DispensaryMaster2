from flask_socketio import SocketIO

socketio = SocketIO(cors_allowed_origins="*")
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
