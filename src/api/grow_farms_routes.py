# # from flask import Blueprint, request, jsonify
# # from api.models import GrowFarm, PlantBatch, EnvironmentData, GrowTask, YieldPrediction
# # from api.extensions import db
# # from api.utils import APIException

# # api = Blueprint('api', __name__)

# # ------------------
# # Grow Farms Routes
# # ------------------

# # Grow Farms
# @api.route('/growfarms', methods=['GET'])
# def get_all_growfarms():
#     growfarms = GrowFarm.query.all()
#     return jsonify([growfarm.serialize() for growfarm in growfarms]), 200

# @api.route('/growfarms/<int:id>', methods=['GET'])
# def get_growfarm(id):
#     growfarm = GrowFarm.query.get(id)
#     if not growfarm:
#         raise APIException('Grow farm not found', 404)
#     return jsonify(growfarm.serialize()), 200

# @api.route('/growfarms', methods=['POST'])
# def create_growfarm():
#     data = request.json
#     new_growfarm = GrowFarm(
#         name=data['name'],
#         location=data['location'],
#         contact_info=data.get('contact_info'),
#         status=data.get('status', 'active')
#     )
#     db.session.add(new_growfarm)
#     db.session.commit()
#     return jsonify(new_growfarm.serialize()), 201

# @api.route('/growfarms/<int:id>', methods=['PUT'])
# def update_growfarm(id):
#     growfarm = GrowFarm.query.get(id)
#     if not growfarm:
#         raise APIException('Grow farm not found', 404)
#     data = request.json
#     growfarm.name = data.get('name', growfarm.name)
#     growfarm.location = data.get('location', growfarm.location)
#     growfarm.contact_info = data.get('contact_info', growfarm.contact_info)
#     growfarm.status = data.get('status', growfarm.status)
#     db.session.commit()
#     return jsonify(growfarm.serialize()), 200

# @api.route('/growfarms/<int:id>', methods=['DELETE'])
# def delete_growfarm(id):
#     growfarm = GrowFarm.query.get(id)
#     if not growfarm:
#         raise APIException('Grow farm not found', 404)
#     db.session.delete(growfarm)
#     db.session.commit()
#     return jsonify({"message": "Grow farm deleted successfully"}), 200

# # Plant Batches
# @api.route('/plant-batches', methods=['GET'])
# def get_all_plant_batches():
#     plant_batches = PlantBatch.query.all()
#     return jsonify([batch.serialize() for batch in plant_batches]), 200

# @api.route('/plant-batches/<int:id>', methods=['GET'])
# def get_plant_batch(id):
#     batch = PlantBatch.query.get(id)
#     if not batch:
#         raise APIException('Plant batch not found', 404)
#     return jsonify(batch.serialize()), 200

# @api.route('/plant-batches', methods=['POST'])
# def create_plant_batch():
#     data = request.json
#     new_batch = PlantBatch(
#         strain=data['strain'],
#         start_date=data['start_date'],
#         end_date=data.get('end_date'),
#         status=data.get('status', 'Growing'),
#         yield_amount=data.get('yield_amount'),
#         environment_id=data.get('environment_id')
#     )
#     db.session.add(new_batch)
#     db.session.commit()
#     return jsonify(new_batch.serialize()), 201

# @api.route('/plant-batches/<int:id>', methods=['PUT'])
# def update_plant_batch(id):
#     batch = PlantBatch.query.get(id)
#     if not batch:
#         raise APIException('Plant batch not found', 404)
#     data = request.json
#     batch.strain = data.get('strain', batch.strain)
#     batch.start_date = data.get('start_date', batch.start_date)
#     batch.end_date = data.get('end_date', batch.end_date)
#     batch.status = data.get('status', batch.status)
#     batch.yield_amount = data.get('yield_amount', batch.yield_amount)
#     db.session.commit()
#     return jsonify(batch.serialize()), 200

# @api.route('/plant-batches/<int:id>', methods=['DELETE'])
# def delete_plant_batch(id):
#     batch = PlantBatch.query.get(id)
#     if not batch:
#         raise APIException('Plant batch not found', 404)
#     db.session.delete(batch)
#     db.session.commit()
#     return jsonify({"message": "Plant batch deleted successfully"}), 200

# # Environment Data
# @api.route('/environment-data', methods=['GET'])
# def get_all_environment_data():
#     data = EnvironmentData.query.all()
#     return jsonify([env.serialize() for env in data]), 200

# @api.route('/environment-data', methods=['POST'])
# def create_environment_data():
#     data = request.json
#     new_env_data = EnvironmentData(
#         temperature=data['temperature'],
#         humidity=data['humidity'],
#         light_intensity=data.get('light_intensity')
#     )
#     db.session.add(new_env_data)
#     db.session.commit()
#     return jsonify(new_env_data.serialize()), 201

# # Grow Tasks
# @api.route('/grow-tasks', methods=['GET'])
# def get_all_grow_tasks():
#     tasks = GrowTask.query.all()
#     return jsonify([task.serialize() for task in tasks]), 200

# @api.route('/grow-tasks/<int:id>', methods=['GET'])
# def get_grow_task(id):
#     task = GrowTask.query.get(id)
#     if not task:
#         raise APIException('Grow task not found', 404)
#     return jsonify(task.serialize()), 200

# @api.route('/grow-tasks', methods=['POST'])
# def create_grow_task():
#     data = request.json
#     new_task = GrowTask(
#         task_name=data['task_name'],
#         task_description=data.get('task_description'),
#         assigned_to=data.get('assigned_to'),
#         priority=data.get('priority', 'Medium'),
#         due_date=data['due_date'],
#         status=data.get('status', 'Pending'),
#         plant_batch_id=data.get('plant_batch_id')
#     )
#     db.session.add(new_task)
#     db.session.commit()
#     return jsonify(new_task.serialize()), 201

# @api.route('/grow-tasks/<int:id>', methods=['PUT'])
# def update_grow_task(id):
#     task = GrowTask.query.get(id)
#     if not task:
#         raise APIException('Grow task not found', 404)
#     data = request.json
#     task.task_name = data.get('task_name', task.task_name)
#     task.task_description = data.get('task_description', task.task_description)
#     task.assigned_to = data.get('assigned_to', task.assigned_to)
#     task.priority = data.get('priority', task.priority)
#     task.due_date = data.get('due_date', task.due_date)
#     task.status = data.get('status', task.status)
#     db.session.commit()
#     return jsonify(task.serialize()), 200

# @api.route('/grow-tasks/<int:id>', methods=['DELETE'])
# def delete_grow_task(id):
#     task = GrowTask.query.get(id)
#     if not task:
#         raise APIException('Grow task not found', 404)
#     db.session.delete(task)
#     db.session.commit()
#     return jsonify({"message": "Grow task deleted successfully"}), 200

# # Yield Predictions
# @api.route('/yield-predictions', methods=['GET'])
# def get_all_yield_predictions():
#     predictions = YieldPrediction.query.all()
#     return jsonify([prediction.serialize() for prediction in predictions]), 200

# @api.route('/yield-predictions/<int:id>', methods=['GET'])
# def get_yield_prediction(id):
#     prediction = YieldPrediction.query.get(id)
#     if not prediction:
#         raise APIException('Yield prediction not found', 404)
#     return jsonify(prediction.serialize()), 200

# @api.route('/yield-predictions', methods=['POST'])
# def create_yield_prediction():
#     data = request.json
#     new_prediction = YieldPrediction(
#         plant_batch_id=data['plant_batch_id'],
#         predicted_yield=data['predicted_yield'],
#         actual_yield=data.get('actual_yield'),
#         accuracy=data.get('accuracy')
#     )
#     db.session.add(new_prediction)
#     db.session.commit()
#     return jsonify(new_prediction.serialize()), 201

# @api.route('/yield-predictions/<int:id>', methods=['DELETE'])
# def delete_yield_prediction(id):
#     prediction = YieldPrediction.query.get(id)
#     if not prediction:
#         raise APIException('Yield prediction not found', 404)
#     db.session.delete(prediction)
#     db.session.commit()
#     return jsonify({"message": "Yield prediction deleted successfully"}), 200
