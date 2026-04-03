from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity
# flask_login available but using JWT instead
try:
    from flask_login import login_required, current_user
except ImportError:
    pass
from api.utils import calculate_lead_time, calculate_sales_velocity, predict_restock
from sqlalchemy.exc import SQLAlchemyError

from datetime import datetime, timedelta
from api.models import (
    # Core database connection
    db,

    # Authentication / Users
    User, Customer,

    # Orders and Payments
    Order, OrderItem, OrderDetail, Invoice, Cart, CartItem, PaymentLog, BillingHistory, Plan,

    # Customer
    CustomerInteraction, Subscription, Address,

    # Business and Store Operations
    Business, Store, CashDrawer, CashLog, Supplier, Pricing, Dispensary, Lead,

    # Medical and Patient Management
    Patient, Insurance, Appointment, Prescription, MedicalResource, PatientEducationResource, Symptom, Claim,

    # Compliance
    Compliance, ComplianceAudit, Task, ComplianceStatus, ProductCompliance, InventoryCompliance, ComplianceAlert, AuditHistory, License, EmployeeTraining,

    # Inventory Management
    Inventory, InventoryLog, Product,

    # Grow Farms and Yield Tracking
    GrowFarm, PlantBatch, YieldPrediction, Seedbank, SeedBatch, StorageConditions, SeedReport, GrowTask,

    # Sales and Campaigns
    Deal, PromotionalDeal, Campaign, CampaignMetrics, Recommendation, Sale, Transaction, PaymentMethod, SalesHistory,

    # Loyalty Programs
    LoyaltyProgram, Reward, LoyaltyHistory, Wishlist, Discount,

    # Feedback / Support
    Feedback, SupportTicket, Review, Settings,

    # Scheduling and Employee Management
    Shift, Employee, Schedule, Payroll, TimeLog, ShiftSchedule, StaffTrainingResource, Resource,

    # Reporting and Analytics 
    Report, EnvironmentData,

    # New: Platform Features
    Connect, FavoriteConnect,
      JobApplication, Advertisement, TokenBlocklist, SavedForLater, Message, Company, Job, UserInterest
)


    
from api.send_email import send_email                           
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from marshmallow import Schema, fields, validate, ValidationError
from reportlab.pdfgen import canvas
from flask_cors import CORS
from sqlalchemy import func
# from .services.predictive import predict_restock
try:
    from twilio.jwt.access_token import AccessToken
except ImportError:
    AccessToken = None
try:
    from twilio.jwt.access_token.grants import ChatGrant
except ImportError:
    ChatGrant = None



# from api.utils import role_required, APIException, generate_sitemap
try:
    from sklearn.linear_model import LinearRegression
except ImportError:
    LinearRegression = None
import numpy as np
import os
import jwt
import json
from flask_socketio import emit
try:
    from api.extensions import socketio
except ImportError:
    socketio = None
from flask import jsonify, send_file
from io import BytesIO
try:
    from textblob import TextBlob
except ImportError:
    TextBlob = None
import pandas as pd
try:
    from prophet import Prophet
except ImportError:
    Prophet = None
try:
    from celery import shared_task
except ImportError:
    def shared_task(f): return f
# from your_project.tasks import generate_report
# TODO: work on getting these project.tasks/generate_report working versus line 43-47

import logging
logger = logging.getLogger(__name__)




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

@api.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        role_name = data.get("role", "customer")  # Default role is 'customer'

        # ✅ Validate role
        valid_roles = ['admin', 'owner', 'manager', 'employee', 'customer']
        if role_name not in valid_roles:
            return jsonify({"error": "Invalid role"}), 400

        # ✅ Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({"error": "User already exists"}), 400

        # ✅ Hash password and create new user
        hashed_password = generate_password_hash(password)
        new_user = User(
            email=email,
            password=hashed_password,
            role=role_name,
            is_active=False  # You can set this True if you prefer
        )

        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            "message": "User created successfully",
            "user": new_user.serialize()
        }), 201

    except Exception as e:
        print(f"Signup error: {str(e)}")
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500
    
@api.route("/forgot-password", methods=["POST"])
def forgot_password(): 
    email=request.json.get("email")

    user = User.query.filter_by(email=email).first()
    if user is None: 
        return jsonify({"message": "email does not exist"}), 400
    
    expiration_time=datetime.utcnow() + timedelta(hours = 1)
    token = jwt.encode({"email": email, "exp": expiration_time}, os.getenv("FLASK_APP_KEY"), algorithm="HS256")

    email_value=f"Click here to reset password.\n{os.getenv('FRONTEND_URL')}/forgot-password?token={token}"
    send_email(email, email_value, "Password Recovery: BudphoriaPro")
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

    send_email(email, "password successfully reset", "password reset confirmation for BudphoriaPro")
    return jsonify({"message": "password reset email sent"}), 200
    
# products    
@api.route('/products', methods=['GET'])
@jwt_required()
def get_products():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    category = request.args.get('category')
    strain = request.args.get('strain')
    
    query = Product.query
    
    if category:
        query = query.filter(Product.category.ilike(f"%{category}%"))
    if strain:
        query = query.filter(Product.strain.ilike(f"%{strain}%"))
        
    products = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        "products": [product.serialize() for product in products.items],
        "total": products.total,
        "pages": products.pages,
        "current_page": products.page
    }), 200


@api.route('/customers/<int:id>', methods=['GET'])
@jwt_required()
@handle_errors
def get_customer(id):
    customer = Customer.query.get_or_404(id)
    return jsonify(customer.serialize()), 200

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
def recommend_products():
    symptoms = request.json.get('symptoms', [])
    query = Product.query.filter(
        db.or_(*[Product.medical_benefits.ilike(f"%{symptom}%") for symptom in symptoms])
    )
    products = query.all()
    return jsonify([p.serialize() for p in products]), 200



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


# @api.route('/analytics', methods=['GET'])
# @jwt_required()
# def get_analytics():
#     analytics_type = request.args.get('type', 'sales')
#     if analytics_type == 'sales':
#         orders = Order.query.filter(Order.status == 'completed').all()
#         total_sales = sum(float(order.total_amount) for order in orders)
#         return jsonify({"total_sales": total_sales}), 200
    
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
# @handle_errors
# def get_dashboard_metrics():
#     # Query parameter to toggle between formats
#     format_type = request.args.get('format', 'user_friendly')  # Default to 'user_friendly'

#     try:
#         # Shared Data
#         orders = Order.query.filter(Order.status == 'completed').all()
#         total_sales = sum(float(order.total_amount) for order in orders)
#         order_count = len(orders)
#         average_order_value = total_sales / order_count if order_count > 0 else 0

#         low_stock_products = Product.query.filter(Product.stock <= Product.reorder_point).all()
#         top_products = Product.query.order_by(Product.sales.desc()).limit(5).all()

#         total_customers = Customer.query.count()
#         top_customer = db.session.query(Customer).join(Order).group_by(Customer.id).order_by(db.func.sum(Order.total_amount).desc()).first()

#         # User-Friendly Metrics
#         if format_type == 'user_friendly':
#             metrics = [
#                  {"title": "Total Sales", "value": f"${total_sales:,.2f}"},
#             {"title": "Average Purchase Order", "value": f"${average_order_value:,.2f}"},
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
#             ]
#             return jsonify(metrics), 200

#         # Data-Centric Metrics
#         elif format_type == 'data_centric':
#             return jsonify({
#                 "sales": {
#                     "total_sales": total_sales,
#                     "order_count": order_count,
#                     "average_order_value": round(average_order_value, 2)
#                 },
#                 "inventory": {
#                     "low_stock_count": len(low_stock_products),
#                     "top_products": [{"name": p.name, "sales": p.sales} for p in top_products]
#                 },
#                 "customers": {
#                     "total_customers": total_customers,
#                     "top_customer": {
#                         "id": top_customer.id if top_customer else None,
#                         "name": f"{top_customer.first_name} {top_customer.last_name}" if top_customer else None,
#                         "total_spent": round(top_customer.total_spent, 2) if top_customer else None
#                     }
#                 }
#             }), 200
#         else:
#             return jsonify({"error": "Invalid format type"}), 400

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500
    
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

def get_top_categories():
    """
    Fetch the top-performing categories based on total sales.
    """
    try:
        # Aggregate sales by category
        results = db.session.query(
            Product.category,
            func.sum(OrderItem.quantity * OrderItem.unit_price).label('total_sales')
        ).join(OrderItem, Product.id == OrderItem.product_id)\
         .group_by(Product.category)\
         .order_by(func.sum(OrderItem.quantity * OrderItem.unit_price).desc())\
         .limit(5).all()  # Limit to top 5 categories

        # Format the response
        top_categories = [{"category": row[0], "total_sales": float(row[1])} for row in results]

        return jsonify({"top_categories": top_categories}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@api.route('/dashboard/sales-performance', methods=['GET'])
@jwt_required()
def get_sales_performance():
    """
    Fetch sales performance based on a specified time breakdown.
    Query Parameters:
    - start_date: Start date in 'YYYY-MM-DD' format.
    - end_date: End date in 'YYYY-MM-DD' format.
    - breakdown: 'daily', 'weekly', 'monthly' (default: daily).
    """
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    breakdown = request.args.get('breakdown', 'daily')

    try:
        # Validate date range
        if start_date:
            start_date = datetime.strptime(start_date, "%Y-%m-%d")
        if end_date:
            end_date = datetime.strptime(end_date, "%Y-%m-%d")

        # Base query for completed orders
        query = Order.query.filter(Order.status == 'completed')
        if start_date:
            query = query.filter(Order.created_at >= start_date)
        if end_date:
            query = query.filter(Order.created_at <= end_date)

        # Aggregate sales based on breakdown
        if breakdown == 'daily':
            results = query.with_entities(
                func.date(Order.created_at).label('date'),
                func.sum(Order.total_amount).label('total_sales')
            ).group_by(func.date(Order.created_at)).order_by('date').all()
        elif breakdown == 'weekly':
            results = query.with_entities(
                func.year(Order.created_at).label('year'),
                func.week(Order.created_at).label('week'),
                func.sum(Order.total_amount).label('total_sales')
            ).group_by('year', 'week').order_by('year', 'week').all()
        elif breakdown == 'monthly':
            results = query.with_entities(
                func.year(Order.created_at).label('year'),
                func.month(Order.created_at).label('month'),
                func.sum(Order.total_amount).label('total_sales')
            ).group_by('year', 'month').order_by('year', 'month').all()
        else:
            return jsonify({"error": "Invalid breakdown type"}), 400

        # Format the response
        performance = []
        for row in results:
            if breakdown == 'daily':
                performance.append({"date": row[0].strftime("%Y-%m-%d"), "total_sales": float(row[1])})
            elif breakdown == 'weekly':
                performance.append({"year": row[0], "week": row[1], "total_sales": float(row[2])})
            elif breakdown == 'monthly':
                performance.append({"year": row[0], "month": row[1], "total_sales": float(row[2])})

        return jsonify({"sales_performance": performance}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# store routes

@api.route('/stock', methods=['GET'])
@jwt_required()
def get_stock_for_store():
    user_id = get_jwt_identity()  # Get the ID of the authenticated user
    store_id = request.args.get('store_id')

    # Fetch the store
    store = Store.query.filter_by(id=store_id).first()
    if not store:
        return jsonify({"message": "Store not found"}), 404

    # Verify if the user is the store manager or owner
    if user_id == store.store_manager or user_id == store.store_owner:
        # Fetch and return the inventory associated with the store
        stock_items = Inventory.query.filter_by(store_id=store_id).all()
        return jsonify([item.serialize() for item in stock_items]), 200

    # Optionally, check the user's role from the `User` model if necessary
    user = User.query.filter_by(id=user_id).first()
    if user and user.role in ['admin']:
        # Allow admin users to access any store’s inventory
        stock_items = Inventory.query.filter_by(store_id=store_id).all()
        return jsonify([item.serialize() for item in stock_items]), 200

    # If the user is neither the store manager, owner, nor admin
    return jsonify({"message": "Access denied. Only store managers, owners, or admins can view stock."}), 403

@api.route('/store', methods=['GET'])
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

def get_leads():
    leads = Lead.query.all()
    return jsonify([lead.serialize() for lead in leads]), 200

def update_lead(id):
    lead = Lead.query.get_or_404(id)
    data = request.json
    for key, value in data.items():
        setattr(lead, key, value)
    db.session.commit()
    return jsonify(lead.serialize()), 200

def get_campaigns():
    status = request.args.get('status')  # Optional filtering by status
    if status:
        campaigns = Campaign.query.filter_by(status=status).all()
    else:
        campaigns = Campaign.query.all()
    return jsonify([campaign.serialize() for campaign in campaigns]), 200

# Route to create a new campaign
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

def update_task(id):
    task = Task.query.get_or_404(id)
    data = request.json
    for key, value in data.items():
        setattr(task, key, value)
    db.session.commit()
    return jsonify(task.serialize()), 200

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

def get_promotion(id):
    promotion = PromotionalDeal.query.get_or_404(id)
    return jsonify(promotion.serialize()), 200

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
# ✅ Function to check and alert for low stock
def check_and_alert_low_stock(product_id):
    product = Product.query.get(product_id)
    if product:
        threshold = getattr(product, 'low_stock_threshold', 10)  # Default threshold if not set
        if product.current_stock < threshold:
            print(f"⚠️ Low stock alert for product '{product.name}' (ID: {product.id})")

            # Emit alert via WebSocket (optional)
            socketio.emit('low_stock_alert', {
                'product_id': product.id,
                'product_name': product.name,
                'current_stock': product.current_stock,
                'threshold': threshold,
                'message': f"Low stock alert for {product.name}"
            }, broadcast=True)

# ✅ Route to update stock and trigger alerts
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

    # Check for low stock alert
    check_and_alert_low_stock(product_id)

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
    

@api.route('/inventory/analytics', methods=['GET'])
def get_inventory_analytics():
    try:
        # Total number of products
        total_products = Product.query.count()

        # Total stock across all products
        total_stock = db.session.query(func.sum(Product.stock)).scalar() or 0

        # Out-of-stock products
        out_of_stock = Product.query.filter(Product.stock == 0).all()
        out_of_stock_list = [{"id": p.id, "name": p.name} for p in out_of_stock]

        # Low-stock products (threshold = 10 units)
        low_stock = Product.query.filter(Product.stock < 10, Product.stock > 0).all()
        low_stock_list = [{"id": p.id, "name": p.name, "stock": p.stock} for p in low_stock]

        # Products with the highest and lowest stock
        highest_stock_product = Product.query.order_by(Product.stock.desc()).first()
        lowest_stock_product = Product.query.order_by(Product.stock).first()

        # Average stock per product
        average_stock = total_stock / total_products if total_products > 0 else 0

        # Breakdown of products by category
        category_breakdown = db.session.query(Product.category, func.count(Product.id))\
            .group_by(Product.category).all()
        category_data = [{"category": category, "count": count} for category, count in category_breakdown]

        # Prepare the response
        response = {
            "total_products": total_products,
            "total_stock": total_stock,
            "out_of_stock_products": out_of_stock_list,
            "low_stock_products": low_stock_list,
            "average_stock": average_stock,
            "category_breakdown": category_data,
            "highest_stock_product": {
                "id": highest_stock_product.id,
                "name": highest_stock_product.name,
                "stock": highest_stock_product.stock
            } if highest_stock_product else None,
            "lowest_stock_product": {
                "id": lowest_stock_product.id,
                "name": lowest_stock_product.name,
                "stock": lowest_stock_product.stock
            } if lowest_stock_product else None
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500





# medical routes

api.route('/api/medical/patients', methods=['GET'])
def get_patients():
    patients = Patient.query.all()

    response = [
        {
            "name": f"{patient.first_name} {patient.last_name}",
            "age": patient.age,
            "prescription": patient.prescription,
            "last_visit": patient.last_visit.isoformat() if patient.last_visit else "N/A",
        }
        for patient in patients
    ]

    return jsonify(response), 200


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

@api.route('/api/medical/compliance/audits', methods=['GET'])
def get_compliance_audit_status():
    pending_audits = ComplianceAudit.query.filter_by(status="Pending").count()
    completed_audits = ComplianceAudit.query.filter_by(status="Completed").count()
    passed_audits = ComplianceAudit.query.filter_by(status="Passed").count()

    response = {
        "pending": pending_audits,
        "completed": completed_audits,
        "passed": passed_audits
    }

    return jsonify(response), 200

@api.route('/compliance/dashboard', methods=['GET'])
def get_compliance_dashboard():
    try:
        # Fetch overall compliance status
        compliance_status = ComplianceStatus.query.first()  # Assuming there is only one compliance status record
        
        # Fetch product compliance data
        product_compliance = ProductCompliance.query.all()
        inventory_compliance = InventoryCompliance.query.all()
        alerts = ComplianceAlert.query.order_by(ComplianceAlert.severity.desc()).all()  # Order by severity
        audit_history = AuditHistory.query.order_by(AuditHistory.date.desc()).all()
        license = License.query.first()
        employee_training = EmployeeTraining.query.order_by(EmployeeTraining.completed_date.desc()).all()

        # Construct response JSON
        response = {
            "overallComplianceStatus": compliance_status.status if compliance_status else "Unknown",
            "productCompliance": [product.serialize() for product in product_compliance],
            "inventoryCompliance": [item.serialize() for item in inventory_compliance],
            "alerts": [alert.serialize() for alert in alerts],
            "auditHistory": [audit.serialize() for audit in audit_history],
            "licenseStatus": license.status if license else "Unknown",
            "employeeTraining": [training.serialize() for training in employee_training]
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/reports', methods=['GET'])
@jwt_required()
def get_reports():
    report_type = request.args.get('type', 'all')  # Default to 'all' if no type is specified
    reports = Report.query
    if report_type != 'all':
        reports = reports.filter_by(type=report_type)
    reports = reports.order_by(Report.created_at.desc()).all()
    return jsonify([report.serialize() for report in reports]), 200

@api.route('/compliance/reports', methods=['GET'])
def generate_compliance_report():
    transactions = Transaction.query.all()
    report = [{"id": t.id, "amount": t.amount, "date": t.date.isoformat()} for t in transactions]
    return jsonify(report), 200

@api.route('/medical/analytics', methods=['GET'])
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
@api.route('/api/medical/revenue-chart', methods=['GET'])
def get_revenue_chart():
    result = db.session.query(
        func.strftime('%Y-%m', Sale.sale_date).label('month'),
        func.sum(Sale.total_amount).label('monthly_revenue')
    ).group_by('month').order_by('month').all()

    response = {
        "labels": [row[0] for row in result],  # Months
        "datasets": [
            {
                "label": "Revenue",
                "data": [row[1] for row in result],  # Revenue values
                "backgroundColor": "rgba(75, 192, 192, 0.6)",
                "borderColor": "rgba(75, 192, 192, 1)",
                "borderWidth": 1,
            }
        ]
    }

    return jsonify(response), 200


@api.route('/medical-resources', methods=['GET'])
def get_medical_resources():
    resources = MedicalResource.query.all()
    return jsonify([resource.serialize() for resource in resources]), 200

@api.route('/medical-resources/<int:id>', methods=['GET'])
def get_medical_resource(id):
    resource = MedicalResource.query.get_or_404(id)
    return jsonify(resource.serialize()), 200
@api.route('/appointments/<int:appointment_id>', methods=['GET'])
def get_appointment(appointment_id):
    appointment = Appointment.query.get_or_404(appointment_id)
    return jsonify(appointment.serialize()), 200

# ----------------------------
# POST: Create a new appointment
# ----------------------------
    return jsonify(insurance.serialize()), 200

# ----------------------------
# GET: Fetch insurance policies by patient ID
# ----------------------------
@api.route('/insurances/patient/<int:patient_id>', methods=['GET'])
def get_patient_insurances(patient_id):
    try:
        insurances = Insurance.query.filter_by(patient_id=patient_id).all()
        if not insurances:
            return jsonify({"message": "No insurance records found for this patient"}), 404
        return jsonify([insurance.serialize() for insurance in insurances]), 200
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500

# ----------------------------
# POST: Create a new insurance record
# ----------------------------
@api.route('/insurances', methods=['POST'])
def create_insurance():
    data = request.get_json()

    # Basic validation
    if not data.get('provider_name') or not data.get('policy_number'):
        return jsonify({"error": "Provider name and policy number are required"}), 400

    try:
        insurance = Insurance(
            patient_id=data['patient_id'],
            provider_name=data['provider_name'],
            policy_number=data['policy_number'],
            coverage_details=data.get('coverage_details')
        )
        db.session.add(insurance)
        db.session.commit()
        return jsonify(insurance.serialize()), 201
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500

# ----------------------------
# PUT: Update an existing insurance record
# ----------------------------
    data = request.get_json()

    # Example validation: Check if the insurance covers the procedure
    insurance = Insurance.query.get_or_404(data['insurance_id'])
    covered_procedures = insurance.coverage_details.get('covered_procedures', [])

    if data['procedure'] in covered_procedures:
        return jsonify({"message": "Procedure is covered"}), 200
    else:
        return jsonify({"message": "Procedure is not covered"}), 400

# ----------------------------
# POST: Create a new insurance claim
# ----------------------------
@api.route('/insurances/<int:insurance_id>/claims', methods=['POST'])
def create_claim(insurance_id):
    data = request.get_json()

    try:
        # Create and save a new claim record
        claim = Claim(
            insurance_id=insurance_id,
            claim_date=data['claim_date'],
            amount=data['amount'],
            status=data.get('status', 'Pending'),
            description=data.get('description')
        )
        db.session.add(claim)
        db.session.commit()
        return jsonify(claim.serialize()), 201
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500

# ----------------------------
# GET: Fetch all claims related to a specific insurance policy
# ----------------------------
def get_education_resources():
    resources = PatientEducationResource.query.all()
    return jsonify([resource.serialize() for resource in resources]), 200

@api.route('/education-resources/<int:resource_id>', methods=['GET'])
def get_education_resource(resource_id):
    resource = PatientEducationResource.query.get_or_404(resource_id)
    return jsonify(resource.serialize()), 200

    return jsonify([resource.serialize() for resource in resources]), 200

@api.route('/training-resources/<int:resource_id>', methods=['GET'])
def get_training_resource(resource_id):
    resource = StaffTrainingResource.query.get_or_404(resource_id)
    return jsonify(resource.serialize()), 200

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




def update_invoice(id):
    invoice = Invoice.query.get_or_404(id)
    data = request.json
    for key, value in data.items():
        setattr(invoice, key, value)
    db.session.commit()
    return jsonify(invoice.serialize()), 200


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

# @api.route('/resources', methods=['GET', 'POST'])
# def manage_resources():
#     if request.method == 'GET':
#         resources = Resource.query.all()
#         return jsonify([resource.serialize() for resource in resources]), 200
#     elif request.method == 'POST':
#         data = request.json
#         resource = Resource(name=data['name'], quantity=data['quantity'])
#         db.session.add(resource)
#         db.session.commit()
#         return jsonify(resource.serialize()), 201

# @api.route('/resources/<int:resource_id>', methods=['PUT', 'DELETE'])
# def manage_single_resource(resource_id):
#     resource = Resource.query.get_or_404(resource_id)

#     if request.method == 'PUT':
#         data = request.json
#         resource.name = data.get('name', resource.name)
#         resource.quantity = data.get('quantity', resource.quantity)
#         db.session.commit()
#         return jsonify(resource.serialize()), 200

#     elif request.method == 'DELETE':
#         db.session.delete(resource)
#         db.session.commit()
#         return jsonify({"message": "Resource deleted successfully"}), 200

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
    availability = fields.Bool(required=True)


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

@api.route('/analytics/clv-prediction', methods=['POST'])
def predict_clv():
    import numpy as np
    try:
        from sklearn.linear_model import LinearRegression
    except ImportError:
        LinearRegression = None

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


def clock_in():
    try:
        employee_id = request.json.get('employee_id')
        shift_id = request.json.get('shift_id')

        # Check if the employee is already clocked in
        time_log = TimeLog.query.filter_by(employee_id=employee_id, status='clocked_in').first()
        if time_log:
            return jsonify({"error": "Employee is already clocked in"}), 400

        # Create a new time log entry
        new_log = TimeLog(
            employee_id=employee_id,
            shift_id=shift_id,
            clock_in_time=datetime.utcnow(),
            status='clocked_in'
        )
        db.session.add(new_log)
        db.session.commit()
        return jsonify({
            "message": "Clock-in successful",
            "time_log": {
                "id": new_log.id,
                "clock_in_time": new_log.clock_in_time.isoformat(),
                "status": new_log.status
            }
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Database error occurred", "details": str(e)}), 500


@api.route('/clock-out', methods=['POST'])
def clock_out():
    try:
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

        return jsonify({
            "message": "Clock-out successful",
            "time_log": {
                "id": time_log.id,
                "clock_in_time": time_log.clock_in_time.isoformat(),
                "clock_out_time": time_log.clock_out_time.isoformat(),
                "total_hours": time_log.total_hours
            }
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Database error occurred", "details": str(e)}), 500

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

    return jsonify(order.serialize()), 200

@api.route('/wishlist', methods=['GET'])
@jwt_required()
def get_wishlist():
    user_id = get_jwt_identity()
    wishlist = Wishlist.query.filter_by(customer_id=user_id).all()
    return jsonify([item.serialize() for item in wishlist]), 200

def remove_from_wishlist(item_id):
    item = Wishlist.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Item removed from wishlist"}), 200


@api.route('/cart', methods=['GET'])
# @jwt_required()
# def get_cart():
#     user_id = get_jwt_identity()  # Assumes you use JWT to authenticate users
#     cart_items = Cart.query.filter_by(user_id=user_id).all()
#     return jsonify([item.serialize() for item in cart_items]), 200

@api.route('/cart/add', methods=['POST'])
@jwt_required()
@handle_errors
def add_to_cart():
    user_id = get_jwt_identity()
    data = request.json
    
    product_id = data.get('product_id')
    quantity = data.get('quantity', 1)
    
    if not product_id:
        return jsonify({"error": "Product ID required"}), 400
    
    # Check if product exists and has stock
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    
    if product.current_stock < quantity:
        return jsonify({"error": f"Insufficient stock. Only {product.current_stock} available"}), 400
    
    # Check if item already in cart
    existing_item = CartItem.query.filter_by(
        user_id=user_id, 
        product_id=product_id, 
        saved_for_later=False
    ).first()
    
    if existing_item:
        new_quantity = existing_item.quantity + quantity
        if new_quantity > product.current_stock:
            return jsonify({"error": f"Cannot add more. Only {product.current_stock} available"}), 400
        existing_item.quantity = new_quantity
    else:
        new_item = CartItem(
            user_id=user_id,
            product_id=product_id,
            quantity=quantity
        )
        db.session.add(new_item)
    
    db.session.commit()
    
    # Return updated cart
    cart_items = CartItem.query.filter_by(user_id=user_id, saved_for_later=False).all()
    return jsonify({
        "message": "Item added to cart",
        "items": [item.serialize() for item in cart_items]
    }), 200
  

@api.route('/cart/<int:item_id>', methods=['DELETE'])
@jwt_required()
@handle_errors
def remove_cart_item(item_id):
    user_id = get_jwt_identity()
    
    cart_item = CartItem.query.filter_by(id=item_id, user_id=user_id).first()
    if not cart_item:
        return jsonify({"error": "Cart item not found"}), 404
    
    db.session.delete(cart_item)
    db.session.commit()
    
    return jsonify({"message": "Item removed from cart"}), 200


# ---------------------
# Clear Cart
# ---------------------
def save_for_later():
    user_id = get_jwt_identity()
    data = request.json
    
    item_id = data.get('item_id')
    if not item_id:
        return jsonify({"error": "Item ID required"}), 400
    
    cart_item = CartItem.query.filter_by(id=item_id, user_id=user_id).first()
    if not cart_item:
        return jsonify({"error": "Cart item not found"}), 404
    
    cart_item.saved_for_later = True
    db.session.commit()
    
    return jsonify({"message": "Item saved for later"}), 200


# ---------------------
# Move Saved Item to Cart
# ---------------------
@api.route('/cart/move-to-cart', methods=['POST'])
@jwt_required()
@handle_errors
def move_to_cart():
    user_id = get_jwt_identity()
    data = request.json
    
    item_id = data.get('item_id')
    if not item_id:
        return jsonify({"error": "Item ID required"}), 400
    
    cart_item = CartItem.query.filter_by(id=item_id, user_id=user_id, saved_for_later=True).first()
    if not cart_item:
        return jsonify({"error": "Saved item not found"}), 404
    
    # Check if item already in cart
    existing_cart_item = CartItem.query.filter_by(
        user_id=user_id, 
        product_id=cart_item.product_id, 
        saved_for_later=False
    ).first()
    
    if existing_cart_item:
        existing_cart_item.quantity += cart_item.quantity
        db.session.delete(cart_item)
    else:
        cart_item.saved_for_later = False
    
    db.session.commit()
    
    return jsonify({"message": "Item moved to cart"}), 200


# ---------------------
# Apply Discount Code
# ---------------------
@api.route('/cart/apply-discount', methods=['POST'])
@jwt_required()
@handle_errors
def apply_discount():
    data = request.json
    code = data.get('code', '').strip().upper()
    
    if not code:
        return jsonify({"error": "Discount code required"}), 400
    
    discount = DiscountCode.query.filter_by(code=code, is_active=True).first()
    
    if not discount:
        return jsonify({"error": "Invalid discount code"}), 404
    
    # Check if expired
    if discount.expires_at and discount.expires_at < datetime.utcnow():
        return jsonify({"error": "Discount code has expired"}), 400
    
    # Check usage limit
    if discount.usage_limit and discount.times_used >= discount.usage_limit:
        return jsonify({"error": "Discount code usage limit reached"}), 400
    
    return jsonify({
        "success": True,
        "discount_percent": discount.discount_percent,
        "message": f"{discount.discount_percent}% discount applied"
    }), 200


# ---------------------
# Get Cart Summary (for header/badge)
# ---------------------
@api.route('/cart/summary', methods=['GET'])
@jwt_required()
@handle_errors
def get_cart_summary():
    user_id = get_jwt_identity()
    
    cart_items = CartItem.query.filter_by(user_id=user_id, saved_for_later=False).all()
    
    item_count = sum(item.quantity for item in cart_items)
    total = sum(float(item.product.unit_price) * item.quantity for item in cart_items)
    
    return jsonify({
        "item_count": item_count,
        "total": total
    }), 200




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
        product = Product.query.get(item.product_id)
        if not product or product.current_stock < item.quantity:
            return jsonify({"error": f"Insufficient stock for {product.name}"}), 400

        product.current_stock -= item.quantity
        db.session.add(product)

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
    order.status = "completed"  # Update the status to completed
    db.session.commit()

    return jsonify({"message": "Order created", "order_id": order.id, "total": total}), 201






@api.route('/payment-methods', methods=['GET'])
@jwt_required()
def get_payment_methods():
    user_id = get_jwt_identity()
    payment_methods = PaymentMethod.query.filter_by(customer_id=user_id).all()
    return jsonify([method.serialize() for method in payment_methods]), 200

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

def get_subscriptions():
    user_id = get_jwt_identity()
    subscriptions = Subscription.query.filter_by(customer_id=user_id).all()
    return jsonify([sub.serialize() for sub in subscriptions]), 200

@api.route('/subscriptions/<int:sub_id>', methods=['GET'])
@jwt_required()
def get_subscription_details(sub_id):
    subscription = Subscription.query.get_or_404(sub_id)
    return jsonify(subscription.serialize()), 200


    # Hypothetical functions for additional details
    next_tier_points = calculate_points_for_next_tier(customer.loyalty_tier) if 'calculate_points_for_next_tier' in globals() else None
    available_rewards = get_rewards_for_tier(customer.loyalty_tier) if 'get_rewards_for_tier' in globals() else []

    return jsonify({
        "points": customer.loyalty_points,
        "tier": customer.loyalty_tier,
        "next_tier_points": next_tier_points,
        "available_rewards": available_rewards
    }), 200



@api.route('/loyalty-program/history', methods=['GET'])
@jwt_required()
def get_loyalty_history():
    user_id = get_jwt_identity()
    history = LoyaltyHistory.query.filter_by(customer_id=user_id).all()
    return jsonify([entry.serialize() for entry in history]), 200

@api.route('/loyalty/redeem', methods=['POST'])
@jwt_required()
def redeem_loyalty_points():
    user_id = get_jwt_identity()
    data = request.json

    # Support for passing explicit customer_id for admin context
    customer_id = data.get('customer_id', user_id)
    points_to_redeem = data.get('points', 0)

    customer = Customer.query.get_or_404(customer_id)

    if customer.loyalty_points < points_to_redeem:
        return jsonify({"error": "Insufficient loyalty points"}), 400

    # Optional: Handle monetary discount conversion
    discount = points_to_redeem / 100  # Example: 100 points = $1

    customer.loyalty_points -= points_to_redeem
    db.session.commit()

    return jsonify({
        "message": f"Redeemed {points_to_redeem} points.",
        "discount": f"${discount:.2f}",
        "remaining_points": customer.loyalty_points
    }), 200

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

def get_addresses():
    user_id = get_jwt_identity()
    addresses = Address.query.filter_by(customer_id=user_id).all()
    return jsonify([addr.serialize() for addr in addresses]), 200

def update_address(address_id):
    address = Address.query.get_or_404(address_id)
    data = request.json
    for key, value in data.items():
        setattr(address, key, value)
    db.session.commit()
    return jsonify(address.serialize()), 200
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
def calculate_payroll():
    data = request.json
    employee_id = data['employee_id']
    pay_period_start = datetime.fromisoformat(data['pay_period_start']).date()
    pay_period_end = datetime.fromisoformat(data['pay_period_end']).date()
    hourly_rate = data['hourly_rate']

    # Step 1: Calculate total hours worked within the pay period
    total_hours = db.session.query(
        db.func.sum(TimeLog.total_hours)
    ).filter(
        TimeLog.employee_id == employee_id,
        TimeLog.clock_in_time >= pay_period_start,
        TimeLog.clock_out_time <= pay_period_end
    ).scalar() or 0.0

    # Step 2: Calculate overtime (if applicable)
    standard_hours = min(total_hours, 40)  # Assuming 40 hours is standard
    overtime_hours = max(0, total_hours - 40)
    overtime_rate = 1.5 * hourly_rate  # 1.5x pay for overtime

    # Step 3: Calculate total pay
    total_pay = (standard_hours * hourly_rate) + (overtime_hours * overtime_rate)

    # Step 4: Create payroll record
    payroll = Payroll(
        employee_id=employee_id,
        pay_period_start=pay_period_start,
        pay_period_end=pay_period_end,
        total_hours=total_hours,
        hourly_rate=hourly_rate,
        total_pay=total_pay
    )
    db.session.add(payroll)
    db.session.commit()

    return jsonify({
        "message": "Payroll calculated successfully",
        "employee_id": employee_id,
        "total_hours": total_hours,
        "standard_hours": standard_hours,
        "overtime_hours": overtime_hours,
        "total_pay": total_pay
    }), 200


# Route to get all time logs
@api.route('/time_logs', methods=['GET'])
def get_time_logs():
    logs = TimeLog.query.all()
    return jsonify([log.serialize() for log in logs]), 200

# Route to create a new time log
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

@api.route('/reports/sales', methods=['GET'])
@jwt_required()
def get_sales_report():
    user_id = get_jwt_identity()  # For user-specific reports, if needed
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    breakdown = request.args.get("breakdown", "daily")  # Options: daily, weekly, monthly, payment_method, category

    # Validate and parse date range
    try:
        if start_date:
            start_date = datetime.strptime(start_date, "%Y-%m-%d")
        if end_date:
            end_date = datetime.strptime(end_date, "%Y-%m-%d")
        else:
            end_date = datetime.utcnow()
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400

    # Base query
    query = Order.query.filter(Order.status == "completed")
    if start_date:
        query = query.filter(Order.created_at >= start_date)
    if end_date:
        query = query.filter(Order.created_at <= end_date)

    # Group data based on breakdown criteria
    if breakdown == "daily":
        results = query.with_entities(
            func.date(Order.created_at).label("date"),
            func.sum(Order.total_amount).label("total_sales")
        ).group_by(func.date(Order.created_at)).order_by("date").all()
    elif breakdown == "weekly":
        results = query.with_entities(
            func.year(Order.created_at).label("year"),
            func.week(Order.created_at).label("week"),
            func.sum(Order.total_amount).label("total_sales")
        ).group_by("year", "week").order_by("year", "week").all()
    elif breakdown == "monthly":
        results = query.with_entities(
            func.year(Order.created_at).label("year"),
            func.month(Order.created_at).label("month"),
            func.sum(Order.total_amount).label("total_sales")
        ).group_by("year", "month").order_by("year", "month").all()
    elif breakdown == "payment_method":
        results = query.join(PaymentLog, Order.id == PaymentLog.order_id).with_entities(
            PaymentLog.payment_method,
            func.sum(PaymentLog.amount).label("total_sales")
        ).group_by(PaymentLog.payment_method).order_by("total_sales").all()
    elif breakdown == "category":
        results = query.join(OrderItem, Order.id == OrderItem.order_id).join(Product, Product.id == OrderItem.product_id).with_entities(
            Product.category,
            func.sum(OrderItem.quantity).label("total_sales")
        ).group_by(Product.category).order_by("total_sales").all()
    else:
        return jsonify({"error": "Invalid breakdown type"}), 400

    # Format the results
    formatted_results = [{"label": row[0], "value": row[1]} for row in results]

    return jsonify({
        "breakdown": breakdown,
        "results": formatted_results
    }), 200

@api.route('/shifts', methods=['POST'])
def create_shift():
    data = request.json
    shift = Shift(
        employee_id=data['employee_id'],
        shift_start=datetime.fromisoformat(data['shift_start']),
        shift_end=datetime.fromisoformat(data['shift_end']),
        status="scheduled"
    )
    db.session.add(shift)
    db.session.commit()
    return jsonify({"message": "Shift created successfully", "shift": shift.id}), 201

@api.route('/api/prescriptions', methods=['GET'])
def get_prescriptions():
    prescriptions = Prescription.query.all()
    return jsonify([{
        'id': p.id,
        'patientId': p.patient_id,
        'medication': p.medication,
        'dosage': p.dosage,
        'frequency': p.frequency
    } for p in prescriptions]), 200

# POST new prescription
def get_public_deals():
    deals = Deal.query.filter_by(stage="published").all()
    return jsonify([deal.to_dict() for deal in deals])


# leafbridgeconnect



# -------------------- USERS --------------------
@api.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    users = User.query.all()
    return jsonify([user.serialize(include_interests=True) for user in users]), 200

@api.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    return jsonify(user.serialize(include_interests=True)), 200

# -------------------- INTERESTS --------------------
@api.route('/interests', methods=['GET'])
def get_all_interests():
    interests = Interest.query.all()
    return jsonify([i.serialize() for i in interests]), 200

@api.route('/user/interests', methods=['POST'])
@jwt_required()
def add_user_interests():
    user_id = get_jwt_identity()
    interest_ids = request.json.get('interest_ids', [])

    UserInterest.query.filter_by(user_id=user_id).delete()
    for interest_id in interest_ids:
        db.session.add(UserInterest(user_id=user_id, interest_id=interest_id))
    db.session.commit()

    return jsonify({"msg": "Interests updated"}), 200

# -------------------- COMPANIES --------------------
@api.route('/companies', methods=['POST'])
@jwt_required()
def create_company():
    data = request.json
    name = data.get('name')
    description = data.get('description')
    user_id = get_jwt_identity()

    new_company = Company(name=name, description=description, owner_id=user_id)
    db.session.add(new_company)
    db.session.commit()

    return jsonify(new_company.serialize()), 201

@api.route('/companies/<int:company_id>', methods=['GET'])
def get_company(company_id):
    company = Company.query.get(company_id)
    if not company:
        return jsonify({"msg": "Company not found"}), 404
    return jsonify(company.serialize(include_jobs=True)), 200

# -------------------- JOBS --------------------
@api.route('/companies/<int:company_id>/jobs', methods=['POST'])
@jwt_required()
def post_job(company_id):
    data = request.json
    title = data.get('title')
    description = data.get('description')
    location = data.get('location')
    job = Job(title=title, description=description, location=location, company_id=company_id)
    db.session.add(job)
    db.session.commit()
    return jsonify(job.serialize()), 201

@api.route('/jobs', methods=['GET'])
def get_jobs():
    jobs = Job.query.all()
    return jsonify([j.serialize() for j in jobs]), 200

# -------------------- FAVORITES --------------------
@api.route('/favorites/<int:target_user_id>', methods=['POST'])
@jwt_required()
def add_favorite(target_user_id):
    current_user_id = get_jwt_identity()
    if FavoriteConnect.query.filter_by(user_id=current_user_id, target_user_id=target_user_id).first():
        return jsonify({"msg": "Already in favorites"}), 400
    fav = FavoriteConnect(user_id=current_user_id, target_user_id=target_user_id)
    db.session.add(fav)
    db.session.commit()
    return jsonify({"msg": "Favorite added"}), 201

@api.route('/favorites', methods=['GET'])
@jwt_required()
def get_favorites():
    current_user_id = get_jwt_identity()
    favs = FavoriteConnect.query.filter_by(user_id=current_user_id).all()
    return jsonify([f.target_user.serialize() for f in favs]), 200

# -------------------- MESSAGES --------------------
@api.route('/messages', methods=['POST'])
@jwt_required()
def send_message():
    data = request.json
    sender_id = get_jwt_identity()
    recipient_id = data.get('recipient_id')
    content = data.get('content')

    msg = Message(sender_id=sender_id, recipient_id=recipient_id, content=content)
    db.session.add(msg)
    db.session.commit()

    return jsonify(msg.serialize()), 201

@api.route('/messages/<int:user_id>', methods=['GET'])
@jwt_required()
def get_messages(user_id):
    current_user_id = get_jwt_identity()
    messages = Message.query.filter(
        ((Message.sender_id == current_user_id) & (Message.recipient_id == user_id)) |
        ((Message.sender_id == user_id) & (Message.recipient_id == current_user_id))
    ).order_by(Message.timestamp).all()
    return jsonify([m.serialize() for m in messages]), 200

# Example logic for calculating points needed for the next tier
def calculate_points_for_next_tier(current_tier):
    tier_thresholds = {
        'bronze': 500,
        'silver': 1000,
        'gold': 2000,
        'platinum': 5000
    }
    return tier_thresholds.get(current_tier, 0)

# Example logic for rewards per tier
def get_rewards_for_tier(tier):
    rewards = {
        'bronze': ['5% off coupon'],
        'silver': ['10% off coupon', 'free grinder'],
        'gold': ['15% off coupon', 'free pre-roll'],
        'platinum': ['25% off', 'exclusive merch', 'VIP events']
    }
    return rewards.get(tier, [])


def hello():
    return jsonify({"message": "Hello from the backend!"}), 200





@api.route('/my-applications', methods=['GET'])
@jwt_required()
@handle_errors
def get_my_applications():
    user_id = get_jwt_identity()
    apps = JobApplication.query.filter_by(user_id=user_id).all()
    result = []
    for app in apps:
        job = Job.query.get(app.job_id)
        company = Company.query.get(app.company_id) if app.company_id else None
        result.append({"id": app.id, "job_id": app.job_id, "job_title": job.title if job else "Unknown", "company_name": company.name if company else "Unknown", "location": job.location if job else "", "applied_at": app.applied_at.isoformat() if app.applied_at else None})
    return jsonify(result), 200

import boto3
from botocore.config import Config
import os
import uuid

def get_r2_client():
    return boto3.client(
        's3',
        endpoint_url=os.getenv('R2_ENDPOINT_URL'),
        aws_access_key_id=os.getenv('R2_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('R2_SECRET_ACCESS_KEY'),
        config=Config(signature_version='s3v4'),
        region_name='auto'
    )

@api.route('/training/upload-video', methods=['POST'])
@jwt_required()
@handle_errors
def upload_training_video():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    company_id = user.company_id if user else 'unknown'

    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    if not file.filename:
        return jsonify({"error": "No file selected"}), 400

    allowed = {'mp4', 'mov', 'avi', 'webm', 'mkv', 'pdf', 'doc', 'docx'}
    ext = file.filename.rsplit('.', 1)[-1].lower()
    if ext not in allowed:
        return jsonify({"error": f"File type .{ext} not allowed"}), 400

    filename = f"dispensarymaster/training/company_{company_id}/{uuid.uuid4()}.{ext}"

    r2 = get_r2_client()
    r2.upload_fileobj(
        file,
        os.getenv('R2_BUCKET_NAME'),
        filename,
        ExtraArgs={'ContentType': file.content_type}
    )

    public_url = f"{os.getenv('R2_ENDPOINT_URL')}/{os.getenv('R2_BUCKET_NAME')}/{filename}"
    return jsonify({"url": public_url, "filename": filename}), 200

# -------------------- TRAINING COMPLETION TRACKING --------------------
@api.route('/training-completions', methods=['POST'])
@jwt_required()
@handle_errors
def mark_training_complete():
    user_id = get_jwt_identity()
    data = request.json
    resource_id = data.get('resource_id')
    
    existing = EmployeeTraining.query.filter_by(
        user_id=user_id, 
        training_resource_id=resource_id
    ).first()
    
    if not existing:
        completion = EmployeeTraining(
            user_id=user_id,
            training_resource_id=resource_id,
            completion_date=datetime.utcnow(),
            status='completed'
        )
        db.session.add(completion)
        db.session.commit()
    return jsonify({"success": True, "message": "Training marked complete"}), 200

def get_team_completions():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or user.role not in ["admin", "owner", "manager"]:
        return jsonify({"error": "Access denied"}), 403
    
    company_id = user.company_id
    resources = StaffTrainingResource.query.filter_by(company_id=company_id).all()
    resource_ids = [r.id for r in resources]
    
    completions = EmployeeTraining.query.filter(
        EmployeeTraining.training_resource_id.in_(resource_ids)
    ).all() if resource_ids else []
    
    result = []
    for c in completions:
        u = User.query.get(c.user_id)
        r = StaffTrainingResource.query.get(c.training_resource_id)
        result.append({
            "user_id": c.user_id,
            "user_email": u.email if u else "Unknown",
            "resource_id": c.training_resource_id,
            "resource_title": r.title if r else "Unknown",
            "completed_at": c.completion_date.isoformat() if c.completion_date else None,
            "status": c.status
        })
    return jsonify(result), 200

# -------------------- JOB APPLICATION --------------------
@api.route('/apply', methods=['POST'])
@jwt_required()
@handle_errors
def apply_to_job():
    user_id = get_jwt_identity()
    data = request.json
    job_id = data.get('job_id')
    company_id = data.get('company_id')

    if not job_id:
        return jsonify({"error": "job_id required"}), 400

    # Check if already applied
    existing = JobApplication.query.filter_by(user_id=user_id, job_id=job_id).first()
    if existing:
        return jsonify({"msg": "Already applied", "id": existing.id}), 200

    application = JobApplication(
        user_id=user_id,
        job_id=job_id,
        company_id=company_id,
        applicant_name=data.get('name', ''),
        applicant_email=data.get('email', ''),
        applicant_phone=data.get('phone', ''),
        cover_letter=data.get('cover_letter', ''),
        status='pending',
        applied_at=datetime.utcnow()
    )
    db.session.add(application)
    db.session.commit()
    return jsonify({"msg": "Applied successfully", "id": application.id}), 201

@api.route('/jobs/<int:job_id>/applications', methods=['GET'])
@jwt_required()
@handle_errors
def get_job_applications(job_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or user.role not in ['admin', 'owner', 'manager']:
        return jsonify({"error": "Access denied"}), 403
    apps = JobApplication.query.filter_by(job_id=job_id).all()
    return jsonify([a.serialize() for a in apps]), 200

@api.route('/jobs/<int:job_id>/applications/<int:app_id>', methods=['PUT'])
@jwt_required()
@handle_errors
def update_application_status(job_id, app_id):
    application = JobApplication.query.get_or_404(app_id)
    data = request.json
    application.status = data.get('status', application.status)
    db.session.commit()
    return jsonify(application.serialize()), 200

@api.route('/jobs/<int:job_id>', methods=['DELETE'])
@jwt_required()
@handle_errors
def delete_job(job_id):
    job = Job.query.get_or_404(job_id)
    db.session.delete(job)
    db.session.commit()
    return jsonify({"message": "Job deleted"}), 200

    db.session.delete(log)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200

# ==================== GROW FARMS - STRAINS ====================
@api.route('/strains', methods=['GET'])
@handle_errors
def get_strains():
    strains = Strain.query.all() if hasattr(Strain, 'query') else []
    return jsonify([s.serialize() for s in strains] if strains else []), 200

def get_pest_disease():
    issues = PestDiseaseIssue.query.all() if hasattr(PestDiseaseIssue, 'query') else []
    return jsonify([i.serialize() for i in issues] if issues else []), 200

def get_storage_conditions():
    batches = SeedBatch.query.all()
    result = []
    for b in batches:
        result.append({
            "id": b.id,
            "strain": b.strain,
            "batch_number": b.batch_number,
            "storage_location": b.storage_location,
            "quantity": b.quantity,
            "expiration_date": b.expiration_date.isoformat() if b.expiration_date else None,
            "germination_rate": float(b.germination_rate) if b.germination_rate else None,
        })
    return jsonify(result), 200

@api.route('/seedbanks/overview', methods=['GET'])
@jwt_required()
@handle_errors
def get_seedbank_overview():
    from datetime import date
    today = date.today()
    batches = SeedBatch.query.all()
    total_seeds = sum(b.quantity or 0 for b in batches)
    expired = [b for b in batches if b.expiration_date and b.expiration_date < today]
    expiring = [b for b in batches if b.expiration_date and 0 <= (b.expiration_date - today).days <= 30]
    low_stock = [b for b in batches if (b.quantity or 0) < 10]
    return jsonify({
        "total_batches": len(batches),
        "total_seeds": total_seeds,
        "expired_batches": len(expired),
        "expiring_soon": len(expiring),
        "low_stock": len(low_stock),
        "seedbanks": [s.serialize() for s in Seedbank.query.all()],
    }), 200

# ==================== CUSTOMER DASHBOARD API ====================
@api.route('/customer/profile', methods=['GET'])
@jwt_required()
@handle_errors
def get_customer_profile_me():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    customer = Customer.query.filter_by(email=user.email).first()
    if not customer:
        return jsonify({
            "id": user_id,
            "email": user.email,
            "role": user.role,
            "first_name": "",
            "last_name": "",
            "phone": "",
            "membership_level": "standard",
            "loyalty_points": 0,
            "total_orders": Order.query.filter_by(customer_id=0).count(),
        }), 200
    orders = Order.query.filter_by(customer_id=customer.id).all()
    total_spent = sum(float(o.total_amount or 0) for o in orders)
    return jsonify({
        "id": customer.id,
        "email": customer.email,
        "first_name": customer.first_name,
        "last_name": customer.last_name,
        "phone": customer.phone,
        "membership_level": customer.membership_level,
        "verification_status": customer.verification_status,
        "loyalty_points": getattr(customer, 'loyalty_points', 0),
        "total_orders": len(orders),
        "total_spent": round(total_spent, 2),
        "preferences": customer.preferences,
    }), 200

def get_customer_orders_me():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    customer = Customer.query.filter_by(email=user.email).first()
    if not customer:
        return jsonify([]), 200
    orders = Order.query.filter_by(customer_id=customer.id).order_by(Order.created_at.desc()).all()
    result = []
    for o in orders:
        items = OrderItem.query.filter_by(order_id=o.id).all()
        order_data = o.serialize()
        order_data['items'] = []
        for item in items:
            product = Product.query.get(item.product_id)
            order_data['items'].append({
                "product_name": product.name if product else "Unknown",
                "quantity": item.quantity,
                "unit_price": float(item.unit_price),
                "subtotal": float(item.unit_price) * item.quantity
            })
        result.append(order_data)
    return jsonify(result), 200

@api.route('/customer/recommendations', methods=['GET'])
@jwt_required()
@handle_errors
def get_customer_recommendations():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    products = Product.query.filter(Product.current_stock > 0).limit(8).all()
    return jsonify([p.serialize() for p in products]), 200

@api.route('/customer/notifications', methods=['GET'])
@jwt_required()
@handle_errors
def get_customer_notifications():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    customer = Customer.query.filter_by(email=user.email).first()
    notifications = []
    if customer:
        orders = Order.query.filter_by(customer_id=customer.id).order_by(Order.created_at.desc()).limit(5).all()
        for o in orders:
            notifications.append({
                "id": o.id,
                "type": "order",
                "message": f"Order #{o.id} is {o.status}",
                "date": o.created_at.isoformat() if o.created_at else None,
                "read": True
            })
    deals = Deal.query.filter_by(is_active=True).limit(3).all() if hasattr(Deal, 'query') else []
    for d in deals:
        notifications.append({
            "id": f"deal-{d.id}",
            "type": "promotion",
            "message": f"New deal: {d.title} — {d.discount_percent}% off",
            "date": None,
            "read": False
        })
    return jsonify(notifications), 200

# ==================== LEAFBRIDGE CONNECT ROUTES ====================

# --- RESUME ROUTES ---
@api.route('/resumes', methods=['GET'])
@jwt_required()
@handle_errors
def get_resumes():
    """Dispensaries search resumes"""
    role = request.args.get('desired_role', '')
    location = request.args.get('location', '')
    cannabis_exp = request.args.get('cannabis_experience')
    min_years = request.args.get('min_years', 0, type=int)

    query = Resume.query.filter_by(is_visible=True)
    if role:
        query = query.filter(Resume.desired_role.ilike(f'%{role}%'))
    if location:
        query = query.filter(Resume.location.ilike(f'%{location}%'))
    if cannabis_exp == 'true':
        query = query.filter_by(cannabis_experience=True)
    if min_years:
        query = query.filter(Resume.experience_years >= min_years)

    resumes = query.order_by(Resume.created_at.desc()).all()
    return jsonify([r.serialize() for r in resumes]), 200

@api.route('/resumes/me', methods=['GET'])
@jwt_required()
@handle_errors
def get_my_resume():
    user_id = get_jwt_identity()
    resume = Resume.query.filter_by(user_id=user_id).first()
    if not resume:
        return jsonify({"error": "No resume found"}), 404
    return jsonify(resume.serialize()), 200

@api.route('/resumes', methods=['POST'])
@jwt_required()
@handle_errors
def create_resume():
    user_id = get_jwt_identity()
    data = request.json
    existing = Resume.query.filter_by(user_id=user_id).first()
    if existing:
        for key, value in data.items():
            setattr(existing, key, value)
        db.session.commit()
        return jsonify(existing.serialize()), 200
    resume = Resume(user_id=user_id, **{k: v for k, v in data.items() if hasattr(Resume, k)})
    db.session.add(resume)
    db.session.commit()
    return jsonify(resume.serialize()), 201

@api.route('/resumes/<int:id>', methods=['PUT'])
@jwt_required()
@handle_errors
def update_resume(id):
    user_id = get_jwt_identity()
    resume = Resume.query.filter_by(id=id, user_id=user_id).first_or_404()
    data = request.json
    for key, value in data.items():
        if hasattr(resume, key):
            setattr(resume, key, value)
    db.session.commit()
    return jsonify(resume.serialize()), 200

@api.route('/resumes/upload', methods=['POST'])
@jwt_required()
@handle_errors
def upload_resume_file():
    user_id = get_jwt_identity()
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files['file']
    allowed = {'pdf', 'doc', 'docx'}
    ext = file.filename.rsplit('.', 1)[-1].lower()
    if ext not in allowed:
        return jsonify({"error": "Only PDF, DOC, DOCX allowed"}), 400
    import uuid
    filename = f"leafbridge/resumes/user_{user_id}/{uuid.uuid4()}.{ext}"
    r2 = get_r2_client()
    r2.upload_fileobj(file, os.getenv('R2_BUCKET_NAME'), filename, ExtraArgs={'ContentType': file.content_type})
    public_url = f"{os.getenv('R2_ENDPOINT_URL')}/{os.getenv('R2_BUCKET_NAME')}/{filename}"
    resume = Resume.query.filter_by(user_id=user_id).first()
    if resume:
        resume.resume_url = public_url
        db.session.commit()
    return jsonify({"resume_url": public_url}), 200

# --- SAVED JOBS ---
@api.route('/saved-jobs', methods=['GET'])
@jwt_required()
@handle_errors
def get_saved_jobs():
    user_id = get_jwt_identity()
    saved = SavedJob.query.filter_by(user_id=user_id).all()
    return jsonify([s.serialize() for s in saved]), 200

@api.route('/saved-jobs', methods=['POST'])
@jwt_required()
@handle_errors
def save_job():
    user_id = get_jwt_identity()
    job_id = request.json.get('job_id')
    existing = SavedJob.query.filter_by(user_id=user_id, job_id=job_id).first()
    if existing:
        db.session.delete(existing)
        db.session.commit()
        return jsonify({"message": "Job unsaved"}), 200
    saved = SavedJob(user_id=user_id, job_id=job_id)
    db.session.add(saved)
    db.session.commit()
    return jsonify(saved.serialize()), 201

# --- ONBOARDING ROUTES ---
@api.route('/onboarding', methods=['GET'])
@jwt_required()
@handle_errors
def get_onboarding():
    user_id = get_jwt_identity()
    checklists = OnboardingChecklist.query.filter_by(employee_id=user_id).all()
    return jsonify([c.serialize() for c in checklists]), 200

@api.route('/onboarding', methods=['POST'])
@jwt_required()
@handle_errors
def create_onboarding():
    data = request.json
    checklist = OnboardingChecklist(
        company_id=data['company_id'],
        employee_id=data['employee_id'],
        title=data.get('title', 'New Employee Onboarding'),
        state=data.get('state', '')
    )
    db.session.add(checklist)
    db.session.flush()

    STATE_TEMPLATES = {
        'MA': [
            {"title": "Sign Employment Contract", "category": "paperwork", "due_days": 1},
            {"title": "Complete I-9 Verification", "category": "compliance", "due_days": 1},
            {"title": "Submit MA Cannabis Handler Permit", "category": "compliance", "due_days": 3},
            {"title": "Complete CORI Background Check", "category": "compliance", "due_days": 3},
            {"title": "Review MA Cannabis Control Commission Rules", "category": "training", "due_days": 5},
            {"title": "Setup Direct Deposit", "category": "paperwork", "due_days": 3},
            {"title": "Complete Sexual Harassment Training", "category": "training", "due_days": 7},
            {"title": "Receive Employee Handbook", "category": "paperwork", "due_days": 1},
            {"title": "Setup POS System Access", "category": "equipment", "due_days": 2},
            {"title": "Complete Seed-to-Sale Training", "category": "training", "due_days": 7},
        ],
        'CA': [
            {"title": "Sign Employment Contract", "category": "paperwork", "due_days": 1},
            {"title": "Complete I-9 Verification", "category": "compliance", "due_days": 1},
            {"title": "Submit CA Cannabis Worker Permit", "category": "compliance", "due_days": 3},
            {"title": "Complete Live Scan Background Check", "category": "compliance", "due_days": 3},
            {"title": "Review DCC Regulations", "category": "training", "due_days": 5},
            {"title": "Setup Direct Deposit", "category": "paperwork", "due_days": 3},
            {"title": "Complete Responsible Vendor Training", "category": "training", "due_days": 7},
            {"title": "Receive Employee Handbook", "category": "paperwork", "due_days": 1},
            {"title": "Setup Metrc System Access", "category": "equipment", "due_days": 2},
        ],
        'CO': [
            {"title": "Sign Employment Contract", "category": "paperwork", "due_days": 1},
            {"title": "Complete I-9 Verification", "category": "compliance", "due_days": 1},
            {"title": "Submit MED Badge Application", "category": "compliance", "due_days": 3},
            {"title": "Complete Background Check", "category": "compliance", "due_days": 3},
            {"title": "Review MED Rules and Regulations", "category": "training", "due_days": 5},
            {"title": "Setup Direct Deposit", "category": "paperwork", "due_days": 3},
            {"title": "Complete Cannabis Training", "category": "training", "due_days": 7},
            {"title": "Receive Employee Handbook", "category": "paperwork", "due_days": 1},
        ],
        'DEFAULT': [
            {"title": "Sign Employment Contract", "category": "paperwork", "due_days": 1},
            {"title": "Complete I-9 Verification", "category": "compliance", "due_days": 1},
            {"title": "Submit State Cannabis Worker Permit", "category": "compliance", "due_days": 3},
            {"title": "Complete Background Check", "category": "compliance", "due_days": 3},
            {"title": "Review State Cannabis Regulations", "category": "training", "due_days": 5},
            {"title": "Setup Direct Deposit", "category": "paperwork", "due_days": 3},
            {"title": "Complete Cannabis Compliance Training", "category": "training", "due_days": 7},
            {"title": "Receive Employee Handbook", "category": "paperwork", "due_days": 1},
            {"title": "Setup System Access", "category": "equipment", "due_days": 2},
        ]
    }

    state = data.get('state', 'DEFAULT').upper()
    template = STATE_TEMPLATES.get(state, STATE_TEMPLATES['DEFAULT'])
    custom_tasks = data.get('tasks', [])
    all_tasks = template + custom_tasks

    for task_data in all_tasks:
        task = OnboardingTask(
            checklist_id=checklist.id,
            title=task_data['title'],
            category=task_data.get('category', 'general'),
            due_days=task_data.get('due_days', 3),
            required=task_data.get('required', True),
        )
        db.session.add(task)

    db.session.commit()
    return jsonify(checklist.serialize()), 201

@api.route('/onboarding/<int:id>', methods=['GET'])
@jwt_required()
@handle_errors
def get_onboarding_detail(id):
    checklist = OnboardingChecklist.query.get_or_404(id)
    return jsonify(checklist.serialize()), 200

@api.route('/onboarding/tasks/<int:task_id>/complete', methods=['PUT'])
@jwt_required()
@handle_errors
def complete_onboarding_task(task_id):
    task = OnboardingTask.query.get_or_404(task_id)
    task.completed = not task.completed
    task.completed_at = datetime.utcnow() if task.completed else None
    checklist = OnboardingChecklist.query.get(task.checklist_id)
    if checklist and all(t.completed for t in checklist.tasks if t.required):
        checklist.status = 'completed'
        checklist.completed_at = datetime.utcnow()
    db.session.commit()
    return jsonify(task.serialize()), 200

# --- PERFORMANCE REVIEW ROUTES ---
@api.route('/performance-reviews', methods=['GET'])
@jwt_required()
@handle_errors
def get_performance_reviews():
    user_id = get_jwt_identity()
    company_id = request.args.get('company_id', type=int)
    employee_id = request.args.get('employee_id', type=int)
    query = PerformanceReview.query
    if company_id:
        query = query.filter_by(company_id=company_id)
    if employee_id:
        query = query.filter_by(employee_id=employee_id)
    reviews = query.order_by(PerformanceReview.created_at.desc()).all()
    return jsonify([r.serialize() for r in reviews]), 200

@api.route('/performance-reviews', methods=['POST'])
@jwt_required()
@handle_errors
def create_performance_review():
    user_id = get_jwt_identity()
    data = request.json
    training_count = EmployeeTraining.query.filter_by(
        user_id=data.get('employee_id')
    ).filter(EmployeeTraining.completion_date.isnot(None)).count()
    ratings = [data.get(k) for k in ['attendance_rating','performance_rating','teamwork_rating','knowledge_rating','customer_service_rating'] if data.get(k)]
    overall = round(sum(ratings) / len(ratings), 1) if ratings else None
    review = PerformanceReview(
        employee_id=data['employee_id'],
        reviewer_id=user_id,
        company_id=data['company_id'],
        review_period=data.get('review_period', ''),
        overall_rating=overall,
        attendance_rating=data.get('attendance_rating'),
        performance_rating=data.get('performance_rating'),
        teamwork_rating=data.get('teamwork_rating'),
        knowledge_rating=data.get('knowledge_rating'),
        customer_service_rating=data.get('customer_service_rating'),
        strengths=data.get('strengths', ''),
        improvements=data.get('improvements', ''),
        goals=data.get('goals', ''),
        manager_comments=data.get('manager_comments', ''),
        training_completed=training_count,
        status='submitted'
    )
    db.session.add(review)
    db.session.commit()
    return jsonify(review.serialize()), 201

@api.route('/performance-reviews/<int:id>', methods=['PUT'])
@jwt_required()
@handle_errors
def update_performance_review(id):
    review = PerformanceReview.query.get_or_404(id)
    data = request.json
    for key, value in data.items():
        if hasattr(review, key):
            setattr(review, key, value)
    db.session.commit()
    return jsonify(review.serialize()), 200

@api.route('/performance-reviews/<int:id>/acknowledge', methods=['PUT'])
@jwt_required()
@handle_errors
def acknowledge_review(id):
    review = PerformanceReview.query.get_or_404(id)
    review.status = 'acknowledged'
    review.employee_comments = request.json.get('employee_comments', '')
    db.session.commit()
    return jsonify(review.serialize()), 200

# ==================== STRIPE PAYMENTS ====================
@api.route('/payments/create-intent', methods=['POST'])
@jwt_required()
@handle_errors
def create_payment_intent():
    import stripe
    stripe.api_key = current_app.config.get('STRIPE_SECRET_KEY', '')
    if not stripe.api_key:
        return jsonify({"error": "Stripe not configured. Add STRIPE_SECRET_KEY to .env"}), 503
    data = request.json
    amount = int(float(data.get('amount', 0)) * 100)  # convert to cents
    intent = stripe.PaymentIntent.create(
        amount=amount, currency='usd',
        metadata={'order_id': data.get('order_id'), 'customer_id': data.get('customer_id')}
    )
    payment = StripePayment(
        order_id=data.get('order_id'),
        stripe_payment_intent_id=intent.id,
        amount=float(data.get('amount', 0)),
        status='pending'
    )
    db.session.add(payment)
    db.session.commit()
    return jsonify({"client_secret": intent.client_secret, "payment_intent_id": intent.id}), 200

@api.route('/payments/confirm', methods=['POST'])
@jwt_required()
@handle_errors
def confirm_payment():
    data = request.json
    payment_intent_id = data.get('payment_intent_id')
    payment = StripePayment.query.filter_by(stripe_payment_intent_id=payment_intent_id).first()
    if payment:
        payment.status = 'succeeded'
        payment.payment_method = data.get('payment_method', 'card')
        db.session.commit()
        # Send SMS confirmation
        order = Order.query.get(payment.order_id)
        if order and order.customer:
            _send_sms(order.customer.phone, f"BudphoriaPro: Payment confirmed for Order #{order.id}. Total: ${payment.amount:.2f}. Thank you!")
    return jsonify({"status": "confirmed"}), 200

@api.route('/payments/config', methods=['GET'])
@handle_errors
def get_stripe_config():
    return jsonify({"publishable_key": current_app.config.get('STRIPE_PUBLISHABLE_KEY', '')}), 200

# ==================== SMS / TWILIO ====================
def _send_sms(to_number, message):
    """Internal helper to send SMS via Twilio"""
    try:
        account_sid = current_app.config.get('TWILIO_ACCOUNT_SID', '')
        auth_token = current_app.config.get('TWILIO_AUTH_TOKEN', '')
        from_number = current_app.config.get('TWILIO_PHONE_NUMBER', '')
        if not all([account_sid, auth_token, from_number, to_number]):
            return False
        from twilio.rest import Client
        client = Client(account_sid, auth_token)
        msg = client.messages.create(body=message, from_=from_number, to=to_number)
        log = SMSLog(to_number=to_number, message=message, status='sent', twilio_sid=msg.sid)
        db.session.add(log)
        db.session.commit()
        return True
    except Exception as e:
        log = SMSLog(to_number=to_number or 'unknown', message=message, status='failed')
        db.session.add(log)
        db.session.commit()
        return False

@api.route('/sms/send', methods=['POST'])
@jwt_required()
@handle_errors
def send_sms():
    data = request.json
    success = _send_sms(data.get('to'), data.get('message'))
    return jsonify({"success": success}), 200 if success else 503

@api.route('/sms/order-ready/<int:order_id>', methods=['POST'])
@jwt_required()
@handle_errors
def sms_order_ready(order_id):
    order = Order.query.get_or_404(order_id)
    customer = Customer.query.get(order.customer_id)
    if not customer or not customer.phone:
        return jsonify({"error": "No phone number on file"}), 400
    msg = f"Hi {customer.first_name}! Your order #{order_id} is ready for pickup. Please bring your ID. Thank you!"
    success = _send_sms(customer.phone, msg)
    return jsonify({"success": success, "sent_to": customer.phone}), 200

@api.route('/sms/delivery-update/<int:delivery_id>', methods=['POST'])
@jwt_required()
@handle_errors
def sms_delivery_update(delivery_id):
    delivery = DeliveryOrder.query.get_or_404(delivery_id)
    customer = Customer.query.get(delivery.customer_id)
    if not customer or not customer.phone:
        return jsonify({"error": "No phone number"}), 400
    status_msgs = {
        'assigned': 'Your order has been assigned to a driver and will be on its way soon!',
        'en_route': 'Your driver is on the way! Estimated arrival in 20-30 minutes.',
        'delivered': 'Your order has been delivered. Enjoy! Leave us a review!'
    }
    msg = f"BudphoriaPro: {status_msgs.get(delivery.status, 'Your order status has been updated.')}"
    success = _send_sms(customer.phone, msg)
    return jsonify({"success": success}), 200

@api.route('/sms/loyalty-reminder', methods=['POST'])
@jwt_required()
@handle_errors
def sms_loyalty_reminder():
    data = request.json
    customer_id = data.get('customer_id')
    customer = Customer.query.get_or_404(customer_id)
    if not customer.phone:
        return jsonify({"error": "No phone"}), 400
    points = getattr(customer, 'loyalty_points', 0)
    msg = f"Hi {customer.first_name}! You have {points} loyalty points. Stop by and redeem them for discounts!"
    success = _send_sms(customer.phone, msg)
    return jsonify({"success": success}), 200

@api.route('/sms/logs', methods=['GET'])
@jwt_required()
@handle_errors
def get_sms_logs():
    logs = SMSLog.query.order_by(SMSLog.created_at.desc()).limit(100).all()
    return jsonify([l.serialize() for l in logs]), 200

# ==================== METRC INTEGRATION ====================
@api.route('/metrc/sync-inventory', methods=['POST'])
@jwt_required()
@handle_errors
def metrc_sync_inventory():
    api_key = current_app.config.get('METRC_API_KEY', '')
    base_url = current_app.config.get('METRC_BASE_URL', '')
    if not api_key:
        return jsonify({"error": "Metrc not configured. Add METRC_API_KEY to .env", "configured": False}), 503
    import requests as req
    products = Product.query.filter(Product.current_stock > 0).all()
    synced = []
    errors = []
    for product in products:
        try:
            payload = {
                "Label": product.batch_number or f"DM-{product.id}",
                "Name": product.name,
                "Quantity": float(product.current_stock),
                "UnitOfMeasureName": "Grams",
                "ProductCategoryName": product.category,
            }
            response = req.post(f"{base_url}/packages/v1/adjust",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json=[payload], timeout=10)
            sync = MetrcSync(sync_type='inventory', local_id=product.id,
                           status='synced' if response.ok else 'failed',
                           response=response.json() if response.ok else {"error": response.text})
            db.session.add(sync)
            if response.ok:
                synced.append(product.id)
            else:
                errors.append({"product_id": product.id, "error": response.text})
        except Exception as e:
            errors.append({"product_id": product.id, "error": str(e)})
    db.session.commit()
    return jsonify({"synced": len(synced), "errors": errors, "total": len(products)}), 200

@api.route('/metrc/sync-sale', methods=['POST'])
@jwt_required()
@handle_errors
def metrc_sync_sale():
    api_key = current_app.config.get('METRC_API_KEY', '')
    base_url = current_app.config.get('METRC_BASE_URL', '')
    if not api_key:
        return jsonify({"error": "Metrc not configured", "configured": False}), 503
    data = request.json
    order_id = data.get('order_id')
    order = Order.query.get_or_404(order_id)
    import requests as req
    payload = {
        "SalesDateTime": order.created_at.isoformat() if order.created_at else datetime.utcnow().isoformat(),
        "SalesCustomerType": "Consumer",
        "Transactions": [
            {
                "PackageLabel": item.product.batch_number if item.product else f"DM-{item.product_id}",
                "Quantity": float(item.quantity),
                "UnitOfMeasureName": "Grams",
                "TotalAmount": float(item.unit_price * item.quantity)
            } for item in order.order_items
        ]
    }
    try:
        response = req.post(f"{base_url}/sales/v1/receipts",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json=[payload], timeout=10)
        sync = MetrcSync(sync_type='sale', local_id=order_id,
                        status='synced' if response.ok else 'failed',
                        metrc_id=str(response.json()[0].get('Id', '')) if response.ok else None,
                        response=response.json() if response.ok else {"error": response.text})
        db.session.add(sync)
        db.session.commit()
        return jsonify({"synced": response.ok, "metrc_response": response.json() if response.ok else response.text}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/metrc/status', methods=['GET'])
@jwt_required()
@handle_errors
def metrc_status():
    api_key = current_app.config.get('METRC_API_KEY', '')
    configured = bool(api_key)
    recent_syncs = MetrcSync.query.order_by(MetrcSync.synced_at.desc()).limit(10).all()
    return jsonify({
        "configured": configured,
        "recent_syncs": [s.serialize() for s in recent_syncs],
        "total_synced": MetrcSync.query.filter_by(status='synced').count(),
        "total_failed": MetrcSync.query.filter_by(status='failed').count(),
    }), 200

# ==================== DELIVERY TRACKING ====================
@api.route('/deliveries', methods=['GET'])
@jwt_required()
@handle_errors
def get_deliveries():
    status = request.args.get('status')
    driver_id = request.args.get('driver_id', type=int)
    query = DeliveryOrder.query
    if status: query = query.filter_by(status=status)
    if driver_id: query = query.filter_by(driver_id=driver_id)
    deliveries = query.order_by(DeliveryOrder.created_at.desc()).all()
    return jsonify([d.serialize() for d in deliveries]), 200

@api.route('/deliveries', methods=['POST'])
@jwt_required()
@handle_errors
def create_delivery():
    data = request.json
    delivery = DeliveryOrder(
        order_id=data['order_id'], customer_id=data['customer_id'],
        delivery_address=data['delivery_address'],
        customer_lat=data.get('customer_lat'), customer_lng=data.get('customer_lng'),
        notes=data.get('notes', '')
    )
    db.session.add(delivery)
    db.session.commit()
    return jsonify(delivery.serialize()), 201

@api.route('/deliveries/<int:id>/assign', methods=['PUT'])
@jwt_required()
@handle_errors
def assign_driver(id):
    delivery = DeliveryOrder.query.get_or_404(id)
    data = request.json
    delivery.driver_id = data['driver_id']
    delivery.status = 'assigned'
    db.session.commit()
    _send_sms_for_delivery(delivery, 'assigned')
    return jsonify(delivery.serialize()), 200

@api.route('/deliveries/<int:id>/location', methods=['PUT'])
@handle_errors
def update_driver_location(id):
    delivery = DeliveryOrder.query.get_or_404(id)
    data = request.json
    delivery.driver_lat = data.get('lat')
    delivery.driver_lng = data.get('lng')
    if data.get('status'): delivery.status = data['status']
    if data.get('status') == 'delivered':
        delivery.delivered_at = datetime.utcnow()
        _send_sms_for_delivery(delivery, 'delivered')
    elif data.get('status') == 'en_route':
        _send_sms_for_delivery(delivery, 'en_route')
    db.session.commit()
    return jsonify(delivery.serialize()), 200

def _send_sms_for_delivery(delivery, status):
    customer = Customer.query.get(delivery.customer_id)
    if not customer or not customer.phone: return
    msgs = {
        'assigned': 'Your delivery has been assigned to a driver!',
        'en_route': 'Your driver is on the way! ETA 20-30 minutes.',
        'delivered': 'Your order has been delivered! Enjoy!'
    }
    _send_sms(customer.phone, f"BudphoriaPro: {msgs.get(status, 'Delivery update.')}")

@api.route('/deliveries/<int:id>', methods=['GET'])
@handle_errors
def get_delivery_tracking(id):
    delivery = DeliveryOrder.query.get_or_404(id)
    return jsonify(delivery.serialize()), 200

# ==================== PRODUCT REVIEWS ====================
@api.route('/products/<int:product_id>/reviews', methods=['GET'])
@handle_errors
def get_product_reviews(product_id):
    reviews = ProductReview.query.filter_by(product_id=product_id).order_by(ProductReview.created_at.desc()).all()
    avg = sum(r.rating for r in reviews) / len(reviews) if reviews else 0
    return jsonify({"reviews": [r.serialize() for r in reviews], "average_rating": round(avg, 1), "total": len(reviews)}), 200

@api.route('/products/<int:product_id>/reviews', methods=['POST'])
@jwt_required()
@handle_errors
def create_product_review(product_id):
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    customer = Customer.query.filter_by(email=user.email).first()
    if not customer:
        return jsonify({"error": "Customer account required to review"}), 403
    data = request.json
    existing = ProductReview.query.filter_by(product_id=product_id, customer_id=customer.id).first()
    if existing:
        for k, v in data.items():
            if hasattr(existing, k): setattr(existing, k, v)
        db.session.commit()
        return jsonify(existing.serialize()), 200
    review = ProductReview(product_id=product_id, customer_id=customer.id,
        rating=data.get('rating', 5), review_text=data.get('review_text', ''),
        effects=data.get('effects', []), would_recommend=data.get('would_recommend', True))
    db.session.add(review)
    db.session.commit()
    return jsonify(review.serialize()), 201

# ==================== WAITLIST / QUEUE ====================
@api.route('/waitlist', methods=['GET'])
@jwt_required()
@handle_errors
def get_waitlist():
    store_id = request.args.get('store_id', type=int)
    query = WaitlistEntry.query.filter_by(status='waiting')
    if store_id: query = query.filter_by(store_id=store_id)
    entries = query.order_by(WaitlistEntry.position).all()
    return jsonify([e.serialize() for e in entries]), 200

@api.route('/waitlist', methods=['POST'])
@jwt_required()
@handle_errors
def join_waitlist():
    data = request.json
    store_id = data.get('store_id')
    last = WaitlistEntry.query.filter_by(store_id=store_id, status='waiting').order_by(WaitlistEntry.position.desc()).first()
    position = (last.position + 1) if last else 1
    entry = WaitlistEntry(customer_id=data['customer_id'], store_id=store_id, position=position, notes=data.get('notes', ''))
    db.session.add(entry)
    db.session.commit()
    customer = Customer.query.get(data['customer_id'])
    if customer and customer.phone:
        _send_sms(customer.phone, f"Hi {customer.first_name}! You are #{position} in the queue. We will text you when ready!")
    return jsonify(entry.serialize()), 201

@api.route('/waitlist/<int:id>/call', methods=['PUT'])
@jwt_required()
@handle_errors
def call_next(id):
    entry = WaitlistEntry.query.get_or_404(id)
    entry.status = 'called'
    entry.called_at = datetime.utcnow()
    db.session.commit()
    customer = Customer.query.get(entry.customer_id)
    if customer and customer.phone:
        _send_sms(customer.phone, f"Hi {customer.first_name}! It is your turn. Please come to the counter now. Thank you!")
    return jsonify(entry.serialize()), 200

@api.route('/waitlist/<int:id>/serve', methods=['PUT'])
@jwt_required()
@handle_errors
def mark_served(id):
    entry = WaitlistEntry.query.get_or_404(id)
    entry.status = 'served'
    entry.served_at = datetime.utcnow()
    db.session.commit()
    return jsonify(entry.serialize()), 200

# ==================== MULTI-LOCATION SYNC ====================
@api.route('/locations/sync-inventory', methods=['POST'])
@jwt_required()
@handle_errors
def sync_inventory_across_locations():
    stores = Store.query.filter_by(is_active=True).all() if hasattr(Store, 'is_active') else Store.query.all()
    products = Product.query.all()
    sync_report = {
        "stores": len(stores),
        "products": len(products),
        "low_stock_alerts": [],
        "out_of_stock": []
    }
    for product in products:
        if product.current_stock <= 0:
            sync_report["out_of_stock"].append({"id": product.id, "name": product.name})
        elif hasattr(product, 'reorder_point') and product.current_stock <= product.reorder_point:
            sync_report["low_stock_alerts"].append({"id": product.id, "name": product.name, "stock": product.current_stock})
    return jsonify(sync_report), 200

@api.route('/locations/inventory-summary', methods=['GET'])
@jwt_required()
@handle_errors
def location_inventory_summary():
    stores = Store.query.all()
    summary = []
    for store in stores:
        store_data = store.serialize()
        store_data['total_products'] = Product.query.count()
        store_data['low_stock'] = Product.query.filter(Product.current_stock <= Product.reorder_point).count() if hasattr(Product, 'reorder_point') else 0
        store_data['out_of_stock'] = Product.query.filter(Product.current_stock <= 0).count()
        summary.append(store_data)
    return jsonify(summary), 200

# ==================== EMBEDDABLE MENU ====================
@api.route('/menu/embed/<int:store_id>', methods=['GET'])
def get_embeddable_menu(store_id):
    """Public endpoint - no auth required for embedding"""
    category = request.args.get('category')
    query = Product.query.filter(Product.current_stock > 0)
    if category: query = query.filter_by(category=category)
    products = query.order_by(Product.name).all()
    deals = []
    try:
        from api.models import Deal
        deals = Deal.query.filter_by(is_active=True).all()
    except: pass
    return jsonify({
        "store_id": store_id,
        "products": [p.serialize() for p in products],
        "deals": [d.serialize() for d in deals],
        "categories": list(set(p.category for p in products if p.category)),
        "embed_script": f'<script src="{request.host_url}static/embed.js" data-store="{store_id}"></script>'
    }), 200

# ==================== GRAM LIMITS (State Compliance) ====================
@api.route('/compliance/gram-limit-check', methods=['POST'])
@jwt_required()
@handle_errors
def check_gram_limit():
    data = request.json
    customer_id = data.get('customer_id')
    requested_grams = float(data.get('grams', 0))
    state = data.get('state', 'MA')
    STATE_LIMITS = {
        'MA': 28.0, 'CA': 28.35, 'CO': 28.0, 'WA': 28.0,
        'OR': 28.0, 'IL': 30.0, 'NV': 28.0, 'AZ': 28.0,
        'MI': 42.0, 'NY': 85.0
    }
    daily_limit = STATE_LIMITS.get(state.upper(), 28.0)
    today = datetime.utcnow().date()
    existing_orders = Order.query.filter(
        Order.customer_id == customer_id,
        db.func.date(Order.created_at) == today
    ).all()
    grams_today = 0
    for order in existing_orders:
        for item in order.order_items:
            grams_today += float(item.quantity)
    remaining = daily_limit - grams_today
    allowed = requested_grams <= remaining
    return jsonify({
        "allowed": allowed,
        "requested_grams": requested_grams,
        "grams_purchased_today": grams_today,
        "daily_limit": daily_limit,
        "remaining_allowed": max(0, remaining),
        "state": state
    }), 200

# ==================== DIGITAL RECEIPTS ====================
@api.route('/receipts/<int:order_id>/email', methods=['POST'])
@jwt_required()
@handle_errors
def email_receipt(order_id):
    order = Order.query.get_or_404(order_id)
    customer = Customer.query.get(order.customer_id)
    if not customer:
        return jsonify({"error": "Customer not found"}), 404
    try:
        from api.utils import send_email
        items_text = ""
        for item in order.order_items:
            product = Product.query.get(item.product_id)
        email_body = f"""
Thank you for your purchase!

Order #{order.id}
Date: {order.created_at.strftime('%B %d, %Y') if order.created_at else 'N/A'}

Items:
{items_text}
Total: ${float(order.total_amount):.2f}

Thank you for choosing us!
        """
        send_email(customer.email, f"Your Receipt - Order #{order.id}", email_body)
        return jsonify({"sent": True, "email": customer.email}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/receipts/<int:order_id>/sms', methods=['POST'])
@jwt_required()
@handle_errors
def sms_receipt(order_id):
    order = Order.query.get_or_404(order_id)
    customer = Customer.query.get(order.customer_id)
    if not customer or not customer.phone:
        return jsonify({"error": "No phone number"}), 400
    msg = f"BudphoriaPro Receipt - Order #{order.id}: ${float(order.total_amount):.2f}. Thank you {customer.first_name}!"
    success = _send_sms(customer.phone, msg)
    return jsonify({"sent": success}), 200

# ==================== MISSING MEDICAL ROUTES ====================

@api.route('/medical/patients', methods=['GET'])
@jwt_required()
@handle_errors
def get_medical_patients():
    patients = Patient.query.all()
    return jsonify([p.serialize() for p in patients]), 200

@api.route('/medical/patients', methods=['POST'])
@jwt_required()
@handle_errors
def create_medical_patient():
    data = request.json
    patient = Patient(**{k: v for k, v in data.items() if hasattr(Patient, k)})
    db.session.add(patient)
    db.session.commit()
    return jsonify(patient.serialize()), 201

@api.route('/medical/patients/<int:id>', methods=['GET'])
@jwt_required()
@handle_errors
def get_medical_patient(id):
    patient = Patient.query.get_or_404(id)
    return jsonify(patient.serialize()), 200

@api.route('/medical/patients/<int:id>', methods=['PUT'])
@jwt_required()
@handle_errors
def update_medical_patient(id):
    patient = Patient.query.get_or_404(id)
    data = request.json
    for k, v in data.items():
        if hasattr(patient, k): setattr(patient, k, v)
    db.session.commit()
    return jsonify(patient.serialize()), 200

@api.route('/medical/prescriptions', methods=['GET'])
@jwt_required()
@handle_errors
def get_medical_prescriptions():
    patient_id = request.args.get('patient_id', type=int)
    query = Prescription.query
    if patient_id: query = query.filter_by(patient_id=patient_id)
    return jsonify([p.serialize() for p in query.all()]), 200

@api.route('/medical/prescriptions', methods=['POST'])
@jwt_required()
@handle_errors
def create_medical_prescription():
    data = request.json
    prescription = Prescription(**{k: v for k, v in data.items() if hasattr(Prescription, k)})
    db.session.add(prescription)
    db.session.commit()
    return jsonify(prescription.serialize()), 201

@api.route('/medical/prescriptions/<int:id>', methods=['PUT'])
@jwt_required()
@handle_errors
def update_medical_prescription(id):
    prescription = Prescription.query.get_or_404(id)
    data = request.json
    for k, v in data.items():
        if hasattr(prescription, k): setattr(prescription, k, v)
    db.session.commit()
    return jsonify(prescription.serialize()), 200

@api.route('/medical/analytics/summary', methods=['GET'])
@jwt_required()
@handle_errors
def get_medical_analytics_summary():
    total_patients = Patient.query.count()
    active_prescriptions = Prescription.query.filter_by(status='active').count() if hasattr(Prescription, 'status') else Prescription.query.count()
    today_appointments = Appointment.query.filter(
        db.func.date(Appointment.appointment_date) == datetime.utcnow().date()
    ).count() if hasattr(Appointment, 'appointment_date') else 0
    pending_insurance = Claim.query.filter_by(status='pending').count() if hasattr(Claim, 'status') else 0
    return jsonify({
        "total_patients": total_patients,
        "active_prescriptions": active_prescriptions,
        "today_appointments": today_appointments,
        "pending_insurance_claims": pending_insurance,
        "monthly_revenue": 0,
    }), 200

@api.route('/medical/compliance/dashboard', methods=['GET'])
@jwt_required()
@handle_errors
def get_medical_compliance_dashboard():
    return jsonify({
        "licenses": License.query.count(),
        "expired_licenses": 0,
        "pending_audits": ComplianceAudit.query.count() if hasattr(ComplianceAudit, 'query') else 0,
        "compliance_score": 94,
        "last_audit": None,
        "alerts": []
    }), 200

@api.route('/medical/compliance/reports', methods=['GET'])
@jwt_required()
@handle_errors
def get_medical_compliance_reports():
    reports = Report.query.order_by(Report.created_at.desc()).limit(20).all() if hasattr(Report, 'query') else []
    return jsonify([r.serialize() for r in reports]), 200

@api.route('/appointments', methods=['GET'])
@jwt_required()
@handle_errors
def get_all_appointments():
    patient_id = request.args.get('patient_id', type=int)
    query = Appointment.query
    if patient_id: query = query.filter_by(patient_id=patient_id)
    appointments = query.order_by(Appointment.id.desc()).all()
    return jsonify([a.serialize() for a in appointments]), 200

@api.route('/appointments', methods=['POST'])
@jwt_required()
@handle_errors
def create_appointment():
    data = request.json
    appointment = Appointment(**{k: v for k, v in data.items() if hasattr(Appointment, k)})
    db.session.add(appointment)
    db.session.commit()
    return jsonify(appointment.serialize()), 201

@api.route('/appointments/<int:id>', methods=['PUT'])
@jwt_required()
@handle_errors
def update_appointment(id):
    appointment = Appointment.query.get_or_404(id)
    data = request.json
    for k, v in data.items():
        if hasattr(appointment, k): setattr(appointment, k, v)
    db.session.commit()
    return jsonify(appointment.serialize()), 200

# ==================== MISSING COMPLIANCE ROUTES ====================

@api.route('/compliance/alerts', methods=['GET'])
@jwt_required()
@handle_errors
def get_compliance_alerts():
    alerts = ComplianceAlert.query.order_by(ComplianceAlert.id.desc()).limit(50).all()
    return jsonify([{
        "id": a.id,
        "type": getattr(a, 'alert_type', 'general'),
        "message": getattr(a, 'message', ''),
        "severity": getattr(a, 'severity', 'medium'),
        "created_at": getattr(a, 'created_at', None)
    } for a in alerts]), 200

@api.route('/compliance/audit-reports', methods=['GET'])
@jwt_required()
@handle_errors
def get_audit_reports():
    audits = ComplianceAudit.query.order_by(ComplianceAudit.id.desc()).all()
    return jsonify([{
        "id": a.id,
        "type": getattr(a, 'audit_type', 'internal'),
        "status": getattr(a, 'status', 'pending'),
        "date": getattr(a, 'audit_date', None),
        "findings": getattr(a, 'findings', ''),
    } for a in audits]), 200

@api.route('/compliance/audit-reports', methods=['POST'])
@jwt_required()
@handle_errors
def create_audit_report():
    data = request.json
    audit = ComplianceAudit(**{k: v for k, v in data.items() if hasattr(ComplianceAudit, k)})
    db.session.add(audit)
    db.session.commit()
    return jsonify({"id": audit.id, "message": "Audit created"}), 201

@api.route('/compliance/batch-tracking', methods=['GET'])
@jwt_required()
@handle_errors
def get_batch_tracking():
    products = Product.query.filter(Product.batch_number.isnot(None)).all()
    return jsonify([{
        "batch_number": p.batch_number,
        "product_id": p.id,
        "product_name": p.name,
        "category": p.category,
        "current_stock": p.current_stock,
        "test_results": p.test_results,
    } for p in products]), 200

@api.route('/reports/compliance', methods=['GET'])
@jwt_required()
@handle_errors
def get_compliance_reports_summary():
    return jsonify({
        "total_reports": Report.query.count() if hasattr(Report, 'query') else 0,
        "pending": 0,
        "completed": 0,
        "reports": []
    }), 200

# ==================== PAYROLL FULL CRUD ====================

@api.route('/payroll', methods=['POST'])
@jwt_required()
@handle_errors
def create_payroll():
    data = request.json
    employee_id = data.get('employee_id')
    employee = Employee.query.get_or_404(employee_id)
    payroll = Payroll(
        employee_id=employee_id,
        pay_period_start=data.get('pay_period_start'),
        pay_period_end=data.get('pay_period_end'),
        total_hours=float(data.get('total_hours', 0)),
        hourly_rate=float(data.get('hourly_rate', employee.hourly_rate if hasattr(employee, 'hourly_rate') else 0)),
    )
    payroll.total_pay = payroll.total_hours * payroll.hourly_rate
    db.session.add(payroll)
    db.session.commit()
    return jsonify(payroll.serialize()), 201

@api.route('/payroll/<int:payroll_id>', methods=['PUT'])
@jwt_required()
@handle_errors
def update_payroll(payroll_id):
    payroll = Payroll.query.get_or_404(payroll_id)
    data = request.json
    for k, v in data.items():
        if hasattr(payroll, k): setattr(payroll, k, v)
    payroll.total_pay = payroll.total_hours * payroll.hourly_rate
    db.session.commit()
    return jsonify(payroll.serialize()), 200

@api.route('/payroll/<int:payroll_id>', methods=['DELETE'])
@jwt_required()
@handle_errors
def delete_payroll(payroll_id):
    payroll = Payroll.query.get_or_404(payroll_id)
    db.session.delete(payroll)
    db.session.commit()
    return jsonify({"message": "Payroll record deleted"}), 200

@api.route('/payroll/summary', methods=['GET'])
@jwt_required()
@handle_errors
def get_payroll_summary():
    payrolls = Payroll.query.all()
    total_paid = sum(p.total_pay for p in payrolls)
    total_hours = sum(p.total_hours for p in payrolls)
    employees_paid = len(set(p.employee_id for p in payrolls))
    return jsonify({
        "total_paid": round(total_paid, 2),
        "total_hours": round(total_hours, 2),
        "employees_paid": employees_paid,
        "total_records": len(payrolls),
        "payrolls": [p.serialize() for p in payrolls]
    }), 200

@api.route('/employees', methods=['GET'])
@jwt_required()
@handle_errors
def get_employees():
    employees = Employee.query.all()
    return jsonify([{
        "id": e.id,
        "name": e.name,
        "role": e.role,
        "email": e.email,
    } for e in employees]), 200

@api.route('/employees', methods=['POST'])
@jwt_required()
@handle_errors
def create_employee():
    data = request.json
    from werkzeug.security import generate_password_hash
    employee = Employee(
        name=data['name'],
        role=data.get('role', 'staff'),
        email=data['email'],
        password_hash=generate_password_hash(data.get('password', 'changeme123'))
    )
    db.session.add(employee)
    db.session.commit()
    return jsonify({"id": employee.id, "name": employee.name, "role": employee.role, "email": employee.email}), 201

@api.route('/employees/<int:id>', methods=['PUT'])
@jwt_required()
@handle_errors
def update_employee(id):
    employee = Employee.query.get_or_404(id)
    data = request.json
    for k, v in data.items():
        if hasattr(employee, k) and k != 'password_hash': setattr(employee, k, v)
    db.session.commit()
    return jsonify({"id": employee.id, "name": employee.name, "role": employee.role}), 200

@api.route('/employees/<int:id>', methods=['DELETE'])
@jwt_required()
@handle_errors
def delete_employee(id):
    employee = Employee.query.get_or_404(id)
    db.session.delete(employee)
    db.session.commit()
    return jsonify({"message": "Employee deleted"}), 200

# ==================== COMPLIANCE MISSING ROUTES ====================

@api.route('/compliance/alerts', methods=['POST'])
@jwt_required()
@handle_errors
def create_compliance_alert():
    data = request.json
    alert = ComplianceAlert(**{k: v for k, v in data.items() if hasattr(ComplianceAlert, k)})
    db.session.add(alert)
    db.session.commit()
    return jsonify({"id": alert.id, "message": "Alert created"}), 201

@api.route('/compliance/licenses', methods=['GET'])
@jwt_required()
@handle_errors
def get_licenses():
    licenses = License.query.all()
    return jsonify([{
        "id": l.id,
        "type": getattr(l, 'license_type', 'unknown'),
        "number": getattr(l, 'license_number', ''),
        "expiry": getattr(l, 'expiry_date', None),
        "status": getattr(l, 'status', 'active'),
    } for l in licenses]), 200

@api.route('/compliance/licenses', methods=['POST'])
@jwt_required()
@handle_errors
def create_license():
    data = request.json
    license = License(**{k: v for k, v in data.items() if hasattr(License, k)})
    db.session.add(license)
    db.session.commit()
    return jsonify({"id": license.id}), 201

# ==================== COMPLIANCE DOCUMENT UPLOAD ====================

@api.route('/compliance/upload-document', methods=['POST'])
@jwt_required()
@handle_errors
def upload_compliance_document():
    """Upload compliance documents to R2 storage"""
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files['file']
    doc_type = request.form.get('doc_type', 'compliance_doc')
    allowed = {'pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'}
    ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''
    if ext not in allowed:
        return jsonify({"error": f"File type .{ext} not allowed"}), 400
    try:
        import uuid, boto3
        filename = f"compliance/{doc_type}/{uuid.uuid4()}.{ext}"
        r2 = boto3.client(
            's3',
            endpoint_url=os.getenv('R2_ENDPOINT_URL'),
            aws_access_key_id=os.getenv('R2_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('R2_SECRET_ACCESS_KEY'),
        )
        r2.upload_fileobj(
            file,
            os.getenv('R2_BUCKET_NAME', ''),
            filename,
            ExtraArgs={'ContentType': file.content_type}
        )
        public_url = f"{os.getenv('R2_ENDPOINT_URL')}/{os.getenv('R2_BUCKET_NAME')}/{filename}"
        return jsonify({"url": public_url, "filename": filename, "doc_type": doc_type}), 200
    except Exception as e:
        return jsonify({"error": f"Upload failed: {str(e)}"}), 500

@api.route('/compliance/documents', methods=['GET'])
@jwt_required()
@handle_errors
def get_compliance_documents():
    """List uploaded compliance documents"""
    try:
        import boto3
        r2 = boto3.client(
            's3',
            endpoint_url=os.getenv('R2_ENDPOINT_URL'),
            aws_access_key_id=os.getenv('R2_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('R2_SECRET_ACCESS_KEY'),
        )
        response = r2.list_objects_v2(Bucket=os.getenv('R2_BUCKET_NAME', ''), Prefix='compliance/')
        files = [{"key": obj['Key'], "size": obj['Size'], "last_modified": obj['LastModified'].isoformat()} for obj in response.get('Contents', [])]
        return jsonify(files), 200
    except Exception as e:
        return jsonify({"documents": [], "error": str(e)}), 200

# ==================== INVOICES + TRANSACTIONS + PLANS CRUD ====================
@api.route('/invoices', methods=['GET'])
@jwt_required()
@handle_errors
def get_invoices():
    invoices = Invoice.query.order_by(Invoice.id.desc()).all()
    return jsonify([i.serialize() for i in invoices]), 200

@api.route('/invoices/<int:id>', methods=['GET'])
@jwt_required()
@handle_errors
def get_invoice(id):
    invoice = Invoice.query.get_or_404(id)
    return jsonify(invoice.serialize()), 200

@api.route('/invoices', methods=['POST'])
@jwt_required()
@handle_errors
def create_invoice():
    data = request.json
    invoice = Invoice(**{k: v for k, v in data.items() if hasattr(Invoice, k)})
    db.session.add(invoice)
    db.session.commit()
    return jsonify(invoice.serialize()), 201

@api.route('/invoices/<int:id>', methods=['PUT'])
@jwt_required()
@handle_errors
def update_invoice(id):
    invoice = Invoice.query.get_or_404(id)
    data = request.json
    for k, v in data.items():
        if hasattr(invoice, k): setattr(invoice, k, v)
    db.session.commit()
    return jsonify(invoice.serialize()), 200

@api.route('/invoices/<int:id>', methods=['DELETE'])
@jwt_required()
@handle_errors
def delete_invoice(id):
    invoice = Invoice.query.get_or_404(id)
    db.session.delete(invoice)
    db.session.commit()
    return jsonify({"message": "Invoice deleted"}), 200

@api.route('/transactions', methods=['GET'])
@jwt_required()
@handle_errors
def get_transactions():
    transactions = Transaction.query.order_by(Transaction.id.desc()).limit(100).all()
    return jsonify([{"id":t.id,"order_id":t.order_id,"customer_name":t.customer_name,"payment_method":t.payment_method,"amount":t.amount,"date":t.date.isoformat() if t.date else None} for t in transactions]), 200

@api.route('/transactions/<int:id>', methods=['GET'])
@jwt_required()
@handle_errors
def get_transaction(id):
    t = Transaction.query.get_or_404(id)
    return jsonify({"id":t.id,"order_id":t.order_id,"amount":t.amount,"date":t.date.isoformat() if t.date else None}), 200

@api.route('/plans', methods=['GET'])
@handle_errors
def get_plans():
    plans = Plan.query.all()
    return jsonify([p.serialize() for p in plans]), 200

@api.route('/plans/<int:id>', methods=['GET'])
@handle_errors
def get_plan(id):
    plan = Plan.query.get_or_404(id)
    return jsonify(plan.serialize()), 200

@api.route('/warehouse', methods=['GET'])
@jwt_required()
@handle_errors
def get_warehouses():
    warehouses = Warehouse.query.all()
    return jsonify([{"id":w.id,"name":getattr(w,"name",""),"location":getattr(w,"location",""),"capacity":getattr(w,"capacity",0)} for w in warehouses]), 200

@api.route('/stores/<int:id>', methods=['GET'])
@jwt_required()
@handle_errors
def get_store_by_id(id):
    store = Store.query.get_or_404(id)
    return jsonify(store.serialize()), 200

# ══════════════════════════════════════════════════════
# LEAFBRIDGE CONNECT — NETWORKING ROUTES
# ══════════════════════════════════════════════════════

@api.route('/leafbridge/stats', methods=['GET'])
@jwt_required()
@handle_errors
def get_leafbridge_stats():
    user_id = get_jwt_identity()
    try:
        from api.models import LeafBridgeConnection
        connections = LeafBridgeConnection.query.filter(
            db.or_(LeafBridgeConnection.user_id == user_id, LeafBridgeConnection.target_user_id == user_id),
            LeafBridgeConnection.status == 'accepted'
        ).count()
    except: connections = 0
    return jsonify({"connections": connections, "applications": 0, "training_complete": 0, "profile_views": 0}), 200

@api.route('/leafbridge/posts', methods=['GET'])
@jwt_required()
@handle_errors
def get_leafbridge_posts():
    from api.models import LeafBridgePost, Resume
    posts = LeafBridgePost.query.order_by(LeafBridgePost.created_at.desc()).limit(50).all()
    result = []
    for post in posts:
        resume = Resume.query.filter_by(user_id=post.user_id).first()
        d = post.serialize()
        d['author_name'] = f"{resume.first_name} {resume.last_name}" if resume and resume.first_name else "Cannabis Pro"
        d['author_role'] = resume.position if resume else None
        result.append(d)
    return jsonify(result), 200

@api.route('/leafbridge/posts', methods=['POST'])
@jwt_required()
@handle_errors
def create_leafbridge_post():
    from api.models import LeafBridgePost
    user_id = get_jwt_identity()
    data = request.json
    if not data.get('content', '').strip():
        return jsonify({"error": "Content required"}), 400
    post = LeafBridgePost(user_id=user_id, content=data['content'], post_type=data.get('post_type', 'update'), likes=0)
    db.session.add(post)
    db.session.commit()
    d = post.serialize()
    d['author_name'] = "You"
    return jsonify(d), 201

@api.route('/leafbridge/posts/<int:post_id>/like', methods=['POST'])
@jwt_required()
@handle_errors
def like_leafbridge_post(post_id):
    from api.models import LeafBridgePost
    post = LeafBridgePost.query.get_or_404(post_id)
    post.likes = (post.likes or 0) + 1
    db.session.commit()
    return jsonify({"likes": post.likes}), 200

@api.route('/leafbridge/profiles', methods=['GET'])
@jwt_required()
@handle_errors
def get_leafbridge_profiles():
    from api.models import Resume, LeafBridgeConnection
    user_id = get_jwt_identity()
    resumes = Resume.query.filter(Resume.user_id != user_id).all()
    result = []
    for r in resumes:
        try:
            conn = LeafBridgeConnection.query.filter(
                db.or_(
                    db.and_(LeafBridgeConnection.user_id == user_id, LeafBridgeConnection.target_user_id == r.user_id),
                    db.and_(LeafBridgeConnection.user_id == r.user_id, LeafBridgeConnection.target_user_id == user_id)
                )
            ).first()
            conn_status = conn.status if conn else None
        except: conn_status = None
        result.append({
            "id": r.id, "user_id": r.user_id,
            "first_name": r.first_name, "last_name": r.last_name,
            "headline": r.headline if hasattr(r, 'headline') else None,
            "position": r.position if hasattr(r, 'position') else None,
            "location": r.location if hasattr(r, 'location') else None,
            "bio": r.bio if hasattr(r, 'bio') else None,
            "available": r.available if hasattr(r, 'available') else False,
            "certifications": [],
            "connection_status": conn_status,
        })
    return jsonify(result), 200

@api.route('/leafbridge/connections', methods=['GET'])
@jwt_required()
@handle_errors
def get_leafbridge_connections():
    from api.models import LeafBridgeConnection, Resume
    user_id = get_jwt_identity()
    conns = LeafBridgeConnection.query.filter(
        db.or_(LeafBridgeConnection.user_id == user_id, LeafBridgeConnection.target_user_id == user_id),
        LeafBridgeConnection.status == 'accepted'
    ).all()
    result = []
    for c in conns:
        other_id = c.target_user_id if c.user_id == user_id else c.user_id
        r = Resume.query.filter_by(user_id=other_id).first()
        if r:
            result.append({"id": c.id, "first_name": r.first_name, "last_name": r.last_name, "position": getattr(r, 'position', None)})
    return jsonify(result), 200

@api.route('/leafbridge/connections', methods=['POST'])
@jwt_required()
@handle_errors
def send_connection_request():
    from api.models import LeafBridgeConnection
    user_id = get_jwt_identity()
    target_id = request.json.get('target_user_id')
    existing = LeafBridgeConnection.query.filter(
        db.or_(
            db.and_(LeafBridgeConnection.user_id == user_id, LeafBridgeConnection.target_user_id == target_id),
            db.and_(LeafBridgeConnection.user_id == target_id, LeafBridgeConnection.target_user_id == user_id)
        )
    ).first()
    if existing:
        return jsonify({"status": existing.status}), 200
    conn = LeafBridgeConnection(user_id=user_id, target_user_id=target_id, status='pending')
    db.session.add(conn)
    db.session.commit()
    return jsonify({"id": conn.id, "status": "pending"}), 201

@api.route('/leafbridge/connections/pending', methods=['GET'])
@jwt_required()
@handle_errors
def get_pending_connections():
    from api.models import LeafBridgeConnection, Resume
    user_id = get_jwt_identity()
    pending = LeafBridgeConnection.query.filter_by(target_user_id=user_id, status='pending').all()
    result = []
    for c in pending:
        r = Resume.query.filter_by(user_id=c.user_id).first()
        if r:
            result.append({"id": c.id, "first_name": r.first_name, "last_name": r.last_name, "position": getattr(r, 'position', None)})
    return jsonify(result), 200

@api.route('/leafbridge/connections/<int:conn_id>/accept', methods=['PUT'])
@jwt_required()
@handle_errors
def accept_connection(conn_id):
    from api.models import LeafBridgeConnection
    conn = LeafBridgeConnection.query.get_or_404(conn_id)
    conn.status = 'accepted'
    db.session.commit()
    return jsonify({"status": "accepted"}), 200

# ── TRAINING ASSIGNMENTS ─────────────────────────────────────────
@api.route('/training-assignments', methods=['GET'])
@jwt_required()
@handle_errors
def get_training_assignments():
    from api.models import TrainingAssignment
    assignments = TrainingAssignment.query.all()
    return jsonify([a.serialize() for a in assignments]), 200

@api.route('/training-assignments', methods=['POST'])
@jwt_required()
@handle_errors
def create_training_assignments():
    from api.models import TrainingAssignment
    data = request.json
    resource_id = data.get('resource_id')
    employee_ids = data.get('employee_ids', [])
    results = []
    for emp_id in employee_ids:
        existing = TrainingAssignment.query.filter_by(resource_id=resource_id, employee_id=emp_id).first()
        if not existing:
            a = TrainingAssignment(resource_id=resource_id, employee_id=emp_id)
            db.session.add(a)
            results.append({"resource_id": resource_id, "employee_id": emp_id})
    db.session.commit()
    return jsonify(results), 201

# ── POST IMAGE UPLOAD ─────────────────────────────────────────────
@api.route('/leafbridge/posts/upload-image', methods=['POST'])
@jwt_required()
@handle_errors
def upload_post_image_legacy():
    if 'file' not in request.files:
        return jsonify({"error": "No file"}), 400
    file = request.files['file']
    allowed = {'jpg','jpeg','png','gif','webp'}
    ext = file.filename.rsplit('.',1)[-1].lower() if '.' in file.filename else ''
    if ext not in allowed:
        return jsonify({"error": "Only JPG, PNG, GIF, WebP allowed"}), 400
    try:
        import uuid, boto3
        filename = f"posts/{uuid.uuid4()}.{ext}"
        r2 = boto3.client('s3',
            endpoint_url=os.getenv('R2_ENDPOINT_URL'),
            aws_access_key_id=os.getenv('R2_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('R2_SECRET_ACCESS_KEY'))
        r2.upload_fileobj(file, os.getenv('R2_BUCKET_NAME',''), filename, ExtraArgs={'ContentType': file.content_type})
        url = f"{os.getenv('R2_ENDPOINT_URL')}/{os.getenv('R2_BUCKET_NAME')}/{filename}"
        return jsonify({"url": url, "filename": filename}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ══════════════════════════════════════════════════════════════
# SALES DASHBOARD, PIPELINE, LEADS, REVENUE, DISCOUNTS
# ══════════════════════════════════════════════════════════════

# ── SALES DASHBOARD ────────────────────────────────────────
@api.route('/sales/dashboard', methods=['GET'])
@jwt_required()
@handle_errors
def get_sales_dashboard():
    from datetime import datetime, timedelta
    orders = Order.query.filter(Order.status == 'completed').all()
    today = datetime.utcnow().date()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    today_sales = sum(float(o.total_amount) for o in orders if o.created_at and o.created_at.date() == today)
    week_sales = sum(float(o.total_amount) for o in orders if o.created_at and o.created_at.date() >= week_ago)
    month_sales = sum(float(o.total_amount) for o in orders if o.created_at and o.created_at.date() >= month_ago)
    total_sales = sum(float(o.total_amount) for o in orders)
    top_products = {}
    for o in orders:
        for item in o.order_items:
            name = item.product.name if item.product else f"Product {item.product_id}"
            top_products[name] = top_products.get(name, 0) + float(item.unit_price) * item.quantity
    top_products_list = sorted([{"name": k, "revenue": v} for k, v in top_products.items()], key=lambda x: -x["revenue"])[:10]
    return jsonify({
        "today_sales": today_sales,
        "week_sales": week_sales,
        "month_sales": month_sales,
        "total_sales": total_sales,
        "order_count": len(orders),
        "avg_order_value": total_sales / len(orders) if orders else 0,
        "top_products": top_products_list,
    }), 200

# ── SALES PIPELINE ─────────────────────────────────────────
@api.route('/sales/pipeline', methods=['GET'])
@jwt_required()
@handle_errors
def get_sales_pipeline():
    orders = Order.query.all()
    pipeline = {
        "pending": {"count": 0, "value": 0},
        "completed": {"count": 0, "value": 0},
        "cancelled": {"count": 0, "value": 0},
    }
    for o in orders:
        status = o.status if o.status in pipeline else "pending"
        pipeline[status]["count"] += 1
        pipeline[status]["value"] += float(o.total_amount)
    return jsonify(pipeline), 200

# ── LEADS ──────────────────────────────────────────────────
@api.route('/leads', methods=['GET'])
@jwt_required()
@handle_errors
def get_leads():
    customers = Customer.query.filter_by(verification_status='pending').all()
    return jsonify([c.serialize() for c in customers]), 200

@api.route('/leads', methods=['POST'])
@jwt_required()
@handle_errors
def create_lead():
    data = request.json
    customer = Customer(
        first_name=data.get('first_name', ''),
        last_name=data.get('last_name', ''),
        email=data.get('email', ''),
        phone=data.get('phone', ''),
        membership_level='standard',
        verification_status='pending'
    )
    db.session.add(customer)
    db.session.commit()
    return jsonify(customer.serialize()), 201

@api.route('/leads/<int:id>/convert', methods=['PUT'])
@jwt_required()
@handle_errors
def convert_lead(id):
    customer = Customer.query.get_or_404(id)
    customer.verification_status = 'verified'
    db.session.commit()
    return jsonify(customer.serialize()), 200

# ── REVENUE REPORTS ────────────────────────────────────────
@api.route('/reports/revenue', methods=['GET'])
@jwt_required()
@handle_errors
def get_revenue_reports():
    from datetime import datetime, timedelta
    period = request.args.get('period', 'monthly')
    orders = Order.query.filter(Order.status == 'completed').order_by(Order.created_at.asc()).all()
    revenue_by_period = {}
    for o in orders:
        if not o.created_at: continue
        if period == 'daily':
            key = o.created_at.strftime('%Y-%m-%d')
        elif period == 'weekly':
            key = f"Week {o.created_at.strftime('%Y-W%W')}"
        else:
            key = o.created_at.strftime('%Y-%m')
        revenue_by_period[key] = revenue_by_period.get(key, 0) + float(o.total_amount)
    total = sum(revenue_by_period.values())
    return jsonify({
        "period": period,
        "data": [{"label": k, "revenue": v} for k, v in sorted(revenue_by_period.items())],
        "total_revenue": total,
        "order_count": len(orders),
        "avg_order": total / len(orders) if orders else 0,
    }), 200

# ── DISCOUNTS ──────────────────────────────────────────────
@api.route('/discounts', methods=['GET'])
@jwt_required()
@handle_errors
def get_discounts():
    # Return discount codes stored in a simple format
    # Using a basic in-memory structure until a Discount model is added
    return jsonify([
        {"id": 1, "code": "WELCOME10", "type": "percentage", "value": 10, "active": True, "uses": 0, "max_uses": 100},
        {"id": 2, "code": "LOYALTY20", "type": "percentage", "value": 20, "active": True, "uses": 0, "max_uses": 50},
        {"id": 3, "code": "FLAT5", "type": "flat", "value": 5, "active": True, "uses": 0, "max_uses": 200},
    ]), 200

@api.route('/discounts', methods=['POST'])
@jwt_required()
@handle_errors
def create_discount():
    data = request.json
    # Returns the discount as-created until Discount model is added
    return jsonify({
        "id": 99,
        "code": data.get('code', '').upper(),
        "type": data.get('type', 'percentage'),
        "value": data.get('value', 0),
        "active": True,
        "uses": 0,
        "max_uses": data.get('max_uses', 100),
    }), 201

@api.route('/discounts/<int:id>', methods=['PUT'])
@jwt_required()
@handle_errors
def update_discount(id):
    data = request.json
    return jsonify({"id": id, **data}), 200

@api.route('/discounts/<int:id>', methods=['DELETE'])
@jwt_required()
@handle_errors
def delete_discount(id):
    return jsonify({"message": "Discount deleted"}), 200

# ══════════════════════════════════════════════════════════════
# LEAFBRIDGE PHOTO SYSTEM
# ══════════════════════════════════════════════════════════════

import uuid as uuid_module
import boto3
from botocore.exceptions import ClientError

def upload_to_r2(file, folder, content_type=None):
    """Upload file to Cloudflare R2 and return public URL"""
    try:
        ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else 'jpg'
        filename = f"{folder}/{uuid_module.uuid4()}.{ext}"
        r2 = boto3.client(
            's3',
            endpoint_url=os.getenv('R2_ENDPOINT_URL'),
            aws_access_key_id=os.getenv('R2_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('R2_SECRET_ACCESS_KEY'),
        )
        bucket = os.getenv('R2_BUCKET_NAME', 'streampirex-media')
        ct = content_type or f"image/{ext}"
        r2.upload_fileobj(file, bucket, filename, ExtraArgs={'ContentType': ct, 'ACL': 'public-read'})
        url = f"{os.getenv('R2_ENDPOINT_URL')}/{bucket}/{filename}"
        return url, filename
    except Exception as e:
        raise Exception(f"R2 upload failed: {str(e)}")

ALLOWED_IMAGE_TYPES = {'jpg', 'jpeg', 'png', 'gif', 'webp'}
MAX_SIZES = {
    'avatar': 5,        # 5MB
    'gallery': 10,      # 10MB
    'company_logo': 5,
    'company_cover': 10,
    'company_gallery': 20,
    'event_photo': 20,
    'post_image': 10,
}

def validate_image(file, photo_type='gallery'):
    ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''
    if ext not in ALLOWED_IMAGE_TYPES:
        raise Exception(f"Invalid file type. Allowed: {', '.join(ALLOWED_IMAGE_TYPES)}")
    file.seek(0, 2)
    size_mb = file.tell() / (1024 * 1024)
    file.seek(0)
    max_mb = MAX_SIZES.get(photo_type, 10)
    if size_mb > max_mb:
        raise Exception(f"File too large. Max {max_mb}MB for {photo_type}")
    return ext

# ── PROFILE AVATAR ─────────────────────────────────────────
@api.route('/leafbridge/profile/photo', methods=['POST'])
@jwt_required()
@handle_errors
def upload_profile_photo():
    from api.models import LeafBridgePhoto, Resume
    user_id = get_jwt_identity()
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files['file']
    ext = validate_image(file, 'avatar')
    url, filename = upload_to_r2(file, f"profiles/{user_id}/avatar")
    # Save to photos table
    photo = LeafBridgePhoto(user_id=user_id, url=url, photo_type='avatar')
    db.session.add(photo)
    # Update resume with avatar url
    resume = Resume.query.filter_by(user_id=user_id).first()
    if resume:
        resume.profile_photo = url
    db.session.commit()
    return jsonify({"url": url}), 200

# ── PROFILE GALLERY ────────────────────────────────────────
@api.route('/leafbridge/profile/gallery', methods=['GET'])
@jwt_required()
@handle_errors
def get_profile_gallery():
    from api.models import LeafBridgePhoto
    user_id = get_jwt_identity()
    target_id = request.args.get('user_id', user_id)
    photos = LeafBridgePhoto.query.filter_by(
        user_id=target_id, photo_type='gallery'
    ).order_by(LeafBridgePhoto.created_at.desc()).all()
    return jsonify([p.serialize() for p in photos]), 200

@api.route('/leafbridge/profile/gallery', methods=['POST'])
@jwt_required()
@handle_errors
def upload_gallery_photo():
    from api.models import LeafBridgePhoto
    user_id = get_jwt_identity()
    # Check limit — max 20 gallery photos
    count = LeafBridgePhoto.query.filter_by(user_id=user_id, photo_type='gallery').count()
    if count >= 20:
        return jsonify({"error": "Gallery limit reached (20 photos max)"}), 400
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files['file']
    caption = request.form.get('caption', '')
    ext = validate_image(file, 'gallery')
    url, filename = upload_to_r2(file, f"profiles/{user_id}/gallery")
    photo = LeafBridgePhoto(user_id=user_id, url=url, caption=caption, photo_type='gallery')
    db.session.add(photo)
    db.session.commit()
    return jsonify(photo.serialize()), 201

@api.route('/leafbridge/profile/gallery/<int:photo_id>', methods=['DELETE'])
@jwt_required()
@handle_errors
def delete_gallery_photo(photo_id):
    from api.models import LeafBridgePhoto
    user_id = get_jwt_identity()
    photo = LeafBridgePhoto.query.filter_by(id=photo_id, user_id=user_id).first_or_404()
    db.session.delete(photo)
    db.session.commit()
    return jsonify({"message": "Photo deleted"}), 200

# ── COMPANY PHOTOS ─────────────────────────────────────────
@api.route('/leafbridge/companies/<int:company_id>/logo', methods=['POST'])
@jwt_required()
@handle_errors
def upload_company_logo(company_id):
    from api.models import LeafBridgePhoto, LeafBridgeCompany
    user_id = get_jwt_identity()
    company = LeafBridgeCompany.query.filter_by(id=company_id, owner_id=user_id).first_or_404()
    if 'file' not in request.files:
        return jsonify({"error": "No file"}), 400
    file = request.files['file']
    validate_image(file, 'company_logo')
    url, _ = upload_to_r2(file, f"companies/{company_id}/logo")
    company.logo_url = url
    # Save photo record
    photo = LeafBridgePhoto(user_id=user_id, url=url, photo_type='company_logo', related_id=company_id)
    db.session.add(photo)
    db.session.commit()
    return jsonify({"url": url}), 200

@api.route('/leafbridge/companies/<int:company_id>/cover', methods=['POST'])
@jwt_required()
@handle_errors
def upload_company_cover(company_id):
    from api.models import LeafBridgePhoto, LeafBridgeCompany
    user_id = get_jwt_identity()
    company = LeafBridgeCompany.query.filter_by(id=company_id, owner_id=user_id).first_or_404()
    if 'file' not in request.files:
        return jsonify({"error": "No file"}), 400
    file = request.files['file']
    validate_image(file, 'company_cover')
    url, _ = upload_to_r2(file, f"companies/{company_id}/cover")
    company.cover_url = url
    photo = LeafBridgePhoto(user_id=user_id, url=url, photo_type='company_cover', related_id=company_id)
    db.session.add(photo)
    db.session.commit()
    return jsonify({"url": url}), 200

@api.route('/leafbridge/companies/<int:company_id>/gallery', methods=['GET'])
@jwt_required()
@handle_errors
def get_company_gallery(company_id):
    from api.models import LeafBridgePhoto
    photos = LeafBridgePhoto.query.filter_by(
        photo_type='company_gallery', related_id=company_id
    ).order_by(LeafBridgePhoto.created_at.desc()).all()
    return jsonify([p.serialize() for p in photos]), 200

@api.route('/leafbridge/companies/<int:company_id>/gallery', methods=['POST'])
@jwt_required()
@handle_errors
def upload_company_gallery_photo(company_id):
    from api.models import LeafBridgePhoto, LeafBridgeCompany
    user_id = get_jwt_identity()
    company = LeafBridgeCompany.query.filter_by(id=company_id, owner_id=user_id).first_or_404()
    # Max 50 company gallery photos
    count = LeafBridgePhoto.query.filter_by(photo_type='company_gallery', related_id=company_id).count()
    if count >= 50:
        return jsonify({"error": "Company gallery limit reached (50 photos)"}), 400
    if 'file' not in request.files:
        return jsonify({"error": "No file"}), 400
    file = request.files['file']
    caption = request.form.get('caption', '')
    validate_image(file, 'company_gallery')
    url, _ = upload_to_r2(file, f"companies/{company_id}/gallery")
    photo = LeafBridgePhoto(user_id=user_id, url=url, caption=caption, photo_type='company_gallery', related_id=company_id)
    db.session.add(photo)
    db.session.commit()
    return jsonify(photo.serialize()), 201

# ── EVENT PHOTOS ───────────────────────────────────────────
@api.route('/leafbridge/events/<int:event_id>/photos', methods=['GET'])
@jwt_required()
@handle_errors
def get_event_photos(event_id):
    from api.models import LeafBridgePhoto
    photos = LeafBridgePhoto.query.filter_by(
        photo_type='event_photo', related_id=event_id
    ).order_by(LeafBridgePhoto.created_at.desc()).all()
    return jsonify([p.serialize() for p in photos]), 200

@api.route('/leafbridge/events/<int:event_id>/photos', methods=['POST'])
@jwt_required()
@handle_errors
def upload_event_photo(event_id):
    from api.models import LeafBridgePhoto
    user_id = get_jwt_identity()
    # Max 100 event photos
    count = LeafBridgePhoto.query.filter_by(photo_type='event_photo', related_id=event_id).count()
    if count >= 100:
        return jsonify({"error": "Event photo limit reached (100 photos)"}), 400
    if 'file' not in request.files:
        return jsonify({"error": "No file"}), 400
    file = request.files['file']
    caption = request.form.get('caption', '')
    validate_image(file, 'event_photo')
    url, _ = upload_to_r2(file, f"events/{event_id}/photos")
    photo = LeafBridgePhoto(user_id=user_id, url=url, caption=caption, photo_type='event_photo', related_id=event_id)
    db.session.add(photo)
    db.session.commit()
    return jsonify(photo.serialize()), 201

@api.route('/leafbridge/events/<int:event_id>/photos/<int:photo_id>', methods=['DELETE'])
@jwt_required()
@handle_errors
def delete_event_photo(event_id, photo_id):
    from api.models import LeafBridgePhoto
    user_id = get_jwt_identity()
    photo = LeafBridgePhoto.query.filter_by(id=photo_id, user_id=user_id, related_id=event_id).first_or_404()
    db.session.delete(photo)
    db.session.commit()
    return jsonify({"message": "Photo deleted"}), 200

# ── FEED POST IMAGES ───────────────────────────────────────
@api.route('/leafbridge/posts/upload-image', methods=['POST'])
@jwt_required()
@handle_errors
def upload_post_image():
    from api.models import LeafBridgePhoto
    user_id = get_jwt_identity()
    if 'file' not in request.files:
        return jsonify({"error": "No file"}), 400
    file = request.files['file']
    validate_image(file, 'post_image')
    url, _ = upload_to_r2(file, f"posts/{user_id}")
    photo = LeafBridgePhoto(user_id=user_id, url=url, photo_type='post_image')
    db.session.add(photo)
    db.session.commit()
    return jsonify({"url": url, "photo_id": photo.id}), 201

# ── BULK UPLOAD (multiple files at once) ───────────────────
@api.route('/leafbridge/upload/bulk', methods=['POST'])
@jwt_required()
@handle_errors
def bulk_upload():
    from api.models import LeafBridgePhoto
    user_id = get_jwt_identity()
    photo_type = request.form.get('photo_type', 'gallery')
    related_id = request.form.get('related_id')
    files = request.files.getlist('files')
    if not files:
        return jsonify({"error": "No files provided"}), 400
    if len(files) > 10:
        return jsonify({"error": "Max 10 files per upload"}), 400
    uploaded = []
    for file in files:
        try:
            validate_image(file, photo_type)
            folder = f"bulk/{user_id}/{photo_type}"
            url, _ = upload_to_r2(file, folder)
            photo = LeafBridgePhoto(
                user_id=user_id, url=url,
                photo_type=photo_type,
                related_id=int(related_id) if related_id else None
            )
            db.session.add(photo)
            uploaded.append({"url": url, "filename": file.filename})
        except Exception as e:
            uploaded.append({"error": str(e), "filename": file.filename})
    db.session.commit()
    return jsonify({"uploaded": uploaded, "count": len([u for u in uploaded if 'url' in u])}), 201

# ── PRODUCT CATEGORIES (dynamic) ──────────────────────────
DISPENSARY_CATEGORIES = [
    "Flower","Edibles","Concentrates","Vapes","Tinctures",
    "Pre-Rolls","Accessories","Topicals","Capsules","Beverages",
    "Sublingual","Seeds","Clones","Shake","Kief","Hash",
    "CBD Products","High-CBD","Sativa","Indica","Hybrid",
    "Infused","Patches","Suppositories"
]

_custom_categories = []

@api.route('/categories', methods=['GET'])
@handle_errors
def get_categories():
    all_cats = DISPENSARY_CATEGORIES + _custom_categories
    return jsonify({"categories": all_cats}), 200

@api.route('/categories', methods=['POST'])
@jwt_required()
@handle_errors
def add_category():
    name = request.json.get('name', '').strip()
    if not name:
        return jsonify({"error": "Name required"}), 400
    if name not in DISPENSARY_CATEGORIES and name not in _custom_categories:
        _custom_categories.append(name)
    return jsonify({"categories": DISPENSARY_CATEGORIES + _custom_categories}), 201

@api.route('/categories/<string:name>', methods=['DELETE'])
@jwt_required()
@handle_errors
def delete_category(name):
    if name in _custom_categories:
        _custom_categories.remove(name)
    return jsonify({"categories": DISPENSARY_CATEGORIES + _custom_categories}), 200

# ── PUBLIC SHOP ROUTE (no auth required) ──────────────────
@api.route('/shop/products', methods=['GET'])
@handle_errors
def get_shop_products():
    """Public endpoint — returns only available products for the shop"""
    products = Product.query.filter(Product.stock > 0).all()
    return jsonify([p.serialize() for p in products]), 200

# ══════════════════════════════════════════════════════════════
# GROWFARM — MISSING ROUTES
# ══════════════════════════════════════════════════════════════

@api.route('/plant_batches', methods=['GET', 'POST'])
@jwt_required()
@handle_errors
def manage_plant_batches():
    from api.models import PlantBatch
    if request.method == 'GET':
        farm_id = request.args.get('farm_id')
        q = PlantBatch.query
        if farm_id:
            q = q.filter_by(grow_farm_id=int(farm_id))
        return jsonify([b.serialize() for b in q.all()]), 200
    data = request.json
    batch = PlantBatch(**{k: v for k, v in data.items() if hasattr(PlantBatch, k)})
    db.session.add(batch)
    db.session.commit()
    return jsonify(batch.serialize()), 201

@api.route('/plant_batches/<int:batch_id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
@handle_errors
def manage_single_plant_batch(batch_id):
    from api.models import PlantBatch
    batch = PlantBatch.query.get_or_404(batch_id)
    if request.method == 'GET':
        return jsonify(batch.serialize()), 200
    if request.method == 'PUT':
        for k, v in request.json.items():
            if hasattr(batch, k):
                setattr(batch, k, v)
        db.session.commit()
        return jsonify(batch.serialize()), 200
    db.session.delete(batch)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200

@api.route('/harvest_logs', methods=['GET', 'POST'])
@jwt_required()
@handle_errors
def manage_harvest_logs():
    from api.models import HarvestLog
    if request.method == 'GET':
        logs = HarvestLog.query.order_by(HarvestLog.id.desc()).all()
        return jsonify([l.serialize() for l in logs]), 200
    data = request.json
    log = HarvestLog(**{k: v for k, v in data.items() if hasattr(HarvestLog, k)})
    db.session.add(log)
    db.session.commit()
    return jsonify(log.serialize()), 201

@api.route('/harvest_logs/<int:log_id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
@handle_errors
def manage_single_harvest_log(log_id):
    from api.models import HarvestLog
    log = HarvestLog.query.get_or_404(log_id)
    if request.method == 'GET':
        return jsonify(log.serialize()), 200
    if request.method == 'PUT':
        for k, v in request.json.items():
            if hasattr(log, k):
                setattr(log, k, v)
        db.session.commit()
        return jsonify(log.serialize()), 200
    db.session.delete(log)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200

@api.route('/pest_disease', methods=['GET', 'POST'])
@jwt_required()
@handle_errors
def manage_pest_disease():
    from api.models import PestDiseaseIssue
    if request.method == 'GET':
        issues = PestDiseaseIssue.query.order_by(PestDiseaseIssue.id.desc()).all()
        return jsonify([i.serialize() for i in issues]), 200
    data = request.json
    issue = PestDiseaseIssue(**{k: v for k, v in data.items() if hasattr(PestDiseaseIssue, k)})
    db.session.add(issue)
    db.session.commit()
    return jsonify(issue.serialize()), 201

@api.route('/pest_disease/<int:issue_id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
@handle_errors
def manage_single_pest_disease(issue_id):
    from api.models import PestDiseaseIssue
    issue = PestDiseaseIssue.query.get_or_404(issue_id)
    if request.method == 'GET':
        return jsonify(issue.serialize()), 200
    if request.method == 'PUT':
        for k, v in request.json.items():
            if hasattr(issue, k):
                setattr(issue, k, v)
        db.session.commit()
        return jsonify(issue.serialize()), 200
    db.session.delete(issue)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200

@api.route('/growfarms/analytics', methods=['GET'])
@jwt_required()
@handle_errors
def get_growfarm_analytics():
    from api.models import GrowFarm, PlantBatch, HarvestLog, YieldPrediction
    farms = GrowFarm.query.count()
    batches = PlantBatch.query.count()
    harvests = HarvestLog.query.count()
    return jsonify({
        "total_farms": farms,
        "active_batches": batches,
        "total_harvests": harvests,
    }), 200

# ══════════════════════════════════════════════════════════════
# SEEDBANK — MISSING ROUTES
# ══════════════════════════════════════════════════════════════

@api.route('/seedbanks/analytics', methods=['GET'])
@jwt_required()
@handle_errors
def get_seedbank_analytics():
    from api.models import Seedbank, SeedBatch, SeedReport
    banks = Seedbank.query.count()
    batches = SeedBatch.query.count()
    reports = SeedReport.query.count()
    return jsonify({
        "total_seedbanks": banks,
        "total_batches": batches,
        "total_reports": reports,
    }), 200

@api.route('/seedbanks/calendar', methods=['GET'])
@jwt_required()
@handle_errors
def get_seedbank_calendar():
    from api.models import SeedBatch
    batches = SeedBatch.query.all()
    events = []
    for b in batches:
        if hasattr(b, 'planting_date') and b.planting_date:
            events.append({
                "id": b.id,
                "title": getattr(b, 'strain_name', f'Batch {b.id}'),
                "date": b.planting_date.isoformat() if b.planting_date else None,
                "type": "planting"
            })
    return jsonify(events), 200
