from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from datetime import datetime, timedelta
from api.models import db, User
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from marshmallow import Schema, fields, validate, ValidationError
from reportlab.pdfgen import canvas
# from sklearn.ensemble import IsolationForest
# from fbprophet import Prophet
from PIL import Image
# import pandas as pd
# import numpy as np
# # import torch
# import stripe



# Create Blueprint
api = Blueprint("api", __name__)

# Stripe setup
# stripe.api_key = "your-stripe-secret-key"


# ---------------------
# Error Handling Helper
# ---------------------
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
#     strain = fields.Str(allow_none=True)
#     thc_content = fields.Float(allow_none=True)
#     cbd_content = fields.Float(allow_none=True)
#     current_stock = fields.Integer(required=True, validate=validate.Range(min=0))
#     reorder_point = fields.Integer(required=True, validate=validate.Range(min=0))
#     unit_price = fields.Decimal(required=True, validate=validate.Range(min=0))
#     supplier = fields.Str(required=True)
#     batch_number = fields.Str(required=True)
#     test_results = fields.Str(allow_none=True)


# class CustomerSchema(Schema):
#     first_name = fields.Str(required=True)
#     last_name = fields.Str(required=True)
#     email = fields.Email(required=True)
#     phone = fields.Str(required=True)
#     membership_level = fields.Str(validate=validate.OneOf(["standard", "premium", "vip"]))
#     verification_status = fields.Str(validate=validate.OneOf(["pending", "verified", "rejected"]))
#     preferences = fields.Dict(allow_none=True)


# ---------------------
# Authentication Routes
# ---------------------
@api.route("/auth/login", methods=["POST"])
def login():
    data = request.json
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Missing email or password"}), 400

    user = User.query.filter_by(email=data["email"]).first()
    if user and check_password_hash(user.password, data["password"]):
        token = create_access_token(identity=user.id)
        return jsonify({"message": "Login successful", "access_token": token, "user": user.serialize()}), 200
    return jsonify({"error": "Invalid email or password"}), 401


@api.route("/auth/register", methods=["POST"])
def register():
    data = request.json
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Missing required fields"}), 400

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already exists"}), 400

    user = User(email=data["email"], password=generate_password_hash(data["password"]))
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "User registered successfully", "user": user.serialize()}), 201


# # ---------------------
# # Product Routes
# # ---------------------
# @api.route("/products", methods=["GET"])
# @jwt_required()
# @handle_errors
# def get_products():
#     products = Product.query.all()
#     return jsonify([product.serialize() for product in products]), 200


# @api.route("/products/<int:id>", methods=["GET"])
# @jwt_required()
# @handle_errors
# def get_product(id):
#     product = Product.query.get_or_404(id)
#     return jsonify(product.serialize()), 200


# @api.route("/products", methods=["POST"])
# @jwt_required()
# @handle_errors
# def create_product():
#     schema = ProductSchema()
#     data = schema.load(request.json)
#     product = Product(**data)
#     db.session.add(product)
#     db.session.commit()
#     return jsonify(product.serialize()), 201


# @api.route("/products/<int:id>", methods=["PUT"])
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


# @api.route("/products/<int:id>", methods=["DELETE"])
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
# @api.route("/customers", methods=["GET"])
# @jwt_required()
# @handle_errors
# def get_customers():
#     customers = Customer.query.all()
#     return jsonify([customer.serialize() for customer in customers]), 200


# @api.route("/customers/<int:id>", methods=["GET"])
# @jwt_required()
# @handle_errors
# def get_customer(id):
#     customer = Customer.query.get_or_404(id)
#     return jsonify(customer.serialize()), 200


# @api.route("/customers", methods=["POST"])
# @jwt_required()
# @handle_errors
# def create_customer():
#     schema = CustomerSchema()
#     data = schema.load(request.json)
#     if Customer.query.filter_by(email=data["email"]).first():
#         return jsonify({"error": "Email already exists"}), 400
#     customer = Customer(**data)
#     db.session.add(customer)
#     db.session.commit()
#     return jsonify(customer.serialize()), 201


# ---------------------
# Analytics Routes
# ---------------------
# @api.route("/analytics/fraud-detection", methods=["POST"])
# @jwt_required()
# @handle_errors
# def fraud_detection():
#     transactions = np.array([
#         [100], [200], [150], [180], [2000], [50], [3000], [4000], [250]
#     ])
#     model = IsolationForest(contamination=0.1)
#     model.fit(transactions)

#     predictions = model.predict(transactions)  # 1 = Normal, -1 = Anomaly
#     anomalies = transactions[predictions == -1].tolist()

#     return jsonify({
#         "anomalies": anomalies,
#         "message": f"{len(anomalies)} suspicious transactions detected."
#     })


# @api.route("/analytics/demand-forecast", methods=["GET"])
# @jwt_required()
# @handle_errors
# def demand_forecast():
#     data = pd.DataFrame({
#         "ds": ["2024-01-01", "2024-01-02", "2024-01-03"],
#         "y": [500, 600, 550]
#     })

#     model = Prophet()
#     model.fit(data)

#     future = model.make_future_dataframe(periods=7)
#     forecast = model.predict(future)

#     return jsonify({
#         "forecast": forecast[["ds", "yhat"]].tail(7).to_dict(orient="records")
#     })


# @api.route("/analytics/kpis", methods=["GET"])
# @jwt_required()
# @handle_errors
# def get_kpi_metrics():
#     try:
#         total_revenue = db.session.query(db.func.sum(Order.total_amount)).scalar() or 0
#         total_orders = db.session.query(db.func.count(Order.id)).scalar() or 0
#         top_selling_products = (
#             db.session.query(Product.name, db.func.sum(OrderItem.quantity).label("total_sold"))
#             .join(OrderItem)
#             .group_by(Product.id)
#             .order_by(db.desc("total_sold"))
#             .limit(3)
#             .all()
#         )

#         return jsonify({
#             "total_revenue": float(total_revenue),
#             "total_orders": total_orders,
#             "top_selling_products": [{"name": product[0], "total_sold": product[1]} for product in top_selling_products],
#         }), 200
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# # ---------------------
# # AI Features
# # ---------------------
# # @api.route("/inventory/recognize", methods=["POST"])
# # @jwt_required()
# # @handle_errors
# # def recognize_inventory():
# #     if "file" not in request.files:
# #         return jsonify({"error": "No file uploaded"}), 400

# #     file = request.files["file"]
# #     image = Image.open(file)

# #     model = torch.hub.load("ultralytics/yolov5", "yolov5s", pretrained=True)
# #     results = model(image)

# #     detections = results.pandas().xyxy[0].to_dict(orient="records")
# #     return jsonify({"detections": detections})


# @api.route("/pos/recommendations", methods=["POST"])
# @jwt_required()
# @handle_errors
# def pos_recommendations():
#     data = request.json
#     cart_items = data.get("cart_items", [])

#     product_recommendations = {
#         "Product A": ["Product B", "Product C"],
#         "Product D": ["Product E"]
#     }

#     recommendations = []
#     for item in cart_items:
#         recommendations.extend(product_recommendations.get(item, []))

#     return jsonify({"recommendations": list(set(recommendations))})


# @api.route("/marketing/campaign-analytics", methods=["POST"])
# @jwt_required()
# @handle_errors
# def campaign_analytics():
#     data = request.json
#     impressions = np.array(data.get("impressions", []))
#     clicks = np.array(data.get("clicks", []))
#     conversions = np.array(data.get("conversions", []))

#     ctr = clicks.sum() / impressions.sum() if impressions.sum() > 0 else 0
#     conversion_rate = conversions.sum() / clicks.sum() if clicks.sum() > 0 else 0

#     return jsonify({
#         "click_through_rate": ctr,
#         "conversion_rate": conversion_rate,
#         "message": "Campaign analytics calculated successfully"
#     })

# ---------------------
# Compliance Routes
# ---------------------
# @api.route('/compliance', methods=['GET'])
# @jwt_required()
# @handle_errors
# def get_compliance_reports():
#     """
#     Fetch all compliance reports.
#     """
#     compliance_reports = Compliance.query.all()
#     return jsonify([report.serialize() for report in compliance_reports]), 200


# @api.route('/compliance/<int:id>', methods=['GET'])
# @jwt_required()
# @handle_errors
# def get_compliance_report(id):
#     """
#     Fetch a specific compliance report by ID.
#     """
#     report = Compliance.query.get_or_404(id)
#     return jsonify(report.serialize()), 200


# @api.route('/compliance', methods=['POST'])
# @jwt_required()
# @handle_errors
# def create_compliance_report():
#     """
#     Create a new compliance report.
#     """
#     data = request.json
#     compliance = Compliance(
#         business_id=data.get('business_id'),
#         licenses=data.get('licenses', {}),
#         test_results=data.get('test_results', {}),
#         reports=data.get('reports', {}),
#         audits=data.get('audits', {})
#     )
#     db.session.add(compliance)
#     db.session.commit()
#     return jsonify(compliance.serialize()), 201


# @api.route('/compliance/<int:id>', methods=['PUT'])
# @jwt_required()
# @handle_errors
# def update_compliance_report(id):
#     """
#     Update an existing compliance report.
#     """
#     data = request.json
#     compliance = Compliance.query.get_or_404(id)

#     compliance.licenses = data.get('licenses', compliance.licenses)
#     compliance.test_results = data.get('test_results', compliance.test_results)
#     compliance.reports = data.get('reports', compliance.reports)
#     compliance.audits = data.get('audits', compliance.audits)
#     db.session.commit()

#     return jsonify(compliance.serialize()), 200


# @api.route('/compliance/<int:id>', methods=['DELETE'])
# @jwt_required()
# @handle_errors
# def delete_compliance_report(id):
#     """
#     Delete a compliance report by ID.
#     """
#     compliance = Compliance.query.get_or_404(id)
#     db.session.delete(compliance)
#     db.session.commit()
#     return jsonify({"message": f"Compliance report {id} deleted successfully."}), 200

# # ---------------------
# # Plan Routes
# # ---------------------
# @api.route('/plans', methods=['GET'])
# @jwt_required()
# @handle_errors
# def get_plans():
#     """
#     Fetch all subscription plans.
#     """
#     plans = Plan.query.all()
#     return jsonify([plan.serialize() for plan in plans]), 200


# @api.route('/plans/<int:id>', methods=['GET'])
# @jwt_required()
# @handle_errors
# def get_plan(id):
#     """
#     Fetch a specific subscription plan by ID.
#     """
#     plan = Plan.query.get_or_404(id)
#     return jsonify(plan.serialize()), 200


# @api.route('/plans', methods=['POST'])
# @jwt_required()
# @handle_errors
# def create_plan():
#     """
#     Create a new subscription plan.
#     """
#     data = request.json
#     if not data.get('name') or not data.get('price') or not data.get('features'):
#         return jsonify({"error": "Missing required fields (name, price, features)."}), 400

#     plan = Plan(
#         name=data['name'],
#         price=data['price'],
#         features=data['features']
#     )
#     db.session.add(plan)
#     db.session.commit()
#     return jsonify(plan.serialize()), 201


# @api.route('/plans/<int:id>', methods=['PUT'])
# @jwt_required()
# @handle_errors
# def update_plan(id):
#     """
#     Update an existing subscription plan.
#     """
#     data = request.json
#     plan = Plan.query.get_or_404(id)

#     plan.name = data.get('name', plan.name)
#     plan.price = data.get('price', plan.price)
#     plan.features = data.get('features', plan.features)

#     db.session.commit()
#     return jsonify(plan.serialize()), 200


# @api.route('/plans/<int:id>', methods=['DELETE'])
# @jwt_required()
# @handle_errors
# def delete_plan(id):
#     """
#     Delete a subscription plan by ID.
#     """
#     plan = Plan.query.get_or_404(id)
#     db.session.delete(plan)
#     db.session.commit()
#     return jsonify({"message": f"Plan {id} deleted successfully."}), 200

# Route to handle Power BI Pro subscription
# @api.route("/subscribe/pro", methods=["POST"])
# @jwt_required()
# def subscribe_to_pro():
#     user_email = request.json.get("email")
#     plan = "pro"
#     try:
#         # Create a Stripe Payment Intent
#         payment_intent = stripe.PaymentIntent.create(
#             amount=2000,  # $20.00 in cents
#             currency="usd",
#             metadata={"plan": plan, "email": user_email},
#         )

#         # Assign Power BI Pro license
#         access_token = "your-graph-api-access-token"
#         assign_powerbi_pro_license(user_email, access_token)

#         return jsonify({"message": "Subscription successful", "payment_intent": payment_intent}), 200
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# def assign_powerbi_pro_license(user_email, access_token):
#     # Microsoft Graph API logic here
#     pass

#powerbi

# @api.route("/get-embed-token", methods=["GET"])
# @jwt_required()
# def get_embed_token():
#     report_id = request.args.get("reportId")
#     if not report_id:
#         return jsonify({"error": "Report ID is required"}), 400

#     try:
#         # Generate embed token logic here
#         embed_token = "your-logic-to-generate-embed-token"
#         return jsonify({"embedToken": embed_token}), 200
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500
    
# @api.route('/subscribe', methods=['POST'])
# @jwt_required()
# def subscribe():
#     data = request.json
#     user_email = data.get('email')
#     plan = data.get('plan', 'basic').lower()  # Default to 'basic' plan

#     # Map plans to POS licenses
#     plan_to_pos_licenses = {
#         "basic": 2,
#         "pro": 5,
#         "enterprise": 10
#     }

#     if plan not in plan_to_pos_licenses:
#         return jsonify({"error": "Invalid plan selected"}), 400

#     try:
#         # Create a Stripe Payment Intent for the selected plan
#         payment_intent = stripe.PaymentIntent.create(
#             amount=PLAN_PRICES[plan],
#             currency="usd",
#             metadata={"plan": plan, "email": user_email},
#         )

#         # Assign Power BI license based on the selected plan (if applicable)
#         access_token = "your-graph-api-access-token"  # Replace with a valid Microsoft Graph API token
#         if plan == "pro":
#             assign_powerbi_license(user_email, access_token, POWERBI_PRO_SKU_ID)
#         elif plan == "premium":
#             assign_powerbi_license(user_email, access_token, POWERBI_PREMIUM_SKU_ID)
#         elif plan == "enterprise":
#             assign_powerbi_license(user_email, access_token, POWERBI_ENTERPRISE_SKU_ID)

#         # Assign POS licenses based on the plan
#         license_count = plan_to_pos_licenses[plan]
#         assign_pos_licenses(user_email, license_count, plan)

#         return jsonify({
#             "message": f"{plan.capitalize()} subscription successful",
#             "payment_intent": payment_intent,
#         }), 200
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# def assign_pos_licenses(user_email, license_count, plan):
#     """
#     Assign the correct number of POS licenses based on the plan selected.
#     """
#     license_entry = License(
#         user_id=user_email,  # Assuming user email is used to link with User model
#         license_type="POS",
#         license_count=license_count,
#         plan=plan
#     )
#     db.session.add(license_entry)
#     db.session.commit()
#     return jsonify({"message": f"POS license(s) assigned for {plan} plan"}), 200

# @api.route('/licenses/assign', methods=['POST'])
# @jwt_required()
# def assign_license():
#     data = request.json
#     user_id = data.get("user_id")
#     license_type = data.get("license_type")
#     license_count = data.get("license_count", 1)
#     plan = data.get("plan")

#     if license_type not in ["POS", "Power BI"]:
#         return jsonify({"error": "Invalid license type"}), 400

#     try:
#         license_entry = License(
#             user_id=user_id,
#             license_type=license_type,
#             license_count=license_count,
#             plan=plan
#         )
#         db.session.add(license_entry)
#         db.session.commit()

#         return jsonify({"message": f"{license_type} license(s) assigned successfully"}), 200
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500
    
# @api.route('/licenses/<int:user_id>', methods=['GET'])
# @jwt_required()
# def view_licenses(user_id):
#     try:
#         licenses = License.query.filter_by(user_id=user_id).all()
#         return jsonify([license.serialize() for license in licenses]), 200
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# @api.route('/licenses/<int:license_id>', methods=['DELETE'])
# @jwt_required()
# def remove_license(license_id):
#     try:
#         license_entry = License.query.get_or_404(license_id)
#         db.session.delete(license_entry)
#         db.session.commit()
#         return jsonify({"message": "License removed successfully"}), 200
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500






