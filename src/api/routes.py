from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity
from flask_login import login_required, current_user
from api.utils import calculate_lead_time, calculate_sales_velocity, predict_restock

from datetime import datetime, timedelta
from api.models import db, User, Product, Customer, Order, OrderItem, Invoice, Business, Patient, Store, CashDrawer, CashLog, Pricing, Dispensary, GrowFarm, PlantBatch, EnvironmentData, GrowTask, YieldPrediction, Seedbank, SeedBatch, StorageConditions, SeedReport, CustomerInteraction, Lead, Campaign, Task, Deal,  PromotionalDeal, Recommendation, Inventory, InventoryLog, Prescription, Transaction, Symptom, MedicalResource, Review, Settings, Message, Payroll, Reward, LoyaltyProgram, TimeLog, Feedback, Plan, Deal, InventoryLog, Payroll, TimeLog, CampaignMetrics, Report,  Appointment, Insurance, PatientEducationResource, StaffTrainingResource, Cart, CartItem, Wishlist, PaymentLog, Subscription, SupportTicket, LoyaltyHistory, Discount, Address, Supplier      
from api.send_email import send_email                           
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from marshmallow import Schema, fields, validate, ValidationError
from reportlab.pdfgen import canvas
from flask_cors import CORS
from sqlalchemy import func
# from .services.predictive import predict_restock
from twilio.jwt.access_token import AccessToken
from twilio.jwt.access_token.grants import ChatGrant



# from api.utils import role_required, APIException, generate_sitemap
from sklearn.linear_model import LinearRegression
import numpy as np
import os
import jwt
import json
from flask_socketio import SocketIO, emit
from api.extensions import socketio
from flask import jsonify, send_file
from io import BytesIO
from textblob import TextBlob
import pandas as pd
from prophet import Prophet
from celery import shared_task
# from your_project.tasks import generate_report
# TODO: work on getting these project.tasks/generate_report working versus line 43-47

socketio = SocketIO()


# Create Blueprint
api = Blueprint('api', __name__)
CORS(api, resources={r"/api/*": {"origins": os.getenv("FRONTEND_URL")}})


# TODO: take care of this generate report logic/function later...
@shared_task
def generate_report():
    # Your report generation logic here
    pass


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




# AUTHENTIC ROUTES

@api.route('/login', methods=['POST'])
@handle_errors
def login():
    data = request.json
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Missing email or password"}), 400

    user = User.query.filter_by(email=data['email']).first()
    if user and check_password_hash(user.password, data['password']):
        token = create_access_token(identity=str(user.id))
        return jsonify({"message": "Login successful", "access_token": token, "user": user.serialize()}), 200
    return jsonify({"error": "Invalid email or password"}), 401

@api.route("/signup", methods=["POST"])
def create_signup():
    try:
        email = request.json.get("email")
        password = request.json.get("password")
        role_name = request.json.get("role", "customer")

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({"error": "User already exists"}), 400

        hashed_password = generate_password_hash(password)
        new_user = User(email=email, password=hashed_password, role=role_name, is_active=False)

        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "User created successfully", "user": new_user.serialize()}), 201
    except Exception as e:
        print(f"signup error: {str(e)}")
        return jsonify({"error":f"Internal Server Error: {str(e)}"}), 500
    
@api.route("/forgot-password", methods=["POST"])
def forgot_password(): 
    email=request.json.get("email")

    user = User.query.filter_by(email=email).first()
    if user is None: 
        return jsonify({"message": "email does not exist"}), 400
    
    expiration_time=datetime.utcnow() + timedelta(hours = 1)
    token = jwt.encode({"email": email, "exp": expiration_time}, os.getenv("FLASK_APP_KEY"), algorithm="HS256")

    email_value=f"Click here to reset password.\n{os.getenv('FRONTEND_URL')}/forgot-password?token={token}"
    send_email(email, email_value, "Password Recovery: DispenseMaster")
    return jsonify({"message": "recovery email sent"}), 200
    


@api.route("/reset-password/<token>", methods=["PUT"])
def reset_password(token):
    data=request.get_json()
    password=data.get("password")

    try:
        decoded_token=jwt.decode(token, os.getenv("FLASK_APP_KEY"), algorithms=["HS256"])
        email=decoded_token.get("email")
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token has expired" }), 400
    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token"}), 400
    
    user=User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "User does not exist"}), 400
    
    user.password=generate_password_hash(password)
    db.session.commit()

    send_email(email, "password successfully reset", "password reset confirmation for DispenseMaster")
    return jsonify({"message": "password reset email sent"}), 200
    
# products    

@api.route('/products/cheapest', methods=['GET'])
def get_cheapest_products():
    strain = request.args.get('strain', '')  # Get the strain filter
    location = request.args.get('location', '')  # Get the location filter

    # Query for the cheapest prices
    query = db.session.query(
        Product.strain,
        Dispensary.name.label('dispensary_name'),
        Dispensary.location,
        func.min(Pricing.price).label('price'),
        Pricing.availability
    ).join(Pricing, Product.id == Pricing.product_id) \
     .join(Dispensary, Pricing.dispensary_id == Dispensary.id) \
     .filter(Product.strain.ilike(f"%{strain}%")) \
     .filter(Dispensary.location.ilike(f"%{location}%")) \
     .group_by(Product.strain, Dispensary.name, Dispensary.location, Pricing.availability)

    # Convert the query results into JSON format
    results = query.all()
    return jsonify([{
        "strain": row.strain,
        "dispensary_name": row.dispensary_name,
        "location": row.location,
        "price": row.price,
        "availability": row.availability
    } for row in results])


@api.route('/products', methods=['GET'])
@jwt_required()  # Ensure the endpoint is protected
def get_products():
    category = request.args.get('category', '')
    strain = request.args.get('strain', '')
    location = request.args.get('location', '')
    cheapest = request.args.get('cheapest', 'false').lower() == 'true'
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    # Base query
    query = db.session.query(Product).filter(Product.is_available_online == True)

    # Apply filters
    if category:
        query = query.filter(Product.category.ilike(f"%{category}%"))
    if strain:
        query = query.filter(Product.strain.ilike(f"%{strain}%"))

    # Handle cheapest filter
    if cheapest:
        query = db.session.query(
            Product.strain,
            Dispensary.name.label('dispensary_name'),
            Dispensary.location,
            func.min(Pricing.price).label('price'),
            Pricing.availability
        ).join(Pricing, Product.id == Pricing.product_id) \
         .join(Dispensary, Pricing.dispensary_id == Dispensary.id) \
         .filter(Product.strain.ilike(f"%{strain}%")) \
         .filter(Dispensary.location.ilike(f"%{location}%")) \
         .group_by(Product.strain, Dispensary.name, Dispensary.location, Pricing.availability)
        results = query.all()
        return jsonify([{
            "strain": row.strain,
            "dispensary_name": row.dispensary_name,
            "location": row.location,
            "price": float(row.price),
            "availability": row.availability
        } for row in results]), 200

    # Pagination and product data retrieval
    products = query.paginate(page, per_page, False)
    product_list = []

    for product in products.items:
        pricings = Pricing.query.filter_by(product_id=product.id).all()
        pricing_data = [
            {
                "price": float(pricing.price),
                "availability": pricing.availability,
                "dispensary": pricing.dispensary.serialize(),
                "updated_at": pricing.updated_at.isoformat() if pricing.updated_at else None,
            }
            for pricing in pricings
        ]
        serialized_product = product.serialize()
        serialized_product["pricings"] = pricing_data
        product_list.append(serialized_product)

    return jsonify({
        "products": product_list,
        "total": products.total,
        "pages": products.pages,
        "current_page": products.page
    }), 200

# Enhanced POST /products with Pricing
@api.route('/products', methods=['POST'])
@jwt_required()
@handle_errors
def create_product():
    product_schema = ProductSchema()
    pricing_schema = PricingSchema()

    # Parse product data
    product_data = product_schema.load(request.json.get("product"))
    product = Product(**product_data)
    db.session.add(product)
    db.session.flush()  # Get the product ID before commit

    # Parse pricing data
    pricing_data = request.json.get("pricings", [])
    for pricing_entry in pricing_data:
        pricing = pricing_schema.load(pricing_entry)
        new_pricing = Pricing(
            product_id=product.id,
            dispensary_id=pricing["dispensary_id"],
            price=pricing["price"],
            availability=pricing["availability"],
            updated_at=datetime.utcnow()
        )
        db.session.add(new_pricing)

    db.session.commit()
    return jsonify(product.serialize()), 201

# Enhanced PUT /products to Update Pricing
@api.route('/products/<int:id>', methods=['PUT'])
@jwt_required()
@handle_errors
def update_product(id):
    product_schema = ProductSchema()
    pricing_schema = PricingSchema()

    product = Product.query.get_or_404(id)
    product_data = product_schema.load(request.json.get("product"), partial=True)

    for key, value in product_data.items():
        setattr(product, key, value)

@api.route('/products/demand-forecast', methods=['GET'])
def demand_forecast():
    sales_data = pd.read_csv('sales_data.csv')  # Replace with actual data source
    sales_data.rename(columns={'date': 'ds', 'sales': 'y'}, inplace=True)

    model = Prophet()
    model.fit(sales_data)
    future = model.make_future_dataframe(periods=30)
    forecast = model.predict(future)

    return forecast[['ds', 'yhat']].to_json(orient='records'), 200

    # Update Pricing Information
    pricing_data = request.json.get("pricings", [])
    for pricing_entry in pricing_data:
        pricing = pricing_schema.load(pricing_entry)
        existing_pricing = Pricing.query.filter_by(
            product_id=product.id,
            dispensary_id=pricing["dispensary_id"]
        ).first()

        if existing_pricing:
            existing_pricing.price = pricing["price"]
            existing_pricing.availability = pricing["availability"]
            existing_pricing.updated_at = datetime.utcnow()
        else:
            new_pricing = Pricing(
                product_id=product.id,
                dispensary_id=pricing["dispensary_id"],
                price=pricing["price"],
                availability=pricing["availability"],
                updated_at=datetime.utcnow()
            )
            db.session.add(new_pricing)

    db.session.commit()
    return jsonify(product.serialize()), 200

@api.route('/products/search', methods=['GET'])
def search_products():
    name = request.args.get('name')
    category = request.args.get('category')
    products = Product.query
    if name:
        products = products.filter(Product.name.ilike(f'%{name}%'))
    if category:
        products = products.filter(Product.category == category)
    return jsonify([product.serialize() for product in products.all()])



# customer routes

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

@api.route('/customers/<int:id>/preferences', methods=['PUT'])
@jwt_required()
def update_preferences(id):
    customer = Customer.query.get_or_404(id)
    data = request.json.get('preferences', {})
    customer.preferences = data
    db.session.commit()
    return jsonify({"message": "Preferences updated successfully", "customer": customer.serialize()}), 200

@api.route('/customers/<int:id>/interactions', methods=['POST'])
@jwt_required()
def log_interaction(id):
    customer = Customer.query.get_or_404(id)
    data = request.json
    interaction = CustomerInteraction(
        customer_id=id,
        interaction_type=data['interaction_type'],
        notes=data.get('notes', '')
    )
    db.session.add(interaction)
    db.session.commit()
    return jsonify({"message": "Interaction logged successfully"}), 201



# order routes

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
    db.session.flush()

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

# recommendation routes


@api.route('/products/customer-recommendations/<int:customer_id>', methods=['GET'])
@jwt_required()
def recommend_products_by_customer(customer_id):
    customer_orders = Order.query.filter_by(customer_id=customer_id).all()
    # Example: Recommend products from the same category as previous orders
    recommended_products = Product.query.filter(Product.category.in_(
        [order_item.product.category for order in customer_orders for order_item in order.order_items])).all()
    return jsonify([product.serialize() for product in recommended_products])


@api.route('/recommendations', methods=['POST'])
def recommend_products():
    symptoms = request.json.get('symptoms', [])
    query = Product.query.filter(
        db.or_(*[Product.medical_benefits.ilike(f"%{symptom}%") for symptom in symptoms])
    )
    products = query.all()
    return jsonify([p.serialize() for p in products]), 200


@api.route('/recommendations', methods=['GET'])
def get_recommendations():
    recommendations = Recommendation.query.all()
    return jsonify([recommendation.serialize() for recommendation in recommendations]), 200

# @api.route('/recommendations/<int:id>', methods=['GET'])
# def get_recommendation(id):
#     recommendation = Recommendation.query.get_or_404(id)
#     return jsonify(recommendation.serialize()), 200

@api.route('/recommendations', methods=['POST'])
def create_recommendation():
    data = request.json
    recommendation = Recommendation(
        patient_id=data['patient_id'],
        product_id=data['product_id'],
        notes=data.get('notes')
    )
    db.session.add(recommendation)
    db.session.commit()
    return jsonify(recommendation.serialize()), 201

@api.route('/recommendations/<int:id>', methods=['PUT'])
def update_recommendation(id):
    recommendation = Recommendation.query.get_or_404(id)
    data = request.json
    for key, value in data.items():
        setattr(recommendation, key, value)
    db.session.commit()
    return jsonify(recommendation.serialize()), 200

@api.route('/recommendations/<int:id>', methods=['DELETE'])
def delete_recommendation(id):
    recommendation = Recommendation.query.get_or_404(id)
    db.session.delete(recommendation)
    db.session.commit()
    return jsonify({"message": "Recommendation deleted successfully"}), 200

# Personalized Recommendations Route

@api.route('/recommendations/personalized', methods=['POST'])
def personalized_recommendations():
    customer_id = request.json.get('customer_id')  # Get customer ID from request
    customer = Customer.query.get(customer_id)

    if not customer:
        return jsonify({"error": "Customer not found"}), 404

    # Fetch customer's purchase history using Order and OrderItem
    purchased_product_ids = [
        item.product_id
        for item in OrderItem.query.join(Order).filter(Order.customer_id == customer.id).all()
    ]

    if not purchased_product_ids:
        return jsonify({"message": "No purchase history found for this customer"}), 200

    # Get product categories based on purchased product IDs
    purchased_categories = [
        product.category
        for product in Product.query.filter(Product.id.in_(purchased_product_ids)).all()
    ]

    # Fetch feedback for this customer
    feedback_data = Feedback.query.filter_by(customer_id=customer.id).all()
    viewed_product_ids = [feedback.product_id for feedback in feedback_data if feedback.action == "viewed"]
    purchased_feedback_ids = [feedback.product_id for feedback in feedback_data if feedback.action == "purchased"]

    # Recommend products based on feedback, purchase history, and categories
    recommendations = Product.query.filter(
        Product.category.in_(purchased_categories),
        ~Product.id.in_(purchased_product_ids),  # Exclude already purchased products
        ~Product.id.in_(viewed_product_ids)  # Optionally exclude previously viewed products
    ).limit(10).all()

    return jsonify([product.serialize() for product in recommendations]), 200



# analytic routes


@api.route('/analytics', methods=['GET'])
@jwt_required()
def get_analytics():
    analytics_type = request.args.get('type', 'sales')
    if analytics_type == 'sales':
        orders = Order.query.filter(Order.status == 'completed').all()
        total_sales = sum(float(order.total_amount) for order in orders)
        return jsonify({"total_sales": total_sales}), 200
    
@api.route('/analytics/predict-sales', methods=['GET'])
@jwt_required()
def predict_sales():
    # Example data (Replace with database data)
    historical_data = Order.query.with_entities(
        func.sum(OrderItem.quantity).label('total_sales'),
        func.date_trunc('month', Order.created_at).label('month')
    ).group_by('month').all()

    # Prepare data
    X = np.array([h[1].timestamp() for h in historical_data]).reshape(-1, 1)
    y = np.array([h[0] for h in historical_data])

    # Train model
    model = LinearRegression()
    model.fit(X, y)

    # Predict next month
    next_month = datetime.utcnow() + timedelta(days=30)
    prediction = model.predict([[next_month.timestamp()]])
    return jsonify({"predicted_sales": prediction[0]}), 200

# dashboard

# @api.route('/dashboard/metrics', methods=['GET'])
# @jwt_required()
# def get_dashboard_metrics():
#     try:
#         orders = Order.query.filter(Order.status == 'completed').all()
#         total_sales = sum(float(order.total_amount) for order in orders)
#         order_count = len(orders)
#         average_purchase_order = total_sales / order_count if order_count > 0 else 0

#         metrics = [
#             {"title": "Total Sales", "value": f"${total_sales:,.2f}"},
#             {"title": "Average Purchase Order", "value": f"${average_purchase_order:,.2f}"},
#             { "title": "Average Purchase Order", "value": "$180", "icon": "🛒", "trend": 2, "bgColor": "bg-yellow-100", "textColor": "text-yellow-900" },
#             { "title": "Users", "value": "1,345", "icon": "👤", "trend": 15, "bgColor": "bg-purple-100", "textColor": "text-purple-900" },
#             { "title": "Refunds", "value": "$320", "icon": "💸", "trend": -3, "bgColor": "bg-red-100", "textColor": "text-red-900" },
#             { "title": "Product Availability", "value": "93%", "icon": "📊", "trend": 1, "bgColor": "bg-teal-100", "textColor": "text-teal-900" },
#             { "title": "Supply Below Safety Stock", "value": "8", "icon": "📉", "trend": -2, "bgColor": "bg-gray-100", "textColor": "text-gray-900" },
#             { "title": "Invoices", "value": "295", "icon": "🧾", "trend": 7, "bgColor": "bg-indigo-100", "textColor": "text-indigo-900" },
#             { "title": "Today's Invoice", "value": "28", "icon": "📆", "trend": 3, "bgColor": "bg-orange-100", "textColor": "text-orange-900" },
#             { "title": "Current Monthly", "value": "$22,560", "icon": "📅", "trend": 10, "bgColor": "bg-green-100", "textColor": "text-green-900" },
#             { "title": "Inventory", "value": "965", "icon": "📦", "trend": 4, "bgColor": "bg-blue-100", "textColor": "text-blue-900" },
#             { "title": "Stores", "value": "4", "icon": "🏬", "trend": 0, "bgColor": "bg-yellow-100", "textColor": "text-yellow-900" },
#             # { "title": "Top Categories", "value": "Electronics, Clothing", "icon": "📂", "trend": 6, "bgColor": "bg-purple-100", "textColor": "text-purple-900" },
#             # { "title": "Sales Performance", "value": "Trending Up", "icon": "📈", "trend": 12, "bgColor": "bg-teal-100", "textColor": "text-teal-900" }
#         ]
#         return jsonify(metrics), 200
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500
    
@api.route('/dashboard/metrics', methods=['GET'])
@jwt_required()
@handle_errors
def get_dashboard_metrics():
    # Query parameter to toggle between formats
    format_type = request.args.get('format', 'user_friendly')  # Default to 'user_friendly'

    try:
        # Shared Data
        orders = Order.query.filter(Order.status == 'completed').all()
        total_sales = sum(float(order.total_amount) for order in orders)
        order_count = len(orders)
        average_order_value = total_sales / order_count if order_count > 0 else 0

        low_stock_products = Product.query.filter(Product.current_stock <= Product.reorder_point).all()
        top_products = Product.query.order_by(Product.sales.desc()).limit(5).all()

        total_customers = Customer.query.count()
        top_customer = db.session.query(Customer).join(Order).group_by(Customer.id).order_by(db.func.sum(Order.total_amount).desc()).first()

        # User-Friendly Metrics
        if format_type == 'user_friendly':
            metrics = [
                 {"title": "Total Sales", "value": f"${total_sales:,.2f}"},
            {"title": "Average Purchase Order", "value": f"${average_purchase_order:,.2f}"},
            { "title": "Average Purchase Order", "value": "$180", "icon": "🛒", "trend": 2, "bgColor": "bg-yellow-100", "textColor": "text-yellow-900" },
            { "title": "Users", "value": "1,345", "icon": "👤", "trend": 15, "bgColor": "bg-purple-100", "textColor": "text-purple-900" },
            { "title": "Refunds", "value": "$320", "icon": "💸", "trend": -3, "bgColor": "bg-red-100", "textColor": "text-red-900" },
            { "title": "Product Availability", "value": "93%", "icon": "📊", "trend": 1, "bgColor": "bg-teal-100", "textColor": "text-teal-900" },
            { "title": "Supply Below Safety Stock", "value": "8", "icon": "📉", "trend": -2, "bgColor": "bg-gray-100", "textColor": "text-gray-900" },
            { "title": "Invoices", "value": "295", "icon": "🧾", "trend": 7, "bgColor": "bg-indigo-100", "textColor": "text-indigo-900" },
            { "title": "Today's Invoice", "value": "28", "icon": "📆", "trend": 3, "bgColor": "bg-orange-100", "textColor": "text-orange-900" },
            { "title": "Current Monthly", "value": "$22,560", "icon": "📅", "trend": 10, "bgColor": "bg-green-100", "textColor": "text-green-900" },
            { "title": "Inventory", "value": "965", "icon": "📦", "trend": 4, "bgColor": "bg-blue-100", "textColor": "text-blue-900" },
            { "title": "Stores", "value": "4", "icon": "🏬", "trend": 0, "bgColor": "bg-yellow-100", "textColor": "text-yellow-900" },
            ]
            return jsonify(metrics), 200

        # Data-Centric Metrics
        elif format_type == 'data_centric':
            return jsonify({
                "sales": {
                    "total_sales": total_sales,
                    "order_count": order_count,
                    "average_order_value": round(average_order_value, 2)
                },
                "inventory": {
                    "low_stock_count": len(low_stock_products),
                    "top_products": [{"name": p.name, "sales": p.sales} for p in top_products]
                },
                "customers": {
                    "total_customers": total_customers,
                    "top_customer": {
                        "id": top_customer.id if top_customer else None,
                        "name": f"{top_customer.first_name} {top_customer.last_name}" if top_customer else None,
                        "total_spent": round(top_customer.total_spent, 2) if top_customer else None
                    }
                }
            }), 200
        else:
            return jsonify({"error": "Invalid format type"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    
@api.route('/dashboard/analytics', methods=['GET'])
def get_dashboard_analytics():
    try:
        # Example data - Replace with your database queries
        total_sales = db.session.query(func.sum(Order.total_amount)).scalar() or 0
        total_orders = db.session.query(func.count(Order.id)).scalar() or 0
        average_order_value = total_sales / total_orders if total_orders else 0
        top_products = db.session.query(
            Product.name, func.sum(OrderItem.quantity).label("total_quantity")
        ).join(OrderItem, Product.id == OrderItem.product_id)\
         .group_by(Product.name)\
         .order_by(func.sum(OrderItem.quantity).desc())\
         .limit(5).all()

        # Real-time data format
        response = {
            "total_sales": f"${total_sales:,.2f}",
            "total_orders": total_orders,
            "average_order_value": f"${average_order_value:,.2f}",
            "top_products": [{"name": p[0], "quantity": p[1]} for p in top_products],
        }

        return jsonify(response), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/dashboard/layout', methods=['POST'])
@login_required
def save_layout():
    data = request.json
    user_id = current_user.id
    layout = data.get('layout')
    # Save the layout to the database
    db.session.execute(
        "UPDATE user_settings SET dashboard_layout = :layout WHERE user_id = :user_id",
        {"layout": json.dumps(layout), "user_id": user_id},
    )
    db.session.commit()
    return jsonify({"message": "Layout saved successfully"}), 200

@api.route('/dashboard/layout', methods=['GET'])
@login_required
def get_layout():
    user_id = current_user.id
    layout = db.session.execute(
        "SELECT dashboard_layout FROM user_settings WHERE user_id = :user_id",
        {"user_id": user_id},
    ).fetchone()
    return jsonify({"layout": layout}), 200


# store routes

@api.route('/store', methods=['GET'])
@api.route('/store/<int:store_id>', methods=['GET'])
@jwt_required()
def get_store(store_id=None):
    try:
        user_id = int(get_jwt_identity())
        if store_id:
            store = Store.query.filter_by(id=store_id, user_id=user_id).first()
            if not store:
                return jsonify({"error": "Store not found"}), 404
            return jsonify(store.serialize()), 200

        stores = Store.query.filter_by(user_id=user_id).all()
        return jsonify([store.serialize() for store in stores]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/store', methods=['POST'])
@jwt_required()
def create_store():
    try:
        user_id = int(get_jwt_identity())
        data = request.json
        new_store = Store(
            user_id=user_id,
            name=data['name'],
            location=data['location'],
            store_manager=data['store_manager'],
            phone=data['phone'],
            status=data['status'],
            employee_count=data['employee_count']
        )
        db.session.add(new_store)
        db.session.commit()
        return jsonify(new_store.serialize()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/store/<int:store_id>', methods=['PUT'])
@jwt_required()
def update_store(store_id):
    try:
        user_id = int(get_jwt_identity())
        store = Store.query.filter_by(id=store_id, user_id=user_id).first()
        if not store:
            return jsonify({"error": "Store not found"}), 404

        data = request.json
        for key, value in data.items():
            setattr(store, key, value)
        db.session.commit()
        return jsonify(store.serialize()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/store/<int:store_id>', methods=['DELETE'])
@jwt_required()
def delete_store(store_id):
    try:
        user_id = get_jwt_identity()
        store = Store.query.filter_by(id=store_id, user_id=user_id).first()
        if not store:
            return jsonify({"error": "Store not found"}), 404
        db.session.delete(store)
        db.session.commit()
        return jsonify({"message": "Store deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# lead routes

@api.route('/leads', methods=['GET'])
@jwt_required()
@handle_errors
def get_leads():
    leads = Lead.query.all()
    return jsonify([lead.serialize() for lead in leads]), 200

@api.route('/leads', methods=['POST'])
@jwt_required()
@handle_errors
def create_lead():
    data = request.json
    lead = Lead(**data)
    db.session.add(lead)
    db.session.commit()
    return jsonify(lead.serialize()), 201

@api.route('/leads/<int:id>', methods=['PUT'])
@jwt_required()
@handle_errors
def update_lead(id):
    lead = Lead.query.get_or_404(id)
    data = request.json
    for key, value in data.items():
        setattr(lead, key, value)
    db.session.commit()
    return jsonify(lead.serialize()), 200

@api.route('/leads/<int:id>', methods=['DELETE'])
@jwt_required()
@handle_errors
def delete_lead(id):
    lead = Lead.query.get_or_404(id)
    db.session.delete(lead)
    db.session.commit()
    return jsonify({"message": "Lead deleted successfully"}), 200

# campaign routes




# Route to get all campaigns
@api.route('/campaigns', methods=['GET'])
@jwt_required()
def get_campaigns():
    status = request.args.get('status')  # Optional filtering by status
    if status:
        campaigns = Campaign.query.filter_by(status=status).all()
    else:
        campaigns = Campaign.query.all()
    return jsonify([campaign.serialize() for campaign in campaigns]), 200

# Route to create a new campaign
@api.route('/campaigns', methods=['POST'])
@jwt_required()
def create_campaign():
    data = request.json
    try:
        new_campaign = Campaign(
            name=data['name'],
            description=data.get('description'),
            target_audience=data.get('target_audience'),
            start_date=data['start_date'],
            end_date=data.get('end_date'),
            status=data.get('status', 'draft')
        )
        db.session.add(new_campaign)
        db.session.commit()
        return jsonify(new_campaign.serialize()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Route to update a specific campaign
@api.route('/campaigns/<int:id>', methods=['PUT'])
@jwt_required()
def update_campaign(id):
    campaign = Campaign.query.get_or_404(id)
    data = request.json
    try:
        for key, value in data.items():
            setattr(campaign, key, value)
        db.session.commit()
        return jsonify(campaign.serialize()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Route to delete a specific campaign
@api.route('/campaigns/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_campaign(id):
    campaign = Campaign.query.get_or_404(id)
    try:
        db.session.delete(campaign)
        db.session.commit()
        return jsonify({"message": "Campaign deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ---------------------------------
# Metrics and Analytics
# ---------------------------------

# Route to fetch metrics for a specific campaign
@api.route('/campaigns/<int:id>/metrics', methods=['GET'])
@jwt_required()
def get_campaign_metrics(id):
    metrics = CampaignMetrics.query.filter_by(campaign_id=id).all()
    if not metrics:
        return jsonify({"error": "Metrics not found for the campaign"}), 404
    return jsonify([metric.serialize() for metric in metrics]), 200

# Route to fetch aggregated metrics for all campaigns
@api.route('/campaigns/metrics', methods=['GET'])
@jwt_required()
def get_all_campaign_metrics():
    metrics = CampaignMetrics.query.all()
    return jsonify([metric.serialize() for metric in metrics]), 200

# Route to fetch analytics for campaign dashboard
@api.route('/campaigns/analytics', methods=['GET'])
@jwt_required()
def get_campaign_analytics():
    # Placeholder: Add custom logic for aggregated analytics
    analytics = {
        "total_campaigns": Campaign.query.count(),
        "total_metrics": CampaignMetrics.query.count()
    }
    return jsonify(analytics), 200


# ---------------------------------
# Bulk Operations
# ---------------------------------

# Route to create multiple campaigns in bulk
@api.route('/campaigns/bulk-create', methods=['POST'])
@jwt_required()
def bulk_create_campaigns():
    data = request.json
    try:
        campaigns = [
            Campaign(
                name=campaign['name'],
                description=campaign.get('description'),
                target_audience=campaign.get('target_audience'),
                start_date=campaign['start_date'],
                end_date=campaign.get('end_date'),
                status=campaign.get('status', 'draft')
            )
            for campaign in data
        ]
        db.session.bulk_save_objects(campaigns)
        db.session.commit()
        return jsonify({"message": "Bulk campaigns created successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Route to delete multiple campaigns in bulk
@api.route('/campaigns/bulk-delete', methods=['DELETE'])
@jwt_required()
def bulk_delete_campaigns():
    campaign_ids = request.json.get('ids', [])
    try:
        Campaign.query.filter(Campaign.id.in_(campaign_ids)).delete(synchronize_session=False)
        db.session.commit()
        return jsonify({"message": "Bulk campaigns deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ---------------------------------
# Campaign Filtering
# ---------------------------------

# Route to filter campaigns by status
@api.route('/campaigns/status/<string:status>', methods=['GET'])
@jwt_required()
def get_campaigns_by_status(status):
    campaigns = Campaign.query.filter_by(status=status).all()
    return jsonify([campaign.serialize() for campaign in campaigns]), 200

# Route to search campaigns by name
@api.route('/campaigns/search', methods=['GET'])
@jwt_required()
def search_campaigns():
    name = request.args.get('name', '')
    campaigns = Campaign.query.filter(Campaign.name.ilike(f"%{name}%")).all()
    return jsonify([campaign.serialize() for campaign in campaigns]), 200


# task routes 

@api.route('/tasks', methods=['GET'])
@jwt_required()
@handle_errors
def get_tasks():
    tasks = Task.query.all()
    return jsonify([task.serialize() for task in tasks]), 200

@api.route('/tasks', methods=['POST'])
@jwt_required()
@handle_errors
def create_task():
    data = request.json
    task = Task(**data)
    db.session.add(task)
    db.session.commit()
    return jsonify(task.serialize()), 201

@api.route('/tasks/<int:id>', methods=['PUT'])
@jwt_required()
@handle_errors
def update_task(id):
    task = Task.query.get_or_404(id)
    data = request.json
    for key, value in data.items():
        setattr(task, key, value)
    db.session.commit()
    return jsonify(task.serialize()), 200

@api.route('/tasks/<int:id>', methods=['DELETE'])
@jwt_required()
@handle_errors
def delete_task(id):
    task = Task.query.get_or_404(id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted successfully"}), 200

# deal routes

@api.route('/deals', methods=['GET'])
def get_deals():
    deals = Deal.query.all()
    grouped_deals = {}
    for deal in deals:
        grouped_deals.setdefault(deal.stage, []).append(deal.serialize())
    return jsonify(grouped_deals), 200

@api.route('/deals/<int:deal_id>', methods=['PUT'])
def update_deal_stage(deal_id):
    deal = Deal.query.get_or_404(deal_id)
    new_stage = request.json.get('stage')
    deal.stage = new_stage
    db.session.commit()
    return jsonify(deal.serialize()), 200

@api.route('/promotions/apply', methods=['POST'])
def apply_promotion():
    data = request.json
    original_price = data.get("original_price")
    promotion_id = data.get("promotion_id")

    promotion = PromotionalDeal.query.get_or_404(promotion_id)
    discounted_price = promotion.calculate_discount(original_price)
    final_price = promotion.calculate_tax(discounted_price)

    return jsonify({
        "original_price": original_price,
        "discounted_price": discounted_price,
        "final_price": final_price,
        "discount": promotion.discount,
        "tax_rate": promotion.tax_rate
    }), 200

@api.route('/promotions', methods=['POST'])
def create_promotion():
    data = request.json
    promotion = PromotionalDeal(
        title=data['title'],
        discount_percentage=data['discount_percentage'],
        tax_rate=data.get('tax_rate', 0.0),
        tier=data.get('tier', 'All'),
        start_date=data.get('start_date'),
        end_date=data.get('end_date')
    )
    db.session.add(promotion)
    db.session.commit()
    return jsonify(promotion.serialize()), 201

@api.route('/promotions', methods=['GET'])
def get_all_promotions():
    promotions = PromotionalDeal.query.all()
    return jsonify([promo.serialize() for promo in promotions]), 200

@api.route('/promotions/<int:id>', methods=['GET'])
def get_promotion(id):
    promotion = PromotionalDeal.query.get_or_404(id)
    return jsonify(promotion.serialize()), 200

@api.route('/promotions/<int:id>', methods=['PUT'])
def update_promotion(id):
    data = request.json
    promotion = PromotionalDeal.query.get_or_404(id)
    promotion.title = data['title']
    promotion.discount_percentage = data['discount_percentage']
    promotion.tax_rate = data.get('tax_rate', promotion.tax_rate)
    promotion.tier = data.get('tier', promotion.tier)
    promotion.start_date = data.get('start_date', promotion.start_date)
    promotion.end_date = data.get('end_date', promotion.end_date)
    db.session.commit()
    return jsonify(promotion.serialize()), 200

@api.route('/promotions/<int:id>', methods=['DELETE'])
def delete_promotion(id):
    promotion = PromotionalDeal.query.get_or_404(id)
    db.session.delete(promotion)
    db.session.commit()
    return jsonify({"message": "Promotion deleted successfully"}), 200


# inventory logs

@api.route('/inventory/logs', methods=['POST'])
@jwt_required()
def log_inventory():
    data = request.json
    log = InventoryLog(
        product_id=data['product_id'],
        transaction_type=data['transaction_type'],
        quantity=data['quantity'],
        reason=data.get('reason')
    )
    db.session.add(log)
    db.session.commit()
    return jsonify(log.serialize()), 201


@api.route('/predict-restock/<int:product_id>', methods=['GET'])
def get_restock_prediction(product_id):
    reorder_point = request.args.get('reorder_point', 10, type=int)
    
    # Calculate additional factors for prediction
    lead_time = calculate_lead_time(product_id)
    sales_velocity = calculate_sales_velocity(product_id)
    
    try:
        # Predict the restock date using available data
        restock_date = predict_restock(
            db=db,
            product_id=product_id,
            reorder_point=reorder_point,
            lead_time=lead_time,
            sales_velocity=sales_velocity
        )
        return jsonify({
            "product_id": product_id,
            "restock_date": restock_date,
            "lead_time": lead_time,
            "sales_velocity": sales_velocity
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/update-stock/<int:product_id>', methods=['POST'])
def update_stock(product_id):
    data = request.json
    product = Product.query.get_or_404(product_id)
    product.current_stock = data['current_stock']
    db.session.commit()

    # Emit WebSocket event for inventory update
    socketio.emit('inventory_updated', {
        'product_id': product.id,
        'current_stock': product.current_stock
    }, broadcast=True)

    # Check for low stock and send alerts
    check_and_alert_low_stock()

    return jsonify({"message": "Stock updated"}), 200

@api.route('/inventory/<int:location_id>', methods=['GET'])
def get_inventory(location_id):
    inventories = Inventory.query.filter_by(location_id=location_id).all()
    return jsonify([inventory.serialize() for inventory in inventories]), 200

@api.route('/inventory/update', methods=['POST'])
def update_inventory():
    data = request.json
    location_id = data.get("location_id")
    product_id = data.get("product_id")
    stock = data.get("current_stock")

    inventory = Inventory.query.filter_by(location_id=location_id, product_id=product_id).first()
    if not inventory:
        inventory = Inventory(product_id=product_id, location_id=location_id, current_stock=stock, reorder_point=10)
        db.session.add(inventory)
    else:
        inventory.current_stock = stock
    db.session.commit()

    return jsonify({"message": "Inventory updated successfully."}), 200


@api.route('/get-stock/<int:product_id>', methods=['GET'])
def get_stock(product_id):
    product = Product.query.get(product_id)
    return jsonify(product.serialize()), 200

@api.route('/get-chat-token', methods=['POST'])
def get_chat_token():
    data = request.json
    identity = data.get('identity')

    twilio_account_sid = 'your_account_sid'
    twilio_api_key = 'your_api_key'
    twilio_api_secret = 'your_api_secret'
    chat_service_sid = 'your_chat_service_sid'

    token = AccessToken(twilio_account_sid, twilio_api_key, twilio_api_secret, identity=identity)
    chat_grant = ChatGrant(service_sid=chat_service_sid)
    token.add_grant(chat_grant)

    return jsonify({'token': token.to_jwt().decode('utf-8')}), 200

@socketio.on('custom_event')
def handle_custom_event(data):
    print(f"Received event data: {data}")
    socketio.emit('response_event', {'message': 'Response data'})

@api.route('/analytics/inventory-forecast', methods=['POST'])
def inventory_forecast():
    
    # Fetch sales data
    sales = db.session.query(Product.id, func.sum(OrderItem.quantity)).group_by(Product.id).all()
    product_ids = [s[0] for s in sales]
    quantities = [s[1] for s in sales]

    # Check if quantities data is available
    if len(quantities) == 0:
        return jsonify({"error": "No sales data available to forecast."}), 400

    # Train model to forecast future sales
    try:
        model = LinearRegression()
        X = np.arange(len(quantities)).reshape(-1, 1)
        y = np.array(quantities)
        model.fit(X, y)

        # Generate predictions for the next 5 periods
        future_X = np.arange(len(quantities), len(quantities) + 5).reshape(-1, 1)
        predictions = model.predict(future_X)

        # Return forecasted inventory levels
        forecast = [{"product_id": pid, "predicted_quantity": float(q)} for pid, q in zip(product_ids, predictions)]
        return jsonify(forecast), 200

    except Exception as e:
        return jsonify({"error": f"An error occurred during forecasting: {str(e)}"}), 500




# medical routes

@api.route('/medical/patients', methods=['GET'])
@jwt_required()
def get_patients():
    patients = Patient.query.all()
    return jsonify([patient.serialize() for patient in patients])


@api.route('/patients', methods=['POST'])
def add_patient():
    data = request.json
    new_patient = Patient(**data)
    db.session.add(new_patient)
    db.session.commit()
    return jsonify(new_patient.serialize()), 201

@api.route('/patients/<int:id>', methods=['GET'])
def get_patient(id):
    patient = Patient.query.get_or_404(id)
    return jsonify(patient.serialize()), 200

@api.route('/prescriptions', methods=['POST'])
def create_prescription():
    data = request.json
    new_prescription = Prescription(**data)
    db.session.add(new_prescription)
    db.session.commit()
    return jsonify(new_prescription.serialize()), 201

@api.route('/process_purchase', methods=['POST'])
def process_purchase():
    data = request.json
    patient = Patient.query.get(data['patient_id'])
    if patient.expiration_date < datetime.utcnow():
        return jsonify({"error": "Medical card expired"}), 400
    return jsonify({"message": "Purchase processed successfully"}), 200

@api.route('/medical/compliance', methods=['GET'])
@jwt_required()
def get_compliance_trends():
    # Example data for compliance trends
    trends = {
        "labels": ["January", "February", "March"],
        "datasets": [
            {
                "label": "Compliance Audits",
                "data": [5, 7, 4],
                "backgroundColor": ["#f87171", "#4ade80", "#60a5fa"],
            }
        ],
    }
    return jsonify(trends)

@api.route('/reports', methods=['GET'])
@jwt_required()
def get_reports():
    report_type = request.args.get('type', 'all')  # Default to 'all' if no type is specified
    reports = Report.query
    if report_type != 'all':
        reports = reports.filter_by(type=report_type)
    reports = reports.order_by(Report.created_at.desc()).all()
    return jsonify([report.serialize() for report in reports]), 200

@api.route('/reports/generate', methods=['POST'])
@jwt_required()
def generate_report():
    data = request.json
    report_type = data.get('type')
    filters = data.get('filters', {})

    # Example: Implement your logic to generate the report
    if report_type == 'sales':
        # Logic for generating a sales report
        pass
    elif report_type == 'inventory':
        # Logic for generating an inventory report
        pass
    else:
        return jsonify({"error": "Invalid report type"}), 400

    # Save the report to the database
    report = Report(type=report_type, filters=filters, created_at=datetime.utcnow())
    db.session.add(report)
    db.session.commit()
    return jsonify(report.serialize()), 201

@api.route('/reports/export/<int:id>', methods=['GET'])
@jwt_required()
def export_report(id):
    format = request.args.get('format', 'pdf')  # Default format is PDF
    report = Report.query.get_or_404(id)

    # Generate export (PDF or CSV)
    if format == 'pdf':
        # Logic to generate PDF file
        pass
    elif format == 'csv':
        # Logic to generate CSV file
        pass
    else:
        return jsonify({"error": "Invalid format"}), 400

    # Return the exported file as a response
    return send_file(exported_file_path, as_attachment=True), 200



@api.route('/compliance/reports', methods=['GET'])
def generate_compliance_report():
    transactions = Transaction.query.all()
    report = [{"id": t.id, "amount": t.amount, "date": t.date.isoformat()} for t in transactions]
    return jsonify(report), 200

@api.route('/analytics/medical', methods=['GET'])
def get_medical_analytics():
    total_patients = Patient.query.count()
    total_prescriptions = Prescription.query.count()
    return jsonify({
        "total_patients": total_patients,
        "total_prescriptions": total_prescriptions
    }), 200

@api.route('/symptoms', methods=['GET'])
def get_symptoms():
    symptoms = Symptom.query.all()
    return jsonify([symptom.serialize() for symptom in symptoms]), 200

@api.route('/symptoms/<int:id>', methods=['GET'])
def get_symptom(id):
    symptom = Symptom.query.get_or_404(id)
    return jsonify(symptom.serialize()), 200

@api.route('/symptoms', methods=['POST'])
def create_symptom():
    data = request.json
    symptom = Symptom(
        patient_id=data['patient_id'],
        name=data['name'],
        severity=data['severity'],
        description=data.get('description')
    )
    db.session.add(symptom)
    db.session.commit()
    return jsonify(symptom.serialize()), 201

@api.route('/symptoms/<int:id>', methods=['PUT'])
def update_symptom(id):
    symptom = Symptom.query.get_or_404(id)
    data = request.json
    for key, value in data.items():
        setattr(symptom, key, value)
    db.session.commit()
    return jsonify(symptom.serialize()), 200

@api.route('/symptoms/<int:id>', methods=['DELETE'])
def delete_symptom(id):
    symptom = Symptom.query.get_or_404(id)
    db.session.delete(symptom)
    db.session.commit()
    return jsonify({"message": "Symptom deleted successfully"}), 200

@api.route('/medical-resources', methods=['GET'])
def get_medical_resources():
    resources = MedicalResource.query.all()
    return jsonify([resource.serialize() for resource in resources]), 200

@api.route('/medical-resources/<int:id>', methods=['GET'])
def get_medical_resource(id):
    resource = MedicalResource.query.get_or_404(id)
    return jsonify(resource.serialize()), 200

@api.route('/medical-resources', methods=['POST'])
def create_medical_resource():
    data = request.json
    resource = MedicalResource(
        title=data['title'],
        content=data['content'],
        type=data['type'],
        link=data.get('link')
    )
    db.session.add(resource)
    db.session.commit()
    return jsonify(resource.serialize()), 201

@api.route('/medical-resources/<int:id>', methods=['PUT'])
def update_medical_resource(id):
    resource = MedicalResource.query.get_or_404(id)
    data = request.json
    for key, value in data.items():
        setattr(resource, key, value)
    db.session.commit()
    return jsonify(resource.serialize()), 200

@api.route('/medical-resources/<int:id>', methods=['DELETE'])
def delete_medical_resource(id):
    resource = MedicalResource.query.get_or_404(id)
    db.session.delete(resource)
    db.session.commit()
    return jsonify({"message": "Medical resource deleted successfully"}), 200



    return send_file(buffer, as_attachment=True, download_name=f"receipt_{order_id}.pdf", mimetype='application/pdf')

@api.route('/appointments', methods=['GET'])
def get_appointments():
    appointments = Appointment.query.all()
    return jsonify([appointment.serialize() for appointment in appointments]), 200

@api.route('/appointments/<int:appointment_id>', methods=['GET'])
def get_appointment(appointment_id):
    appointment = Appointment.query.get_or_404(appointment_id)
    return jsonify(appointment.serialize()), 200

@api.route('/appointments', methods=['POST'])
def create_appointment():
    data = request.get_json()
    appointment = Appointment(
        patient_id=data['patient_id'],
        physician_id=data['physician_id'],
        appointment_date=data['appointment_date'],
        status=data.get('status', 'Scheduled'),
        notes=data.get('notes')
    )
    db.session.add(appointment)
    db.session.commit()
    return jsonify(appointment.serialize()), 201

@api.route('/appointments/<int:appointment_id>', methods=['PUT'])
def update_appointment(appointment_id):
    data = request.get_json()
    appointment = Appointment.query.get_or_404(appointment_id)
    appointment.status = data.get('status', appointment.status)
    appointment.notes = data.get('notes', appointment.notes)
    db.session.commit()
    return jsonify(appointment.serialize()), 200

@api.route('/appointments/<int:appointment_id>', methods=['DELETE'])
def delete_appointment(appointment_id):
    appointment = Appointment.query.get_or_404(appointment_id)
    db.session.delete(appointment)
    db.session.commit()
    return jsonify({"message": "Appointment deleted"}), 200

@api.route('/insurances', methods=['GET'])
def get_insurances():
    insurances = Insurance.query.all()
    return jsonify([insurance.serialize() for insurance in insurances]), 200

@api.route('/insurances/<int:insurance_id>', methods=['GET'])
def get_insurance(insurance_id):
    insurance = Insurance.query.get_or_404(insurance_id)
    return jsonify(insurance.serialize()), 200

@api.route('/insurances', methods=['POST'])
def create_insurance():
    data = request.get_json()
    insurance = Insurance(
        patient_id=data['patient_id'],
        provider_name=data['provider_name'],
        policy_number=data['policy_number'],
        coverage_details=data.get('coverage_details')
    )
    db.session.add(insurance)
    db.session.commit()
    return jsonify(insurance.serialize()), 201

@api.route('/insurances/<int:insurance_id>', methods=['PUT'])
def update_insurance(insurance_id):
    data = request.get_json()
    insurance = Insurance.query.get_or_404(insurance_id)
    insurance.provider_name = data.get('provider_name', insurance.provider_name)
    insurance.policy_number = data.get('policy_number', insurance.policy_number)
    insurance.coverage_details = data.get('coverage_details', insurance.coverage_details)
    db.session.commit()
    return jsonify(insurance.serialize()), 200

@api.route('/insurances/<int:insurance_id>', methods=['DELETE'])
def delete_insurance(insurance_id):
    insurance = Insurance.query.get_or_404(insurance_id)
    db.session.delete(insurance)
    db.session.commit()
    return jsonify({"message": "Insurance deleted"}), 200

@api.route('/education-resources', methods=['GET'])
def get_education_resources():
    resources = PatientEducationResource.query.all()
    return jsonify([resource.serialize() for resource in resources]), 200

@api.route('/education-resources/<int:resource_id>', methods=['GET'])
def get_education_resource(resource_id):
    resource = PatientEducationResource.query.get_or_404(resource_id)
    return jsonify(resource.serialize()), 200

@api.route('/education-resources', methods=['POST'])
def create_education_resource():
    data = request.get_json()
    resource = PatientEducationResource(
        title=data['title'],
        content=data['content'],
        resource_type=data['resource_type'],
        link=data.get('link')
    )
    db.session.add(resource)
    db.session.commit()
    return jsonify(resource.serialize()), 201

@api.route('/education-resources/<int:resource_id>', methods=['PUT'])
def update_education_resource(resource_id):
    data = request.get_json()
    resource = PatientEducationResource.query.get_or_404(resource_id)
    resource.title = data.get('title', resource.title)
    resource.content = data.get('content', resource.content)
    resource.resource_type = data.get('resource_type', resource.resource_type)
    resource.link = data.get('link', resource.link)
    db.session.commit()
    return jsonify(resource.serialize()), 200

@api.route('/education-resources/<int:resource_id>', methods=['DELETE'])
def delete_education_resource(resource_id):
    resource = PatientEducationResource.query.get_or_404(resource_id)
    db.session.delete(resource)
    db.session.commit()
    return jsonify({"message": "Resource deleted"}), 200

@api.route('/training-resources', methods=['GET'])
def get_training_resources():
    resources = StaffTrainingResource.query.all()
    return jsonify([resource.serialize() for resource in resources]), 200

@api.route('/training-resources/<int:resource_id>', methods=['GET'])
def get_training_resource(resource_id):
    resource = StaffTrainingResource.query.get_or_404(resource_id)
    return jsonify(resource.serialize()), 200

@api.route('/training-resources', methods=['POST'])
def create_training_resource():
    data = request.get_json()
    resource = StaffTrainingResource(
        title=data['title'],
        content=data['content'],
        resource_type=data['resource_type'],
        link=data.get('link')
    )
    db.session.add(resource)
    db.session.commit()
    return jsonify(resource.serialize()), 201

@api.route('/training-resources/<int:resource_id>', methods=['PUT'])
def update_training_resource(resource_id):
    data = request.get_json()
    resource = StaffTrainingResource.query.get_or_404(resource_id)
    resource.title = data.get('title', resource.title)
    resource.content = data.get('content', resource.content)
    resource.resource_type = data.get('resource_type', resource.resource_type)
    resource.link = data.get('link', resource.link)
    db.session.commit()
    return jsonify(resource.serialize()), 200

@api.route('/training-resources/<int:resource_id>', methods=['DELETE'])
def delete_training_resource(resource_id):
    resource = StaffTrainingResource.query.get_or_404(resource_id)
    db.session.delete(resource)
    db.session.commit()
    return jsonify({"message": "Resource deleted"}), 200


# loyalty program

@api.route('/loyalty/points/<int:customer_id>', methods=['GET'])
@jwt_required()
def get_loyalty_points(customer_id):
    customer = Customer.query.get_or_404(customer_id)
    return jsonify({"loyalty_points": customer.loyalty_points}), 200

@api.route('/loyalty/points/earn', methods=['POST'])
@jwt_required()
def earn_loyalty_points():
    data = request.json
    customer = Customer.query.get_or_404(data['customer_id'])
    points_earned = int(data['amount_spent'] / 10)  # Example: $10 = 1 point
    customer.loyalty_points += points_earned
    db.session.commit()
    return jsonify({"message": f"{points_earned} points added.", "loyalty_points": customer.loyalty_points}), 200

@api.route('/loyalty/points/redeem', methods=['POST'])
@jwt_required()
def redeem_loyalty_points():
    data = request.json
    customer = Customer.query.get_or_404(data['customer_id'])
    points_to_redeem = data['points']
    if points_to_redeem > customer.loyalty_points:
        return jsonify({"error": "Insufficient points"}), 400
    customer.loyalty_points -= points_to_redeem
    db.session.commit()
    return jsonify({"message": f"{points_to_redeem} points redeemed.", "loyalty_points": customer.loyalty_points}), 200

@socketio.on('connect')
def handle_connect():
    emit('status', {'message': 'Connected to the server!'})


#   loyalty program    


@api.route('/loyalty/referrals', methods=['POST'])
@jwt_required()
def handle_referral():
    data = request.json
    referrer = Customer.query.get_or_404(data['referrer_id'])
    referred = Customer.query.get_or_404(data['referred_id'])
    points = 50  # Example referral reward
    referrer.loyalty_points += points
    db.session.commit()
    return jsonify({"message": f"{points} points awarded to referrer.", "referrer": referrer.serialize()}), 200

@api.route('/loyalty/upgrade-tier/<int:customer_id>', methods=['POST'])
def upgrade_tier(customer_id):
    customer = Customer.query.get_or_404(customer_id)
    if customer.loyalty_points >= 1000:
        customer.loyalty_tier = 'Gold'
    elif customer.loyalty_points >= 500:
        customer.loyalty_tier = 'Silver'
    else:
        customer.loyalty_tier = 'Bronze'
    db.session.commit()
    return jsonify({"message": "Tier upgraded successfully", "customer": customer.serialize()}), 200



@api.route('/loyalty/add-points', methods=['POST'])
@jwt_required()
@handle_errors
def add_loyalty_points():
    data = request.json
    customer_id = data['customer_id']
    points = data['points']
    loyalty = LoyaltyProgram.query.filter_by(customer_id=customer_id).first()
    
    if not loyalty:
        loyalty = LoyaltyProgram(customer_id=customer_id, points=0)
        db.session.add(loyalty)
    
    loyalty.points += points
    db.session.commit()
    return jsonify({"message": "Points added successfully", "points": loyalty.points}), 200

@api.route('/loyalty/rewards', methods=['GET'])
@jwt_required()
def get_rewards():
    rewards = Reward.query.all()
    return jsonify([reward.serialize() for reward in rewards]), 200

@api.route('/loyalty/rewards/redeem', methods=['POST'])
@jwt_required()
def redeem_reward():
    data = request.json
    customer = Customer.query.get_or_404(data['customer_id'])
    reward = Reward.query.get_or_404(data['reward_id'])
    
    if customer.loyalty_points < reward.point_cost:
        return jsonify({"error": "Insufficient points"}), 400
    
    customer.loyalty_points -= reward.point_cost
    db.session.commit()
    return jsonify({"message": f"Redeemed {reward.name}", "remaining_points": customer.loyalty_points}), 200

@api.route('/loyalty/expire-points', methods=['POST'])
def expire_loyalty_points():
    now = datetime.utcnow()
    expired_customers = Customer.query.filter(Customer.points_expiry <= now).all()
    for customer in expired_customers:
        customer.loyalty_points = 0
    db.session.commit()
    return jsonify({"message": "Expired points cleaned up"}), 200

@api.route('/loyalty/transfer-points', methods=['POST'])
@jwt_required()
def transfer_points():
    data = request.json
    sender = Customer.query.get_or_404(data['sender_id'])
    receiver = Customer.query.get_or_404(data['receiver_id'])
    points = data['points']
    
    if sender.loyalty_points < points:
        return jsonify({"error": "Insufficient points"}), 400
    
    sender.loyalty_points -= points
    receiver.loyalty_points += points
    db.session.commit()
    return jsonify({"message": f"{points} points transferred.", "sender_points": sender.loyalty_points, "receiver_points": receiver.loyalty_points}), 200J



@api.route('/cash/drawer', methods=['POST'])
@jwt_required()
def create_cash_drawer():
    data = request.json
    drawer = CashDrawer(total_cash=data['start_balance'], start_balance=data['start_balance'])
    db.session.add(drawer)
    db.session.commit()
    return jsonify(drawer.serialize()), 201

@api.route('/cash/transaction', methods=['POST'])
@jwt_required()
def log_cash_transaction():
    data = request.json
    log = CashLog(drawer_id=data['drawer_id'], type=data['type'], amount=data['amount'])
    drawer = CashDrawer.query.get(data['drawer_id'])
    drawer.total_cash += data['amount'] if data['type'] == "deposit" else -data['amount']
    db.session.add(log)
    db.session.commit()
    return jsonify(log.serialize()), 201

@api.route('/recall/<string:batch_number>', methods=['POST'])
@jwt_required()
def recall_batch(batch_number):
    # Example logic
    batch = Product.query.filter_by(batch_number=batch_number).first()
    if not batch:
        return jsonify({"error": "Batch not found"}), 404

    # Mark batch as recalled
    batch.is_recalled = True
    db.session.commit()

    # Notify customers or perform additional actions
    return jsonify({"message": f"Batch {batch_number} has been recalled."}), 200

# Business Routes
# ---------------------
@api.route('/businesses', methods=['GET'])
@jwt_required()
def get_businesses():
    businesses = Business.query.all()
    return jsonify([business.serialize() for business in businesses]), 200


@api.route('/businesses/<int:id>', methods=['GET'])
@jwt_required()
def get_business(id):
    business = Business.query.get_or_404(id)
    return jsonify(business.serialize()), 200


@api.route('/businesses', methods=['POST'])
@jwt_required()
def create_business():
    data = request.json
    business = Business(
        name=data['name'],
        address=data['address'],
        city=data['city'],
        state=data['state'],
        zip_code=data['zip_code'],
        phone=data['phone'],
        email=data.get('email'),
        license_number=data['license_number'],
        license_expiry=datetime.strptime(data['license_expiry'], '%Y-%m-%d'),
        status=data.get('status', 'active')
    )
    db.session.add(business)
    db.session.commit()
    return jsonify(business.serialize()), 201


@api.route('/businesses/<int:id>', methods=['PUT'])
@jwt_required()
def update_business(id):
    business = Business.query.get_or_404(id)
    data = request.json
    for key, value in data.items():
        setattr(business, key, value)
    db.session.commit()
    return jsonify(business.serialize()), 200


@api.route('/businesses/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_business(id):
    business = Business.query.get_or_404(id)
    db.session.delete(business)
    db.session.commit()
    return jsonify({"message": "Business deleted successfully"}), 200


# ---------------------
# Invoice Routes

@api.route('/invoices', methods=['GET'])
@jwt_required()
def get_invoices():
    customer_id = request.args.get('customer_id')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    if customer_id:
        query = Invoice.query.filter_by(customer_id=customer_id)
    else:
        query = Invoice.query

    invoices = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "invoices": [invoice.serialize() for invoice in invoices.items],
        "total": invoices.total,
        "pages": invoices.pages,
        "current_page": invoices.page
    }), 200




@api.route('/invoices', methods=['POST'])
@jwt_required()
def create_invoice():
    data = request.json
    invoice = Invoice(
        customer_id=data['customer_id'],
        order_id=data['order_id'],
        total_amount=data['total_amount'],
        due_date=datetime.strptime(data['due_date'], '%Y-%m-%d') if 'due_date' in data else None,
        payment_method=data.get('payment_method'),
        notes=data.get('notes')
    )
    db.session.add(invoice)
    db.session.commit()
    return jsonify(invoice.serialize()), 201


@api.route('/invoices/<int:id>', methods=['PUT'])
@jwt_required()
def update_invoice(id):
    invoice = Invoice.query.get_or_404(id)
    data = request.json
    for key, value in data.items():
        setattr(invoice, key, value)
    db.session.commit()
    return jsonify(invoice.serialize()), 200


@api.route('/invoices/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_invoice(id):
    invoice = Invoice.query.get_or_404(id)
    db.session.delete(invoice)
    db.session.commit()
    return jsonify({"message": "Invoice deleted successfully"}), 200


# ---------------------
# Run App
# ---------------------
if __name__ == '__main__':
    db.create_all()  # Ensure tables are created before running
    api.run(debug=True)

# Dispensary Routes
@api.route('/dispensaries', methods=['POST'])
def add_dispensary():
    try:
        data = request.json
        dispensary = Dispensary(**data)
        db.session.add(dispensary)
        db.session.commit()
        return jsonify(dispensary.serialize()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@api.route('/dispensaries', methods=['GET'])
def get_dispensaries():
    dispensaries = Dispensary.query.all()
    return jsonify([dispensary.serialize() for dispensary in dispensaries]), 200

@api.route('/dispensaries/<int:id>', methods=['PUT'])
def update_dispensary(id):
    try:
        data = request.json
        dispensary = Dispensary.query.get_or_404(id)
        for key, value in data.items():
            setattr(dispensary, key, value)
        db.session.commit()
        return jsonify(dispensary.serialize()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@api.route('/dispensaries/<int:id>', methods=['DELETE'])
def delete_dispensary(id):
    try:
        dispensary = Dispensary.query.get_or_404(id)
        db.session.delete(dispensary)
        db.session.commit()
        return jsonify({"message": "Dispensary deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Pricing Routes
# @api.route('/pricing', methods=['POST'])
# def add_pricing():
#     try:
#         data = request.json
#         pricing = Pricing(**data)
#         db.session.add(pricing)
#         db.session.commit()
#         return jsonify(pricing.serialize()), 201
#     except Exception as e:
#         return jsonify({"error": str(e)}), 400

# @api.route('/prices', methods=['GET'])
# def get_prices():
#     # Query Parameters
#     product_name = request.args.get('product_name')
#     location = request.args.get('location')
#     sort_by = request.args.get('sort_by', 'price')  # Default sorting by price
#     real_time = request.args.get('real_time', 'false').lower() == 'true'  # Flag for real-time updates

#     # Base Query
#     query = db.session.query(
#         Product.name.label('product_name'),
#         Product.strain,
#         Product.thc_content,
#         Product.cbd_content,
#         Pricing.price,
#         Pricing.availability,
#         Dispensary.name.label('dispensary_name'),
#         Dispensary.location,
#         Product.medical_benefits,
#         Product.is_organic
#     ).join(Pricing, Product.id == Pricing.product_id)\
#      .join(Dispensary, Dispensary.id == Pricing.dispensary_id)

#     # Apply Filters
#     if product_name:
#         query = query.filter(Product.name.ilike(f"%{product_name}%"))
#     if location:
#         query = query.filter(Dispensary.location.ilike(f"%{location}%"))

#     # Sorting Logic
#     if sort_by == 'price':
#         query = query.order_by(Pricing.price.asc())
#     elif sort_by == 'thc_content':
#         query = query.order_by(Product.thc_content.desc())

#     # Fetch Results
#     results = query.all()

#     # Prepare Response
#     response = [
#         {
#             "product_name": row.product_name,
#             "strain": row.strain,
#             "thc_content": row.thc_content,
#             "cbd_content": row.cbd_content,
#             "price": float(row.price),
#             "availability": row.availability,
#             "dispensary_name": row.dispensary_name,
#             "location": row.location
#         }
#         for row in results
#     ]

#     # Real-Time Updates (Optional WebSocket Integration)
#     if real_time:
#         # Emit data to a WebSocket if required
#         # socketio.emit('real_time_price_update', response)
#         pass

#     return jsonify(response), 200

@api.route('/pricing/<int:id>', methods=['DELETE'])
def delete_pricing(id):
    try:
        pricing = Pricing.query.get_or_404(id)
        db.session.delete(pricing)
        db.session.commit()
        return jsonify({"message": "Pricing entry deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# @api.route('/prices', methods=['GET'])
# def get_prices():
#     product_name = request.args.get('product_name')
#     location = request.args.get('location')
#     sort_by = request.args.get('sort_by', 'price')  # Default sorting by price
#     medical_benefits = request.args.get('medical_benefits')
#     organic_certified = request.args.get('organic_certified', type=bool)
#     on_sale = request.args.get('on_sale', type=bool)

#     # Base query
#     query = db.session.query(
#         Product.name.label('product_name'),
#         Product.strain,
#         Product.thc_content,
#         Product.cbd_content,
#         Pricing.price,
#         Pricing.availability,
#         Dispensary.name.label('dispensary_name'),
#         Dispensary.location,
#         Product.medical_benefits,
#         Product.is_organic
#     ).join(Dispensary, Product.id == Pricing.product_id)\
#      .join(Pricing, Dispensary.id == Pricing.dispensary_id)

#     # Apply filters
#     if product_name:
#         query = query.filter(Product.name.ilike(f"%{product_name}%"))
#     if location:
#         query = query.filter(Dispensary.location.ilike(f"%{location}%"))
#     if medical_benefits:
#         query = query.filter(Product.medical_benefits.ilike(f"%{medical_benefits}%"))
#     if organic_certified is not None:
#         query = query.filter(Product.is_organic == organic_certified)
#     if on_sale:
#         query = query.filter(Pricing.price < Product.unit_price)

#     # Apply sorting
#     if sort_by == 'price':
#         query = query.order_by(Pricing.price.asc())
#     elif sort_by == 'thc_content':
#         query = query.order_by(Product.thc_content.desc())

#     results = query.all()

#     # Add loyalty points and reviews to the response
#     response = []
#     for product_name, strain, thc_content, cbd_content, price, availability, dispensary_name, location, medical_benefits, is_organic in results:
#         # Calculate estimated loyalty points
#         loyalty_points = int(price / 10)  # Example: $10 = 1 point
        
#         # Fetch reviews (dummy placeholder for now)
#         reviews = [
#             {"rating": 5, "comment": "Amazing product!"},
#             {"rating": 4, "comment": "Great value."}
#         ]

#         response.append({
#             "product_name": product_name,
#             "strain": strain,
#             "thc_content": thc_content,
#             "cbd_content": cbd_content,
#             "price": float(price),
#             "availability": availability,
#             "dispensary_name": dispensary_name,
#             "location": location,
#             "medical_benefits": medical_benefits,
#             "is_organic": is_organic,
#             "loyalty_points": loyalty_points,
#             "reviews": reviews
#         })

#     return jsonify(response), 200

# Non-Medical Prices Route
@api.route('/prices/non-medical', methods=['GET'])
def get_non_medical_prices():
    product_name = request.args.get('product_name')
    location = request.args.get('location')
    sort_by = request.args.get('sort_by', 'price')  # Default sorting by price
    organic_certified = request.args.get('organic_certified', type=bool)
    on_sale = request.args.get('on_sale', type=bool)

    # Base query for non-medical products
    query = db.session.query(
        Product.name.label('product_name'),
        Product.strain,
        Product.thc_content,
        Product.cbd_content,
        Pricing.price,
        Pricing.availability,
        Dispensary.name.label('dispensary_name'),
        Dispensary.location,
        Product.is_organic
    ).join(Pricing, Product.id == Pricing.product_id)\
     .join(Dispensary, Dispensary.id == Pricing.dispensary_id)\
     .filter(Product.category == 'non-medical')  # Filter for non-medical products

    # Apply filters
    if product_name:
        query = query.filter(Product.name.ilike(f"%{product_name}%"))
    if location:
        query = query.filter(Dispensary.location.ilike(f"%{location}%"))
    if organic_certified is not None:
        query = query.filter(Product.is_organic == organic_certified)
    if on_sale:
        query = query.filter(Pricing.price < Product.unit_price)

    # Apply sorting
    if sort_by == 'price':
        query = query.order_by(Pricing.price.asc())
    elif sort_by == 'thc_content':
        query = query.order_by(Product.thc_content.desc())

    # Fetch results
    results = query.all()

    # Prepare response
    response = [
        {
            "product_name": row.product_name,
            "strain": row.strain,
            "thc_content": row.thc_content,
            "cbd_content": row.cbd_content,
            "price": float(row.price),
            "availability": row.availability,
            "dispensary_name": row.dispensary_name,
            "location": row.location,
            "is_organic": row.is_organic,
        }
        for row in results
    ]

    return jsonify(response), 200


# Medical Prices Route
@api.route('/prices/medical', methods=['GET'])
def get_medical_prices():
    product_name = request.args.get('product_name')
    location = request.args.get('location')
    sort_by = request.args.get('sort_by', 'price')  # Default sorting by price
    medical_benefits = request.args.get('medical_benefits')

    # Base query for medical products
    query = db.session.query(
        Product.name.label('product_name'),
        Product.strain,
        Product.thc_content,
        Product.cbd_content,
        Pricing.price,
        Pricing.availability,
        Dispensary.name.label('dispensary_name'),
        Dispensary.location,
        Product.medical_benefits
    ).join(Pricing, Product.id == Pricing.product_id)\
     .join(Dispensary, Dispensary.id == Pricing.dispensary_id)\
     .filter(Product.category == 'medical')  # Filter for medical products

    # Apply filters
    if product_name:
        query = query.filter(Product.name.ilike(f"%{product_name}%"))
    if location:
        query = query.filter(Dispensary.location.ilike(f"%{location}%"))
    if medical_benefits:
        query = query.filter(Product.medical_benefits.ilike(f"%{medical_benefits}%"))

    # Apply sorting
    if sort_by == 'price':
        query = query.order_by(Pricing.price.asc())
    elif sort_by == 'thc_content':
        query = query.order_by(Product.thc_content.desc())

    # Fetch results
    results = query.all()

    # Prepare response
    response = [
        {
            "product_name": row.product_name,
            "strain": row.strain,
            "thc_content": row.thc_content,
            "cbd_content": row.cbd_content,
            "price": float(row.price),
            "availability": row.availability,
            "dispensary_name": row.dispensary_name,
            "location": row.location,
            "medical_benefits": row.medical_benefits,
        }
        for row in results
    ]

    return jsonify(response), 200

# Helper Function for Query Logic
def fetch_prices(product_name=None, location=None, sort_by='price'):
    query = db.session.query(
        Product.name.label('product_name'),
        Product.strain,
        Product.thc_content,
        Product.cbd_content,
        Pricing.price,
        Pricing.availability,
        Dispensary.name.label('dispensary_name'),
        Dispensary.location
    ).join(Pricing, Product.id == Pricing.product_id)\
     .join(Dispensary, Dispensary.id == Pricing.dispensary_id)

    if product_name:
        query = query.filter(Product.name.ilike(f"%{product_name}%"))
    if location:
        query = query.filter(Dispensary.location.ilike(f"%{location}%"))

    if sort_by == 'price':
        query = query.order_by(Pricing.price.asc())
    elif sort_by == 'thc_content':
        query = query.order_by(Product.thc_content.desc())

    return query.all()

# HTTP Endpoint for Initial Data Fetch
@api.route('/prices', methods=['GET'])
def get_real_time_prices():
    product_name = request.args.get('product_name', None)
    location = request.args.get('location', None)
    sort_by = request.args.get('sort_by', 'price')

    results = fetch_prices(product_name, location, sort_by)
    response = [
        {
            "product_name": row.product_name,
            "strain": row.strain,
            "thc_content": row.thc_content,
            "cbd_content": row.cbd_content,
            "price": float(row.price),
            "availability": row.availability,
            "dispensary_name": row.dispensary_name,
            "location": row.location
        }
        for row in results
    ]

    return jsonify(response), 200

# WebSocket Endpoint for Real-Time Updates
@socketio.on('request_real_time_prices')
def handle_real_time_prices(data):
    product_name = data.get('product_name', None)
    location = data.get('location', None)
    sort_by = data.get('sort_by', 'price')

    results = fetch_prices(product_name, location, sort_by)
    response = [
        {
            "product_name": row.product_name,
            "strain": row.strain,
            "thc_content": row.thc_content,
            "cbd_content": row.cbd_content,
            "price": float(row.price),
            "availability": row.availability,
            "dispensary_name": row.dispensary_name,
            "location": row.location
        }
        for row in results
    ]

    # Emit the response back to the client
    socketio.emit('real_time_price_update', response)

@api.route('/products/compare-prices', methods=['GET'])
def compare_prices():
    product_name = request.args.get('product_name', None)
    location = request.args.get('location', None)
    sort_by = request.args.get('sort_by', 'price')

    if not product_name:
        return jsonify({"error": "Product name is required for price comparison"}), 400

    results = fetch_prices(product_name, location, sort_by)
    if not results:
        return jsonify({"message": "No products found for comparison"}), 404

    response = [
        {
            "product_name": row.product_name,
            "strain": row.strain,
            "thc_content": row.thc_content,
            "cbd_content": row.cbd_content,
            "price": float(row.price),
            "availability": row.availability,
            "dispensary_name": row.dispensary_name,
            "location": row.location
        }
        for row in results
    ]

    lowest_price = min(response, key=lambda x: x['price'])

    # Emit real-time updates if WebSocket is implemented
    socketio.emit('real_time_price_update', {
        "lowest_price": lowest_price,
        "all_prices": response
    })

    return jsonify({
        "lowest_price": lowest_price,
        "all_prices": response
    }), 200




@api.route('/reviews', methods=['POST'])
@jwt_required()
def create_review():
    data = request.json
    review = Review(
        product_id=data['product_id'],
        dispensary_id=data['dispensary_id'],
        customer_id=get_jwt_identity(),
        rating=data['rating'],
        comment=data.get('comment')
    )
    db.session.add(review)
    db.session.commit()
    return jsonify(review.serialize()), 201

@api.route('/reviews/sentiment', methods=['POST'])
def analyze_sentiment():
    reviews = request.json.get('reviews', [])
    sentiment_results = []

    for review in reviews:
        analysis = TextBlob(review)
        sentiment_results.append({
            'review': review,
            'polarity': analysis.sentiment.polarity,
            'subjectivity': analysis.sentiment.subjectivity,
            'sentiment': 'positive' if analysis.sentiment.polarity > 0 else 'negative' if analysis.sentiment.polarity < 0 else 'neutral'
        })

    return jsonify(sentiment_results), 200


# grow farm routes

# Get all grow farms
@api.route('/growfarms', methods=['GET'])
def get_all_growfarms():
    grow_farms = GrowFarm.query.all()
    return jsonify([farm.serialize() for farm in grow_farms]), 200

# Get a single grow farm by ID
@api.route('/growfarms/<int:id>', methods=['GET'])
def get_growfarm(id):
    grow_farm = GrowFarm.query.get_or_404(id)
    return jsonify(grow_farm.serialize()), 200

# Create a new grow farm
@api.route('/growfarms', methods=['POST'])
def create_growfarm():
    data = request.json
    new_farm = GrowFarm(
        name=data['name'],
        location=data.get('location'),
        contact_info=data.get('contact_info'),
        status=data.get('status', 'active')
    )
    db.session.add(new_farm)
    db.session.commit()
    return jsonify(new_farm.serialize()), 201

# Update an existing grow farm
@api.route('/growfarms/<int:id>', methods=['PUT'])
def update_growfarm(id):
    grow_farm = GrowFarm.query.get_or_404(id)
    data = request.json
    for key, value in data.items():
        setattr(grow_farm, key, value)
    db.session.commit()
    return jsonify(grow_farm.serialize()), 200

# Delete a grow farm
@api.route('/growfarms/<int:id>', methods=['DELETE'])
def delete_growfarm(id):
    grow_farm = GrowFarm.query.get_or_404(id)
    db.session.delete(grow_farm)
    db.session.commit()
    return jsonify({"message": "Grow farm deleted successfully"}), 200

@api.route('/plant_batches', methods=['GET', 'POST'])
def manage_plant_batches():
    if request.method == 'GET':
        batches = PlantBatch.query.all()
        return jsonify([batch.serialize() for batch in batches])
    elif request.method == 'POST':
        data = request.json
        batch = PlantBatch(**data)
        db.session.add(batch)
        db.session.commit()
        return jsonify(batch.serialize()), 201

@api.route('/plant_batches/<int:batch_id>', methods=['GET', 'PUT', 'DELETE'])
def manage_single_batch(batch_id):
    batch = PlantBatch.query.get_or_404(batch_id)

    if request.method == 'GET':
        return jsonify(batch.serialize())
    elif request.method == 'PUT':
        data = request.json
        for key, value in data.items():
            setattr(batch, key, value)
        db.session.commit()
        return jsonify(batch.serialize()), 200
    elif request.method == 'DELETE':
        db.session.delete(batch)
        db.session.commit()
        return jsonify({"message": "Batch deleted successfully"}), 200

@api.route('/environment_data', methods=['GET', 'POST'])
def manage_environment_data():
    if request.method == 'GET':
        env_data = EnvironmentData.query.all()
        return jsonify([data.serialize() for data in env_data])
    elif request.method == 'POST':
        data = request.json
        env_record = EnvironmentData(**data)
        db.session.add(env_record)
        db.session.commit()
        return jsonify(env_record.serialize()), 201

@api.route('/grow_tasks', methods=['GET', 'POST'])
def manage_grow_tasks():
    if request.method == 'GET':
        tasks = GrowTask.query.all()
        return jsonify([task.serialize() for task in tasks])
    elif request.method == 'POST':
        data = request.json
        task = GrowTask(**data)
        db.session.add(task)
        db.session.commit()
        return jsonify(task.serialize()), 201

@api.route('/grow_tasks/<int:task_id>', methods=['GET', 'PUT', 'DELETE'])
def manage_single_grow_task(task_id):
    task = GrowTask.query.get_or_404(task_id)

    if request.method == 'GET':
        return jsonify(task.serialize())
    elif request.method == 'PUT':
        data = request.json
        for key, value in data.items():
            setattr(task, key, value)
        db.session.commit()
        return jsonify(task.serialize()), 200
    elif request.method == 'DELETE':
        db.session.delete(task)
        db.session.commit()
        return jsonify({"message": "Task deleted successfully"}), 200

@api.route('/yield_predictions', methods=['GET', 'POST'])
def manage_yield_predictions():
    if request.method == 'GET':
        predictions = YieldPrediction.query.all()
        return jsonify([prediction.serialize() for prediction in predictions])
    elif request.method == 'POST':
        data = request.json
        prediction = YieldPrediction(**data)
        db.session.add(prediction)
        db.session.commit()
        return jsonify(prediction.serialize()), 201

@api.route('/yield_predictions/<int:prediction_id>', methods=['GET', 'PUT', 'DELETE'])
def manage_single_yield_prediction(prediction_id):
    prediction = YieldPrediction.query.get_or_404(prediction_id)

    if request.method == 'GET':
        return jsonify(prediction.serialize())
    elif request.method == 'PUT':
        data = request.json
        for key, value in data.items():
            setattr(prediction, key, value)
        db.session.commit()
        return jsonify(prediction.serialize()), 200
    elif request.method == 'DELETE':
        db.session.delete(prediction)
        db.session.commit()
        return jsonify({"message": "Yield prediction deleted successfully"}), 200

@api.route('/growfarms/overview', methods=['GET'])
def get_grow_farm_overview():
    total_farms = GrowFarm.query.count()
    active_batches = PlantBatch.query.filter_by(status="Growing").count()
    tasks_in_progress = GrowTask.query.filter_by(status="Pending").count()
    environment_warnings = EnvironmentData.query.filter(
        (EnvironmentData.temperature < 10) | 
        (EnvironmentData.humidity > 90)
    ).count()

    return jsonify({
        "totalFarms": total_farms,
        "activeBatches": active_batches,
        "tasksInProgress": tasks_in_progress,
        "environmentWarnings": environment_warnings
    }), 200

@api.route('/grow-tasks/assign', methods=['POST'])
def assign_grow_task():
    data = request.json
    task_id = data.get("taskId")
    worker_id = data.get("workerId")

    task = GrowTask.query.get_or_404(task_id)
    task.assigned_to = worker_id

    db.session.commit()
    return jsonify({"message": "Task assigned successfully"}), 200

@api.route('/notifications', methods=['GET'])
def get_notifications():
    warnings = EnvironmentData.query.filter(
        (EnvironmentData.temperature < 10) | 
        (EnvironmentData.humidity > 90)
    ).all()

    notifications = [
        {
            "type": "warning",
            "message": f"Threshold exceeded at {data.timestamp}: Temp {data.temperature}, Humidity {data.humidity}"
        }
        for data in warnings
    ]

    return jsonify(notifications), 200

@api.route('/resources', methods=['GET', 'POST'])
def manage_resources():
    if request.method == 'GET':
        resources = Resource.query.all()
        return jsonify([resource.serialize() for resource in resources]), 200
    elif request.method == 'POST':
        data = request.json
        resource = Resource(name=data['name'], quantity=data['quantity'])
        db.session.add(resource)
        db.session.commit()
        return jsonify(resource.serialize()), 201

@api.route('/resources/<int:resource_id>', methods=['PUT', 'DELETE'])
def manage_single_resource(resource_id):
    resource = Resource.query.get_or_404(resource_id)

    if request.method == 'PUT':
        data = request.json
        resource.name = data.get('name', resource.name)
        resource.quantity = data.get('quantity', resource.quantity)
        db.session.commit()
        return jsonify(resource.serialize()), 200

    elif request.method == 'DELETE':
        db.session.delete(resource)
        db.session.commit()
        return jsonify({"message": "Resource deleted successfully"}), 200

@api.route('/grow-tasks/schedule', methods=['GET'])
def get_task_schedule():
    tasks = GrowTask.query.all()
    schedule = [
        {
            "id": task.id,
            "name": task.task_name,
            "startDate": task.due_date.isoformat(),
            "endDate": (task.due_date + timedelta(hours=2)).isoformat()  # Example duration
        }
        for task in tasks
    ]

    return jsonify(schedule), 200


# Seedbank Routes

@api.route('/seedbanks', methods=['GET', 'POST'])
def manage_seedbanks():
    if request.method == 'GET':
        seedbanks = Seedbank.query.all()
        return jsonify([seedbank.serialize() for seedbank in seedbanks]), 200
    elif request.method == 'POST':
        data = request.json
        seedbank = Seedbank(**data)
        db.session.add(seedbank)
        db.session.commit()
        return jsonify(seedbank.serialize()), 201


@api.route('/seedbanks/<int:seedbank_id>', methods=['GET', 'PUT', 'DELETE'])
def manage_single_seedbank(seedbank_id):
    seedbank = Seedbank.query.get_or_404(seedbank_id)

    if request.method == 'GET':
        return jsonify(seedbank.serialize())
    elif request.method == 'PUT':
        data = request.json
        for key, value in data.items():
            setattr(seedbank, key, value)
        db.session.commit()
        return jsonify(seedbank.serialize()), 200
    elif request.method == 'DELETE':
        db.session.delete(seedbank)
        db.session.commit()
        return jsonify({"message": "Seedbank deleted successfully"}), 200


# Seed Batch Routes

@api.route('/seed_batches', methods=['GET', 'POST'])
def manage_seed_batches():
    if request.method == 'GET':
        seed_batches = SeedBatch.query.all()
        return jsonify([batch.serialize() for batch in seed_batches]), 200
    elif request.method == 'POST':
        data = request.json
        batch = SeedBatch(**data)
        db.session.add(batch)
        db.session.commit()
        return jsonify(batch.serialize()), 201


@api.route('/seed_batches/<int:batch_id>', methods=['GET', 'PUT', 'DELETE'])
def manage_single_seed_batch(batch_id):
    seed_batch = SeedBatch.query.get_or_404(batch_id)

    if request.method == 'GET':
        return jsonify(seed_batch.serialize())
    elif request.method == 'PUT':
        data = request.json
        for key, value in data.items():
            setattr(seed_batch, key, value)
        db.session.commit()
        return jsonify(seed_batch.serialize()), 200
    elif request.method == 'DELETE':
        db.session.delete(seed_batch)
        db.session.commit()
        return jsonify({"message": "Seed batch deleted successfully"}), 200


# Storage Conditions Routes

@api.route('/storage_conditions', methods=['GET', 'POST'])
def manage_storage_conditions():
    if request.method == 'GET':
        conditions = StorageConditions.query.all()
        return jsonify([condition.serialize() for condition in conditions]), 200
    elif request.method == 'POST':
        data = request.json
        condition = StorageConditions(**data)
        db.session.add(condition)
        db.session.commit()
        return jsonify(condition.serialize()), 201


@api.route('/storage_conditions/<int:condition_id>', methods=['GET', 'PUT', 'DELETE'])
def manage_single_storage_condition(condition_id):
    condition = StorageConditions.query.get_or_404(condition_id)

    if request.method == 'GET':
        return jsonify(condition.serialize())
    elif request.method == 'PUT':
        data = request.json
        for key, value in data.items():
            setattr(condition, key, value)
        db.session.commit()
        return jsonify(condition.serialize()), 200
    elif request.method == 'DELETE':
        db.session.delete(condition)
        db.session.commit()
        return jsonify({"message": "Storage condition deleted successfully"}), 200


# Seed Report Routes

@api.route('/seed_reports', methods=['GET', 'POST'])
def manage_seed_reports():
    if request.method == 'GET':
        reports = SeedReport.query.all()
        return jsonify([report.serialize() for report in reports]), 200
    elif request.method == 'POST':
        data = request.json
        report = SeedReport(**data)
        db.session.add(report)
        db.session.commit()
        return jsonify(report.serialize()), 201


@api.route('/seed_reports/<int:report_id>', methods=['GET', 'PUT', 'DELETE'])
def manage_single_seed_report(report_id):
    report = SeedReport.query.get_or_404(report_id)

    if request.method == 'GET':
        return jsonify(report.serialize())
    elif request.method == 'PUT':
        data = request.json
        for key, value in data.items():
            setattr(report, key, value)
        db.session.commit()
        return jsonify(report.serialize()), 200
    elif request.method == 'DELETE':
        db.session.delete(report)
        db.session.commit()
        return jsonify({"message": "Seed report deleted successfully"}), 200


# cRM 

@api.route('/crm/metrics', methods=['GET'])
@jwt_required()
def get_crm_metrics():
    total_customers = Customer.query.count()
    lifecycle_counts = db.session.query(Customer.lifecycle_stage, func.count(Customer.id)).group_by(Customer.lifecycle_stage).all()
    top_customers = Customer.query.order_by(Customer.loyalty_points.desc()).limit(5).all()

    metrics = {
        "total_customers": total_customers,
        "lifecycle_counts": {stage: count for stage, count in lifecycle_counts},
        "top_customers": [customer.serialize() for customer in top_customers]
    }
    return jsonify(metrics), 200

@api.route('/notifications', methods=['GET'])
def get_seedbank_notifications():
    # Get storage conditions with thresholds exceeded
    alerts = StorageConditions.query.filter(
        (StorageConditions.temperature < 10) |  # Example threshold
        (StorageConditions.temperature > 30) | 
        (StorageConditions.humidity > 80)
    ).all()

    # Get seed batches nearing expiration
    today = datetime.utcnow().date()
    expiring_batches = SeedBatch.query.filter(
        SeedBatch.expiration_date <= today + timedelta(days=30)
    ).all()

    notifications = {
        "alerts": [
            {
                "id": condition.id,
                "location": condition.location,
                "message": f"Temperature: {condition.temperature}, Humidity: {condition.humidity}"
            }
            for condition in alerts
        ],
        "expiring_batches": [
            {
                "id": batch.id,
                "strain": batch.strain,
                "expiration_date": batch.expiration_date.isoformat()
            }
            for batch in expiring_batches
        ]
    }

    return jsonify(notifications), 200


# # ---------------------
# # Validation Schemas
# # ---------------------


class ProductSchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    category = fields.Str(required=True)
    current_stock = fields.Integer(required=True, validate=validate.Range(min=0))
    reorder_point = fields.Integer(required=True, validate=validate.Range(min=0))
    unit_price = fields.Decimal(required=True, validate=validate.Range(min=0))
    strain = fields.Str(required=False)
    thc_content = fields.Float(required=False)
    cbd_content = fields.Float(required=False)
    is_organic = db.Column(db.Boolean, default=False)  # New field
    medical_benefits = db.Column(db.Text, nullable=True)  # New field

class CustomerSchema(Schema):
    first_name = fields.Str(required=True)
    last_name = fields.Str(required=True)
    email = fields.Email(required=True)
    phone = fields.Str(required=True)

class OrderSchema(Schema):
    customer_id = fields.Integer(required=True)
    items = fields.List(fields.Dict(keys=fields.Str(), values=fields.Int()), required=True)

# class StoreSchema(Schema):
#     name = fields.Str(required=True, validate=validate.Length(min=1, max=200))
#     location = fields.Str(required=True)
#     store_manager = fields.Str(required=True)
#     phone = fields.Str(required=True, validate=validate.Length(min=10, max=15))
#     status = fields.Str(required=True)
#     employee_count = fields.Int(required=True, validate=validate.Range(min=0))

# Pricing Schema for Validation
class PricingSchema(Schema):
    dispensary_id = fields.Int(required=True)
    price = fields.Float(required=True)
    availability = fields.Bool(required=True, default=True)


@api.route('/analytics/customer-segmentation', methods=['GET'])
@jwt_required()
def customer_segmentation():
    customers = Customer.query.all()
    analytics_data = []

    for customer in customers:
        # Example: Calculate total spent, purchase frequency, and churn probability
        total_spent = sum(order.total_amount for order in customer.orders)
        purchase_frequency = len(customer.orders) / (datetime.utcnow() - customer.created_at).days
        last_purchase_date = max(order.created_at for order in customer.orders) if customer.orders else None
        churn_probability = 1 - purchase_frequency if purchase_frequency < 0.05 else 0.0

        analytics_data.append({
            "customer_id": customer.id,
            "total_spent": total_spent,
            "purchase_frequency": purchase_frequency,
            "last_purchase_date": last_purchase_date,
            "churn_probability": churn_probability,
        })

    return jsonify(analytics_data), 200

# predictive analytics

@api.route('/analytics/clv-prediction', methods=['POST'])
def predict_clv():
    import numpy as np
    from sklearn.linear_model import LinearRegression

    # Example data: Replace with your database query
    customers = Customer.query.all()
    data = np.array([[c.total_spent, c.purchase_frequency] for c in customers])
    labels = np.array([c.total_spent * 1.2 for c in customers])  # Mock future value

    # Train linear regression model
    model = LinearRegression().fit(data, labels)
    predictions = model.predict(data)

    # Update customer CLV predictions
    for customer, prediction in zip(customers, predictions):
        customer.clv_prediction = prediction
        db.session.commit()

    return jsonify({"message": "CLV prediction completed"}), 200

@api.route('/complete-order', methods=['POST'])
def complete_order():
    order_data = request.json
    order_id = order_data.get("order_id")
    order_items = OrderItem.query.filter_by(order_id=order_id).all()

    for item in order_items:
        sale = SalesHistory(
            product_id=item.product_id,
            date_sold=datetime.utcnow().date(),
            quantity_sold=item.quantity,
        )
        db.session.add(sale)

    db.session.commit()
    return jsonify({"message": "Order completed and sales history updated."}), 200


@api.route('/reports/generate', methods=['POST'])
def trigger_report():
    generate_report.delay()  # Triggers the Celery task asynchronously
    return jsonify({"message": "Report generation task started."}), 202

# Clock-In Route
@api.route('/clock-in', methods=['POST'])
def clock_in():
    employee_id = request.json.get('employee_id')
    # Check if the employee is already clocked in
    time_log = TimeLog.query.filter_by(employee_id=employee_id, status='clocked_in').first()

    if time_log:
        return jsonify({"error": "Employee is already clocked in"}), 400

    # Create a new time log entry
    new_log = TimeLog(employee_id=employee_id, clock_in_time=datetime.utcnow(), status='clocked_in')
    db.session.add(new_log)
    db.session.commit()
    return jsonify({"message": "Clock-in successful", "time_log": new_log.id}), 200

# Clock-Out Route
@api.route('/clock-out', methods=['POST'])
def clock_out():
    employee_id = request.json.get('employee_id')
    # Check if the employee is clocked in
    time_log = TimeLog.query.filter_by(employee_id=employee_id, status='clocked_in').first()

    if not time_log:
        return jsonify({"error": "Employee is not clocked in"}), 400

    # Update the time log entry
    time_log.clock_out_time = datetime.utcnow()
    time_log.calculate_hours()
    time_log.status = 'clocked_out'
    db.session.commit()

    return jsonify({"message": "Clock-out successful", "total_hours": time_log.total_hours}), 200

# Retrieve Payroll Data Route


# customer dashboard

@api.route('/dashboard/overview', methods=['GET'])
@jwt_required()
def get_dashboard_overview():
    user_id = get_jwt_identity()
    # Fetch recent orders
    recent_orders = Order.query.filter_by(customer_id=user_id).order_by(Order.created_at.desc()).limit(5).all()
    # Fetch account statistics
    total_spent = db.session.query(func.sum(Order.total_amount)).filter(Order.customer_id == user_id).scalar() or 0
    loyalty_points = Customer.query.get(user_id).loyalty_points

    return jsonify({
        "recent_orders": [order.serialize() for order in recent_orders],
        "account_statistics": {
            "total_spent": total_spent,
            "loyalty_points": loyalty_points
        }
    }), 200


@api.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    customer = Customer.query.get_or_404(user_id)
    return jsonify(customer.serialize()), 200

@api.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    data = request.json
    customer = Customer.query.get_or_404(user_id)
    for key, value in data.items():
        setattr(customer, key, value)
    db.session.commit()
    return jsonify(customer.serialize()), 200

@api.route('/orders', methods=['GET'])
@jwt_required()
def get_order_history():
    user_id = get_jwt_identity()
    orders = Order.query.filter_by(customer_id=user_id).all()
    return jsonify([order.serialize() for order in orders]), 200

@api.route('/orders/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order_details(order_id):
    order = Order.query.get_or_404(order_id)
    return jsonify(order.serialize()), 200

@api.route('/wishlist', methods=['GET'])
@jwt_required()
def get_wishlist():
    user_id = get_jwt_identity()
    wishlist = Wishlist.query.filter_by(customer_id=user_id).all()
    return jsonify([item.serialize() for item in wishlist]), 200

@api.route('/wishlist', methods=['POST'])
@jwt_required()
def add_to_wishlist():
    user_id = get_jwt_identity()
    data = request.json
    new_item = Wishlist(customer_id=user_id, product_id=data['product_id'])
    db.session.add(new_item)
    db.session.commit()
    return jsonify(new_item.serialize()), 201

@api.route('/wishlist/<int:item_id>', methods=['DELETE'])
@jwt_required()
def remove_from_wishlist(item_id):
    item = Wishlist.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Item removed from wishlist"}), 200


# @api.route('/cart', methods=['GET'])
# @jwt_required()
# def get_cart():
#     user_id = get_jwt_identity()  # Assumes you use JWT to authenticate users
#     cart_items = Cart.query.filter_by(user_id=user_id).all()
#     return jsonify([item.serialize() for item in cart_items]), 200

@api.route('/cart/save_for_later', methods=['POST'])
@jwt_required()
def save_for_later():
    data = request.json
    user_id = get_jwt_identity()  # Get the current user's ID

    # Check if the cart item exists
    cart_item = Cart.query.filter_by(user_id=user_id, product_id=data['product_id']).first()
    if not cart_item:
        return jsonify({"error": "Cart item not found"}), 404

    # Move item to "saved for later"
    saved_item = SavedForLater(
        user_id=user_id,
        product_id=cart_item.product_id,
        quantity=cart_item.quantity,
    )
    db.session.add(saved_item)
    db.session.delete(cart_item)
    db.session.commit()

    return jsonify({"message": "Item saved for later"}), 201

@api.route('/cart/apply_discount', methods=['POST'])
@jwt_required()
def apply_discount():
    data = request.json
    user_id = get_jwt_identity()  # Get the current user's ID

    # Validate the discount code
    discount = Discount.query.filter_by(code=data['code'], is_active=True).first()
    if not discount:
        return jsonify({"error": "Invalid or expired discount code"}), 400

    # Calculate discount
    cart_items = Cart.query.filter_by(user_id=user_id).all()
    total = sum(item.quantity * item.product.unit_price for item in cart_items)
    discount_amount = total * (discount.percentage / 100)

    return jsonify({
        "message": "Discount applied",
        "original_total": total,
        "discount": discount_amount,
        "new_total": total - discount_amount,
    }), 200


@api.route('/cart/<int:item_id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(item_id):
    item = Cart.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Item removed from cart"}), 200

@api.route('/cart/<int:item_id>', methods=['PATCH'])
@jwt_required()
def update_cart_item(item_id):
    data = request.json
    item = Cart.query.get_or_404(item_id)
    if 'quantity' in data:
        item.quantity = data['quantity']
    db.session.commit()
    return jsonify(item.serialize()), 200

@api.route('/checkout', methods=['POST'])
@jwt_required()
def checkout():
    user_id = get_jwt_identity()  # Get the current user's ID
    cart_items = Cart.query.filter_by(user_id=user_id).all()
    if not cart_items:
        return jsonify({"error": "Cart is empty"}), 400

    # Create an order
    order = Order(user_id=user_id, status="pending", total_amount=0)
    db.session.add(order)
    db.session.flush()  # Get the order ID before committing

    # Calculate total and move items to the order
    total = 0
    for item in cart_items:
        total += item.quantity * item.product.unit_price
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.product.unit_price,
        )
        db.session.add(order_item)
        db.session.delete(item)  # Remove from cart

    order.total_amount = total
    db.session.commit()

    return jsonify({"message": "Order created", "order_id": order.id, "total": total}), 201





@api.route('/payment-methods', methods=['GET'])
@jwt_required()
def get_payment_methods():
    user_id = get_jwt_identity()
    payment_methods = PaymentMethod.query.filter_by(customer_id=user_id).all()
    return jsonify([method.serialize() for method in payment_methods]), 200

@api.route('/payment-methods', methods=['POST'])
@jwt_required()
def add_payment_method():
    user_id = get_jwt_identity()
    data = request.json
    new_method = PaymentMethod(customer_id=user_id, **data)
    db.session.add(new_method)
    db.session.commit()
    return jsonify(new_method.serialize()), 201

@api.route('/payment-methods/<int:method_id>', methods=['DELETE'])
@jwt_required()
def delete_payment_method(method_id):
    method = PaymentMethod.query.get_or_404(method_id)
    db.session.delete(method)
    db.session.commit()
    return jsonify({"message": "Payment method deleted"}), 200

@api.route('/support-tickets', methods=['GET'])
@jwt_required()
def get_support_tickets():
    user_id = get_jwt_identity()
    tickets = SupportTicket.query.filter_by(customer_id=user_id).all()
    return jsonify([ticket.serialize() for ticket in tickets]), 200

@api.route('/support-tickets', methods=['POST'])
@jwt_required()
def create_support_ticket():
    user_id = get_jwt_identity()
    data = request.json
    new_ticket = SupportTicket(customer_id=user_id, **data)
    db.session.add(new_ticket)
    db.session.commit()
    return jsonify(new_ticket.serialize()), 201


@api.route('/subscriptions', methods=['GET'])
@jwt_required()
def get_subscriptions():
    user_id = get_jwt_identity()
    subscriptions = Subscription.query.filter_by(customer_id=user_id).all()
    return jsonify([sub.serialize() for sub in subscriptions]), 200

@api.route('/subscriptions/<int:sub_id>', methods=['GET'])
@jwt_required()
def get_subscription_details(sub_id):
    subscription = Subscription.query.get_or_404(sub_id)
    return jsonify(subscription.serialize()), 200

@api.route('/subscriptions', methods=['POST'])
@jwt_required()
def create_subscription():
    user_id = get_jwt_identity()
    data = request.json
    new_subscription = Subscription(customer_id=user_id, **data)
    db.session.add(new_subscription)
    db.session.commit()
    return jsonify(new_subscription.serialize()), 201

@api.route('/subscriptions/<int:sub_id>', methods=['PUT'])
@jwt_required()
def update_subscription(sub_id):
    subscription = Subscription.query.get_or_404(sub_id)
    data = request.json
    for key, value in data.items():
        setattr(subscription, key, value)
    db.session.commit()
    return jsonify(subscription.serialize()), 200

@api.route('/subscriptions/<int:sub_id>', methods=['DELETE'])
@jwt_required()
def delete_subscription(sub_id):
    subscription = Subscription.query.get_or_404(sub_id)
    db.session.delete(subscription)
    db.session.commit()
    return jsonify({"message": "Subscription deleted successfully"}), 200

@api.route('/loyalty-program', methods=['GET'])
@jwt_required()
def get_loyalty_program():
    user_id = get_jwt_identity()
    customer = Customer.query.get_or_404(user_id)
    return jsonify({
        "points": customer.loyalty_points,
        "tier": customer.loyalty_tier
    }), 200

@api.route('/loyalty-program/history', methods=['GET'])
@jwt_required()
def get_loyalty_history():
    user_id = get_jwt_identity()
    history = LoyaltyHistory.query.filter_by(customer_id=user_id).all()
    return jsonify([entry.serialize() for entry in history]), 200

# @api.route('/loyalty-program/redeem', methods=['POST'])
# @jwt_required()
# def redeem_loyalty_points():
#     user_id = get_jwt_identity()
#     data = request.json
#     points_to_redeem = data.get("points")
#     customer = Customer.query.get_or_404(user_id)

#     if customer.loyalty_points < points_to_redeem:
#         return jsonify({"error": "Insufficient points"}), 400

#     customer.loyalty_points -= points_to_redeem
#     db.session.commit()
#     return jsonify({"message": f"{points_to_redeem} points redeemed.", "remaining_points": customer.loyalty_points}), 200

@api.route('/analytics/customer', methods=['GET'])
@jwt_required()
def get_customer_analytics():
    user_id = get_jwt_identity()
    customer = Customer.query.get_or_404(user_id)

    # Example: Analytics calculation
    total_spent = db.session.query(func.sum(Order.total_amount)).filter(Order.customer_id == user_id).scalar() or 0
    order_count = Order.query.filter_by(customer_id=user_id).count()
    avg_order_value = total_spent / order_count if order_count > 0 else 0

    return jsonify({
        "total_spent": total_spent,
        "order_count": order_count,
        "avg_order_value": avg_order_value,
        "loyalty_points": customer.loyalty_points,
    }), 200


@api.route('/settings', methods=['GET'])
@jwt_required()
def get_settings():
    user_id = get_jwt_identity()
    settings = Settings.query.filter_by(customer_id=user_id).first()
    return jsonify(settings.serialize()), 200

@api.route('/settings', methods=['PUT'])
@jwt_required()
def update_settings():
    user_id = get_jwt_identity()
    data = request.json
    settings = Settings.query.filter_by(customer_id=user_id).first()
    
    if not settings:
        settings = Settings(customer_id=user_id)
        db.session.add(settings)

    for key, value in data.items():
        setattr(settings, key, value)
    db.session.commit()
    return jsonify(settings.serialize()), 200


@api.route('/addresses', methods=['GET'])
@jwt_required()
def get_addresses():
    user_id = get_jwt_identity()
    addresses = Address.query.filter_by(customer_id=user_id).all()
    return jsonify([addr.serialize() for addr in addresses]), 200

@api.route('/addresses', methods=['POST'])
@jwt_required()
def add_address():
    user_id = get_jwt_identity()
    data = request.json
    new_address = Address(customer_id=user_id, **data)
    db.session.add(new_address)
    db.session.commit()
    return jsonify(new_address.serialize()), 201

@api.route('/addresses/<int:address_id>', methods=['PUT'])
@jwt_required()
def update_address(address_id):
    address = Address.query.get_or_404(address_id)
    data = request.json
    for key, value in data.items():
        setattr(address, key, value)
    db.session.commit()
    return jsonify(address.serialize()), 200

@api.route('/addresses/<int:address_id>', methods=['DELETE'])
@jwt_required()
def delete_address(address_id):
    address = Address.query.get_or_404(address_id)
    db.session.delete(address)
    db.session.commit()
    return jsonify({"message": "Address deleted successfully"}), 200


# pos system

@api.route('/cart', methods=['GET'])
@jwt_required()
def get_cart():
    user_id = get_jwt_identity()
    cart = Cart.query.filter_by(customer_id=user_id).first()
    if not cart:
        return jsonify({"error": "Cart not found"}), 404
    return jsonify(cart.serialize()), 200

@api.route('/cart', methods=['POST'])
@jwt_required()
def add_to_cart():
    user_id = get_jwt_identity()
    data = request.json
    cart = Cart.query.filter_by(customer_id=user_id).first()

    if not cart:
        cart = Cart(customer_id=user_id)
        db.session.add(cart)

    product = Product.query.get_or_404(data['product_id'])
    cart_item = CartItem(
        cart_id=cart.id,
        product_id=product.id,
        quantity=data.get('quantity', 1)
    )
    db.session.add(cart_item)
    db.session.commit()

    return jsonify(cart.serialize()), 201

# @api.route('/cart/<int:item_id>', methods=['PUT'])
# @jwt_required()
# def update_cart_item(item_id):
#     cart_item = CartItem.query.get_or_404(item_id)
#     data = request.json
#     cart_item.quantity = data.get('quantity', cart_item.quantity)
#     db.session.commit()
#     return jsonify(cart_item.serialize()), 200

@api.route('/cart/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_cart_item(item_id):
    cart_item = CartItem.query.get_or_404(item_id)
    db.session.delete(cart_item)
    db.session.commit()
    return jsonify({"message": "Item removed from cart"}), 200

@api.route('/cart/clear', methods=['DELETE'])
@jwt_required()
def clear_cart():
    user_id = get_jwt_identity()
    cart = Cart.query.filter_by(customer_id=user_id).first()
    if not cart:
        return jsonify({"error": "Cart not found"}), 404
    db.session.delete(cart)
    db.session.commit()
    return jsonify({"message": "Cart cleared successfully"}), 200

@api.route('/pos/payment', methods=['POST'])
@jwt_required()
def process_payment():
    data = request.json
    order_id = data.get('order_id')
    payments = data.get('payments', [])  # Example: [{"method": "cash", "amount": 50}, {"method": "credit", "amount": 25}]
    
    if not payments:
        return jsonify({"error": "No payment methods provided"}), 400

    order = Order.query.get_or_404(order_id)
    total_paid = sum(payment['amount'] for payment in payments)
    
    if total_paid < order.total_amount:
        return jsonify({"error": "Insufficient payment"}), 400

    for payment in payments:
        PaymentLog(
            order_id=order.id,
            payment_method=payment['method'],
            amount=payment['amount']
        )
        db.session.add(payment_log)
    
    order.status = "completed"
    db.session.commit()
    
    return jsonify({"message": "Payment processed successfully", "order": order.serialize()}), 200

@api.route('/pos/receipt/<int:order_id>', methods=['GET'])
@jwt_required()
def generate_receipt(order_id):
    order = Order.query.get_or_404(order_id)
    items = OrderItem.query.filter_by(order_id=order.id).all()

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer)
    pdf.drawString(100, 750, f"Receipt for Order #{order.id}")
    pdf.drawString(100, 730, "---------------------------")

    y = 710
    for item in items:
        pdf.drawString(100, y, f"{item.product.name} (x{item.quantity}): ${item.unit_price}")
        y -= 20

    pdf.drawString(100, y - 20, f"Total: ${order.total_amount}")
    pdf.save()

    buffer.seek(0)
    return send_file(buffer, as_attachment=True, download_name=f"receipt_{order.id}.pdf", mimetype='application/pdf')


@api.route('/pos/offline-transactions', methods=['POST'])
@jwt_required()
def sync_offline_transactions():
    data = request.json.get("transactions", [])
    if not data:
        return jsonify({"error": "No transactions to sync"}), 400

    for transaction in data:
        order = Order(**transaction.get("order"))
        db.session.add(order)
        db.session.flush()

        for item in transaction.get("items", []):
            order_item = OrderItem(order_id=order.id, **item)
            db.session.add(order_item)

    db.session.commit()
    return jsonify({"message": "Offline transactions synced successfully"}), 200


@api.route('/pos/reports', methods=['GET'])
@jwt_required()
def generate_pos_reports():
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    
    query = Order.query.filter(Order.created_at.between(start_date, end_date))
    total_sales = sum(order.total_amount for order in query)
    total_orders = query.count()
    top_products = db.session.query(
        Product.name, func.sum(OrderItem.quantity).label('quantity_sold')
    ).join(OrderItem, Product.id == OrderItem.product_id)\
     .group_by(Product.name)\
     .order_by(func.sum(OrderItem.quantity).desc())\
     .limit(5).all()

    return jsonify({
        "total_sales": total_sales,
        "total_orders": total_orders,
        "top_products": [{"name": p[0], "quantity": p[1]} for p in top_products]
    }), 200

# Route to get all plans
@api.route('/plans', methods=['GET'])
def get_plans():
    plans = Plan.query.all()
    return jsonify([plan.serialize() for plan in plans]), 200

# Route to create a new plan (Admin use)
@api.route('/plans', methods=['POST'])
def create_plan():
    data = request.get_json()

    if not data or not all(key in data for key in ('name', 'price', 'features')):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        new_plan = Plan(
            name=data['name'],
            price=data['price'],
            features=data['features']
        )
        db.session.add(new_plan)
        db.session.commit()
        return jsonify(new_plan.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Route to update a specific plan by ID (Admin use)
@api.route('/plans/<int:plan_id>', methods=['PUT'])
def update_plan(plan_id):
    data = request.get_json()
    plan = Plan.query.get(plan_id)

    if not plan:
        return jsonify({"error": "Plan not found"}), 404

    try:
        if 'name' in data:
            plan.name = data['name']
        if 'price' in data:
            plan.price = data['price']
        if 'features' in data:
            plan.features = data['features']

        db.session.commit()
        return jsonify(plan.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Route to delete a specific plan by ID (Admin use)
@api.route('/plans/<int:plan_id>', methods=['DELETE'])
def delete_plan(plan_id):
    plan = Plan.query.get(plan_id)

    if not plan:
        return jsonify({"error": "Plan not found"}), 404

    try:
        db.session.delete(plan)
        db.session.commit()
        return jsonify({"message": f"Plan with ID {plan_id} deleted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Route to get all deals

# Route to get a specific deal by ID
@api.route('/deals/<int:deal_id>', methods=['GET'])
def get_deal(deal_id):
    deal = Deal.query.get(deal_id)
    if not deal:
        return jsonify({"error": "Deal not found"}), 404
    return jsonify(deal.serialize()), 200

# Route to create a new deal
@api.route('/deals', methods=['POST'])
def create_deal():
    data = request.get_json()

    if not data or not all(key in data for key in ('name', 'stage', 'value', 'customer_id')):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        new_deal = Deal(
            name=data['name'],
            description=data.get('description', None),
            stage=data['stage'],
            value=data['value'],
            customer_id=data['customer_id'],
            assigned_to=data.get('assigned_to', None)
        )
        db.session.add(new_deal)
        db.session.commit()
        return jsonify(new_deal.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Route to update a specific deal by ID
@api.route('/deals/<int:deal_id>', methods=['PUT'])
def update_deal(deal_id):
    data = request.get_json()
    deal = Deal.query.get(deal_id)

    if not deal:
        return jsonify({"error": "Deal not found"}), 404

    try:
        if 'name' in data:
            deal.name = data['name']
        if 'description' in data:
            deal.description = data['description']
        if 'stage' in data:
            deal.stage = data['stage']
        if 'value' in data:
            deal.value = data['value']
        if 'customer_id' in data:
            deal.customer_id = data['customer_id']
        if 'assigned_to' in data:
            deal.assigned_to = data['assigned_to']

        db.session.commit()
        return jsonify(deal.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Route to delete a specific deal by ID
@api.route('/deals/<int:deal_id>', methods=['DELETE'])
def delete_deal(deal_id):
    deal = Deal.query.get(deal_id)

    if not deal:
        return jsonify({"error": "Deal not found"}), 404

    try:
        db.session.delete(deal)
        db.session.commit()
        return jsonify({"message": f"Deal with ID {deal_id} deleted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
    # Route to get all inventory logs
@api.route('/inventory_logs', methods=['GET'])
def get_inventory_logs():
    logs = InventoryLog.query.all()
    return jsonify([log.serialize() for log in logs]), 200

# Route to create a new inventory log
@api.route('/inventory_logs', methods=['POST'])
def create_inventory_log():
    data = request.get_json()

    if not data or not all(key in data for key in ('product_id', 'transaction_type', 'quantity')):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        new_log = InventoryLog(
            product_id=data['product_id'],
            transaction_type=data['transaction_type'],
            quantity=data['quantity'],
            reason=data.get('reason', None)
        )
        db.session.add(new_log)
        db.session.commit()
        return jsonify(new_log.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
    
@api.route('/inventory/check-expiry', methods=['GET'])
@jwt_required()
def check_expiry():
    from datetime import datetime, timedelta
    nearing_expiry = Product.query.filter(
        Product.expiry_date != None,
        Product.expiry_date <= datetime.utcnow() + timedelta(days=30)
    ).all()
    return jsonify([product.serialize() for product in nearing_expiry]), 200

# Route to get all payroll records
@api.route('/payroll', methods=['GET'])
def get_payrolls():
    store_id = request.args.get('store_id')  # Get the store_id from query parameters
    if store_id:
        # Filter payrolls based on the provided store ID
        payrolls = Payroll.query.filter_by(store_id=store_id).all()
        if not payrolls:
            return jsonify({"message": "No payrolls found for the specified store"}), 404
    else:
        # Return all payrolls if no store ID is provided
        payrolls = Payroll.query.all()
    
    return jsonify([payroll.serialize() for payroll in payrolls]), 200


# Route to get a specific payroll record by ID
@api.route('/payroll/<int:payroll_id>', methods=['GET'])
def get_payroll(payroll_id):
    payroll = Payroll.query.get(payroll_id)
    if not payroll:
        return jsonify({"error": "Payroll not found"}), 404
    return jsonify(payroll.serialize()), 200

# Route to create a new payroll record
@api.route('/payroll', methods=['POST'])
def create_payroll():
    data = request.get_json()

    if not data or not all(key in data for key in ('employee_id', 'pay_period_start', 'pay_period_end', 'hourly_rate')):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        total_hours = data.get('total_hours', 0.0)
        total_pay = total_hours * data['hourly_rate']

        new_payroll = Payroll(
            employee_id=data['employee_id'],
            pay_period_start=data['pay_period_start'],
            pay_period_end=data['pay_period_end'],
            total_hours=total_hours,
            hourly_rate=data['hourly_rate'],
            total_pay=total_pay
        )
        db.session.add(new_payroll)
        db.session.commit()
        return jsonify(new_payroll.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Route to get all time logs
@api.route('/time_logs', methods=['GET'])
def get_time_logs():
    logs = TimeLog.query.all()
    return jsonify([log.serialize() for log in logs]), 200

# Route to create a new time log
@api.route('/time_logs', methods=['POST'])
def create_time_log():
    data = request.get_json()

    if not data or not all(key in data for key in ('employee_id', 'clock_in_time')):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        new_log = TimeLog(
            employee_id=data['employee_id'],
            clock_in_time=data['clock_in_time'],
            clock_out_time=data.get('clock_out_time', None),
            status=data.get('status', 'clocked_in')
        )
        db.session.add(new_log)
        db.session.commit()
        return jsonify(new_log.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@api.route('/api/products/<string:barcode>', methods=['GET'])
def get_product_by_barcode(barcode):
    product = Product.query.filter_by(barcode=barcode).first()
    if product:
        return jsonify(product.serialize()), 200
    else:
        return jsonify({"error": "Product not found"}), 404

@api.route('/analytics/sales', methods=['GET'])
@jwt_required()
@handle_errors
def get_sales_analytics():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    # Validate date range
    try:
        if start_date:
            start_date = datetime.strptime(start_date, "%Y-%m-%d")
        if end_date:
            end_date = datetime.strptime(end_date, "%Y-%m-%d")
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400
    
    query = Order.query.filter(Order.status == 'completed')
    if start_date:
        query = query.filter(Order.created_at >= start_date)
    if end_date:
        query = query.filter(Order.created_at <= end_date)
    
    orders = query.all()
    total_sales = sum(float(order.total_amount) for order in orders)
    order_count = len(orders)
    
    daily_sales = {}
    for order in orders:
        order_date = order.created_at.date()
        daily_sales[order_date] = daily_sales.get(order_date, 0) + float(order.total_amount)
    
    return jsonify({
        "start_date": start_date.strftime("%Y-%m-%d") if start_date else None,
        "end_date": end_date.strftime("%Y-%m-%d") if end_date else None,
        "total_sales": total_sales,
        "order_count": order_count,
        "daily_sales": [{"date": str(date), "sales": sales} for date, sales in daily_sales.items()]
    }), 200

@api.route('/analytics/sales/export', methods=['GET'])
@jwt_required()
@handle_errors
def export_sales_report():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    output_format = request.args.get('format', 'pdf').lower()

    # Validate date range
    try:
        if start_date:
            start_date = datetime.strptime(start_date, "%Y-%m-%d")
        if end_date:
            end_date = datetime.strptime(end_date, "%Y-%m-%d")
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400

    query = Order.query.filter(Order.status == 'completed')
    if start_date:
        query = query.filter(Order.created_at >= start_date)
    if end_date:
        query = query.filter(Order.created_at <= end_date)

    orders = query.all()

    if output_format == 'pdf':
        from io import BytesIO
        buffer = BytesIO()
        pdf = canvas.Canvas(buffer)
        pdf.drawString(100, 750, f"Sales Report ({start_date} to {end_date})")
        pdf.drawString(100, 730, f"Total Sales: {sum(float(o.total_amount) for o in orders)}")
        pdf.drawString(100, 710, f"Total Orders: {len(orders)}")
        pdf.showPage()
        pdf.save()

        buffer.seek(0)
        return send_file(buffer, as_attachment=True, download_name="sales_report.pdf", mimetype="application/pdf")
    elif output_format == 'excel':
        import pandas as pd
        from io import BytesIO

        data = [{"Order ID": o.id, "Total Amount": o.total_amount, "Date": o.created_at} for o in orders]
        df = pd.DataFrame(data)

        buffer = BytesIO()
        with pd.ExcelWriter(buffer, engine='xlsxwriter') as writer:
            df.to_excel(writer, index=False, sheet_name="Sales Report")
        buffer.seek(0)
        return send_file(buffer, as_attachment=True, download_name="sales_report.xlsx", mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    else:
        return jsonify({"error": "Invalid format. Use 'pdf' or 'excel'."}), 400
    
@api.route('/warehouse/inventory', methods=['GET'])
@jwt_required()
def get_warehouse_inventory():
    warehouse_id = request.args.get('warehouse_id')
    inventory = Inventory.query.filter_by(warehouse_id=warehouse_id).all()
    return jsonify([item.serialize() for item in inventory]), 200

@api.route('/suppliers', methods=['GET'])
def get_suppliers():
    suppliers = Supplier.query.all()
    return jsonify([supplier.to_dict() for supplier in suppliers])



# @api.route('/dashboard/metrics', methods=['GET'])
# @jwt_required()
# @handle_errors
# def get_dashboard_metrics():
#     # Sales Metrics
#     completed_orders = Order.query.filter(Order.status == 'completed').all()
#     total_sales = sum(float(order.total_amount) for order in completed_orders)
#     order_count = len(completed_orders)
#     average_order_value = total_sales / order_count if order_count > 0 else 0

#     # Inventory Metrics
#     low_stock_products = Product.query.filter(Product.current_stock <= Product.reorder_point).all()
#     top_products = Product.query.order_by(Product.sales.desc()).limit(5).all()

#     # Customer Metrics
#     total_customers = Customer.query.count()
#     top_customer = db.session.query(Customer).join(Order).group_by(Customer.id).order_by(db.func.sum(Order.total_amount).desc()).first()

#     return jsonify({
#         "sales": {
#             "total_sales": total_sales,
#             "order_count": order_count,
#             "average_order_value": round(average_order_value, 2)
#         },
#         "inventory": {
#             "low_stock_count": len(low_stock_products),
#             "top_products": [{"name": p.name, "sales": p.sales} for p in top_products]
#         },
#         "customers": {
#             "total_customers": total_customers,
#             "top_customer": {
#                 "id": top_customer.id if top_customer else None,
#                 "name": f"{top_customer.first_name} {top_customer.last_name}" if top_customer else None,
#                 "total_spent": round(top_customer.total_spent, 2) if top_customer else None
#             }
#         }
#     }), 200
