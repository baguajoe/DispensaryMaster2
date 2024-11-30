from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, create_access_token
from datetime import datetime, timedelta
from api.models import db, User
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
    strain = fields.Str(allow_none=True)
    thc_content = fields.Float(allow_none=True)
    cbd_content = fields.Float(allow_none=True)
    current_stock = fields.Integer(required=True, validate=validate.Range(min=0))
    reorder_point = fields.Integer(required=True, validate=validate.Range(min=0))
    unit_price = fields.Decimal(required=True, validate=validate.Range(min=0))
    supplier = fields.Str(required=True)
    batch_number = fields.Str(required=True)
    test_results = fields.Str(allow_none=True)

class CustomerSchema(Schema):
    first_name = fields.Str(required=True)
    last_name = fields.Str(required=True)
    email = fields.Email(required=True)
    phone = fields.Str(required=True)
    membership_level = fields.Str(validate=validate.OneOf(['standard', 'premium', 'vip']))
    verification_status = fields.Str(validate=validate.OneOf(['pending', 'verified', 'rejected']))
    preferences = fields.Dict(allow_none=True)

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

@api.route('/auth/register', methods=['POST'])
# @handle_errors
def register():
    data = request.json
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Missing required fields"}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already exists"}), 400

    user = User(email=data['email'], password=generate_password_hash(data['password']))
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "User registered successfully", "user": user.serialize()}), 201

#get invoices

@api.route('/invoices/<int:id>/pdf', methods=['GET'])
@jwt_required()
def generate_invoice_pdf(id):
    invoice = Invoice.query.get_or_404(id)
    file_path = f"/tmp/invoice_{id}.pdf"
    c = canvas.Canvas(file_path)
    c.drawString(100, 750, f"Invoice #{invoice.id}")
    c.drawString(100, 730, f"Customer: {invoice.customer.first_name} {invoice.customer.last_name}")
    c.drawString(100, 710, f"Total Amount: ${float(invoice.total_amount):.2f}")
    c.save()
    return jsonify({"message": "PDF generated", "path": file_path}), 200

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

@api.route('/invoices', methods=['POST'])
@jwt_required()
def create_invoice():
    data = request.json
    order = Order.query.get_or_404(data['order_id'])
    customer = order.customer

    invoice = Invoice(
        customer_id=customer.id,
        order_id=order.id,
        due_date=data.get('due_date'),
        total_amount=order.total_amount
    )
    db.session.add(invoice)
    db.session.commit()
    return jsonify(invoice.serialize()), 201


# ---------------------
# Analytics Routes
# ---------------------
@api.route('/analytics/sales', methods=['GET'])
@jwt_required()
@handle_errors
def get_sales_analytics():
    start_date = request.args.get('start_date', (datetime.utcnow() - timedelta(days=30)).strftime('%Y-%m-%d'))
    end_date = request.args.get('end_date', datetime.utcnow().strftime('%Y-%m-%d'))
    orders = Order.query.filter(Order.created_at.between(start_date, end_date), Order.status == 'completed').all()

    total_sales = sum(float(order.total_amount) for order in orders)
    order_count = len(orders)
    sales_by_date = {}
    for order in orders:
        date = order.created_at.strftime('%Y-%m-%d')
        sales_by_date[date] = sales_by_date.get(date, 0) + float(order.total_amount)

    return jsonify({
        "total_sales": total_sales,
        "order_count": order_count,
        "average_order_value": total_sales / order_count if order_count > 0 else 0,
        "sales_by_date": sales_by_date
    }), 200

@api.route('/analytics/inventory', methods=['GET'])
@jwt_required()
@handle_errors
def get_inventory_analytics():
    low_stock_products = Product.query.filter(Product.current_stock <= Product.reorder_point).all()
    total_inventory_value = sum(float(p.unit_price) * p.current_stock for p in Product.query.all())

    return jsonify({
        "low_stock_count": len(low_stock_products),
        "low_stock_products": [product.serialize() for product in low_stock_products],
        "total_inventory_value": total_inventory_value
    }), 200

@api.route('/analytics/sales/predictions', methods=['GET'])
@jwt_required()
def get_sales_predictions():
    predictions = predict_sales_trends()
    if "error" in predictions:
        return jsonify(predictions), 400
    return jsonify(predictions), 200
    
@api.route('/analytics/kpis', methods=['GET'])
@jwt_required()
def get_kpi_metrics():
    try:
        total_revenue = db.session.query(db.func.sum(Order.total_amount)).scalar() or 0
        total_orders = db.session.query(db.func.count(Order.id)).scalar() or 0
        top_selling_products = (
            db.session.query(Product.name, db.func.sum(OrderItem.quantity).label('total_sold'))
            .join(OrderItem)
            .group_by(Product.id)
            .order_by(db.desc('total_sold'))
            .limit(3)
            .all()
        )

        return jsonify({
            "total_revenue": float(total_revenue),
            "total_orders": total_orders,
            "top_selling_products": [{"name": product[0], "total_sold": product[1]} for product in top_selling_products],
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------------
# Import Inventory Routes
# ---------------------
@api.route('/inventory/import', methods=['POST'])
@handle_errors
def import_inventory():
    """
    Import inventory from uploaded files (Excel or PDF).
    """
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    filename = file.filename

    if filename.endswith('.xlsx') or filename.endswith('.xls'):
        # Save the file temporarily and import
        file_path = f"/tmp/{filename}"
        file.save(file_path)
        result = import_inventory_from_excel(file_path)
        return jsonify(result), 200 if 'message' in result else 400

    elif filename.endswith('.pdf'):
        # Save the file temporarily and import
        file_path = f"/tmp/{filename}"
        file.save(file_path)
        result = import_inventory_from_pdf(file_path)
        return jsonify(result), 200 if 'message' in result else 400

    else:
        return jsonify({"error": "Unsupported file type"}), 400
