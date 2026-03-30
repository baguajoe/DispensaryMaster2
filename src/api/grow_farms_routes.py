from flask import Blueprint, request, jsonify
from api.models import db, GrowFarm, PlantBatch, GrowTask, YieldPrediction
from api.utils import APIException
from flask_jwt_extended import jwt_required

grow_farms_bp = Blueprint('grow_farms', __name__)

# ── Grow Farms ──────────────────────────────────────────────
@grow_farms_bp.route('/growfarms', methods=['GET'])
@jwt_required()
def get_all_growfarms():
    growfarms = GrowFarm.query.all()
    return jsonify([gf.serialize() for gf in growfarms]), 200

@grow_farms_bp.route('/growfarms/<int:id>', methods=['GET'])
@jwt_required()
def get_growfarm(id):
    gf = GrowFarm.query.get(id)
    if not gf:
        raise APIException('Grow farm not found', 404)
    return jsonify(gf.serialize()), 200

@grow_farms_bp.route('/growfarms', methods=['POST'])
@jwt_required()
def create_growfarm():
    data = request.json
    gf = GrowFarm(
        name=data['name'],
        location=data['location'],
        contact_info=data.get('contact_info'),
        status=data.get('status', 'active')
    )
    db.session.add(gf)
    db.session.commit()
    return jsonify(gf.serialize()), 201

@grow_farms_bp.route('/growfarms/<int:id>', methods=['PUT'])
@jwt_required()
def update_growfarm(id):
    gf = GrowFarm.query.get(id)
    if not gf:
        raise APIException('Grow farm not found', 404)
    data = request.json
    gf.name = data.get('name', gf.name)
    gf.location = data.get('location', gf.location)
    gf.contact_info = data.get('contact_info', gf.contact_info)
    gf.status = data.get('status', gf.status)
    db.session.commit()
    return jsonify(gf.serialize()), 200

@grow_farms_bp.route('/growfarms/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_growfarm(id):
    gf = GrowFarm.query.get(id)
    if not gf:
        raise APIException('Grow farm not found', 404)
    db.session.delete(gf)
    db.session.commit()
    return jsonify({"message": "Grow farm deleted"}), 200

# ── Plant Batches ────────────────────────────────────────────
@grow_farms_bp.route('/plant-batches', methods=['GET'])
@jwt_required()
def get_all_plant_batches():
    batches = PlantBatch.query.all()
    return jsonify([b.serialize() for b in batches]), 200

@grow_farms_bp.route('/plant-batches', methods=['POST'])
@jwt_required()
def create_plant_batch():
    data = request.json
    batch = PlantBatch(
        strain=data['strain'],
        start_date=data['start_date'],
        end_date=data.get('end_date'),
        status=data.get('status', 'Growing'),
        yield_amount=data.get('yield_amount'),
    )
    db.session.add(batch)
    db.session.commit()
    return jsonify(batch.serialize()), 201

@grow_farms_bp.route('/plant-batches/<int:id>', methods=['PUT'])
@jwt_required()
def update_plant_batch(id):
    batch = PlantBatch.query.get(id)
    if not batch:
        raise APIException('Plant batch not found', 404)
    data = request.json
    for field in ['strain', 'start_date', 'end_date', 'status', 'yield_amount']:
        if field in data:
            setattr(batch, field, data[field])
    db.session.commit()
    return jsonify(batch.serialize()), 200

@grow_farms_bp.route('/plant-batches/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_plant_batch(id):
    batch = PlantBatch.query.get(id)
    if not batch:
        raise APIException('Plant batch not found', 404)
    db.session.delete(batch)
    db.session.commit()
    return jsonify({"message": "Plant batch deleted"}), 200

# ── Grow Tasks ──────────────────────────────────────────────
@grow_farms_bp.route('/grow-tasks', methods=['GET'])
@jwt_required()
def get_all_grow_tasks():
    tasks = GrowTask.query.all()
    return jsonify([t.serialize() for t in tasks]), 200

@grow_farms_bp.route('/grow-tasks', methods=['POST'])
@jwt_required()
def create_grow_task():
    data = request.json
    task = GrowTask(
        task_name=data['task_name'],
        task_description=data.get('task_description'),
        assigned_to=data.get('assigned_to'),
        priority=data.get('priority', 'Medium'),
        due_date=data['due_date'],
        status=data.get('status', 'Pending'),
        plant_batch_id=data.get('plant_batch_id')
    )
    db.session.add(task)
    db.session.commit()
    return jsonify(task.serialize()), 201

@grow_farms_bp.route('/grow-tasks/<int:id>', methods=['PUT'])
@jwt_required()
def update_grow_task(id):
    task = GrowTask.query.get(id)
    if not task:
        raise APIException('Grow task not found', 404)
    data = request.json
    for field in ['task_name', 'task_description', 'assigned_to', 'priority', 'due_date', 'status']:
        if field in data:
            setattr(task, field, data[field])
    db.session.commit()
    return jsonify(task.serialize()), 200

@grow_farms_bp.route('/grow-tasks/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_grow_task(id):
    task = GrowTask.query.get(id)
    if not task:
        raise APIException('Grow task not found', 404)
    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted"}), 200

# ── Yield Predictions ───────────────────────────────────────
@grow_farms_bp.route('/yield-predictions', methods=['GET'])
@jwt_required()
def get_yield_predictions():
    predictions = YieldPrediction.query.all()
    return jsonify([p.serialize() for p in predictions]), 200

@grow_farms_bp.route('/yield-predictions', methods=['POST'])
@jwt_required()
def create_yield_prediction():
    data = request.json
    pred = YieldPrediction(
        plant_batch_id=data['plant_batch_id'],
        predicted_yield=data['predicted_yield'],
        actual_yield=data.get('actual_yield'),
        accuracy=data.get('accuracy')
    )
    db.session.add(pred)
    db.session.commit()
    return jsonify(pred.serialize()), 201
