from flask import Blueprint, jsonify, request
from models import db, User, Company, Connect, FavoriteConnect, JobPosting, JobApplication, Advertisement, Message, Report
from flask_jwt_extended import jwt_required, get_jwt_identity

api = Blueprint('api', __name__)

# -------------------------
# User Management
# -------------------------
@api.route('/user/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    return jsonify(user.serialize(include_interests=True)), 200

# -------------------------
# Company Profiles
# -------------------------
@api.route('/companies', methods=['GET'])
def get_companies():
    companies = Company.query.all()
    return jsonify([c.serialize() for c in companies]), 200

@api.route('/company/<int:company_id>', methods=['GET'])
def get_company(company_id):
    company = Company.query.get(company_id)
    if not company:
        return jsonify({"msg": "Company not found"}), 404
    return jsonify(company.serialize()), 200

# -------------------------
# Networking (Connections & Favorites)
# -------------------------
@api.route('/connect', methods=['POST'])
@jwt_required()
def send_connection_request():
    user_id = get_jwt_identity()
    data = request.get_json()
    connection = Connect(user_id=user_id, connected_user_id=data['target_id'])
    db.session.add(connection)
    db.session.commit()
    return jsonify({"msg": "Connection request sent"}), 201

@api.route('/favorites', methods=['POST'])
@jwt_required()
def add_favorite():
    user_id = get_jwt_identity()
    data = request.get_json()
    favorite = FavoriteConnect(user_id=user_id, favorite_user_id=data['target_id'])
    db.session.add(favorite)
    db.session.commit()
    return jsonify({"msg": "Favorite added"}), 201

# -------------------------
# Job Board
# -------------------------
@api.route('/jobs', methods=['GET'])
def list_jobs():
    jobs = JobPosting.query.all()
    return jsonify([job.serialize() for job in jobs]), 200

@api.route('/jobs', methods=['POST'])
@jwt_required()
def create_job():
    data = request.get_json()
    job = JobPosting(**data)
    db.session.add(job)
    db.session.commit()
    return jsonify(job.serialize()), 201

@api.route('/apply', methods=['POST'])
@jwt_required()
def apply_to_job():
    user_id = get_jwt_identity()
    data = request.get_json()
    app = JobApplication(user_id=user_id, job_id=data['job_id'], company_id=data['company_id'])
    db.session.add(app)
    db.session.commit()
    return jsonify({"msg": "Applied to job"}), 201

# -------------------------
# Messaging
# -------------------------
@api.route('/messages', methods=['POST'])
@jwt_required()
def send_message():
    user_id = get_jwt_identity()
    data = request.get_json()
    msg = Message(sender_id=user_id, recipient_id=data['recipient_id'], content=data['content'])
    db.session.add(msg)
    db.session.commit()
    return jsonify(msg.serialize()), 201

# -------------------------
# Advertisements
# -------------------------
@api.route('/ads', methods=['GET'])
def get_ads():
    ads = Advertisement.query.filter_by(active=True).all()
    return jsonify([ad.serialize() for ad in ads]), 200

@api.route('/ads', methods=['POST'])
@jwt_required()
def create_ad():
    data = request.get_json()
    ad = Advertisement(**data)
    db.session.add(ad)
    db.session.commit()
    return jsonify(ad.serialize()), 201

# -------------------------
# Reporting
# -------------------------
@api.route('/report', methods=['POST'])
@jwt_required()
def report_content():
    user_id = get_jwt_identity()
    data = request.get_json()
    report = Report(reported_by_id=user_id, **data)
    db.session.add(report)
    db.session.commit()
    return jsonify({"msg": "Report submitted"}), 201
