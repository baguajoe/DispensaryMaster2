# from flask import Blueprint, request, jsonify
# from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity
# from datetime import datetime, timedelta
# from api.models import db, User, Product, Customer, Order, OrderItem, Invoice, Business, Patient, Store 
# from werkzeug.security import generate_password_hash, check_password_hash
# from functools import wraps
# from marshmallow import Schema, fields, validate, ValidationError
# from reportlab.pdfgen import canvas
# from flask_cors import CORS
# from sqlalchemy import func
# # from api.utils import role_required, APIException, generate_sitemap


# # Create Blueprint
# api = Blueprint('api', __name__)
# CORS(api, resources={r"/api/*": {"origins": "https://shiny-broccoli-q79pvgr4wqp72qx9-3000.app.github.dev"}})

# # ---------------------
# # Error Handling Helper
# # ---------------------
# def handle_errors(f):
#     @wraps(f)
#     def decorated_function(*args, **kwargs):
#         try:
#             return f(*args, **kwargs)
#         except ValidationError as e:
#             return jsonify({"error": "Validation error", "details": e.messages}), 400
#         except Exception as e:
#             return jsonify({"error": str(e)}), 500
#     return decorated_function

# # ---------------------
# # Validation Schemas
# # ---------------------
# class ProductSchema(Schema):
#     name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
#     category = fields.Str(required=True)
#     current_stock = fields.Integer(required=True, validate=validate.Range(min=0))
#     reorder_point = fields.Integer(required=True, validate=validate.Range(min=0))
#     unit_price = fields.Decimal(required=True, validate=validate.Range(min=0))

# class CustomerSchema(Schema):
#     first_name = fields.Str(required=True)
#     last_name = fields.Str(required=True)
#     email = fields.Email(required=True)
#     phone = fields.Str(required=True)

# class OrderSchema(Schema):
#     customer_id = fields.Integer(required=True)
#     items = fields.List(fields.Dict(keys=fields.Str(), values=fields.Int()), required=True)

# class StoreSchema(Schema):
#     name = fields.Str(required=True, validate=validate.Length(min=1, max=200))
#     location = fields.Str(required=True)
#     store_manager = fields.Str(required=True)
#     phone = fields.Str(required=True, validate=validate.Length(min=10, max=15))
#     status = fields.Str(required=True)
#     employee_count = fields.Int(required=True, validate=validate.Range(min=0))


# # ---------------------
# # Authentication Routes
# # ---------------------
# @api.route('/login', methods=['POST'])
# @handle_errors
# def login():
#     data = request.json
#     if not data or not data.get('email') or not data.get('password'):
#         return jsonify({"error": "Missing email or password"}), 400

#     user = User.query.filter_by(email=data['email']).first()
#     if user and check_password_hash(user.password, data['password']):
#         token = create_access_token(identity=str(user.id))
#         return jsonify({"message": "Login successful", "access_token": token, "user": user.serialize()}), 200
#     return jsonify({"error": "Invalid email or password"}), 401

# @api.route("/signup", methods=["POST"])
# def create_signup():
#     try:
#         # Extract email, password, and role from the request
#         email = request.json.get("email")
#         password = request.json.get("password")
#         role_name = request.json.get("role", "customer")  # Default role is "user" if not provided

#         if not email or not password:
#             return jsonify({"error": "Email and password are required"}), 400

#         # Check if user already exists
#         if User.query.filter_by(email=email).first():
#             return jsonify({"error": "User already exists"}), 400

#         # Fetch the role from the database
#         # role = Role.query.filter_by(name=role_name).first()
#         # if not role:
#         #     return jsonify({"error": "Invalid role"}), 400

#         # Create a new user
#         hashed_password = generate_password_hash(password)
#         new_user = User(email=email, password=hashed_password, role=role_name, is_active=False)

#         db.session.add(new_user)
#         db.session.commit()

#         return jsonify({"message": "User created successfully", "user": new_user.serialize()}), 201
#     except Exception as e:
#         api.logger.error(f"Signup error: {str(e)}")
#         return jsonify({"error": "Internal Server Error"}), 500
    
# # @api.route('/admin-only', methods=['GET'])
# # @jwt_required()
# # @role_required("admin")
# # def admin_only():
# #     return jsonify({"message": "Welcome, admin!"}), 200



# # @api.route("/roles", methods=["GET"])
# # def get_roles():
# #     roles = Role.query.all()
# #     return jsonify([role.serialize() for role in roles]), 200


# # @api.route('/roles/seed', methods=['POST'])
# # def seed_roles():
# #     roles = [
# #         {"id": 1, "name": "admin", "description": "Full access to the system."},
# #         {"id": 2, "name": "user", "description": "Standard user with basic access."},
# #         {"id": 3, "name": "manager", "description": "Elevated privileges to manage specific features."},
# #         {"id": 4, "name": "guest", "description": "Limited access for viewing information."},
# #     ]
    
# #     for role_data in roles:
# #         if not Role.query.filter_by(id=role_data["id"]).first():
# #             role = Role(**role_data)
# #             db.session.add(role)

# #     db.session.commit()
# #     return jsonify({"message": "Roles seeded successfully"}), 201

# # @api.route("/admin-only", methods=["GET"])
# # @jwt_required()
# # def admin_only():
# #     try:
# #         user_id = get_jwt_identity()
# #         user = User.query.get(user_id)

# #         if not user or user.role.name != "admin":
# #             return jsonify({"error": "Access denied"}), 403

# #         return jsonify({"message": "Welcome, admin!"}), 200
# #     except Exception as e:
# #         api.logger.error(f"Admin-only access error: {str(e)}")
# #         return jsonify({"error": "Internal Server Error"}), 500

# # @api.route("/users/<int:user_id>/role", methods=["PUT"])
# # @jwt_required()
# # def update_user_role(user_id):
# #     try:
# #         new_role_name = request.json.get("role")
# #         if not new_role_name:
# #             return jsonify({"error": "Role name is required"}), 400

# #         user = User.query.get_or_404(user_id)
# #         new_role = Role.query.filter_by(name=new_role_name).first()

# #         if not new_role:
# #             return jsonify({"error": "Invalid role"}), 400

# #         user.role_id = new_role.id
# #         db.session.commit()

# #         return jsonify({"message": "User role updated successfully", "user": user.serialize()}), 200
# #     except Exception as e:
# #         api.logger.error(f"Role update error: {str(e)}")
# #         return jsonify({"error": "Internal Server Error"}), 500



# # ---------------------
# # Product Routes
# # ---------------------
# # @api.route('/products', methods=['GET'])
# # @jwt_required()
# # @handle_errors
# # def get_products():
# #     products = Product.query.all()
# #     return jsonify([product.serialize() for product in products]), 200

# @api.route('/products', methods=['GET'])
# @jwt_required()
# def get_products():
#     page = request.args.get('page', 1, type=int)
#     per_page = request.args.get('per_page', 10, type=int)

#     products = Product.query.paginate(page, per_page, False)
#     return jsonify({
#         "products": [product.serialize() for product in products.items],
#         "total": products.total,
#         "pages": products.pages,
#         "current_page": products.page
#     }), 200


# # @api.route('/products/<int:id>', methods=['GET'])
# # @jwt_required()
# # @handle_errors
# # def get_product(id):
# #     product = Product.query.get_or_404(id)
# #     return jsonify(product.serialize()), 200

# @api.route('/products', methods=['POST'])
# @jwt_required()
# @handle_errors
# def create_product():
#     schema = ProductSchema()
#     data = schema.load(request.json)
#     product = Product(**data)
#     db.session.add(product)
#     db.session.commit()
#     return jsonify(product.serialize()), 201

# @api.route('/products/<int:id>', methods=['PUT'])
# @jwt_required()
# @handle_errors
# def update_product(id):
#     schema = ProductSchema()
#     product = Product.query.get_or_404(id)
#     data = schema.load(request.json, partial=True)
#     for key, value in data.items():
#         setattr(product, key, value)
#     db.session.commit()
#     return jsonify(product.serialize()), 200

# @api.route('/products/<int:id>', methods=['DELETE'])
# @jwt_required()
# @handle_errors
# def delete_product(id):
#     product = Product.query.get_or_404(id)
#     db.session.delete(product)
#     db.session.commit()
#     return jsonify({"message": "Product deleted successfully"}), 200

# # ---------------------
# # Customer Routes
# # ---------------------
# @api.route('/customers', methods=['GET'])
# @jwt_required()
# @handle_errors
# def get_customers():
#     customers = Customer.query.all()
#     return jsonify([customer.serialize() for customer in customers]), 200

# @api.route('/customers/<int:id>', methods=['GET'])
# @jwt_required()
# @handle_errors
# def get_customer(id):
#     customer = Customer.query.get_or_404(id)
#     return jsonify(customer.serialize()), 200

# @api.route('/customers', methods=['POST'])
# @jwt_required()
# @handle_errors
# def create_customer():
#     schema = CustomerSchema()
#     data = schema.load(request.json)
#     if Customer.query.filter_by(email=data['email']).first():
#         return jsonify({"error": "Email already exists"}), 400
#     customer = Customer(**data)
#     db.session.add(customer)
#     db.session.commit()
#     return jsonify(customer.serialize()), 201

# @api.route('/patients', methods=['POST'])
# def add_patient():
#     data = request.json
#     new_patient = Patient(**data)
#     db.session.add(new_patient)
#     db.session.commit()
#     return jsonify(new_patient.serialize()), 201

# @api.route('/patients/<int:id>', methods=['GET'])
# def get_patient(id):
#     patient = Patient.query.get_or_404(id)
#     return jsonify(patient.serialize()), 200

# @api.route('/prescriptions', methods=['POST'])
# def create_prescription():
#     data = request.json
#     new_prescription = Prescription(**data)
#     db.session.add(new_prescription)
#     db.session.commit()
#     return jsonify(new_prescription.serialize()), 201


# # ---------------------
# # Order Routes
# # ---------------------
# @api.route('/orders', methods=['GET'])
# @jwt_required()
# @handle_errors
# def get_orders():
#     orders = Order.query.all()
#     return jsonify([order.serialize() for order in orders]), 200

# @api.route('/orders/<int:id>', methods=['GET'])
# @jwt_required()
# @handle_errors
# def get_order(id):
#     order = Order.query.get_or_404(id)
#     return jsonify(order.serialize()), 200

# @api.route('/orders', methods=['POST'])
# @jwt_required()
# @handle_errors
# def create_order():
#     schema = OrderSchema()
#     data = schema.load(request.json)
#     order = Order(customer_id=data['customer_id'], total_amount=0)
#     db.session.add(order)
#     db.session.flush()  # Get order ID before committing

#     total_amount = 0
#     for item in data['items']:
#         product = Product.query.get_or_404(item['product_id'])
#         total_price = product.unit_price * item['quantity']
#         order_item = OrderItem(order_id=order.id, product_id=product.id, quantity=item['quantity'], unit_price=total_price)
#         db.session.add(order_item)
#         total_amount += total_price

#     order.total_amount = total_amount
#     db.session.commit()
#     return jsonify(order.serialize()), 201

# @api.route('/purchase', methods=['POST'])
# def process_purchase():
#     data = request.json
#     patient = Patient.query.get(data['patient_id'])
#     if patient.expiration_date < datetime.utcnow():
#         return jsonify({"error": "Medical card expired"}), 400
#     # Continue with purchase processing...

# @api.route('/compliance/reports', methods=['GET'])
# def generate_compliance_report():
#     transactions = Transaction.query.all()
#     report = [{
#         "id": t.id,
#         "order_id": t.order_id,
#         "amount": t.amount,
#         "date": t.date.isoformat()
#     } for t in transactions]
#     return jsonify(report), 200

# # @api.route('/recommendations', methods=['POST'])
# # def recommend_products():
# #     symptoms = request.json.get('symptoms', [])
# #     products = Product.query.filter(Product.medical_benefits.ilike(f"%{symptoms}%")).all()
# #     return jsonify([p.serialize() for p in products]), 200

# @api.route('/recommendations', methods=['POST'])
# def recommend_products():
#     symptoms = request.json.get('symptoms', [])
#     query = Product.query.filter(
#         db.or_(*[Product.medical_benefits.ilike(f"%{symptom}%") for symptom in symptoms])
#     )
#     products = query.all()
#     return jsonify([p.serialize() for p in products]), 200

# @api.route('/education', methods=['GET'])
# def get_education():
#     resources = Education.query.all()
#     return jsonify([r.serialize() for r in resources]), 200




# # ---------------------
# # Analytics Routes
# # ---------------------
# # @api.route('/analytics', methods=['GET'])
# # @jwt_required()
# # @handle_errors
# # def get_analytics():
# #     analytics_type = request.args.get('type', 'sales')

# #     if analytics_type == 'sales':
# #         orders = Order.query.filter(Order.status == 'completed').all()
# #         total_sales = sum(float(order.total_amount) for order in orders)
# #         order_count = len(orders)
# #         return jsonify({"total_sales": total_sales, "order_count": order_count}), 200
    


# #     elif analytics_type == 'inventory':
# #         low_stock_products = Product.query.filter(Product.current_stock <= Product.reorder_point).all()
# #         return jsonify({"low_stock_count": len(low_stock_products), "low_stock_products": [p.serialize() for p in low_stock_products]}), 200

# #     else:
# #         return jsonify({"error": "Invalid analytics type"}), 400
    
# # @api.route('/analytics/medical', methods=['GET'])
# # def get_medical_analytics():
# #     total_patients = Patient.query.count()
# #     total_prescriptions = Prescription.query.count()
# #     most_common_conditions = db.session.query(Patient.conditions, db.func.count(Patient.conditions)).group_by(Patient.conditions).all()

# #     return jsonify({
# #         "total_patients": total_patients,
# #         "total_prescriptions": total_prescriptions,
# #         "most_common_conditions": most_common_conditions,
# #     }), 200

# @api.route('/analytics', methods=['GET'])
# @jwt_required()
# def get_analytics():
#     analytics_type = request.args.get('type', 'sales')

#     if analytics_type == 'sales':
#         # Total sales and order count
#         orders = Order.query.filter(Order.status == 'completed').all()
#         total_sales = sum(float(order.total_amount) for order in orders)
#         order_count = len(orders)
#         return jsonify({"total_sales": total_sales, "order_count": order_count}), 200

#     elif analytics_type == 'inventory':
#         # Low-stock inventory details
#         low_stock_products = Product.query.filter(Product.current_stock <= Product.reorder_point).all()
#         total_inventory_value = db.session.query(
#             db.func.sum(Product.unit_price * Product.current_stock)
#         ).scalar() or 0
#         return jsonify({
#             "low_stock_count": len(low_stock_products),
#             "low_stock_products": [p.serialize() for p in low_stock_products],
#             "total_inventory_value": float(total_inventory_value)
#         }), 200

#     elif analytics_type == 'sales-funnel':
#         # Sales funnel data
#         funnel_data = {
#             "leads": Lead.query.count(),
#             "qualified_leads": Lead.query.filter_by(status="qualified").count(),
#             "proposals": Order.query.filter_by(status="pending").count(),
#             "closed_won": Order.query.filter_by(status="completed").count()
#         }
#         return jsonify(funnel_data), 200

#     elif analytics_type == 'top-categories':
#         # Top categories data
#         top_categories = (
#             db.session.query(
#                 Product.category,
#                 db.func.count(Product.id).label("sales"),
#                 db.func.sum(Product.unit_price * Product.current_stock).label("revenue")
#             )
#             .group_by(Product.category)
#             .order_by(db.desc("revenue"))
#             .limit(5)
#             .all()
#         )
#         data = [{"category": c[0], "sales": c[1], "revenue": float(c[2])} for c in top_categories]
#         return jsonify(data), 200

#     elif analytics_type == 'sales-performance':
#         # Sales performance over time
#         performance_data = (
#             db.session.query(
#                 func.date(Order.created_at).label("date"),
#                 func.sum(Order.total_amount).label("total_sales")
#             )
#             .filter(Order.status == 'completed')
#             .group_by(func.date(Order.created_at))
#             .order_by(func.date(Order.created_at))
#             .all()
#         )
#         data = {
#             "labels": [str(row.date) for row in performance_data],
#             "datasets": [{
#                 "label": "Total Sales",
#                 "data": [float(row.total_sales) for row in performance_data],
#                 "borderColor": "#4CAF50",
#                 "fill": False,
#             }]
#         }
#         return jsonify(data), 200

#     elif analytics_type == 'forecasting':
#         # Predictive sales analytics (mocked data for now)
#         forecast_data = {
#             "labels": ["2024-12-19", "2024-12-20", "2024-12-21"],
#             "datasets": [{
#                 "label": "Predicted Sales",
#                 "data": [1500.0, 1600.0, 1700.0],
#                 "borderColor": "#FF5733",
#                 "fill": False,
#             }]
#         }
#         return jsonify(forecast_data), 200

#     else:
#         return jsonify({"error": "Invalid analytics type"}), 400

# @api.route('/analytics/medical', methods=['GET'])
# def get_medical_analytics():
#     total_patients = Patient.query.count()
#     total_prescriptions = Prescription.query.count()
#     most_common_conditions = (
#         db.session.query(Patient.conditions, func.count(Patient.conditions).label("count"))
#         .group_by(Patient.conditions)
#         .order_by(func.count(Patient.conditions).desc())
#         .all()
#     )
#     condition_data = [{"condition": cond[0], "count": cond[1]} for cond in most_common_conditions]
#     return jsonify({
#         "total_patients": total_patients,
#         "total_prescriptions": total_prescriptions,
#         "most_common_conditions": condition_data,
#     }), 200


        
# # @api.route('/dashboard/metrics', methods=['GET'])
# # @jwt_required()
# # # @handle_errors
# # def get_dashboard_metrics():
# #     try:
# #         # Fetching data for metrics
# #         orders = Order.query.filter(Order.status == 'completed').all()
# #         total_sales = sum(float(order.total_amount) for order in orders)
# #         order_count = len(orders)
# #         average_purchase_order = total_sales / order_count if order_count > 0 else 0
        
# #         new_products_count = Product.query.filter(Product.created_at >= datetime.now().replace(day=1)).count()  # New products added this month
        
# #         users_count = User.query.count()
        
# #         refunds = Order.query.filter(Order.status == 'refunded').all()
# #         total_refunds = sum(float(order.total_amount) for order in refunds)
        
# #         product_availability = (Product.query.filter(Product.current_stock > 0).count() / Product.query.count()) * 100 if Product.query.count() > 0 else 0
        
# #         low_stock_products = Product.query.filter(Product.current_stock <= Product.reorder_point).count()
        
# #         invoices_count = Invoice.query.count()
# #         todays_invoices = Invoice.query.filter(db.func.date(Invoice.issue_date) == datetime.today().date()).count()
        
# #         current_month_sales = sum(float(order.total_amount) for order in orders if order.created_at.month == datetime.now().month)
        
# #         total_inventory = Product.query.count()
        
# #         stores_count = Business.query.count()
        
# #         # Mock data for top categories and sales performance
# #         top_categories = "Electronics, Clothing"  # Placeholder
# #         sales_performance = "Trending Up"  # Placeholder trend

# #         # Returning all metrics
# #         metrics = [
# #             {"title": "Total Sales", "value": f"${total_sales:,.2f}", "icon": "💰", "trend": 8, "bgColor": "bg-green-100", "textColor": "text-green-900"},
# #             {"title": "New Products", "value": str(new_products_count), "icon": "📦", "trend": 5, "bgColor": "bg-blue-100", "textColor": "text-blue-900"},
# #             {"title": "Average Purchase Order", "value": f"${average_purchase_order:,.2f}", "icon": "🛒", "trend": 2, "bgColor": "bg-yellow-100", "textColor": "text-yellow-900"},
# #             {"title": "Users", "value": f"{users_count:,}", "icon": "👤", "trend": 15, "bgColor": "bg-purple-100", "textColor": "text-purple-900"},
# #             {"title": "Refunds", "value": f"${total_refunds:,.2f}", "icon": "💸", "trend": -3, "bgColor": "bg-red-100", "textColor": "text-red-900"},
# #             {"title": "Product Availability", "value": f"{product_availability:.0f}%", "icon": "📊", "trend": 1, "bgColor": "bg-teal-100", "textColor": "text-teal-900"},
# #             {"title": "Supply Below Safety Stock", "value": str(low_stock_products), "icon": "📉", "trend": -2, "bgColor": "bg-gray-100", "textColor": "text-gray-900"},
# #             {"title": "Invoices", "value": str(invoices_count), "icon": "🧾", "trend": 7, "bgColor": "bg-indigo-100", "textColor": "text-indigo-900"},
# #             {"title": "Today's Invoice", "value": str(todays_invoices), "icon": "📆", "trend": 3, "bgColor": "bg-orange-100", "textColor": "text-orange-900"},
# #             {"title": "Current Monthly", "value": f"${current_month_sales:,.2f}", "icon": "📅", "trend": 10, "bgColor": "bg-green-100", "textColor": "text-green-900"},
# #             {"title": "Inventory", "value": str(total_inventory), "icon": "📦", "trend": 4, "bgColor": "bg-blue-100", "textColor": "text-blue-900"},
# #             {"title": "Stores", "value": str(stores_count), "icon": "🏬", "trend": 0, "bgColor": "bg-yellow-100", "textColor": "text-yellow-900"},
# #             {"title": "Top Categories", "value": top_categories, "icon": "📂", "trend": 6, "bgColor": "bg-purple-100", "textColor": "text-purple-900"},
# #             {"title": "Sales Performance", "value": sales_performance, "icon": "📈", "trend": 12, "bgColor": "bg-teal-100", "textColor": "text-teal-900"}
# #         ]
        
# #         return jsonify(metrics), 200

# #     except Exception as e:
# #         return jsonify({"error": str(e)}), 500

# @api.route('/dashboard/metrics', methods=['GET'])
# @jwt_required()
# def get_dashboard_metrics():
#     try:
#         orders = Order.query.filter(Order.status == 'completed').all()
#         total_sales = sum(float(order.total_amount) for order in orders)
#         order_count = len(orders)
#         average_purchase_order = total_sales / order_count if order_count > 0 else 0

#         new_products_count = Product.query.filter(Product.created_at >= datetime.now().replace(day=1)).count()
#         users_count = User.query.count()
#         refunds = Order.query.filter(Order.status == 'refunded').all()
#         total_refunds = sum(float(order.total_amount) for order in refunds)
#         product_availability = (Product.query.filter(Product.current_stock > 0).count() / Product.query.count()) * 100 if Product.query.count() > 0 else 0
#         low_stock_products = Product.query.filter(Product.current_stock <= Product.reorder_point).count()
#         invoices_count = Invoice.query.count()
#         todays_invoices = Invoice.query.filter(db.func.date(Invoice.issue_date) == datetime.today().date()).count()
#         current_month_sales = sum(float(order.total_amount) for order in orders if order.created_at.month == datetime.now().month)
#         total_inventory = Product.query.count()
#         stores_count = Business.query.count()

#         # Dynamic top_categories
#         top_categories = (
#             db.session.query(
#                 Product.category,
#                 func.count(OrderItem.id).label("sales"),
#                 func.sum(OrderItem.unit_price).label("revenue")
#             )
#             .join(OrderItem, Product.id == OrderItem.product_id)
#             .group_by(Product.category)
#             .order_by(func.sum(OrderItem.unit_price).desc())
#             .limit(5)
#             .all()
#         )
#         top_categories_data = [{"category": c[0], "sales": c[1], "revenue": float(c[2])} for c in top_categories]

#         metrics = [
#             {"title": "Total Sales", "value": f"${total_sales:,.2f}", "icon": "💰", "trend": 8, "bgColor": "bg-green-100", "textColor": "text-green-900"},
#             {"title": "New Products", "value": str(new_products_count), "icon": "📦", "trend": 5, "bgColor": "bg-blue-100", "textColor": "text-blue-900"},
#             {"title": "Average Purchase Order", "value": f"${average_purchase_order:,.2f}", "icon": "🛒", "trend": 2, "bgColor": "bg-yellow-100", "textColor": "text-yellow-900"},
#             {"title": "Users", "value": f"{users_count:,}", "icon": "👤", "trend": 15, "bgColor": "bg-purple-100", "textColor": "text-purple-900"},
#             {"title": "Refunds", "value": f"${total_refunds:,.2f}", "icon": "💸", "trend": -3, "bgColor": "bg-red-100", "textColor": "text-red-900"},
#             {"title": "Product Availability", "value": f"{product_availability:.0f}%", "icon": "📊", "trend": 1, "bgColor": "bg-teal-100", "textColor": "text-teal-900"},
#             {"title": "Supply Below Safety Stock", "value": str(low_stock_products), "icon": "📉", "trend": -2, "bgColor": "bg-gray-100", "textColor": "text-gray-900"},
#             {"title": "Invoices", "value": str(invoices_count), "icon": "🧾", "trend": 7, "bgColor": "bg-indigo-100", "textColor": "text-indigo-900"},
#             {"title": "Today's Invoice", "value": str(todays_invoices), "icon": "📆", "trend": 3, "bgColor": "bg-orange-100", "textColor": "text-orange-900"},
#             {"title": "Current Monthly", "value": f"${current_month_sales:,.2f}", "icon": "📅", "trend": 10, "bgColor": "bg-green-100", "textColor": "text-green-900"},
#             {"title": "Inventory", "value": str(total_inventory), "icon": "📦", "trend": 4, "bgColor": "bg-blue-100", "textColor": "text-blue-900"},
#             {"title": "Stores", "value": str(stores_count), "icon": "🏬", "trend": 0, "bgColor": "bg-yellow-100", "textColor": "text-yellow-900"},
#             {"title": "Top Categories", "value": top_categories_data, "icon": "📂", "trend": 6, "bgColor": "bg-purple-100", "textColor": "text-purple-900"},
#         ]
#         return jsonify(metrics), 200
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

    
# # GET Route - Fetch All Stores or a Single Store by ID
# @api.route('/store', methods=['GET'])
# @api.route('/store/<int:store_id>', methods=['GET'])
# @jwt_required()
# def get_store(store_id=None):
#     try:
#         user_id = int(get_jwt_identity())
        
#         # If store_id is provided, fetch a single store
#         if store_id:
#             store = Store.query.filter_by(id=store_id, user_id=user_id).first()
#             if not store:
#                 return jsonify({"error": "Store not found"}), 404
#             return jsonify(store), 200

#         # If no store_id, fetch all stores for the user
#         stores = Store.query.filter_by(user_id=user_id).all()
#         return jsonify([store.serialize() for store in stores]), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# # PUT Route - Update a Store by ID
# @api.route('/store/<int:store_id>', methods=['PUT'])
# @jwt_required()
# def update_store(store_id):
#     try:
#         user_id = int(get_jwt_identity())
#         request_body = request.json

#         # Find the store to update
#         store = Store.query.filter_by(id=store_id, user_id=user_id).first()
#         if not store:
#             return jsonify({"error": "Store not found or unauthorized"}), 404
        
#         # Update fields if provided
#         store.name = request_body.get("name", store.name)
#         store.location = request_body.get("location", store.location)
#         store.store_manager = request_body.get("store_manager", store.store_manager)
#         store.phone = request_body.get("phone", store.phone)
#         store.status = request_body.get("status", store.status)
#         store.employee_count = request_body.get("employee_count", store.employee_count)

#         db.session.commit()
#         return jsonify(store.serialize()), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# @api.route('/store', methods=['POST'])
# @jwt_required()
# def create_store():
#     try:
#         user_id=int(get_jwt_identity())
#         request_body=request.json
#         name=request_body.get("name")
#         location=request_body.get("location")
#         store_manager=request_body.get("store_manager")
#         phone=request_body.get("phone")
#         status=request_body.get("status")
#         employee_count=request_body.get("employee_count")

#         new_store=Store(user_id=user_id, name=name, location=location, store_manager=store_manager, phone=phone, status=status, employee_count=employee_count)

#         db.session.add(new_store)
#         db.session.commit()
#         return jsonify(new_store.serialize()), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500
    
# # @api.route('/store/<int:store_id>', methods=['DELETE'])
# # @jwt_required()
# # def delete_store(store_id):
# #     try:
# #         user_id = int(get_jwt_identity())
# #         store = Store.query.filter_by(id=store_id, user_id=user_id).first()

# #         if not store:
# #             return jsonify({"error": "Store not found"}), 404

# #         db.session.delete(store)
# #         db.session.commit()
# #         return jsonify({"message": "Store deleted successfully"}), 200
# #     except Exception as e:
# #         return jsonify({"error": str(e)}), 500

# @api.route('/store/<int:store_id>', methods=['DELETE'])
# @jwt_required()
# def delete_store(store_id):
#     try:
#         # Get the ID of the currently authenticated user
#         user_id = get_jwt_identity()

#         # Find the store associated with the user and the provided store_id
#         store = Store.query.filter_by(id=store_id, user_id=user_id).first()

#         if not store:
#             return jsonify({"error": "Store not found or access denied"}), 404

#         # Delete the store from the database
#         db.session.delete(store)
#         db.session.commit()

#         return jsonify({"message": f"Store '{store.name}' deleted successfully"}), 200

#     except Exception as e:
#         # Log the exception for debugging (optional)
#         print(f"Error deleting store: {e}")

#         # Return a generic error response
#         return jsonify({"error": "An unexpected error occurred while deleting the store"}), 500
    
# @api.route('/leads', methods=['GET'])
# @jwt_required()
# @handle_errors
# def get_leads():
#     leads = Lead.query.all()
#     return jsonify([lead.serialize() for lead in leads]), 200

# @api.route('/leads', methods=['POST'])
# @jwt_required()
# @handle_errors
# def create_lead():
#     data = request.json
#     lead = Lead(
#         first_name=data['first_name'],
#         last_name=data['last_name'],
#         email=data['email'],
#         phone=data.get('phone'),
#         status=data.get('status', 'new'),
#         notes=data.get('notes')
#     )
#     db.session.add(lead)
#     db.session.commit()
#     return jsonify(lead.serialize()), 201

# @api.route('/leads/<int:id>', methods=['PUT'])
# @jwt_required()
# @handle_errors
# def update_lead(id):
#     lead = Lead.query.get_or_404(id)
#     data = request.json
#     for key, value in data.items():
#         setattr(lead, key, value)
#     db.session.commit()
#     return jsonify(lead.serialize()), 200

# @api.route('/leads/<int:id>', methods=['DELETE'])
# @jwt_required()
# @handle_errors
# def delete_lead(id):
#     lead = Lead.query.get_or_404(id)
#     db.session.delete(lead)
#     db.session.commit()
#     return jsonify({"message": "Lead deleted successfully"}), 200

# @api.route('/campaigns', methods=['GET'])
# @jwt_required()
# @handle_errors
# def get_campaigns():
#     campaigns = Campaign.query.all()
#     return jsonify([campaign.serialize() for campaign in campaigns]), 200

# @api.route('/campaigns', methods=['POST'])
# @jwt_required()
# @handle_errors
# def create_campaign():
#     data = request.json
#     campaign = Campaign(
#         name=data['name'],
#         description=data.get('description'),
#         start_date=datetime.strptime(data['start_date'], '%Y-%m-%d'),
#         end_date=datetime.strptime(data['end_date'], '%Y-%m-%d') if data.get('end_date') else None,
#         status=data.get('status', 'draft'),
#     )
#     db.session.add(campaign)
#     db.session.commit()
#     return jsonify(campaign.serialize()), 201

# @api.route('/campaigns/<int:id>', methods=['PUT'])
# @jwt_required()
# @handle_errors
# def update_campaign(id):
#     campaign = Campaign.query.get_or_404(id)
#     data = request.json
#     for key, value in data.items():
#         setattr(campaign, key, value)
#     db.session.commit()
#     return jsonify(campaign.serialize()), 200

# @api.route('/campaigns/<int:id>', methods=['DELETE'])
# @jwt_required()
# @handle_errors
# def delete_campaign(id):
#     campaign = Campaign.query.get_or_404(id)
#     db.session.delete(campaign)
#     db.session.commit()
#     return jsonify({"message": "Campaign deleted successfully"}), 200

# @api.route('/tasks', methods=['GET'])
# @jwt_required()
# @handle_errors
# def get_tasks():
#     tasks = Task.query.all()
#     return jsonify([task.serialize() for task in tasks]), 200

# @api.route('/tasks', methods=['POST'])
# @jwt_required()
# @handle_errors
# def create_task():
#     data = request.json
#     task = Task(
#         name=data['name'],
#         description=data.get('description'),
#         assigned_to=data['assigned_to'],
#         due_date=datetime.strptime(data['due_date'], '%Y-%m-%d') if data.get('due_date') else None,
#         status=data.get('status', 'pending')
#     )
#     db.session.add(task)
#     db.session.commit()
#     return jsonify(task.serialize()), 201

# @api.route('/tasks/<int:id>', methods=['PUT'])
# @jwt_required()
# @handle_errors
# def update_task(id):
#     task = Task.query.get_or_404(id)
#     data = request.json
#     for key, value in data.items():
#         setattr(task, key, value)
#     db.session.commit()
#     return jsonify(task.serialize()), 200

# @api.route('/tasks/<int:id>', methods=['DELETE'])
# @jwt_required()
# @handle_errors
# def delete_task(id):
#     task = Task.query.get_or_404(id)
#     db.session.delete(task)
#     db.session.commit()
#     return jsonify({"message": "Task deleted successfully"}), 200

# # deals

# @api.route('/deals', methods=['GET'])
# def get_deals():
#     deals = Deal.query.all()
#     grouped_deals = {}
#     for deal in deals:
#         grouped_deals.setdefault(deal.stage, []).append(deal.serialize())
#     return jsonify(grouped_deals), 200

# @api.route('/deals/<int:deal_id>', methods=['PUT'])
# def update_deal_stage(deal_id):
#     deal = Deal.query.get_or_404(deal_id)
#     new_stage = request.json.get('stage')
#     deal.stage = new_stage
#     db.session.commit()
#     return jsonify(deal.serialize()), 200






