from flask import Blueprint, request, jsonify
from api.models import db, Seedbank, SeedBatch, StorageConditions, SeedReport
from api.utils import APIException
from flask_jwt_extended import jwt_required

seed_banks_bp = Blueprint('seed_banks', __name__)

# ── Seedbanks ───────────────────────────────────────────────
@seed_banks_bp.route('/seedbanks', methods=['GET'])
@jwt_required()
def get_seedbanks():
    seedbanks = Seedbank.query.all()
    return jsonify([s.serialize() for s in seedbanks]), 200

@seed_banks_bp.route('/seedbanks', methods=['POST'])
@jwt_required()
def create_seedbank():
    data = request.json
    sb = Seedbank(
        name=data['name'],
        location=data['location'],
        contact_email=data['contact_email'],
        phone_number=data.get('phone_number'),
        description=data.get('description')
    )
    db.session.add(sb)
    db.session.commit()
    return jsonify(sb.serialize()), 201

@seed_banks_bp.route('/seedbanks/<int:id>', methods=['PUT'])
@jwt_required()
def update_seedbank(id):
    sb = Seedbank.query.get(id)
    if not sb:
        raise APIException("Seedbank not found", 404)
    data = request.json
    for field in ['name', 'location', 'contact_email', 'phone_number', 'description']:
        if field in data:
            setattr(sb, field, data[field])
    db.session.commit()
    return jsonify(sb.serialize()), 200

@seed_banks_bp.route('/seedbanks/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_seedbank(id):
    sb = Seedbank.query.get(id)
    if not sb:
        raise APIException("Seedbank not found", 404)
    db.session.delete(sb)
    db.session.commit()
    return jsonify({"message": "Seedbank deleted"}), 200

# ── Seed Batches ────────────────────────────────────────────
@seed_banks_bp.route('/seedbatches', methods=['GET'])
@jwt_required()
def get_seed_batches():
    batches = SeedBatch.query.all()
    return jsonify([b.serialize() for b in batches]), 200

@seed_banks_bp.route('/seedbatches', methods=['POST'])
@jwt_required()
def create_seed_batch():
    data = request.json
    batch = SeedBatch(
        name=data['name'],
        strain=data['strain'],
        quantity=data['quantity'],
        harvest_date=data['harvest_date'],
        grower=data.get('grower')
    )
    db.session.add(batch)
    db.session.commit()
    return jsonify(batch.serialize()), 201

@seed_banks_bp.route('/seedbatches/<int:id>', methods=['PUT'])
@jwt_required()
def update_seed_batch(id):
    batch = SeedBatch.query.get(id)
    if not batch:
        raise APIException("Seed batch not found", 404)
    data = request.json
    for field in ['name', 'strain', 'quantity', 'harvest_date', 'grower']:
        if field in data:
            setattr(batch, field, data[field])
    db.session.commit()
    return jsonify(batch.serialize()), 200

@seed_banks_bp.route('/seedbatches/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_seed_batch(id):
    batch = SeedBatch.query.get(id)
    if not batch:
        raise APIException("Seed batch not found", 404)
    db.session.delete(batch)
    db.session.commit()
    return jsonify({"message": "Seed batch deleted"}), 200

# ── Storage Conditions ──────────────────────────────────────
@seed_banks_bp.route('/storageconditions', methods=['GET'])
@jwt_required()
def get_storage_conditions():
    conditions = StorageConditions.query.all()
    return jsonify([c.serialize() for c in conditions]), 200

@seed_banks_bp.route('/storageconditions', methods=['POST'])
@jwt_required()
def create_storage_condition():
    data = request.json
    cond = StorageConditions(
        temperature=data['temperature'],
        humidity=data['humidity'],
        light_exposure=data['light_exposure'],
        notes=data.get('notes')
    )
    db.session.add(cond)
    db.session.commit()
    return jsonify(cond.serialize()), 201

# ── Seed Reports ────────────────────────────────────────────
@seed_banks_bp.route('/seedreports', methods=['GET'])
@jwt_required()
def get_seed_reports():
    reports = SeedReport.query.all()
    return jsonify([r.serialize() for r in reports]), 200

@seed_banks_bp.route('/seedreports', methods=['POST'])
@jwt_required()
def create_seed_report():
    data = request.json
    report = SeedReport(
        seed_batch_id=data['seed_batch_id'],
        germination_rate=data['germination_rate'],
        harvest_yield=data.get('harvest_yield'),
        report_date=data['report_date'],
        notes=data.get('notes')
    )
    db.session.add(report)
    db.session.commit()
    return jsonify(report.serialize()), 201
