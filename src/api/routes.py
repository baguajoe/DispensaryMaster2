from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity
# from flask_login import current_user
from datetime import datetime, timedelta
from api.models import db, User, Product, Customer, Order, OrderItem, Invoice, Business, Patient, Store, CashDrawer, CashLog, Pricing, Dispensary, GrowFarm, PlantBatch, EnvironmentData, GrowTask, YieldPrediction, Seedbank, SeedBatch, StorageConditions, SeedReport, CustomerInteraction, Lead, Campaign, Task, Deal,  Recommendation, InventoryLog, Prescription, Transaction, Symptom, MedicalResource, Review, Settings, Message                                
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from marshmallow import Schema, fields, validate, ValidationError
from reportlab.pdfgen import canvas
from flask_cors import CORS
from sqlalchemy import func
# from api.utils import role_required, APIException, generate_sitemap
from sklearn.linear_model import LinearRegression
import numpy as np
from flask_socketio import SocketIO, emit
from flask import jsonify, send_file
from io import BytesIO
from . import api  # Import the blueprint
from textblob import TextBlob
import pandas as pd
from prophet import Prophet

socketio = SocketIO()


# Create Blueprint
# api = Blueprint('api', __name__)
# CORS(api, resources={r"/api/*": {"origins": "https://shiny-broccoli-q79pvgr4wqp72qx9-3000.app.github.dev"}})



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
    
@api.route('/products', methods=['GET'])
@jwt_required()
def get_products():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    products = Product.query.paginate(page, per_page, False)
    product_list = []

    for product in products.items:
        pricings = Pricing.query.filter_by(product_id=product.id).all()
        pricing_data = [
            {
                "price": pricing.price,
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

    # Recommend products in the same categories, excluding already purchased ones
    recommendations = Product.query.filter(
        Product.category.in_(purchased_categories),
        ~Product.id.in_(purchased_product_ids)
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

@api.route('/dashboard/metrics', methods=['GET'])
@jwt_required()
def get_dashboard_metrics():
    try:
        orders = Order.query.filter(Order.status == 'completed').all()
        total_sales = sum(float(order.total_amount) for order in orders)
        order_count = len(orders)
        average_purchase_order = total_sales / order_count if order_count > 0 else 0

        metrics = [
            {"title": "Total Sales", "value": f"${total_sales:,.2f}"},
            {"title": "Average Purchase Order", "value": f"${average_purchase_order:,.2f}"}
        ]
        return jsonify(metrics), 200
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

@api.route('/campaigns', methods=['GET'])
@jwt_required()
@handle_errors
def get_campaigns():
    campaigns = Campaign.query.all()
    return jsonify([campaign.serialize() for campaign in campaigns]), 200

@api.route('/campaigns', methods=['POST'])
@jwt_required()
@handle_errors
def create_campaign():
    data = request.json
    campaign = Campaign(**data)
    db.session.add(campaign)
    db.session.commit()
    return jsonify(campaign.serialize()), 201

@api.route('/campaigns/<int:id>', methods=['PUT'])
@jwt_required()
@handle_errors
def update_campaign(id):
    campaign = Campaign.query.get_or_404(id)
    data = request.json
    for key, value in data.items():
        setattr(campaign, key, value)
    db.session.commit()
    return jsonify(campaign.serialize()), 200

@api.route('/campaigns/<int:id>', methods=['DELETE'])
@jwt_required()
@handle_errors
def delete_campaign(id):
    campaign = Campaign.query.get_or_404(id)
    db.session.delete(campaign)
    db.session.commit()
    return jsonify({"message": "Campaign deleted successfully"}), 200


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


@api.route('/inventory/update', methods=['POST'])
def update_inventory():
    data = request.json
    # Update inventory logic...
    socketio.emit('inventory_update', {'product_id': data['product_id'], 'new_stock': data['new_stock']})
    return jsonify({"message": "Inventory updated"}), 200



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


@api.route('/receipt', methods=['POST'])
def generate_receipt():
    data = request.json
    order_id = data.get('order_id')
    items = data.get('items', [])
    total_amount = data.get('total_amount', 0.00)

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer)
    pdf.drawString(100, 750, f"Receipt for Order #{order_id}")
    pdf.drawString(100, 730, "---------------------------")

    y = 710
    for item in items:
        pdf.drawString(100, y, f"{item['name']} (x{item['quantity']}): ${item['price']}")
        y -= 20

    pdf.drawString(100, y - 20, f"Total: ${total_amount}")
    pdf.save()

    buffer.seek(0)
    return send_file(buffer, as_attachment=True, download_name=f"receipt_{order_id}.pdf", mimetype='application/pdf')

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
# ---------------------
@api.route('/invoices', methods=['GET'])
@jwt_required()
def get_invoices():
    invoices = Invoice.query.all()
    return jsonify([invoice.serialize() for invoice in invoices]), 200


@api.route('/invoices/<int:id>', methods=['GET'])
@jwt_required()
def get_invoice(id):
    invoice = Invoice.query.get_or_404(id)
    return jsonify(invoice.serialize()), 200


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

@api.route('/prices', methods=['GET'])
def get_real_time_prices():
    product_name = request.args.get('product_name', None)
    location = request.args.get('location', None)
    sort_by = request.args.get('sort_by', 'price')  # Default sort by price

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

    results = query.all()
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


# # ---------------------
# # Validation Schemas
# # ---------------------


# class ProductSchema(Schema):
#     name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
#     category = fields.Str(required=True)
#     current_stock = fields.Integer(required=True, validate=validate.Range(min=0))
#     reorder_point = fields.Integer(required=True, validate=validate.Range(min=0))
#     unit_price = fields.Decimal(required=True, validate=validate.Range(min=0))
#     strain = fields.Str(required=False)
#     thc_content = fields.Float(required=False)
#     cbd_content = fields.Float(required=False)
#     is_organic = db.Column(db.Boolean, default=False)  # New field
#     medical_benefits = db.Column(db.Text, nullable=True)  # New field

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

# # Pricing Schema for Validation
# class PricingSchema(Schema):
#     dispensary_id = fields.Int(required=True)
#     price = fields.Float(required=True)
#     availability = fields.Bool(required=True, default=True)


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


@api.route('/analytics/inventory-forecast', methods=['POST'])
def inventory_forecast():
    import numpy as np
    from sklearn.linear_model import LinearRegression

    # Fetch sales data
    sales = db.session.query(Product.id, func.sum(OrderItem.quantity)).group_by(Product.id).all()
    product_ids = [s[0] for s in sales]
    quantities = [s[1] for s in sales]

    # Train model to forecast future sales
    model = LinearRegression().fit(np.arange(len(quantities)).reshape(-1, 1), quantities)
    predictions = model.predict(np.arange(len(quantities) + 5).reshape(-1, 1))

    # Return forecasted inventory levels
    forecast = [{"product_id": pid, "predicted_quantity": q} for pid, q in zip(product_ids, predictions)]
    return jsonify(forecast), 200
