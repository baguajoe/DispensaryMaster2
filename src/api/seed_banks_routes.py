# # from flask import Blueprint, request, jsonify
# # from api.models import db, Seedbank, SeedBatch, StorageConditions, SeedReport
# # from api.utils import APIException

# # api = Blueprint('seedbanks', __name__)

# # --------------------------------
# # Seedbank Routes
# # --------------------------------

# @api.route('/seedbanks', methods=['GET'])
# def get_seedbanks():
#     seedbanks = Seedbank.query.all()
#     return jsonify([seedbank.serialize() for seedbank in seedbanks]), 200

# @api.route('/seedbanks/<int:seedbank_id>', methods=['GET'])
# def get_seedbank(seedbank_id):
#     seedbank = Seedbank.query.get(seedbank_id)
#     if not seedbank:
#         raise APIException("Seedbank not found", status_code=404)
#     return jsonify(seedbank.serialize()), 200

# @api.route('/seedbanks', methods=['POST'])
# def create_seedbank():
#     data = request.json
#     seedbank = Seedbank(
#         name=data.get('name'),
#         location=data.get('location'),
#         contact_info=data.get('contact_info'),
#         status=data.get('status', 'active')
#     )
#     db.session.add(seedbank)
#     db.session.commit()
#     return jsonify(seedbank.serialize()), 201

# @api.route('/seedbanks/<int:seedbank_id>', methods=['PUT'])
# def update_seedbank(seedbank_id):
#     seedbank = Seedbank.query.get(seedbank_id)
#     if not seedbank:
#         raise APIException("Seedbank not found", status_code=404)

#     data = request.json
#     seedbank.name = data.get('name', seedbank.name)
#     seedbank.location = data.get('location', seedbank.location)
#     seedbank.contact_info = data.get('contact_info', seedbank.contact_info)
#     seedbank.status = data.get('status', seedbank.status)

#     db.session.commit()
#     return jsonify(seedbank.serialize()), 200

# @api.route('/seedbanks/<int:seedbank_id>', methods=['DELETE'])
# def delete_seedbank(seedbank_id):
#     seedbank = Seedbank.query.get(seedbank_id)
#     if not seedbank:
#         raise APIException("Seedbank not found", status_code=404)
#     db.session.delete(seedbank)
#     db.session.commit()
#     return jsonify({"message": "Seedbank deleted"}), 200

# # --------------------------------
# # SeedBatch Routes
# # --------------------------------

# @api.route('/seedbatches', methods=['GET'])
# def get_seed_batches():
#     seed_batches = SeedBatch.query.all()
#     return jsonify([batch.serialize() for batch in seed_batches]), 200

# @api.route('/seedbatches/<int:batch_id>', methods=['GET'])
# def get_seed_batch(batch_id):
#     seed_batch = SeedBatch.query.get(batch_id)
#     if not seed_batch:
#         raise APIException("Seed batch not found", status_code=404)
#     return jsonify(seed_batch.serialize()), 200

# @api.route('/seedbatches', methods=['POST'])
# def create_seed_batch():
#     data = request.json
#     seed_batch = SeedBatch(
#         strain=data.get('strain'),
#         batch_number=data.get('batch_number'),
#         quantity=data.get('quantity'),
#         storage_location=data.get('storage_location'),
#         expiration_date=data.get('expiration_date'),
#         status=data.get('status', 'active')
#     )
#     db.session.add(seed_batch)
#     db.session.commit()
#     return jsonify(seed_batch.serialize()), 201

# @api.route('/seedbatches/<int:batch_id>', methods=['PUT'])
# def update_seed_batch(batch_id):
#     seed_batch = SeedBatch.query.get(batch_id)
#     if not seed_batch:
#         raise APIException("Seed batch not found", status_code=404)

#     data = request.json
#     seed_batch.strain = data.get('strain', seed_batch.strain)
#     seed_batch.batch_number = data.get('batch_number', seed_batch.batch_number)
#     seed_batch.quantity = data.get('quantity', seed_batch.quantity)
#     seed_batch.storage_location = data.get('storage_location', seed_batch.storage_location)
#     seed_batch.expiration_date = data.get('expiration_date', seed_batch.expiration_date)
#     seed_batch.status = data.get('status', seed_batch.status)

#     db.session.commit()
#     return jsonify(seed_batch.serialize()), 200

# @api.route('/seedbatches/<int:batch_id>', methods=['DELETE'])
# def delete_seed_batch(batch_id):
#     seed_batch = SeedBatch.query.get(batch_id)
#     if not seed_batch:
#         raise APIException("Seed batch not found", status_code=404)
#     db.session.delete(seed_batch)
#     db.session.commit()
#     return jsonify({"message": "Seed batch deleted"}), 200

# # --------------------------------
# # Storage Conditions Routes
# # --------------------------------

# @api.route('/storageconditions', methods=['GET'])
# def get_storage_conditions():
#     conditions = StorageConditions.query.all()
#     return jsonify([condition.serialize() for condition in conditions]), 200

# @api.route('/storageconditions', methods=['POST'])
# def create_storage_condition():
#     data = request.json
#     condition = StorageConditions(
#         location=data.get('location'),
#         temperature=data.get('temperature'),
#         humidity=data.get('humidity'),
#         last_updated=data.get('last_updated')
#     )
#     db.session.add(condition)
#     db.session.commit()
#     return jsonify(condition.serialize()), 201

# @api.route('/storageconditions/<int:condition_id>', methods=['PUT'])
# def update_storage_condition(condition_id):
#     condition = StorageConditions.query.get(condition_id)
#     if not condition:
#         raise APIException("Storage condition not found", status_code=404)

#     data = request.json
#     condition.location = data.get('location', condition.location)
#     condition.temperature = data.get('temperature', condition.temperature)
#     condition.humidity = data.get('humidity', condition.humidity)
#     condition.last_updated = data.get('last_updated', condition.last_updated)

#     db.session.commit()
#     return jsonify(condition.serialize()), 200

# @api.route('/storageconditions/<int:condition_id>', methods=['DELETE'])
# def delete_storage_condition(condition_id):
#     condition = StorageConditions.query.get(condition_id)
#     if not condition:
#         raise APIException("Storage condition not found", status_code=404)
#     db.session.delete(condition)
#     db.session.commit()
#     return jsonify({"message": "Storage condition deleted"}), 200

# # --------------------------------
# # SeedReport Routes
# # --------------------------------

# @api.route('/seedreports', methods=['GET'])
# def get_seed_reports():
#     reports = SeedReport.query.all()
#     return jsonify([report.serialize() for report in reports]), 200

# @api.route('/seedreports', methods=['POST'])
# def create_seed_report():
#     data = request.json
#     report = SeedReport(
#         report_type=data.get('report_type'),
#         parameters=data.get('parameters'),
#         report_data=data.get('report_data'),
#         generated_at=data.get('generated_at')
#     )
#     db.session.add(report)
#     db.session.commit()
#     return jsonify(report.serialize()), 201

# @api.route('/seedreports/<int:report_id>', methods=['GET'])
# def get_seed_report(report_id):
#     report = SeedReport.query.get(report_id)
#     if not report:
#         raise APIException("Seed report not found", status_code=404)
#     return jsonify(report.serialize()), 200

# @api.route('/seedreports/<int:report_id>', methods=['DELETE'])
# def delete_seed_report(report_id):
#     report = SeedReport.query.get(report_id)
#     if not report:
#         raise APIException("Seed report not found", status_code=404)
#     db.session.delete(report)
#     db.session.commit()
#     return jsonify({"message": "Seed report deleted"}), 200
