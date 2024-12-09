from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, create_access_token
from datetime import datetime, timedelta
from api.models import db, User, Product, Customer, Order, OrderItem, Invoice, Role
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from marshmallow import Schema, fields, validate, ValidationError
from reportlab.pdfgen import canvas
from flask_cors import CORS

# Create Blueprint
api = Blueprint('api', __name__)
CORS(api)

# ---------------------
# Error Handling Helper
# ---------------------
def handle_errors(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except ValidationError as e:
            return jsonify({"error": "Validation error", "details": e.messages}), 400
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return decorated_function

# ---------------------
# Validation Schemas
# ---------------------
class ProductSchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    category = fields.Str(required=True)
    current_stock = fields.Integer(required=True, validate=validate.Range(min=0))
    reorder_point = fields.Integer(required=True, validate=validate.Range(min=0))
    unit_price = fields.Decimal(required=True, validate=validate.Range(min=0))

class CustomerSchema(Schema):
    first_name = fields.Str(required=True)
    last_name = fields.Str(required=True)
    email = fields.Email(required=True)
    phone = fields.Str(required=True)

class OrderSchema(Schema):
    customer_id = fields.Integer(required=True)
    items = fields.List(fields.Dict(keys=fields.Str(), values=fields.Int()), required=True)

# ---------------------
# Authentication Routes
# ---------------------
@api.route('/auth/login', methods=['POST'])
@handle_errors
def login():
    data = request.json
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Missing email or password"}), 400

    user = User.query.filter_by(email=data['email']).first()
    if user and check_password_hash(user.password, data['password']):
        token = create_access_token(identity=user.id)
        return jsonify({"message": "Login successful", "access_token": token, "user": user.serialize()}), 200
    return jsonify({"error": "Invalid email or password"}), 401

@api.route("/signup",methods=["POST"])
def create_signup():
    email = request.json.get("email", None)
    password = request.json.get("password", None)
    role = request.json.get("role", None)
    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "User already exist"}), 400
    
    hashed_password=generate_password_hash(password)
    role_id = Role.query.filter_by(name=role).first()
    new_user=User(email=email, password=hashed_password, role_id=role_id, is_active=True)

    db.session.add(new_user)
    db.session.commit()
    return jsonify({"msg": "user created successfully"}), 201

@api.route("/role", methods=["GET"])
def get_role():
    roles=Role.query.all()
    return jsonify([role.serialize() for role in roles])
# ---------------------
# Product Routes
# ---------------------
@api.route('/products', methods=['GET'])
@jwt_required()
@handle_errors
def get_products():
    products = Product.query.all()
    return jsonify([product.serialize() for product in products]), 200

@api.route('/products/<int:id>', methods=['GET'])
@jwt_required()
@handle_errors
def get_product(id):
    product = Product.query.get_or_404(id)
    return jsonify(product.serialize()), 200

@api.route('/products', methods=['POST'])
@jwt_required()
@handle_errors
def create_product():
    schema = ProductSchema()
    data = schema.load(request.json)
    product = Product(**data)
    db.session.add(product)
    db.session.commit()
    return jsonify(product.serialize()), 201

@api.route('/products/<int:id>', methods=['PUT'])
@jwt_required()
@handle_errors
def update_product(id):
    schema = ProductSchema()
    product = Product.query.get_or_404(id)
    data = schema.load(request.json, partial=True)
    for key, value in data.items():
        setattr(product, key, value)
    db.session.commit()
    return jsonify(product.serialize()), 200

@api.route('/products/<int:id>', methods=['DELETE'])
@jwt_required()
@handle_errors
def delete_product(id):
    product = Product.query.get_or_404(id)
    db.session.delete(product)
    db.session.commit()
    return jsonify({"message": "Product deleted successfully"}), 200

# ---------------------
# Customer Routes
# ---------------------
@api.route('/customers', methods=['GET'])
@jwt_required()
@handle_errors
def get_customers():
    customers = Customer.query.all()
    return jsonify([customer.serialize() for customer in customers]), 200

@api.route('/customers/<int:id>', methods=['GET'])
@jwt_required()
@handle_errors
def get_customer(id):
    customer = Customer.query.get_or_404(id)
    return jsonify(customer.serialize()), 200

@api.route('/customers', methods=['POST'])
@jwt_required()
@handle_errors
def create_customer():
    schema = CustomerSchema()
    data = schema.load(request.json)
    if Customer.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already exists"}), 400
    customer = Customer(**data)
    db.session.add(customer)
    db.session.commit()
    return jsonify(customer.serialize()), 201

# ---------------------
# Order Routes
# ---------------------
@api.route('/orders', methods=['GET'])
@jwt_required()
@handle_errors
def get_orders():
    orders = Order.query.all()
    return jsonify([order.serialize() for order in orders]), 200

@api.route('/orders/<int:id>', methods=['GET'])
@jwt_required()
@handle_errors
def get_order(id):
    order = Order.query.get_or_404(id)
    return jsonify(order.serialize()), 200

@api.route('/orders', methods=['POST'])
@jwt_required()
@handle_errors
def create_order():
    schema = OrderSchema()
    data = schema.load(request.json)
    order = Order(customer_id=data['customer_id'], total_amount=0)
    db.session.add(order)
    db.session.flush()  # Get order ID before committing

    total_amount = 0
    for item in data['items']:
        product = Product.query.get_or_404(item['product_id'])
        total_price = product.unit_price * item['quantity']
        order_item = OrderItem(order_id=order.id, product_id=product.id, quantity=item['quantity'], unit_price=total_price)
        db.session.add(order_item)
        total_amount += total_price

    order.total_amount = total_amount
    db.session.commit()
    return jsonify(order.serialize()), 201

# ---------------------
# Analytics Routes
# ---------------------
@api.route('/analytics', methods=['GET'])
@jwt_required()
@handle_errors
def get_analytics():
    analytics_type = request.args.get('type', 'sales')

    if analytics_type == 'sales':
        orders = Order.query.filter(Order.status == 'completed').all()
        total_sales = sum(float(order.total_amount) for order in orders)
        order_count = len(orders)
        return jsonify({"total_sales": total_sales, "order_count": order_count}), 200

    elif analytics_type == 'inventory':
        low_stock_products = Product.query.filter(Product.current_stock <= Product.reorder_point).all()
        return jsonify({"low_stock_count": len(low_stock_products), "low_stock_products": [p.serialize() for p in low_stock_products]}), 200

    else:
        return jsonify({"error": "Invalid analytics type"}), 400
        
# @api.route('/dashboard/metrics', methods=['GET'])
# @jwt_required()
# @handle_errors
# def get_analytics():
#     analytics_type = request.args.get('type', 'sales')

#     if analytics_type == 'sales':
#         orders = Order.query.filter(Order.status == 'completed').all()
#         total_sales = sum(float(order.total_amount) for order in orders)
#         order_count = len(orders)
#         return jsonify({"total_sales": total_sales, "order_count": order_count}), 200

#     elif analytics_type == 'inventory':
#         low_stock_products = Product.query.filter(Product.current_stock <= Product.reorder_point).all()
#         return jsonify({"low_stock_count": len(low_stock_products), "low_stock_products": [p.serialize() for p in low_stock_products]}), 200

#     else:
#         return jsonify({"error": "Invalid analytics type"}), 400
