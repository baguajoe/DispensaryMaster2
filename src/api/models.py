from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from enum import Enum
from sqlalchemy import Enum as qenum

from .extensions import db


# db = SQLAlchemy()

# ---------------------
# Non-Medical Models
# ---------------------

# User Model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password = db.Column(db.String(256), nullable=False)
    plan_id = db.Column(db.Integer, db.ForeignKey("plan.id"), nullable=True)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    role = db.Column(db.String(20), nullable=False, default="customer")
    plan = db.relationship("Plan", back_populates="users")

    __table_args__ = (
        db.CheckConstraint(
            role.in_(['admin', 'owner', 'manager', 'employee', 'customer']),
            name='valid_roles'
        ),
    )

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def __repr__(self):
        return f'<User {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "is_active": self.is_active,
            "plan_id": self.plan_id,
            "role": self.role
        }

# Plan Model
class Plan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    features = db.Column(db.JSON, nullable=False)
    users = db.relationship("User", back_populates="plan")

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "price": self.price,
            "features": self.features,
            "users": [user.serialize() for user in self.users]
        }

# Product Model
class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    strain = db.Column(db.String(100), nullable=True)
    thc_content = db.Column(db.Float, nullable=True)
    cbd_content = db.Column(db.Float, nullable=True)
    current_stock = db.Column(db.Integer, nullable=False)
    reorder_point = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Numeric(8, 2), nullable=False)
    supplier = db.Column(db.String(100), nullable=False)
    batch_number = db.Column(db.String(50), nullable=False)
    medical_benefits = db.Column(db.Text, nullable=True)
    test_results = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Add relationship to dispensary
    dispensary_id = db.Column(db.Integer, db.ForeignKey('dispensary.id'), nullable=False)
    dispensary = db.relationship('Dispensary', backref='products')

    def __repr__(self):
        return f'<Product {self.name}>'

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "strain": self.strain,
            "thc_content": self.thc_content,
            "cbd_content": self.cbd_content,
            "current_stock": self.current_stock,
            "reorder_point": self.reorder_point,
            "unit_price": float(self.unit_price),
            "supplier": self.supplier,
            "batch_number": self.batch_number,
            "test_results": self.test_results,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "dispensary": self.dispensary.serialize() if self.dispensary else None
        }

class Dispensary(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    contact_info = db.Column(db.JSON, nullable=False)

    def __repr__(self):
        return f'<Dispensary {self.name}>'

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "location": self.location,
            "contact_info": self.contact_info
        }
    






class Pricing(db.Model):
    __tablename__ = 'pricing'
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    dispensary_id = db.Column(db.Integer, db.ForeignKey('dispensary.id'), nullable=False)
    price = db.Column(db.Numeric(8, 2), nullable=False)
    promotional_price = db.Column(db.Numeric(8, 2), nullable=True)
    availability = db.Column(db.Boolean, default=True)
    stock_quantity = db.Column(db.Integer, default=0)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    product = db.relationship('Product', backref='pricings')
    dispensary = db.relationship('Dispensary', backref='pricings')

    def __repr__(self):
        return f'<Pricing Product: {self.product.name if self.product else "Unknown"}, Dispensary: {self.dispensary.name if self.dispensary else "Unknown"}>'

    def serialize(self):
        return {
            "id": self.id,
            "product": self.product.serialize() if self.product else None,
            "dispensary": self.dispensary.serialize() if self.dispensary else None,
            "price": float(self.price),
            "promotional_price": float(self.promotional_price) if self.promotional_price else None,
            "availability": self.availability,
            "stock_quantity": self.stock_quantity,
            "updated_at": self.updated_at.isoformat()
        }


# OrderItem Model
class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Numeric(8, 2), nullable=False)

    order = db.relationship('Order', backref='order_items', lazy=True)
    product = db.relationship('Product', backref='order_items', lazy=True)

    def __repr__(self):
        return f'<OrderItem Order: {self.order_id}, Product: {self.product_id}>'

    def serialize(self):
        return {
            "id": self.id,
            "order_id": self.order_id,
            "product_id": self.product_id,
            "quantity": self.quantity,
            "unit_price": float(self.unit_price),
        }

# Order Model
class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='pending')
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())

    customer = db.relationship('Customer', backref='orders', lazy=True)

    def __repr__(self):
        return f'<Order {self.id} - {self.status}>'

    def serialize(self):
        return {
            "id": self.id,
            "customer_id": self.customer_id,
            "total_amount": float(self.total_amount),
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

# Customer Model
class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.column(db.Integer, db.ForeignKey("user.id"))    
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(20), nullable=False)
    membership_level = db.Column(db.String(20), nullable=False, default='standard')
    verification_status = db.Column(db.String(20), nullable=False, default='pending')
    preferences = db.Column(db.JSON, nullable=True)
    loyalty_points = db.Column(db.Integer, nullable=False, default=0)
    date_of_birth = db.Column(db.Date, nullable=True)  # New field
    preferred_products = db.Column(db.JSON, nullable=True)  # New field
    last_purchase_date = db.Column(db.DateTime, nullable=True)  # New field
    lifecycle_stage = db.Column(db.String(20), nullable=False, default='lead')  # New field

    def serialize(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "phone": self.phone,
            "membership_level": self.membership_level,
            "verification_status": self.verification_status,
            "preferences": self.preferences,
            "loyalty_points": self.loyalty_points,
            "date_of_birth": self.date_of_birth.isoformat() if self.date_of_birth else None,
            "preferred_products": self.preferred_products,
            "last_purchase_date": self.last_purchase_date.isoformat() if self.last_purchase_date else None,
            "lifecycle_stage": self.lifecycle_stage,
        }


class CustomerInteraction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    interaction_type = db.Column(db.String(50))  # Example: "purchase", "support", "feedback"
    notes = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    customer = db.relationship('Customer', backref='interactions')

class LoyaltyProgram(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    points = db.Column(db.Integer, nullable=False, default=0)
    rewards = db.Column(db.JSON, nullable=True)  # e.g., discounts, free items
    customer = db.relationship('Customer', backref='loyalty_program')

    def __repr__(self):
        return f'<LoyaltyProgram {self.customer_id} - {self.points} points>'
    
    def serialize(self):
        return {
            "id": self.id,
            "customer_id": self.customer_id,
            "points": self.points,
            "rewards": self.rewards,
        }
class Reward(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    point_cost = db.Column(db.Integer, nullable=False)
    description = db.Column(db.String(255), nullable=True)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "point_cost": self.point_cost,
            "description": self.description
        }

class Badge(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    image_url = db.Column(db.String(255), nullable=True)

    def serialize(self):
        return {"id": self.id, "name": self.name, "description": self.description, "image_url": self.image_url}
    
class LoyaltyTier(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    required_points = db.Column(db.Integer, nullable=False)
    benefits = db.Column(db.JSON, nullable=True)
    
    def serialize(self):
        return {"id": self.id, "name": self.name, "required_points": self.required_points, "benefits": self.benefits}





# Business Model
class Business(db.Model):
    __tablename__ = 'business'
    __table_args__ = {'extend_existing': True}  # Allows redefinition

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(50), nullable=False)
    zip_code = db.Column(db.String(20), nullable=False)
    phone = db.Column(db.String(15), nullable=False)
    email = db.Column(db.String(100), nullable=True)
    license_number = db.Column(db.String(100), nullable=False, unique=True)
    license_expiry = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default="active")  # active, inactive, suspended
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "address": self.address,
            "city": self.city,
            "state": self.state,
            "zip_code": self.zip_code,
            "phone": self.phone,
            "email": self.email,
            "license_number": self.license_number,
            "license_expiry": self.license_expiry.isoformat() if self.license_expiry else None,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

# Compliance Model
class Compliance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    business_id = db.Column(db.Integer, db.ForeignKey('business.id'), nullable=False)
    licenses = db.Column(db.JSON, nullable=False, default={})
    test_results = db.Column(db.JSON, nullable=False, default={})
    reports = db.Column(db.JSON, nullable=False, default={})
    audits = db.Column(db.JSON, nullable=False, default={})

    business = db.relationship('Business', backref='compliance', lazy=True)

    def __repr__(self):
        return f'<Compliance for Business {self.business.name}>'

    def serialize(self):
        return {
            "id": self.id,
            "business_id": self.business_id,
            "licenses": self.licenses,
            "test_results": self.test_results,
            "reports": self.reports,
            "audits": self.audits,
        }

# Transaction Model
class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.String(100), unique=True, nullable=False)
    customer_name = db.Column(db.String(100), nullable=False)
    payment_method = db.Column(db.String(50))
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)

# Education Model
class Education(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "category": self.category,
        }

# Store Model
class Store(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    name = db.Column(db.String(200), nullable=False)
    location = db.Column(db.String, nullable=False)
    store_manager = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String, nullable=False)
    status = db.Column(db.String(50), nullable=False)
    employee_count = db.Column(db.Integer, nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "location": self.location,
            "store_manager": self.store_manager,
            "phone": self.phone,
            "status": self.status,
            "employee_count": self.employee_count,
        }

# Lead Status Enum
class LeadStatus(Enum):
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    CLOSED = "closed"

# Lead Model
class Lead(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    status = db.Column(db.Enum(LeadStatus), default=LeadStatus.NEW)
    notes = db.Column(db.Text, nullable=True)
    score = db.Column(db.Integer, nullable=False, default=0)
    source = db.Column(db.String(50), nullable=True)
    assigned_to = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    user = db.relationship('User', backref='leads', lazy=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())

    def serialize(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "phone": self.phone,
            "status": self.status.value if self.status else None,
            "notes": self.notes,
            "score": self.score,
            "source": self.source,
            "assigned_to": self.assigned_to,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

# Campaign Model
class Campaign(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(20), default="draft")
    metrics = db.Column(db.JSON, nullable=True)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "status": self.status,
            "metrics": self.metrics,
        }

# Task Model
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    assigned_to = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    due_date = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(20), default="pending")
    user = db.relationship('User', backref='tasks')

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "assigned_to": self.assigned_to,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "status": self.status,
        }
    
# deals

class Deal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    stage = db.Column(db.String(50), nullable=False, default="new")  # Example stages: "new", "negotiation", "closed"
    value = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    assigned_to = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)

    # Relationships
    customer = db.relationship('Customer', backref='deals')
    assigned_user = db.relationship('User', backref='assigned_deals')

    def __repr__(self):
        return f'<Deal {self.name} - Stage: {self.stage}>'

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "stage": self.stage,
            "value": float(self.value),
            "customer_id": self.customer_id,
            "assigned_to": self.assigned_to,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
    
class PromotionalDeal(db.Model):  # Previously "Deal"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    discount = db.Column(db.Float, nullable=False)
    tier = db.Column(db.String(20), default='All')  # Bronze, Silver, Gold

    def __repr__(self):
        return f'<PromotionalDeal {self.title} - Discount: {self.discount}>'

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "discount": self.discount,
            "tier": self.tier,
        }


class InventoryLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    transaction_type = db.Column(db.String(20), nullable=False)  # 'restock', 'sale', 'adjustment'
    quantity = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    reason = db.Column(db.String(200), nullable=True)

    product = db.relationship('Product', backref='inventory_logs')



# ---------------------
# Medical Models
# ---------------------

# Patient Model
class Patient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    medical_card_number = db.Column(db.String(50), unique=True, nullable=False)
    expiration_date = db.Column(db.Date, nullable=False)
    physician_name = db.Column(db.String(100), nullable=False)
    conditions = db.Column(db.Text, nullable=True)

    def serialize(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "phone": self.phone,
            "medical_card_number": self.medical_card_number,
            "expiration_date": self.expiration_date.isoformat(),
            "physician_name": self.physician_name,
            "conditions": self.conditions,
        }

# Prescription Model
class Prescription(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    dosage = db.Column(db.String(50), nullable=False)
    frequency = db.Column(db.String(50), nullable=False)
    prescribed_date = db.Column(db.Date, default=datetime.utcnow)

    patient = db.relationship('Patient', backref='prescriptions')
    product = db.relationship('Product', backref='prescriptions')

    def serialize(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "product_id": self.product_id,
            "dosage": self.dosage,
            "frequency": self.frequency,
            "prescribed_date": self.prescribed_date.isoformat(),
        }

# Symptom Model
class Symptom(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    severity = db.Column(db.String(20), nullable=False)
    description = db.Column(db.Text, nullable=True)
    recorded_at = db.Column(db.DateTime, default=datetime.utcnow)

    patient = db.relationship('Patient', backref='symptoms')

    def serialize(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "name": self.name,
            "severity": self.severity,
            "description": self.description,
            "recorded_at": self.recorded_at.isoformat() if self.recorded_at else None,
        }

# Medical Resource Model
class MedicalResource(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), nullable=False)
    link = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "type": self.type,
            "link": self.link,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# Recommendation Model
class Recommendation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)

    # Relationships
    patient = db.relationship('Patient', backref='recommendations')
    product = db.relationship('Product', backref='recommendations')

    def __repr__(self):
        return f'<Recommendation {self.id} for Patient {self.patient_id}>'

    def serialize(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "product_id": self.product_id,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "patient": self.patient.serialize() if self.patient else None,
            "product": self.product.serialize() if self.product else None
        }


class CashDrawer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    total_cash = db.Column(db.Float, nullable=False, default=0.0)
    start_balance = db.Column(db.Float, nullable=False, default=0.0)
    end_balance = db.Column(db.Float, nullable=True)
    logs = db.relationship('CashLog', backref='drawer')

class CashLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    drawer_id = db.Column(db.Integer, db.ForeignKey('cash_drawer.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # "deposit", "withdrawal"
    amount = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class Invoice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    issue_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    due_date = db.Column(db.DateTime, nullable=True)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.String(20), default="unpaid")  # unpaid, paid, overdue
    payment_method = db.Column(db.String(50), nullable=True)  # e.g., cash, card, digital wallet
    notes = db.Column(db.Text, nullable=True)  # Optional notes for the invoice

    # Relationships
    customer = db.relationship('Customer', backref='invoices')
    order = db.relationship('Order', backref='invoice')

    def __repr__(self):
        return f'<Invoice {self.id} - {self.status}>'

    def serialize(self):
        return {
            "id": self.id,
            "customer_id": self.customer_id,
            "order_id": self.order_id,
            "issue_date": self.issue_date.isoformat() if self.issue_date else None,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "total_amount": float(self.total_amount),
            "status": self.status,
            "payment_method": self.payment_method,
            "notes": self.notes,
        }

# class Business(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     name = db.Column(db.String(100), nullable=False)
#     address = db.Column(db.String(200), nullable=False)
#     city = db.Column(db.String(100), nullable=False)
#     state = db.Column(db.String(50), nullable=False)
#     zip_code = db.Column(db.String(20), nullable=False)
#     phone = db.Column(db.String(15), nullable=False)
#     email = db.Column(db.String(100), nullable=True)
#     license_number = db.Column(db.String(100), nullable=False, unique=True)
#     license_expiry = db.Column(db.Date, nullable=False)
#     status = db.Column(db.String(20), default="active")  # active, inactive, suspended
#     created_at = db.Column(db.DateTime, server_default=db.func.now())
#     updated_at = db.Column(db.DateTime, onupdate=db.func.now())

#     # Relationships
#     compliance = db.relationship("Compliance", backref="business", lazy=True)

#     def __repr__(self):
#         return f"<Business {self.name}>"

#     def serialize(self):
#         return {
#             "id": self.id,
#             "name": self.name,
#             "address": self.address,
#             "city": self.city,
#             "state": self.state,
#             "zip_code": self.zip_code,
#             "phone": self.phone,
#             "email": self.email,
#             "license_number": self.license_number,
#             "license_expiry": self.license_expiry.isoformat() if self.license_expiry else None,
#             "status": self.status,
#             "created_at": self.created_at.isoformat() if self.created_at else None,
#             "updated_at": self.updated_at.isoformat() if self.updated_at else None,
#         }

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    dispensary_id = db.Column(db.Integer, db.ForeignKey('dispensary.id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1 to 5
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    product = db.relationship('Product', backref='reviews')
    dispensary = db.relationship('Dispensary', backref='reviews')
    customer = db.relationship('Customer', backref='reviews')

    def serialize(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "dispensary_id": self.dispensary_id,
            "customer_id": self.customer_id,
            "rating": self.rating,
            "comment": self.comment,
            "created_at": self.created_at.isoformat()
        }
    
    # grow farms

class GrowFarm(db.Model):
    __tablename__ = 'grow_farms'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(200))
    contact_info = db.Column(db.JSON)  # JSONB equivalent in SQLAlchemy
    status = db.Column(db.String(20), default='active', nullable=False)

    # crops = db.relationship('Crop', backref='grow_farm', lazy=True)

class PlantBatch(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    strain = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=True)
    status = db.Column(db.String(50), nullable=False, default="Growing")
    yield_amount = db.Column(db.Float, nullable=True)  # Actual or predicted yield in grams
    environment_id = db.Column(db.Integer, db.ForeignKey('environment_data.id'), nullable=True)

    def serialize(self):
        return {
            "id": self.id,
            "strain": self.strain,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "status": self.status,
            "yield_amount": self.yield_amount
        }

class EnvironmentData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    temperature = db.Column(db.Float, nullable=False)
    humidity = db.Column(db.Float, nullable=False)
    light_intensity = db.Column(db.Float, nullable=True)
    timestamp = db.Column(db.DateTime, default=db.func.now())

    plant_batch = db.relationship('PlantBatch', backref='environment_data')

    def serialize(self):
        return {
            "id": self.id,
            "plant_batch_id": self.plant_batch_id,
            "temperature": self.temperature,
            "humidity": self.humidity,
            "light_intensity": self.light_intensity,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }


class GrowTask(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task_name = db.Column(db.String(100), nullable=False)
    task_description = db.Column(db.Text, nullable=True)
    assigned_to = db.Column(db.String(100), nullable=True)
    priority = db.Column(db.String(20), nullable=False, default="Medium")
    due_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), nullable=False, default="Pending")
    plant_batch_id = db.Column(db.Integer, db.ForeignKey('plant_batch.id'), nullable=True)

    plant_batch = db.relationship('PlantBatch', backref='grow_tasks')

    def serialize(self):
        return {
            "id": self.id,
            "task_name": self.task_name,
            "task_description": self.task_description,
            "assigned_to": self.assigned_to,
            "priority": self.priority,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "status": self.status,
            "plant_batch_id": self.plant_batch_id
        }

class YieldPrediction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    plant_batch_id = db.Column(db.Integer, db.ForeignKey('plant_batch.id'), nullable=False)
    predicted_yield = db.Column(db.Float, nullable=False)
    actual_yield = db.Column(db.Float, nullable=True)
    accuracy = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.now())

    plant_batch = db.relationship('PlantBatch', backref='yield_predictions')

    def serialize(self):
        return {
            "id": self.id,
            "plant_batch_id": self.plant_batch_id,
            "predicted_yield": self.predicted_yield,
            "actual_yield": self.actual_yield,
            "accuracy": self.accuracy,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


# seedbank

class Seedbank(db.Model):
    __tablename__ = 'seedbanks'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(200))
    contact_info = db.Column(db.JSON)  # JSONB equivalent in SQLAlchemy
    status = db.Column(db.String(20), default='active', nullable=False)

    # seeds = db.relationship('Seed', backref='seedbank', lazy=True)

class SeedBatch(db.Model):
    __tablename__ = 'seed_batches'

    id = db.Column(db.Integer, primary_key=True)
    strain = db.Column(db.String(100), nullable=False)
    batch_number = db.Column(db.String(50), unique=True, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    storage_location = db.Column(db.String(200), nullable=True)
    expiration_date = db.Column(db.Date, nullable=True)
    status = db.Column(db.String(20), default='active')

    def serialize(self):
        return {
            "id": self.id,
            "strain": self.strain,
            "batch_number": self.batch_number,
            "quantity": self.quantity,
            "storage_location": self.storage_location,
            "expiration_date": self.expiration_date.isoformat() if self.expiration_date else None,
            "status": self.status
        }

class StorageConditions(db.Model):
    __tablename__ = 'storage_conditions'

    id = db.Column(db.Integer, primary_key=True)
    location = db.Column(db.String(100), nullable=False)
    temperature = db.Column(db.Float, nullable=False)
    humidity = db.Column(db.Float, nullable=False)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)

    def serialize(self):
        return {
            "id": self.id,
            "location": self.location,
            "temperature": self.temperature,
            "humidity": self.humidity,
            "last_updated": self.last_updated.isoformat() if self.last_updated else None
        }

class SeedReport(db.Model):
    __tablename__ = 'seed_reports'

    id = db.Column(db.Integer, primary_key=True)
    report_type = db.Column(db.String(50), nullable=False)
    parameters = db.Column(db.JSON, nullable=True)
    report_data = db.Column(db.JSON, nullable=False)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)

    def serialize(self):
        return {
            "id": self.id,
            "report_type": self.report_type,
            "parameters": self.parameters,
            "report_data": self.report_data,
            "generated_at": self.generated_at.isoformat() if self.generated_at else None
        }

# new pages

class Settings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    theme = db.Column(db.String(50))
    notifications_enabled = db.Column(db.Boolean, default=True)

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "theme": self.theme,
            "notifications_enabled": self.notifications_enabled
        }

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    receiver_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    content = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def serialize(self):
        return {
            "id": self.id,
            "sender_id": self.sender_id,
            "receiver_id": self.receiver_id,
            "content": self.content,
            "timestamp": self.timestamp.isoformat()
        }

class CustomerAnalytics(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    total_spent = db.Column(db.Float, nullable=False, default=0.0)
    purchase_frequency = db.Column(db.Float, nullable=False, default=0.0)
    last_purchase_date = db.Column(db.DateTime, nullable=True)
    churn_probability = db.Column(db.Float, nullable=True)

    customer = db.relationship('Customer', backref='analytics')

    def serialize(self):
        return {
            "id": self.id,
            "customer_id": self.customer_id,
            "total_spent": self.total_spent,
            "purchase_frequency": self.purchase_frequency,
            "last_purchase_date": self.last_purchase_date.isoformat() if self.last_purchase_date else None,
            "churn_probability": self.churn_probability,
        }

# delivery

class Delivery(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    status = db.Column(db.String(50), default='Pending')  # Pending, Dispatched, Delivered
    estimated_time = db.Column(db.DateTime, nullable=True)
    order = db.relationship('Order', backref='delivery')

