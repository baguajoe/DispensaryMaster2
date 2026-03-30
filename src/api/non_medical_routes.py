from flask import Blueprint, request, jsonify
from api.models import db, Store, Supplier, LoyaltyHistory, Customer, User
from flask_jwt_extended import jwt_required, get_jwt_identity
from functools import wraps

non_medical_bp = Blueprint('non_medical', __name__)

def handle_errors(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return decorated

# ── Stores ──────────────────────────────────────────────────
@non_medical_bp.route('/stores', methods=['GET'])
@jwt_required()
@handle_errors
def get_stores():
    stores = Store.query.all()
    return jsonify([s.serialize() for s in stores]), 200

@non_medical_bp.route('/stores', methods=['POST'])
@jwt_required()
@handle_errors
def create_store():
    data = request.json
    store = Store(
        name=data['name'],
        location=data['location'],
        store_manager=data.get('store_manager', ''),
        phone=data.get('phone', ''),
        status=data.get('status', 'Active'),
        employee_count=data.get('employee_count', 0)
    )
    db.session.add(store)
    db.session.commit()
    return jsonify(store.serialize()), 201

@non_medical_bp.route('/stores/<int:id>', methods=['PUT'])
@jwt_required()
@handle_errors
def update_store(id):
    store = Store.query.get_or_404(id)
    data = request.json
    for field in ['name', 'location', 'store_manager', 'phone', 'status', 'employee_count']:
        if field in data:
            setattr(store, field, data[field])
    db.session.commit()
    return jsonify(store.serialize()), 200

@non_medical_bp.route('/stores/<int:id>', methods=['DELETE'])
@jwt_required()
@handle_errors
def delete_store(id):
    store = Store.query.get_or_404(id)
    db.session.delete(store)
    db.session.commit()
    return jsonify({"message": "Store deleted"}), 200

# ── Suppliers ───────────────────────────────────────────────
@non_medical_bp.route('/suppliers', methods=['GET'])
@jwt_required()
@handle_errors
def get_all_suppliers():
    suppliers = Supplier.query.all()
    return jsonify([s.serialize() for s in suppliers]), 200

@non_medical_bp.route('/suppliers', methods=['POST'])
@jwt_required()
@handle_errors
def create_supplier():
    data = request.json
    supplier = Supplier(
        name=data['name'],
        company=data.get('company', ''),
        email=data['email'],
        phone=data.get('phone', ''),
        address=data.get('address', ''),
    )
    db.session.add(supplier)
    db.session.commit()
    return jsonify(supplier.serialize()), 201

@non_medical_bp.route('/suppliers/<int:id>', methods=['PUT'])
@jwt_required()
@handle_errors
def update_supplier(id):
    supplier = Supplier.query.get_or_404(id)
    data = request.json
    for field in ['name', 'company', 'email', 'phone', 'address']:
        if field in data:
            setattr(supplier, field, data[field])
    db.session.commit()
    return jsonify(supplier.serialize()), 200

@non_medical_bp.route('/suppliers/<int:id>', methods=['DELETE'])
@jwt_required()
@handle_errors
def delete_supplier(id):
    supplier = Supplier.query.get_or_404(id)
    db.session.delete(supplier)
    db.session.commit()
    return jsonify({"message": "Supplier deleted"}), 200
