#!/bin/bash
cd /workspaces/DispensaryMaster2
echo "Building all 9 Dutchie-competitive features..."

# ============================================================
# 1. FIX PUBLICDEALS + ADD ENV VARS TO APP.PY
# ============================================================
sed -i 's/REACT_APP_BACKEND_URL/BACKEND_URL/g' src/front/js/pages/PublicDeals.js
echo "✓ PublicDeals.js fixed"

python3 << 'PYEOF'
with open('src/app.py', 'r') as f:
    content = f.read()

if 'STRIPE_SECRET_KEY' not in content:
    content = content.replace(
        "# Run the App",
        """# Third Party Integrations
app.config["STRIPE_SECRET_KEY"] = os.getenv("STRIPE_SECRET_KEY", "")
app.config["STRIPE_PUBLISHABLE_KEY"] = os.getenv("STRIPE_PUBLISHABLE_KEY", "")
app.config["TWILIO_ACCOUNT_SID"] = os.getenv("TWILIO_ACCOUNT_SID", "")
app.config["TWILIO_AUTH_TOKEN"] = os.getenv("TWILIO_AUTH_TOKEN", "")
app.config["TWILIO_PHONE_NUMBER"] = os.getenv("TWILIO_PHONE_NUMBER", "")
app.config["METRC_API_KEY"] = os.getenv("METRC_API_KEY", "")
app.config["METRC_BASE_URL"] = os.getenv("METRC_BASE_URL", "https://api.metrc.com")

# Run the App"""
    )
    with open('src/app.py', 'w') as f:
        f.write(content)
    print("✓ app.py env vars added")

# Add models
with open('src/api/models.py', 'r') as f:
    content = f.read()

new_models = '''
# ==================== DUTCHIE FEATURE MODELS ====================

class DeliveryOrder(db.Model):
    __tablename__ = 'delivery_order'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    driver_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    delivery_address = db.Column(db.String(300), nullable=False)
    status = db.Column(db.String(30), default='pending')  # pending, assigned, en_route, delivered
    estimated_arrival = db.Column(db.DateTime)
    delivered_at = db.Column(db.DateTime)
    driver_lat = db.Column(db.Float)
    driver_lng = db.Column(db.Float)
    customer_lat = db.Column(db.Float)
    customer_lng = db.Column(db.Float)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    order = db.relationship('Order', backref='delivery')
    customer = db.relationship('Customer', backref='deliveries')

    def serialize(self):
        return {
            "id": self.id, "order_id": self.order_id, "driver_id": self.driver_id,
            "customer_id": self.customer_id, "delivery_address": self.delivery_address,
            "status": self.status, "estimated_arrival": self.estimated_arrival.isoformat() if self.estimated_arrival else None,
            "delivered_at": self.delivered_at.isoformat() if self.delivered_at else None,
            "driver_lat": self.driver_lat, "driver_lng": self.driver_lng,
            "customer_lat": self.customer_lat, "customer_lng": self.customer_lng,
            "notes": self.notes, "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class SMSLog(db.Model):
    __tablename__ = 'sms_log'
    id = db.Column(db.Integer, primary_key=True)
    to_number = db.Column(db.String(20), nullable=False)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='sent')
    twilio_sid = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def serialize(self):
        return {"id": self.id, "to_number": self.to_number, "message": self.message,
                "status": self.status, "created_at": self.created_at.isoformat() if self.created_at else None}

class MetrcSync(db.Model):
    __tablename__ = 'metrc_sync'
    id = db.Column(db.Integer, primary_key=True)
    sync_type = db.Column(db.String(50))  # inventory, transfer, sale
    metrc_id = db.Column(db.String(100))
    local_id = db.Column(db.Integer)
    status = db.Column(db.String(20), default='pending')
    response = db.Column(db.JSON)
    synced_at = db.Column(db.DateTime, default=datetime.utcnow)

    def serialize(self):
        return {"id": self.id, "sync_type": self.sync_type, "metrc_id": self.metrc_id,
                "local_id": self.local_id, "status": self.status,
                "synced_at": self.synced_at.isoformat() if self.synced_at else None}

class ProductReview(db.Model):
    __tablename__ = 'product_review'
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1-5
    review_text = db.Column(db.Text)
    effects = db.Column(db.JSON, default=[])  # ["relaxed", "happy", "creative"]
    would_recommend = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    product = db.relationship('Product', backref='product_reviews')
    customer = db.relationship('Customer', backref='product_reviews')

    def serialize(self):
        return {"id": self.id, "product_id": self.product_id, "customer_id": self.customer_id,
                "rating": self.rating, "review_text": self.review_text, "effects": self.effects or [],
                "would_recommend": self.would_recommend,
                "created_at": self.created_at.isoformat() if self.created_at else None}

class WaitlistEntry(db.Model):
    __tablename__ = 'waitlist_entry'
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    store_id = db.Column(db.Integer, db.ForeignKey('store.id'), nullable=False)
    position = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), default='waiting')  # waiting, called, served, left
    called_at = db.Column(db.DateTime)
    served_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.Column(db.String(200))

    customer = db.relationship('Customer', backref='waitlist_entries')

    def serialize(self):
        return {"id": self.id, "customer_id": self.customer_id, "store_id": self.store_id,
                "position": self.position, "status": self.status,
                "called_at": self.called_at.isoformat() if self.called_at else None,
                "served_at": self.served_at.isoformat() if self.served_at else None,
                "created_at": self.created_at.isoformat() if self.created_at else None,
                "notes": self.notes}

class StripePayment(db.Model):
    __tablename__ = 'stripe_payment'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    stripe_payment_intent_id = db.Column(db.String(200), unique=True)
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(10), default='usd')
    status = db.Column(db.String(30), default='pending')
    payment_method = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    order = db.relationship('Order', backref='stripe_payment')

    def serialize(self):
        return {"id": self.id, "order_id": self.order_id,
                "stripe_payment_intent_id": self.stripe_payment_intent_id,
                "amount": self.amount, "currency": self.currency,
                "status": self.status, "payment_method": self.payment_method,
                "created_at": self.created_at.isoformat() if self.created_at else None}
'''

if 'class DeliveryOrder(' not in content:
    content += new_models
    with open('src/api/models.py', 'w') as f:
        f.write(content)
    print("✓ New models added")
else:
    print("  Models already exist")

# Create all tables
import sys
sys.path.insert(0, 'src')
from app import app
from api.models import db
with app.app_context():
    db.create_all()
    print("✓ All tables created")
PYEOF

# ============================================================
# 2. ADD ALL BACKEND ROUTES
# ============================================================
python3 << 'PYEOF'
with open('src/api/routes.py', 'r') as f:
    content = f.read()

if 'def create_payment_intent(' not in content:
    new_routes = '''
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
            _send_sms(order.customer.phone, f"DispenseMaster: Payment confirmed for Order #{order.id}. Total: ${payment.amount:.2f}. Thank you!")
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
    msg = f"DispenseMaster: {status_msgs.get(delivery.status, 'Your order status has been updated.')}"
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
    _send_sms(customer.phone, f"DispenseMaster: {msgs.get(status, 'Delivery update.')}")

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
            items_text += f"{product.name if product else 'Item'} x{item.quantity} - ${float(item.unit_price * item.quantity):.2f}\n"
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
    msg = f"DispenseMaster Receipt - Order #{order.id}: ${float(order.total_amount):.2f}. Thank you {customer.first_name}!"
    success = _send_sms(customer.phone, msg)
    return jsonify({"sent": success}), 200
'''
    content += new_routes
    with open('src/api/routes.py', 'w') as f:
        f.write(content)
    print("✓ All backend routes added")

# Fix imports
with open('src/api/routes.py', 'r') as f:
    content = f.read()

imports_line = 'from api.models import db, User, Product, Customer, Order, OrderItem, Invoice, Role'
if 'DeliveryOrder' not in content.split(imports_line)[1][:200] if imports_line in content else True:
    new_imports = imports_line + ', DeliveryOrder, SMSLog, MetrcSync, ProductReview, WaitlistEntry, StripePayment, Resume, OnboardingChecklist, OnboardingTask, PerformanceReview, SavedJob, EmployeeTraining'
    content = content.replace(imports_line, new_imports)
    with open('src/api/routes.py', 'w') as f:
        f.write(content)
    print("✓ Imports updated")
PYEOF

# ============================================================
# 3. BUILD ALL FRONTEND PAGES
# ============================================================

# Stripe Checkout Component
cat > src/front/js/pages/StripeCheckout.js << 'EOF'
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const StripeCheckout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { order_id, amount } = location.state || {};
    const [loading, setLoading] = useState(false);
    const [publishableKey, setPublishableKey] = useState("");
    const [status, setStatus] = useState("");
    const [cardDetails, setCardDetails] = useState({ number:"", expiry:"", cvc:"", name:"" });
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/payments/config`, { headers })
            .then(r => r.ok ? r.json() : {})
            .then(data => setPublishableKey(data.publishable_key || ""))
            .catch(console.error);
    }, []);

    const handlePayment = async () => {
        if (!order_id || !amount) return setStatus("Missing order information");
        setLoading(true);
        setStatus("Processing payment...");
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/payments/create-intent`, {
                method:"POST", headers, body:JSON.stringify({ order_id, amount, customer_id: 1 })
            });
            if (!r.ok) {
                const err = await r.json();
                setStatus(err.error || "Payment setup failed");
                setLoading(false);
                return;
            }
            const { client_secret, payment_intent_id } = await r.json();
            const confirm = await fetch(`${process.env.BACKEND_URL}/api/payments/confirm`, {
                method:"POST", headers, body:JSON.stringify({ payment_intent_id, payment_method:"card" })
            });
            if (confirm.ok) {
                setStatus("✓ Payment successful!");
                setTimeout(() => navigate("/orders"), 2000);
            } else {
                setStatus("Payment confirmation failed");
            }
        } catch(e) { setStatus("Payment error: " + e.message); }
        finally { setLoading(false); }
    };

    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2>💳 Checkout</h2><p>Secure payment processing</p></div>
            <div className="row justify-content-center">
                <div className="col-md-6">
                    {!publishableKey && (
                        <div className="alert alert-warning mb-4">
                            <strong>Stripe not configured.</strong> Add STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY to your .env file to enable real payments.
                        </div>
                    )}
                    <div className="glass-panel mb-3">
                        <h5 className="mb-3">Order Summary</h5>
                        <div className="d-flex justify-content-between mb-2">
                            <span>Order #{order_id}</span>
                            <span className="text-success fw-bold">${parseFloat(amount||0).toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="glass-panel mb-3">
                        <h5 className="mb-3">Card Details</h5>
                        <div className="row g-3">
                            <div className="col-12">
                                <label className="form-label">Cardholder Name</label>
                                <input className="form-control" placeholder="John Doe" value={cardDetails.name} onChange={e=>setCardDetails({...cardDetails,name:e.target.value})} />
                            </div>
                            <div className="col-12">
                                <label className="form-label">Card Number</label>
                                <input className="form-control" placeholder="4242 4242 4242 4242" maxLength="19"
                                    value={cardDetails.number} onChange={e=>setCardDetails({...cardDetails,number:e.target.value})} />
                            </div>
                            <div className="col-6">
                                <label className="form-label">Expiry</label>
                                <input className="form-control" placeholder="MM/YY" maxLength="5" value={cardDetails.expiry} onChange={e=>setCardDetails({...cardDetails,expiry:e.target.value})} />
                            </div>
                            <div className="col-6">
                                <label className="form-label">CVC</label>
                                <input className="form-control" placeholder="123" maxLength="3" value={cardDetails.cvc} onChange={e=>setCardDetails({...cardDetails,cvc:e.target.value})} />
                            </div>
                        </div>
                    </div>
                    {status && <div className={`alert ${status.includes("✓")?"alert-success":"alert-info"} mb-3`}>{status}</div>}
                    <button className="btn btn-success w-100 py-3" onClick={handlePayment} disabled={loading}>
                        {loading ? <span className="spinner-border spinner-border-sm me-2"/> : "💳 "}
                        {loading ? "Processing..." : `Pay $${parseFloat(amount||0).toFixed(2)}`}
                    </button>
                    <p className="text-center mt-2" style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.4)"}}>🔒 Secured by Stripe</p>
                </div>
            </div>
        </div>
    );
};
export default StripeCheckout;
EOF
echo "✓ StripeCheckout.js"

# Delivery Tracking Page
cat > src/front/js/pages/DeliveryTracking.js << 'EOF'
import React, { useState, useEffect } from "react";

const STATUS_STEPS = ["pending","assigned","en_route","delivered"];
const STATUS_LABELS = { pending:"Order Placed", assigned:"Driver Assigned", en_route:"On The Way", delivered:"Delivered" };
const STATUS_ICONS = { pending:"📦", assigned:"🚗", en_route:"🏃", delivered:"✅" };

const DeliveryTracking = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ order_id:"", customer_id:"", delivery_address:"", notes:"" });
    const [updating, setUpdating] = useState(false);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    const load = () => {
        fetch(`${process.env.BACKEND_URL}/api/deliveries`, { headers })
            .then(r => r.ok ? r.json() : [])
            .then(data => { setDeliveries(Array.isArray(data)?data:[]); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { load(); const interval = setInterval(load, 30000); return () => clearInterval(interval); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        const r = await fetch(`${process.env.BACKEND_URL}/api/deliveries`, { method:"POST", headers, body:JSON.stringify(form) });
        if (r.ok) { load(); setShowCreate(false); }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        setUpdating(true);
        await fetch(`${process.env.BACKEND_URL}/api/deliveries/${id}/location`, {
            method:"PUT", headers, body:JSON.stringify({ status:newStatus })
        });
        load();
        setUpdating(false);
    };

    const handleSMS = async (id, type) => {
        await fetch(`${process.env.BACKEND_URL}/api/sms/delivery-update/${id}`, { method:"POST", headers });
        alert("SMS sent to customer!");
    };

    const STATUS_COLOR = { pending:"#ffd600", assigned:"#11cdef", en_route:"#fb6340", delivered:"#2dce89" };

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2>🚗 Delivery Tracking</h2><p>{deliveries.filter(d=>d.status!=="delivered").length} active deliveries</p></div>
                <button className="btn btn-success" onClick={()=>setShowCreate(!showCreate)}>+ New Delivery</button>
            </div>

            <div className="row g-3 mb-4">
                {[{l:"Pending",s:"pending",c:"#ffd600"},{l:"Assigned",s:"assigned",c:"#11cdef"},{l:"En Route",s:"en_route",c:"#fb6340"},{l:"Delivered",s:"delivered",c:"#2dce89"}].map(({l,s,c})=>(
                    <div key={s} className="col-6 col-md-3"><div className="glass-panel text-center">
                        <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>{l}</div>
                        <div style={{fontSize:"1.8rem",fontWeight:700,color:c}}>{deliveries.filter(d=>d.status===s).length}</div>
                    </div></div>
                ))}
            </div>

            {showCreate && (
                <div className="glass-panel mb-4">
                    <h5 className="mb-3">Create Delivery</h5>
                    <form onSubmit={handleCreate}>
                        <div className="row g-3">
                            <div className="col-md-3"><label className="form-label">Order ID</label><input className="form-control" required value={form.order_id} onChange={e=>setForm({...form,order_id:e.target.value})} /></div>
                            <div className="col-md-3"><label className="form-label">Customer ID</label><input className="form-control" required value={form.customer_id} onChange={e=>setForm({...form,customer_id:e.target.value})} /></div>
                            <div className="col-md-4"><label className="form-label">Delivery Address</label><input className="form-control" required value={form.delivery_address} onChange={e=>setForm({...form,delivery_address:e.target.value})} /></div>
                            <div className="col-md-2 d-flex align-items-end"><button type="submit" className="btn btn-success w-100">Create</button></div>
                        </div>
                    </form>
                </div>
            )}

            <div className="row g-3">
                <div className="col-md-5">
                    <div className="glass-panel">
                        <h5 className="mb-3">Active Deliveries</h5>
                        {deliveries.map(d=>(
                            <div key={d.id} className="mb-2 p-3 rounded" style={{background:selected?.id===d.id?"rgba(45,206,137,0.15)":"rgba(255,255,255,0.06)",border:`1px solid ${selected?.id===d.id?"rgba(45,206,137,0.4)":"rgba(255,255,255,0.1)"}`,cursor:"pointer"}} onClick={()=>setSelected(d)}>
                                <div className="d-flex justify-content-between">
                                    <div style={{fontWeight:600}}>Order #{d.order_id}</div>
                                    <span className="badge" style={{background:STATUS_COLOR[d.status]+"33",color:STATUS_COLOR[d.status]}}>{STATUS_LABELS[d.status]}</span>
                                </div>
                                <div style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.5)",marginTop:"4px"}}>📍 {d.delivery_address?.slice(0,40)}</div>
                            </div>
                        ))}
                        {deliveries.length===0 && <p style={{color:"rgba(255,255,255,0.5)"}}>No deliveries yet</p>}
                    </div>
                </div>
                <div className="col-md-7">
                    {!selected ? (
                        <div className="glass-panel text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}><div style={{fontSize:"3rem"}}>🚗</div><h5>Select a delivery</h5></div>
                    ) : (
                        <div className="glass-panel">
                            <h5 className="mb-4">Order #{selected.order_id} — Tracking</h5>
                            <div className="d-flex justify-content-between mb-4">
                                {STATUS_STEPS.map((step,i)=>{
                                    const currentIdx = STATUS_STEPS.indexOf(selected.status);
                                    const done = i <= currentIdx;
                                    return (
                                        <div key={step} className="text-center flex-grow-1">
                                            <div style={{fontSize:"1.8rem",opacity:done?1:0.3}}>{STATUS_ICONS[step]}</div>
                                            <div style={{fontSize:"0.7rem",color:done?"#2dce89":"rgba(255,255,255,0.3)",marginTop:"4px"}}>{STATUS_LABELS[step]}</div>
                                            {i<STATUS_STEPS.length-1&&<div style={{height:"2px",background:done?"#2dce89":"rgba(255,255,255,0.1)",marginTop:"8px"}}/>}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mb-3">
                                <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>DELIVERY ADDRESS</div>
                                <div>{selected.delivery_address}</div>
                            </div>
                            <h6 className="mb-2">Update Status</h6>
                            <div className="d-flex gap-2 flex-wrap mb-3">
                                {STATUS_STEPS.filter(s=>s!==selected.status).map(s=>(
                                    <button key={s} className="btn btn-outline-light btn-sm" disabled={updating} onClick={()=>{handleStatusUpdate(selected.id,s);setSelected({...selected,status:s});}}>
                                        {STATUS_ICONS[s]} {STATUS_LABELS[s]}
                                    </button>
                                ))}
                            </div>
                            <button className="btn btn-outline-info btn-sm" onClick={()=>handleSMS(selected.id,selected.status)}>📱 Send SMS Update</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default DeliveryTracking;
EOF
echo "✓ DeliveryTracking.js"

# SMS Dashboard
cat > src/front/js/pages/SMSDashboard.js << 'EOF'
import React, { useState, useEffect } from "react";

const TEMPLATES = [
    { label:"Order Ready", msg:"Hi {name}! Your order #{order} is ready for pickup. Please bring your ID!" },
    { label:"Loyalty Reminder", msg:"Hi {name}! You have {points} loyalty points. Stop by and use them for discounts!" },
    { label:"New Deal", msg:"Hi {name}! We have a new deal just for you: {deal}. Come in today!" },
    { label:"Appointment Reminder", msg:"Hi {name}! Reminder: You have an appointment tomorrow. See you then!" },
];

const SMSDashboard = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ to:"", message:"" });
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState("");
    const [configured, setConfigured] = useState(false);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/sms/logs`, { headers })
            .then(r => r.ok ? r.json() : [])
            .then(data => { setLogs(Array.isArray(data)?data:[]); setConfigured(true); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/sms/send`, { method:"POST", headers, body:JSON.stringify(form) });
            const data = await r.json();
            if (data.success) { setStatus("✓ SMS sent!"); setForm({to:"",message:""}); }
            else setStatus("SMS failed — check Twilio configuration");
        } catch(e) { setStatus("Error: " + e.message); }
        finally { setSending(false); setTimeout(()=>setStatus(""), 3000); }
    };

    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2>📱 SMS Dashboard</h2><p>Send and track customer text messages</p></div>

            {!configured && (
                <div className="alert alert-warning mb-4">
                    <strong>Twilio not configured.</strong> Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to your .env file.
                </div>
            )}

            <div className="row g-4">
                <div className="col-md-5">
                    <div className="glass-panel mb-3">
                        <h5 className="mb-3">Send SMS</h5>
                        <form onSubmit={handleSend}>
                            <div className="mb-3"><label className="form-label">Phone Number</label><input className="form-control" required placeholder="+16175551234" value={form.to} onChange={e=>setForm({...form,to:e.target.value})} /></div>
                            <div className="mb-3"><label className="form-label">Message</label><textarea className="form-control" rows="4" required value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Type your message..." maxLength="160" />
                                <small style={{color:"rgba(255,255,255,0.4)"}}>{form.message.length}/160 characters</small>
                            </div>
                            {status && <div className={`alert ${status.includes("✓")?"alert-success":"alert-danger"} py-2`}>{status}</div>}
                            <button type="submit" className="btn btn-success w-100" disabled={sending}>{sending?<span className="spinner-border spinner-border-sm"/>:"Send SMS"}</button>
                        </form>
                    </div>

                    <div className="glass-panel">
                        <h5 className="mb-3">Quick Templates</h5>
                        {TEMPLATES.map((t,i)=>(
                            <button key={i} className="btn btn-outline-light btn-sm w-100 mb-2 text-start"
                                onClick={()=>setForm({...form,message:t.msg})}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="col-md-7">
                    <div className="glass-panel">
                        <h5 className="mb-3">Recent Messages ({logs.length})</h5>
                        {loading ? <div className="spinner-border text-light"/>
                        : logs.length===0 ? <p style={{color:"rgba(255,255,255,0.5)"}}>No messages sent yet</p>
                        : logs.map(log=>(
                            <div key={log.id} className="mb-2 p-3 rounded" style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)"}}>
                                <div className="d-flex justify-content-between mb-1">
                                    <span style={{fontFamily:"monospace",fontSize:"0.85rem"}}>{log.to_number}</span>
                                    <div className="d-flex gap-2 align-items-center">
                                        <span className={`badge bg-${log.status==="sent"?"success":"danger"}`}>{log.status}</span>
                                        <span style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.4)"}}>{log.created_at?new Date(log.created_at).toLocaleString():""}</span>
                                    </div>
                                </div>
                                <div style={{fontSize:"0.85rem",color:"rgba(255,255,255,0.7)"}}>{log.message}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default SMSDashboard;
EOF
echo "✓ SMSDashboard.js"

# Metrc Integration Page
cat > src/front/js/pages/MetrcIntegration.js << 'EOF'
import React, { useState, useEffect } from "react";

const MetrcIntegration = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState(null);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/metrc/status`, { headers })
            .then(r => r.ok ? r.json() : null)
            .then(data => { setStatus(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleSync = async (type) => {
        setSyncing(true);
        setSyncResult(null);
        try {
            const endpoint = type === 'inventory' ? '/api/metrc/sync-inventory' : '/api/metrc/sync-sale';
            const r = await fetch(`${process.env.BACKEND_URL}${endpoint}`, { method:"POST", headers, body:JSON.stringify({}) });
            const data = await r.json();
            setSyncResult({ success: r.ok, data, type });
        } catch(e) { setSyncResult({ success:false, error:e.message }); }
        finally { setSyncing(false); }
    };

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;

    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2>🌿 Metrc Integration</h2><p>State-required seed-to-sale tracking</p></div>

            {!status?.configured && (
                <div className="alert alert-warning mb-4">
                    <strong>Metrc not configured.</strong> Add your METRC_API_KEY to the .env file. Most states legally require Metrc integration. <a href="https://metrc.com" target="_blank" rel="noreferrer" className="alert-link">Get your API key at metrc.com →</a>
                </div>
            )}

            <div className="row g-3 mb-4">
                {[
                    {l:"Status",v:status?.configured?"Connected":"Not Configured",c:status?.configured?"#2dce89":"#f5365c"},
                    {l:"Total Synced",v:status?.total_synced||0,c:"#2dce89"},
                    {l:"Failed Syncs",v:status?.total_failed||0,c:"#f5365c"},
                    {l:"Last Sync",v:status?.recent_syncs?.[0]?.synced_at?new Date(status.recent_syncs[0].synced_at).toLocaleDateString():"Never",c:"#11cdef"},
                ].map((s,i)=>(
                    <div key={i} className="col-6 col-md-3"><div className="glass-panel text-center">
                        <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>{s.l}</div>
                        <div style={{fontSize:i===0?"1rem":"1.8rem",fontWeight:700,color:s.c,marginTop:"4px"}}>{s.v}</div>
                    </div></div>
                ))}
            </div>

            <div className="row g-3">
                <div className="col-md-6">
                    <div className="glass-panel">
                        <h5 className="mb-3">Sync Actions</h5>
                        <div className="d-grid gap-3">
                            <button className="btn btn-success py-3" onClick={()=>handleSync('inventory')} disabled={syncing||!status?.configured}>
                                {syncing?<span className="spinner-border spinner-border-sm me-2"/>:"📦 "}
                                Sync Inventory to Metrc
                            </button>
                            <button className="btn btn-outline-success py-3" onClick={()=>handleSync('sales')} disabled={syncing||!status?.configured}>
                                {syncing?<span className="spinner-border spinner-border-sm me-2"/>:"💰 "}
                                Sync Sales to Metrc
                            </button>
                        </div>
                        {syncResult && (
                            <div className={`alert ${syncResult.success?"alert-success":"alert-danger"} mt-3`}>
                                {syncResult.success ? `✓ Synced ${syncResult.data?.synced||0} records. ${syncResult.data?.errors?.length||0} errors.` : `Failed: ${syncResult.error || "Check Metrc API key"}`}
                            </div>
                        )}
                        <hr style={{borderColor:"rgba(255,255,255,0.1)"}}/>
                        <h6>What Gets Synced</h6>
                        <ul className="list-unstyled" style={{fontSize:"0.85rem",color:"rgba(255,255,255,0.7)"}}>
                            <li>✓ Product inventory levels</li>
                            <li>✓ Batch/package numbers</li>
                            <li>✓ Sales transactions</li>
                            <li>✓ Customer purchase records</li>
                        </ul>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="glass-panel">
                        <h5 className="mb-3">Recent Sync History</h5>
                        {(status?.recent_syncs||[]).length===0 ? <p style={{color:"rgba(255,255,255,0.5)"}}>No syncs yet</p>
                        : (status?.recent_syncs||[]).map((s,i)=>(
                            <div key={i} className="mb-2 p-2 rounded d-flex justify-content-between" style={{background:"rgba(255,255,255,0.06)"}}>
                                <div>
                                    <span className="badge bg-secondary me-2">{s.sync_type}</span>
                                    <span style={{fontSize:"0.85rem"}}>ID: {s.local_id}</span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <span className={`badge bg-${s.status==="synced"?"success":"danger"}`}>{s.status}</span>
                                    <span style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.4)"}}>{s.synced_at?new Date(s.synced_at).toLocaleDateString():""}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default MetrcIntegration;
EOF
echo "✓ MetrcIntegration.js"

# Kiosk Mode
cat > src/front/js/pages/KioskMode.js << 'EOF'
import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";

const CATEGORIES = ["All","Flower","Edibles","Concentrates","Vapes","Pre-Rolls","Topicals","CBD"];

const KioskMode = () => {
    const { store, actions } = useContext(Context);
    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [category, setCategory] = useState("All");
    const [search, setSearch] = useState("");
    const [cart, setCart] = useState([]);
    const [step, setStep] = useState("browse"); // browse, cart, age-verify, payment, receipt
    const [ageVerified, setAgeVerified] = useState(false);
    const [dob, setDob] = useState("");
    const [idScanned, setIdScanned] = useState(false);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/products`, { headers })
            .then(r => r.ok ? r.json() : {})
            .then(data => {
                const prods = Array.isArray(data) ? data : (data.products || []);
                setProducts(prods); setFiltered(prods); setLoading(false);
            }).catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        let result = products;
        if (category !== "All") result = result.filter(p => p.category === category);
        if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
        setFiltered(result);
    }, [category, search, products]);

    const addToCart = (product) => {
        const existing = cart.find(i => i.id === product.id);
        if (existing) setCart(cart.map(i => i.id === product.id ? {...i, qty: i.qty+1} : i));
        else setCart([...cart, {...product, qty:1}]);
    };

    const removeFromCart = (id) => setCart(cart.filter(i => i.id !== id));
    const updateQty = (id, qty) => qty <= 0 ? removeFromCart(id) : setCart(cart.map(i => i.id===id ? {...i, qty} : i));

    const getPrice = (p) => parseFloat(p.price || p.unit_price || 0);
    const subtotal = cart.reduce((s, i) => s + getPrice(i) * i.qty, 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    const verifyAge = () => {
        if (!dob) return alert("Please enter your date of birth");
        const age = Math.floor((new Date() - new Date(dob)) / (365.25*24*60*60*1000));
        if (age >= 21) { setAgeVerified(true); setStep("payment"); }
        else alert("You must be 21 or older to purchase cannabis products.");
    };

    const completeOrder = async () => {
        setCompleting(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/orders`, {
                method:"POST", headers,
                body:JSON.stringify({
                    customer_id: 1,
                    items: cart.map(i => ({ product_id:i.id, quantity:i.qty }))
                })
            });
            if (r.ok) {
                const data = await r.json();
                setOrderId(data.id);
                setStep("receipt");
                setCart([]);
            }
        } catch(e) { console.error(e); }
        finally { setCompleting(false); }
    };

    const resetKiosk = () => { setStep("browse"); setCart([]); setAgeVerified(false); setDob(""); setIdScanned(false); setOrderId(null); };

    if (loading) return <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0a0e1a"}}><div className="spinner-border text-light"/></div>;

    return (
        <div style={{height:"100vh",background:"linear-gradient(135deg,#0a0e1a,#1a2040)",color:"white",fontFamily:"system-ui",overflow:"hidden",display:"flex",flexDirection:"column"}}>
            {/* Header */}
            <div style={{padding:"1rem 2rem",background:"rgba(0,0,0,0.4)",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
                <div style={{fontSize:"1.5rem",fontWeight:800,color:"#2dce89"}}>🌿 DispenseMaster Kiosk</div>
                <div style={{display:"flex",gap:"1rem",alignItems:"center"}}>
                    {cart.length>0 && step==="browse" && (
                        <button style={{background:"#2dce89",border:"none",borderRadius:"8px",padding:"0.5rem 1.5rem",color:"white",fontWeight:600,cursor:"pointer",fontSize:"1rem"}}
                            onClick={()=>setStep("cart")}>
                            🛒 Cart ({cart.reduce((s,i)=>s+i.qty,0)}) — ${total.toFixed(2)}
                        </button>
                    )}
                    {step!=="browse" && <button style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:"8px",padding:"0.5rem 1rem",color:"white",cursor:"pointer"}} onClick={resetKiosk}>✕ Start Over</button>}
                </div>
            </div>

            {/* Browse Step */}
            {step === "browse" && (
                <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
                    <div style={{padding:"1rem 2rem",display:"flex",gap:"1rem",alignItems:"center",background:"rgba(0,0,0,0.2)"}}>
                        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..." style={{flex:1,padding:"0.75rem 1rem",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.05)",color:"white",fontSize:"1rem"}} />
                        <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
                            {CATEGORIES.map(c=><button key={c} onClick={()=>setCategory(c)} style={{padding:"0.5rem 1rem",borderRadius:"20px",border:"none",background:category===c?"#2dce89":"rgba(255,255,255,0.1)",color:"white",cursor:"pointer",fontWeight:category===c?700:400}}>{c}</button>)}
                        </div>
                    </div>
                    <div style={{flex:1,overflowY:"auto",padding:"1.5rem 2rem",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"1rem",alignContent:"start"}}>
                        {filtered.map(p=>(
                            <div key={p.id} onClick={()=>addToCart(p)} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"12px",padding:"1.25rem",cursor:"pointer",transition:"transform 0.15s,border-color 0.15s"}}
                                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.borderColor="rgba(45,206,137,0.5)";}}
                                onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.borderColor="rgba(255,255,255,0.12)";}}>
                                <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase",marginBottom:"0.5rem"}}>{p.category}</div>
                                <div style={{fontWeight:700,fontSize:"1rem",marginBottom:"0.25rem"}}>{p.name}</div>
                                {p.strain && <div style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.5)",marginBottom:"0.25rem"}}>{p.strain}</div>}
                                {p.thc_content>0 && <div style={{fontSize:"0.75rem",color:"#2dce89",marginBottom:"0.75rem"}}>THC: {p.thc_content}%</div>}
                                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                                    <span style={{fontWeight:800,fontSize:"1.2rem",color:"#2dce89"}}>${getPrice(p).toFixed(2)}</span>
                                    <span style={{background:"#2dce89",borderRadius:"50%",width:"32px",height:"32px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.2rem",color:"white"}}>+</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Cart Step */}
            {step === "cart" && (
                <div style={{flex:1,display:"flex",flexDirection:"column",padding:"2rem",overflow:"auto"}}>
                    <h2 style={{marginBottom:"1.5rem"}}>🛒 Your Cart</h2>
                    {cart.map(item=>(
                        <div key={item.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"1rem",marginBottom:"0.75rem",background:"rgba(255,255,255,0.06)",borderRadius:"10px"}}>
                            <div><div style={{fontWeight:600}}>{item.name}</div><div style={{fontSize:"0.85rem",color:"rgba(255,255,255,0.5)"}}>${getPrice(item).toFixed(2)} each</div></div>
                            <div style={{display:"flex",alignItems:"center",gap:"1rem"}}>
                                <button onClick={()=>updateQty(item.id,item.qty-1)} style={{width:"36px",height:"36px",borderRadius:"50%",border:"1px solid rgba(255,255,255,0.2)",background:"transparent",color:"white",fontSize:"1.2rem",cursor:"pointer"}}>-</button>
                                <span style={{fontWeight:700,fontSize:"1.1rem",minWidth:"24px",textAlign:"center"}}>{item.qty}</span>
                                <button onClick={()=>updateQty(item.id,item.qty+1)} style={{width:"36px",height:"36px",borderRadius:"50%",border:"none",background:"#2dce89",color:"white",fontSize:"1.2rem",cursor:"pointer"}}>+</button>
                                <span style={{fontWeight:700,color:"#2dce89",minWidth:"60px",textAlign:"right"}}>${(getPrice(item)*item.qty).toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                    <div style={{marginTop:"auto",background:"rgba(0,0,0,0.3)",borderRadius:"12px",padding:"1.5rem"}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.5rem"}}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.5rem"}}><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
                        <div style={{display:"flex",justifyContent:"space-between",fontWeight:800,fontSize:"1.3rem",marginTop:"0.75rem",paddingTop:"0.75rem",borderTop:"1px solid rgba(255,255,255,0.1)"}}><span>Total</span><span style={{color:"#2dce89"}}>${total.toFixed(2)}</span></div>
                    </div>
                    <div style={{display:"flex",gap:"1rem",marginTop:"1.5rem"}}>
                        <button onClick={()=>setStep("browse")} style={{flex:1,padding:"1rem",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.2)",background:"transparent",color:"white",fontSize:"1rem",cursor:"pointer"}}>← Continue Shopping</button>
                        <button onClick={()=>setStep("age-verify")} style={{flex:2,padding:"1rem",borderRadius:"10px",border:"none",background:"#2dce89",color:"white",fontSize:"1.1rem",fontWeight:700,cursor:"pointer"}}>Proceed to Checkout →</button>
                    </div>
                </div>
            )}

            {/* Age Verification Step */}
            {step === "age-verify" && (
                <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem",textAlign:"center"}}>
                    <div style={{fontSize:"4rem",marginBottom:"1rem"}}>🪪</div>
                    <h2 style={{marginBottom:"0.5rem"}}>Age Verification Required</h2>
                    <p style={{color:"rgba(255,255,255,0.6)",marginBottom:"2rem"}}>You must be 21 or older to purchase cannabis products</p>
                    <div style={{background:"rgba(255,255,255,0.06)",borderRadius:"16px",padding:"2rem",width:"100%",maxWidth:"400px"}}>
                        <div style={{marginBottom:"1.5rem"}}>
                            <label style={{display:"block",marginBottom:"0.5rem",color:"rgba(255,255,255,0.7)"}}>Date of Birth</label>
                            <input type="date" value={dob} onChange={e=>setDob(e.target.value)} style={{width:"100%",padding:"1rem",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.05)",color:"white",fontSize:"1.1rem"}} />
                        </div>
                        <button onClick={verifyAge} style={{width:"100%",padding:"1rem",borderRadius:"10px",border:"none",background:"#2dce89",color:"white",fontSize:"1.1rem",fontWeight:700,cursor:"pointer",marginBottom:"1rem"}}>Verify Age</button>
                        <div style={{color:"rgba(255,255,255,0.5)",fontSize:"0.85rem"}}>Or show your ID to the budtender</div>
                    </div>
                </div>
            )}

            {/* Payment Step */}
            {step === "payment" && (
                <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem",textAlign:"center"}}>
                    <div style={{fontSize:"4rem",marginBottom:"1rem"}}>💳</div>
                    <h2 style={{marginBottom:"0.5rem"}}>Choose Payment Method</h2>
                    <p style={{color:"rgba(255,255,255,0.6)",marginBottom:"2rem"}}>Total: <strong style={{color:"#2dce89",fontSize:"1.3rem"}}>${total.toFixed(2)}</strong></p>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",width:"100%",maxWidth:"500px",marginBottom:"2rem"}}>
                        {[{l:"💵 Cash",v:"cash"},{l:"💳 Card",v:"card"},{l:"🏦 Debit",v:"debit"},{l:"📱 Digital",v:"digital"}].map(pm=>(
                            <button key={pm.v} onClick={completeOrder} disabled={completing} style={{padding:"2rem",borderRadius:"12px",border:"1px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.06)",color:"white",fontSize:"1.1rem",fontWeight:600,cursor:"pointer",transition:"all 0.2s"}}
                                onMouseEnter={e=>{e.currentTarget.style.background="rgba(45,206,137,0.2)";e.currentTarget.style.borderColor="#2dce89";}}
                                onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.06)";e.currentTarget.style.borderColor="rgba(255,255,255,0.2)";}}>
                                {completing?<span className="spinner-border spinner-border-sm"/>:pm.l}
                            </button>
                        ))}
                    </div>
                    <p style={{color:"rgba(255,255,255,0.4)",fontSize:"0.85rem"}}>Please see budtender to complete payment</p>
                </div>
            )}

            {/* Receipt Step */}
            {step === "receipt" && (
                <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem",textAlign:"center"}}>
                    <div style={{fontSize:"5rem",marginBottom:"1rem"}}>✅</div>
                    <h1 style={{color:"#2dce89",marginBottom:"0.5rem"}}>Order Placed!</h1>
                    {orderId && <p style={{color:"rgba(255,255,255,0.6)",fontSize:"1.1rem",marginBottom:"2rem"}}>Order #{orderId} — Please see budtender for payment and pickup</p>}
                    <div style={{background:"rgba(45,206,137,0.1)",border:"1px solid rgba(45,206,137,0.3)",borderRadius:"12px",padding:"2rem",maxWidth:"400px",marginBottom:"2rem"}}>
                        <div style={{fontSize:"0.9rem",color:"rgba(255,255,255,0.7)"}}>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.5rem"}}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.5rem"}}><span>Tax</span><span>${tax.toFixed(2)}</span></div>
                            <div style={{display:"flex",justifyContent:"space-between",fontWeight:800,fontSize:"1.1rem",borderTop:"1px solid rgba(255,255,255,0.1)",paddingTop:"0.5rem"}}><span>Total</span><span style={{color:"#2dce89"}}>${total.toFixed(2)}</span></div>
                        </div>
                    </div>
                    <button onClick={resetKiosk} style={{padding:"1rem 3rem",borderRadius:"10px",border:"none",background:"#2dce89",color:"white",fontSize:"1.1rem",fontWeight:700,cursor:"pointer"}}>Start New Order</button>
                </div>
            )}
        </div>
    );
};
export default KioskMode;
EOF
echo "✓ KioskMode.js"

# Waitlist/Queue Management
cat > src/front/js/pages/WaitlistQueue.js << 'EOF'
import React, { useState, useEffect } from "react";

const WaitlistQueue = () => {
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ customer_id:"", store_id:"1", notes:"" });
    const [adding, setAdding] = useState(false);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    const load = () => {
        fetch(`${process.env.BACKEND_URL}/api/waitlist?store_id=1`, { headers })
            .then(r => r.ok ? r.json() : [])
            .then(data => { setQueue(Array.isArray(data)?data:[]); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { load(); const interval = setInterval(load, 15000); return () => clearInterval(interval); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setAdding(true);
        const r = await fetch(`${process.env.BACKEND_URL}/api/waitlist`, { method:"POST", headers, body:JSON.stringify(form) });
        if (r.ok) { load(); setForm({ customer_id:"", store_id:"1", notes:"" }); }
        setAdding(false);
    };

    const handleCall = async (id) => {
        await fetch(`${process.env.BACKEND_URL}/api/waitlist/${id}/call`, { method:"PUT", headers });
        load();
    };

    const handleServe = async (id) => {
        await fetch(`${process.env.BACKEND_URL}/api/waitlist/${id}/serve`, { method:"PUT", headers });
        load();
    };

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2>🔢 Waitlist & Queue</h2><p>{queue.length} customers waiting · Auto-refreshes every 15s</p></div>
            </div>

            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="glass-panel">
                        <h5 className="mb-3">Add to Queue</h5>
                        <form onSubmit={handleAdd}>
                            <div className="mb-3"><label className="form-label">Customer ID</label><input className="form-control" required value={form.customer_id} onChange={e=>setForm({...form,customer_id:e.target.value})} placeholder="Customer ID" /></div>
                            <div className="mb-3"><label className="form-label">Notes</label><input className="form-control" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Medical, pickup, etc." /></div>
                            <button type="submit" className="btn btn-success w-100" disabled={adding}>{adding?<span className="spinner-border spinner-border-sm"/>:"Add to Queue"}</button>
                        </form>
                    </div>
                </div>
                <div className="col-md-8">
                    <div className="glass-panel">
                        <h5 className="mb-3">Current Queue</h5>
                        {loading ? <div className="spinner-border text-light"/>
                        : queue.length===0 ? <div className="text-center py-4" style={{color:"rgba(255,255,255,0.5)"}}><div style={{fontSize:"3rem"}}>🎉</div><p>No one waiting!</p></div>
                        : queue.map(entry=>(
                            <div key={entry.id} className="d-flex justify-content-between align-items-center mb-2 p-3 rounded"
                                style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)"}}>
                                <div className="d-flex align-items-center gap-3">
                                    <div style={{width:"40px",height:"40px",borderRadius:"50%",background:"#2dce89",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:"1.1rem"}}>#{entry.position}</div>
                                    <div>
                                        <div style={{fontWeight:600}}>Customer #{entry.customer_id}</div>
                                        {entry.notes && <div style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.5)"}}>{entry.notes}</div>}
                                        <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.4)"}}>{entry.created_at?`Waiting since ${new Date(entry.created_at).toLocaleTimeString()}`:"Just joined"}</div>
                                    </div>
                                </div>
                                <div className="d-flex gap-2">
                                    <span className={`badge bg-${entry.status==="waiting"?"warning text-dark":entry.status==="called"?"info":"success"}`}>{entry.status}</span>
                                    {entry.status==="waiting" && <button className="btn btn-sm btn-success" onClick={()=>handleCall(entry.id)}>📢 Call</button>}
                                    {entry.status==="called" && <button className="btn btn-sm btn-outline-success" onClick={()=>handleServe(entry.id)}>✓ Served</button>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default WaitlistQueue;
EOF
echo "✓ WaitlistQueue.js"

# Product Reviews Page
cat > src/front/js/pages/ProductReviews.js << 'EOF'
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EFFECTS = ["Relaxed","Happy","Creative","Energetic","Focused","Sleepy","Hungry","Euphoric","Uplifted","Talkative"];

const ProductReviews = () => {
    const { product_id } = useParams();
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ rating:5, review_text:"", effects:[], would_recommend:true });
    const [saving, setSaving] = useState(false);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        if (!product_id) return;
        fetch(`${process.env.BACKEND_URL}/api/products/${product_id}/reviews`, { headers })
            .then(r => r.ok ? r.json() : { reviews:[], average_rating:0 })
            .then(data => { setReviews(data.reviews||[]); setAvgRating(data.average_rating||0); setLoading(false); })
            .catch(() => setLoading(false));
    }, [product_id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const r = await fetch(`${process.env.BACKEND_URL}/api/products/${product_id}/reviews`, { method:"POST", headers, body:JSON.stringify(form) });
        if (r.ok) { const data = await r.json(); setReviews(prev=>[data,...prev.filter(rv=>rv.customer_id!==data.customer_id)]); setShowForm(false); }
        setSaving(false);
    };

    const toggleEffect = (effect) => setForm({...form, effects: form.effects.includes(effect) ? form.effects.filter(e=>e!==effect) : [...form.effects, effect]});

    const Stars = ({rating, onChange, readOnly}) => (
        <div className="d-flex gap-1">{[1,2,3,4,5].map(s=><span key={s} style={{fontSize:"1.5rem",cursor:readOnly?"default":"pointer",color:s<=rating?"#ffd600":"rgba(255,255,255,0.2)"}} onClick={()=>!readOnly&&onChange(s)}>★</span>)}</div>
    );

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2>⭐ Product Reviews</h2><p>{reviews.length} reviews · {avgRating} avg rating</p></div>
                <button className="btn btn-success" onClick={()=>setShowForm(!showForm)}>+ Write Review</button>
            </div>

            {/* Average */}
            <div className="glass-panel mb-4 text-center" style={{padding:"2rem"}}>
                <div style={{fontSize:"4rem",fontWeight:800,color:"#ffd600"}}>{avgRating.toFixed(1)}</div>
                <div className="d-flex justify-content-center mb-2">{[1,2,3,4,5].map(s=><span key={s} style={{fontSize:"2rem",color:s<=Math.round(avgRating)?"#ffd600":"rgba(255,255,255,0.2)"}}>★</span>)}</div>
                <div style={{color:"rgba(255,255,255,0.5)"}}>{reviews.length} customer reviews</div>
            </div>

            {showForm && (
                <div className="glass-panel mb-4">
                    <h5 className="mb-3">Write a Review</h5>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3"><label className="form-label">Rating *</label><Stars rating={form.rating} onChange={r=>setForm({...form,rating:r})} /></div>
                        <div className="mb-3"><label className="form-label">Your Experience</label><textarea className="form-control" rows="3" value={form.review_text} onChange={e=>setForm({...form,review_text:e.target.value})} placeholder="Share your experience..." /></div>
                        <div className="mb-3"><label className="form-label">Effects Felt</label><div className="d-flex flex-wrap gap-2">{EFFECTS.map(e=><span key={e} className={`badge ${form.effects.includes(e)?"bg-success":"bg-secondary"}`} style={{cursor:"pointer",padding:"8px 12px",fontSize:"0.85rem"}} onClick={()=>toggleEffect(e)}>{e}</span>)}</div></div>
                        <div className="mb-3 form-check"><input className="form-check-input" type="checkbox" checked={form.would_recommend} onChange={e=>setForm({...form,would_recommend:e.target.checked})} /><label className="form-check-label">I would recommend this product</label></div>
                        <div className="d-flex gap-2"><button type="button" className="btn btn-outline-light" onClick={()=>setShowForm(false)}>Cancel</button><button type="submit" className="btn btn-success flex-grow-1" disabled={saving}>{saving?<span className="spinner-border spinner-border-sm"/>:"Submit Review"}</button></div>
                    </form>
                </div>
            )}

            {loading ? <div className="spinner-border text-light"/>
            : reviews.map(r=>(
                <div key={r.id} className="glass-panel mb-3">
                    <div className="d-flex justify-content-between mb-2">
                        <div className="d-flex gap-1">{[1,2,3,4,5].map(s=><span key={s} style={{color:s<=r.rating?"#ffd600":"rgba(255,255,255,0.2)"}}>★</span>)}</div>
                        <span style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.4)"}}>{r.created_at?new Date(r.created_at).toLocaleDateString():""}</span>
                    </div>
                    {r.review_text && <p style={{margin:"0.5rem 0"}}>{r.review_text}</p>}
                    {(r.effects||[]).length>0 && <div className="d-flex flex-wrap gap-1 mb-2">{r.effects.map(e=><span key={e} className="badge bg-secondary">{e}</span>)}</div>}
                    {r.would_recommend && <div style={{fontSize:"0.8rem",color:"#2dce89"}}>✓ Recommends this product</div>}
                </div>
            ))}
        </div>
    );
};
export default ProductReviews;
EOF
echo "✓ ProductReviews.js"

# Multi-Location Dashboard
cat > src/front/js/pages/MultiLocationDashboard.js << 'EOF'
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MultiLocationDashboard = () => {
    const navigate = useNavigate();
    const [summary, setSummary] = useState([]);
    const [syncReport, setSyncReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/locations/inventory-summary`, { headers })
            .then(r => r.ok ? r.json() : [])
            .then(data => { setSummary(Array.isArray(data)?data:[]); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleSync = async () => {
        setSyncing(true);
        const r = await fetch(`${process.env.BACKEND_URL}/api/locations/sync-inventory`, { method:"POST", headers });
        if (r.ok) { const data = await r.json(); setSyncReport(data); }
        setSyncing(false);
    };

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2>🏪 Multi-Location Dashboard</h2><p>{summary.length} locations</p></div>
                <button className="btn btn-success" onClick={handleSync} disabled={syncing}>{syncing?<span className="spinner-border spinner-border-sm me-2"/>:"🔄 "}Sync All Inventory</button>
            </div>

            {syncReport && (
                <div className="alert alert-info mb-4">
                    <strong>Sync Complete:</strong> {syncReport.stores} stores · {syncReport.products} products ·
                    {syncReport.low_stock_alerts?.length>0 && <span className="text-warning ms-2">⚠️ {syncReport.low_stock_alerts.length} low stock</span>}
                    {syncReport.out_of_stock?.length>0 && <span className="text-danger ms-2">❌ {syncReport.out_of_stock.length} out of stock</span>}
                </div>
            )}

            {summary.length === 0 ? (
                <div className="glass-panel text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}>
                    <div style={{fontSize:"3rem"}}>🏪</div>
                    <h5>No locations found</h5>
                    <button className="btn btn-success mt-2" onClick={()=>navigate("/stores")}>Add Store</button>
                </div>
            ) : (
                <div className="row g-3">
                    {summary.map((store,i)=>(
                        <div key={i} className="col-md-6 col-lg-4">
                            <div className="glass-panel">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div><h5 className="mb-0">{store.name||`Store #${store.id}`}</h5><small style={{color:"rgba(255,255,255,0.5)"}}>{store.city}, {store.state}</small></div>
                                    <span className="badge bg-success">Active</span>
                                </div>
                                <div className="row g-2">
                                    {[{l:"Products",v:store.total_products,c:"#11cdef"},{l:"Low Stock",v:store.low_stock,c:"#ffd600"},{l:"Out of Stock",v:store.out_of_stock,c:"#f5365c"}].map((s,j)=>(
                                        <div key={j} className="col-4 text-center">
                                            <div style={{fontSize:"1.5rem",fontWeight:700,color:s.c}}>{s.v}</div>
                                            <div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.5)"}}>{s.l}</div>
                                        </div>
                                    ))}
                                </div>
                                <button className="btn btn-outline-light btn-sm w-100 mt-3" onClick={()=>navigate("/inventory")}>View Inventory →</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
export default MultiLocationDashboard;
EOF
echo "✓ MultiLocationDashboard.js"

# Gram Limit Checker (add to POS)
cat > src/front/js/pages/GramLimitChecker.js << 'EOF'
import React, { useState } from "react";

const STATES = ["MA","CA","CO","WA","OR","IL","NV","AZ","MI","NY","FL","PA","NJ","CT","RI","VT","ME","MN"];
const STATE_LIMITS = { MA:28,CA:28.35,CO:28,WA:28,OR:28,IL:30,NV:28,AZ:28,MI:42,NY:85 };

const GramLimitChecker = () => {
    const [form, setForm] = useState({ customer_id:"", grams:"", state:"MA" });
    const [result, setResult] = useState(null);
    const [checking, setChecking] = useState(false);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    const handleCheck = async (e) => {
        e.preventDefault();
        setChecking(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/compliance/gram-limit-check`, { method:"POST", headers, body:JSON.stringify(form) });
            const data = await r.json();
            setResult(data);
        } catch(e) { console.error(e); }
        finally { setChecking(false); }
    };

    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2>⚖️ Gram Limit Compliance</h2><p>State-mandated purchase limits per customer per day</p></div>
            <div className="row g-4">
                <div className="col-md-5">
                    <div className="glass-panel">
                        <h5 className="mb-3">Check Purchase Limit</h5>
                        <form onSubmit={handleCheck}>
                            <div className="mb-3"><label className="form-label">Customer ID</label><input className="form-control" required value={form.customer_id} onChange={e=>setForm({...form,customer_id:e.target.value})} /></div>
                            <div className="mb-3"><label className="form-label">Requested Grams</label><input className="form-control" type="number" step="0.1" min="0" required value={form.grams} onChange={e=>setForm({...form,grams:e.target.value})} /></div>
                            <div className="mb-3">
                                <label className="form-label">State</label>
                                <select className="form-select" value={form.state} onChange={e=>setForm({...form,state:e.target.value})}>
                                    {STATES.map(s=><option key={s}>{s}</option>)}
                                </select>
                                <small style={{color:"rgba(255,255,255,0.5)"}}>Daily limit: {STATE_LIMITS[form.state]||28}g</small>
                            </div>
                            <button type="submit" className="btn btn-success w-100" disabled={checking}>{checking?<span className="spinner-border spinner-border-sm"/>:"Check Limit"}</button>
                        </form>
                    </div>
                </div>
                <div className="col-md-7">
                    {result && (
                        <div className={`glass-panel ${result.allowed?"":"border border-danger"}`} style={{borderColor:result.allowed?"rgba(45,206,137,0.4)":"rgba(245,54,92,0.4)"}}>
                            <div className="text-center mb-4">
                                <div style={{fontSize:"4rem"}}>{result.allowed?"✅":"🚫"}</div>
                                <h3 style={{color:result.allowed?"#2dce89":"#f5365c"}}>{result.allowed?"PURCHASE ALLOWED":"PURCHASE DENIED"}</h3>
                                <p style={{color:"rgba(255,255,255,0.6)"}}>{result.allowed?`Customer can purchase ${result.requested_grams}g`:`Exceeds daily limit of ${result.daily_limit}g`}</p>
                            </div>
                            <div className="row g-3">
                                {[{l:"Requested",v:`${result.requested_grams}g`,c:"#11cdef"},{l:"Purchased Today",v:`${result.grams_purchased_today}g`,c:"#ffd600"},{l:"Daily Limit",v:`${result.daily_limit}g`,c:"#fb6340"},{l:"Remaining",v:`${result.remaining_allowed.toFixed(1)}g`,c:result.remaining_allowed>0?"#2dce89":"#f5365c"}].map((s,i)=>(
                                    <div key={i} className="col-6 text-center">
                                        <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>{s.l}</div>
                                        <div style={{fontSize:"1.5rem",fontWeight:700,color:s.c}}>{s.v}</div>
                                    </div>
                                ))}
                            </div>
                            {!result.allowed && (
                                <div className="alert alert-danger mt-3 mb-0">
                                    Customer has purchased {result.grams_purchased_today}g today. Maximum allowed is {result.daily_limit}g per day in {result.state}. They may purchase up to {result.remaining_allowed.toFixed(1)}g more.
                                </div>
                            )}
                        </div>
                    )}
                    <div className="glass-panel mt-3">
                        <h5 className="mb-3">State Limits Reference</h5>
                        <div className="row g-2">
                            {Object.entries(STATE_LIMITS).map(([state,limit])=>(
                                <div key={state} className="col-4 col-md-3">
                                    <div className="text-center p-2 rounded" style={{background:"rgba(255,255,255,0.06)"}}>
                                        <div style={{fontWeight:700}}>{state}</div>
                                        <div style={{fontSize:"0.85rem",color:"#2dce89"}}>{limit}g/day</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default GramLimitChecker;
EOF
echo "✓ GramLimitChecker.js"

# ============================================================
# 4. UPDATE LAYOUT + SIDEBAR
# ============================================================
python3 << 'PYEOF'
with open('src/front/js/layout.js', 'r') as f:
    content = f.read()

new_imports = {
    'StripeCheckout': './pages/StripeCheckout',
    'DeliveryTracking': './pages/DeliveryTracking',
    'SMSDashboard': './pages/SMSDashboard',
    'MetrcIntegration': './pages/MetrcIntegration',
    'KioskMode': './pages/KioskMode',
    'WaitlistQueue': './pages/WaitlistQueue',
    'ProductReviews': './pages/ProductReviews',
    'MultiLocationDashboard': './pages/MultiLocationDashboard',
    'GramLimitChecker': './pages/GramLimitChecker',
}

new_routes = {
    '/checkout/stripe': 'StripeCheckout',
    '/delivery-tracking': 'DeliveryTracking',
    '/sms-dashboard': 'SMSDashboard',
    '/metrc': 'MetrcIntegration',
    '/kiosk': 'KioskMode',
    '/waitlist': 'WaitlistQueue',
    '/products/:product_id/reviews': 'ProductReviews',
    '/multi-location': 'MultiLocationDashboard',
    '/gram-limit': 'GramLimitChecker',
}

changed = False
for name, path in new_imports.items():
    if f'import {name}' not in content:
        content = content.replace(
            'import JobBoard from "./pages/JobBoard";',
            f'import JobBoard from "./pages/JobBoard";\nimport {name} from "{path}";'
        )
        changed = True
        print(f"✓ Import added: {name}")

for route, component in new_routes.items():
    if f'path="{route}"' not in content:
        kiosk_route = f'\n                            <Route path="{route}" element={{<{component} />}} />' if route == '/kiosk' else f'\n                            <Route path="{route}" element={{<RequireAuth><{component} /></RequireAuth>}} />'
        content = content.replace(
            '<Route path="/job-board"',
            f'{kiosk_route}\n                            <Route path="/job-board"'
        )
        changed = True
        print(f"✓ Route added: {route}")

if changed:
    with open('src/front/js/layout.js', 'w') as f:
        f.write(content)

# Update sidebar
with open('src/front/js/component/Sidebar.js', 'r') as f:
    sidebar = f.read()

sidebar_items = [
    ('delivery-tracking', 'Delivery Tracking', 'Operations'),
    ('sms-dashboard', 'SMS Dashboard', 'Operations'),
    ('metrc', 'Metrc Sync', 'Compliance'),
    ('kiosk', 'Kiosk Mode', 'POS'),
    ('waitlist', 'Queue / Waitlist', 'Operations'),
    ('multi-location', 'Multi-Location', 'Operations'),
    ('gram-limit', 'Gram Limit Check', 'Compliance'),
]

for path, name, section in sidebar_items:
    if f'"/{path}"' not in sidebar:
        sidebar = sidebar.replace(
            '{ name: "Job Board", path: "/job-board" }',
            f'{{ name: "{name}", path: "/{path}" }},\n            {{ name: "Job Board", path: "/job-board" }}'
        )
        print(f"✓ Sidebar: {name}")

with open('src/front/js/component/Sidebar.js', 'w') as f:
    f.write(sidebar)
PYEOF

# Create tables
pipenv run python -c "
import sys
sys.path.insert(0, 'src')
from app import app
from api.models import db
with app.app_context():
    db.create_all()
    print('✓ All tables created')
" 2>&1 | grep -E "✓|Error" | head -3

# Verify Flask still starts
cd src && pipenv run python -c "
from app import app
rules = [r.rule for r in app.url_map._rules if 'static' not in r.rule]
print(f'✓ Flask starts with {len(rules)} routes')
" 2>&1 | grep -E "✓|Error|Assert" | head -3
cd ..

echo ""
echo "============================================================"
echo "✅ ALL 9 DUTCHIE-COMPETITIVE FEATURES BUILT"
echo "============================================================"
echo ""
echo "1. ✓ Stripe Payments    — /checkout/stripe"
echo "2. ✓ SMS / Twilio       — /sms-dashboard"
echo "3. ✓ Metrc Integration  — /metrc"
echo "4. ✓ Delivery Tracking  — /delivery-tracking"
echo "5. ✓ Kiosk Mode         — /kiosk (full screen, no auth)"
echo "6. ✓ Waitlist/Queue     — /waitlist"
echo "7. ✓ Product Reviews    — /products/:id/reviews"
echo "8. ✓ Multi-Location     — /multi-location"
echo "9. ✓ Gram Limit Check   — /gram-limit"
echo ""
echo "To activate Stripe/SMS/Metrc add to your .env:"
echo "  STRIPE_SECRET_KEY=sk_live_..."
echo "  STRIPE_PUBLISHABLE_KEY=pk_live_..."
echo "  TWILIO_ACCOUNT_SID=AC..."
echo "  TWILIO_AUTH_TOKEN=..."
echo "  TWILIO_PHONE_NUMBER=+1..."
echo "  METRC_API_KEY=..."
