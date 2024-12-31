# # from flask import Blueprint, request, jsonify
# # from api.models import (
# #     Patient,
# #     Prescription,
# #     Symptom,
# #     MedicalResource,
# #     Recommendation,
# #     Compliance,
# #     PatientAnalytics,
# #     db
# # 
# # from api.utils import APIException

# # Create Blueprint
# # api = Blueprint('medical_routes', __name__)

# # Patient Routes
# @api.route('/patients', methods=['GET'])
# def get_patients():
#     patients = Patient.query.all()
#     return jsonify([patient.serialize() for patient in patients]), 200

# @api.route('/patients/<int:patient_id>', methods=['GET'])
# def get_patient(patient_id):
#     patient = Patient.query.get(patient_id)
#     if not patient:
#         raise APIException('Patient not found', status_code=404)
#     return jsonify(patient.serialize()), 200

# @api.route('/patients', methods=['POST'])
# def create_patient():
#     data = request.json
#     new_patient = Patient(**data)
#     db.session.add(new_patient)
#     db.session.commit()
#     return jsonify(new_patient.serialize()), 201

# # Prescription Routes
# @api.route('/prescriptions', methods=['GET'])
# def get_prescriptions():
#     prescriptions = Prescription.query.all()
#     return jsonify([prescription.serialize() for prescription in prescriptions]), 200

# @api.route('/prescriptions/<int:prescription_id>', methods=['GET'])
# def get_prescription(prescription_id):
#     prescription = Prescription.query.get(prescription_id)
#     if not prescription:
#         raise APIException('Prescription not found', status_code=404)
#     return jsonify(prescription.serialize()), 200

# @api.route('/prescriptions', methods=['POST'])
# def create_prescription():
#     data = request.json
#     new_prescription = Prescription(**data)
#     db.session.add(new_prescription)
#     db.session.commit()
#     return jsonify(new_prescription.serialize()), 201

# # Symptom Tracker Routes
# @api.route('/symptoms', methods=['GET'])
# def get_symptoms():
#     symptoms = Symptom.query.all()
#     return jsonify([symptom.serialize() for symptom in symptoms]), 200

# @api.route('/symptoms/<int:symptom_id>', methods=['GET'])
# def get_symptom(symptom_id):
#     symptom = Symptom.query.get(symptom_id)
#     if not symptom:
#         raise APIException('Symptom not found', status_code=404)
#     return jsonify(symptom.serialize()), 200

# @api.route('/symptoms', methods=['POST'])
# def create_symptom():
#     data = request.json
#     new_symptom = Symptom(**data)
#     db.session.add(new_symptom)
#     db.session.commit()
#     return jsonify(new_symptom.serialize()), 201

# # Medical Resources Routes
# @api.route('/resources', methods=['GET'])
# def get_resources():
#     resources = MedicalResource.query.all()
#     return jsonify([resource.serialize() for resource in resources]), 200

# @api.route('/resources/<int:resource_id>', methods=['GET'])
# def get_resource(resource_id):
#     resource = MedicalResource.query.get(resource_id)
#     if not resource:
#         raise APIException('Resource not found', status_code=404)
#     return jsonify(resource.serialize()), 200

# @api.route('/resources', methods=['POST'])
# def create_resource():
#     data = request.json
#     new_resource = MedicalResource(**data)
#     db.session.add(new_resource)
#     db.session.commit()
#     return jsonify(new_resource.serialize()), 201

# # Recommendations Routes
# @api.route('/recommendations', methods=['GET'])
# def get_recommendations():
#     recommendations = Recommendation.query.all()
#     return jsonify([recommendation.serialize() for recommendation in recommendations]), 200

# @api.route('/recommendations/<int:recommendation_id>', methods=['GET'])
# def get_recommendation(recommendation_id):
#     recommendation = Recommendation.query.get(recommendation_id)
#     if not recommendation:
#         raise APIException('Recommendation not found', status_code=404)
#     return jsonify(recommendation.serialize()), 200

# @api.route('/recommendations', methods=['POST'])
# def create_recommendation():
#     data = request.json
#     new_recommendation = Recommendation(**data)
#     db.session.add(new_recommendation)
#     db.session.commit()
#     return jsonify(new_recommendation.serialize()), 201

# # Compliance Routes
# @api.route('/compliance', methods=['GET'])
# def get_compliance():
#     compliance_records = Compliance.query.all()
#     return jsonify([compliance.serialize() for compliance in compliance_records]), 200

# @api.route('/compliance/<int:compliance_id>', methods=['GET'])
# def get_compliance_record(compliance_id):
#     compliance = Compliance.query.get(compliance_id)
#     if not compliance:
#         raise APIException('Compliance record not found', status_code=404)
#     return jsonify(compliance.serialize()), 200

# @api.route('/compliance', methods=['POST'])
# def create_compliance():
#     data = request.json
#     new_compliance = Compliance(**data)
#     db.session.add(new_compliance)
#     db.session.commit()
#     return jsonify(new_compliance.serialize()), 201

# # Analytics Routes
# @api.route('/analytics/patients', methods=['GET'])
# def get_patient_analytics():
#     analytics = PatientAnalytics.query.all()
#     return jsonify([analytic.serialize() for analytic in analytics]), 200

# @api.route('/analytics/patients/<int:analytic_id>', methods=['GET'])
# def get_patient_analytic(analytic_id):
#     analytic = PatientAnalytics.query.get(analytic_id)
#     if not analytic:
#         raise APIException('Patient analytics not found', status_code=404)
#     return jsonify(analytic.serialize()), 200

# @api.route('/analytics/patients', methods=['POST'])
# def create_patient_analytics():
#     data = request.json
#     new_analytics = PatientAnalytics(**data)
#     db.session.add(new_analytics)
#     db.session.commit()
#     return jsonify(new_analytics.serialize()), 201

# # Catch-All Route for Undefined Routes
# @api.route('/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
# def catch_all(path):
#     return jsonify({"message": f"Route {path} not defined."}), 404
