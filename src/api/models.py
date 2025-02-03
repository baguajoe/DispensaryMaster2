from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from enum import Enum
from sqlalchemy import Enum as qenum
from sqlalchemy.ext.hybrid import hybrid_property


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

class Supplier(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    contact_info = db.Column(db.JSON, nullable=True)  # Store phone, email, address
    company_name = db.Column(db.String(200), nullable=True)
    website = db.Column(db.String(200), nullable=True)
    tax_id = db.Column(db.String(50), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    rating = db.Column(db.Float, nullable=True)
    product_categories = db.Column(db.JSON, nullable=True)  # List of categories
    country = db.Column(db.String(100), nullable=True)
    region = db.Column(db.String(100), nullable=True)
    payment_terms = db.Column(db.String(50), nullable=True)
    bank_details = db.Column(db.JSON, nullable=True)  # {account_number, bank_name, swift_code}
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "contact_info": self.contact_info,
            "company_name": self.company_name,
            "website": self.website,
            "tax_id": self.tax_id,
            "is_active": self.is_active,
            "rating": self.rating,
            "product_categories": self.product_categories,
            "country": self.country,
            "region": self.region,
            "payment_terms": self.payment_terms,
            "bank_details": self.bank_details,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

# Product Model
class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    sku = db.Column(db.String(50), unique=True, nullable=False)  # Unique SKU for inventory management
    category = db.Column(db.String(50), nullable=False)
    strain = db.Column(db.String(100), nullable=True)  # Specific to cannabis industry
    thc_content = db.Column(db.Float, nullable=True)  # Specific to cannabis industry
    cbd_content = db.Column(db.Float, nullable=True)  # Specific to cannabis industry
    stock = db.Column(db.Integer, nullable=False)  # Current stock
    sales = db.Column(db.Integer, nullable=True)  # Current sales
    reorder_point = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Numeric(8, 2), nullable=False)  # Unified naming
    supplier_id = db.Column(db.Integer, db.ForeignKey('supplier.id'), nullable=True)  # Rich supplier data
    dispensary_id = db.Column(db.Integer, db.ForeignKey('dispensary.id'), nullable=True)  # Track dispensary
    batch_number = db.Column(db.String(50), nullable=True)  # Optional for tracking
    medical_benefits = db.Column(db.Text, nullable=True)  # Specific to cannabis industry
    test_results = db.Column(db.Text, nullable=True)  # Specific to cannabis industry
    is_available_online=db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    supplier = db.relationship('Supplier', backref=(db.backref('products', lazy=True)))
    dispensary = db.relationship('Dispensary', backref=(db.backref('products', lazy=True)))

    def __repr__(self):
        return f'<Product {self.name}>'

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "sku": self.sku,
            "category": self.category,
            "strain": self.strain,
            "thc_content": self.thc_content,
            "cbd_content": self.cbd_content,
            "stock": self.stock,
            "reorder_point": self.reorder_point,
            "price": float(self.price),
            "supplier": self.supplier.serialize() if self.supplier else None,
            "dispensary": self.dispensary.serialize() if self.dispensary else None,
            "batch_number": self.batch_number,
            "medical_benefits": self.medical_benefits,
            "test_results": self.test_results,
            "created_at": self.created_at.isoformat() if self.created_at else None,
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

    order = db.relationship('Order', backref='order_items')
    product = db.relationship('Product', backref='order_items')

    @hybrid_property
    def subtotal(self):
        """Calculate subtotal as quantity * unit_price."""
        return self.quantity * self.unit_price

    @subtotal.expression
    def subtotal(cls):
        """SQL expression for subtotal."""
        return cls.quantity * cls.unit_price

    def serialize(self):
        """Serialize the model for JSON responses."""
        return {
            "id": self.id,
            "order_id": self.order_id,
            "product_id": self.product_id,
            "quantity": self.quantity,
            "unit_price": float(self.unit_price),
            "subtotal": float(self.subtotal),
        }

# Order Model
class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employee.id'), nullable=True)  # To track the cashier or clerk
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    refund_amount = db.Column(db.Numeric(10, 2), default=0.0)  # To track refunds
    status = db.Column(db.String(20), default='pending')  # pending, completed, refunded
    payment_status = db.Column(db.String(20), default='unpaid')  # unpaid, partially_paid, paid
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())

    customer = db.relationship('Customer', backref='orders')
    employee = db.relationship('Employee', backref='orders')  # Relationship with employee

    def calculate_remaining_amount(self):
        return float(self.total_amount) - float(self.refund_amount)

    def serialize(self):
        return {
            "id": self.id,
            "customer_id": self.customer_id,
            "employee_id": self.employee_id,
            "total_amount": float(self.total_amount),
            "refund_amount": float(self.refund_amount),
            "status": self.status,
            "payment_status": self.payment_status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

class OrderDetail(db.Model):
    __tablename__ = 'order_detail'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price_per_unit = db.Column(db.Float, nullable=False)

    # Relationships
    order = db.relationship('Order', backref='order_details', lazy=True)
    product = db.relationship('Product', backref='order_details', lazy=True)

    def serialize(self):
        return {
            "id": self.id,
            "order_id": self.order_id,
            "product_id": self.product_id,
            "quantity": self.quantity,
            "price_per_unit": self.price_per_unit
        }

# Customer Model
class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))  # Correct casing
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(20), nullable=False)
    membership_level = db.Column(db.String(20), nullable=False, default='standard')
    verification_status = db.Column(db.String(20), nullable=False, default='pending')
    preferences = db.Column(db.JSON, nullable=True)
    loyalty_points = db.Column(db.Integer, nullable=False, default=0)
    date_of_birth = db.Column(db.Date, nullable=True)
    preferred_products = db.Column(db.JSON, nullable=True)
    last_purchase_date = db.Column(db.DateTime, nullable=True)
    lifecycle_stage = db.Column(db.String(20), nullable=False, default='lead')

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
    __tablename__ = 'customer_interaction'

    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    interaction_type = db.Column(db.String(100), nullable=False)  # E.g., Chat, Visit, Purchase
    interaction_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    notes = db.Column(db.Text, nullable=True)

    # Relationship to Customer
    customer = db.relationship('Customer', backref='interactions', lazy=True)

    def serialize(self):
        return {
            "id": self.id,
            "customer_id": self.customer_id,
            "interaction_type": self.interaction_type,
            "interaction_date": self.interaction_date.isoformat(),
            "notes": self.notes,
        }
class ShiftSchedule(db.Model):
    __tablename__ = 'shift_schedule'

    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employee.id'), nullable=False)
    shift_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    shift_type = db.Column(db.String(50), nullable=True)  # E.g., Morning, Evening, Night
    status = db.Column(db.String(50), default="Scheduled")  # E.g., Scheduled, Completed, Canceled

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship to Employee
    employee = db.relationship('Employee', backref='shift_schedules', lazy=True)

    def serialize(self):
        return {
            "id": self.id,
            "employee_id": self.employee_id,
            "shift_date": self.shift_date.isoformat(),
            "start_time": self.start_time.strftime("%H:%M:%S"),
            "end_time": self.end_time.strftime("%H:%M:%S"),
            "shift_type": self.shift_type,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
        
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
    
class ComplianceAudit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    status = db.Column(db.String(50))  # Pending, Completed, Passed
    
class Report(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50), nullable=False)  # e.g., 'sales', 'inventory', 'compliance', etc.
    filters = db.Column(db.JSON, nullable=True, default={})  # Store report filters as JSON
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    generated_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # Optional: Reference the user who generated the report
    file_path = db.Column(db.String(255), nullable=True)  # Path to the exported file (PDF, CSV, etc.)
    
    # Relationships
    user = db.relationship('User', backref='reports', lazy=True)

    def __repr__(self):
        return f"<Report {self.type} generated on {self.created_at}>"

    def serialize(self):
        return {
            "id": self.id,
            "type": self.type,
            "filters": self.filters,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "generated_by": self.generated_by,
            "file_path": self.file_path,
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

class Resource(db.Model):
    __tablename__ = 'resource'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    resource_type = db.Column(db.String(100), nullable=False)  # E.g., "Document", "Video", "Guide"
    category = db.Column(db.String(100), nullable=False)  # E.g., "Patient Education", "Staff Training"
    url = db.Column(db.String(500), nullable=True)  # Link to an external resource or file path
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "resource_type": self.resource_type,
            "category": self.category,
            "url": self.url,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
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


class Location(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20), nullable=False)

    # Relationships
    inventories = db.relationship('Inventory', backref=db.backref('location_ref', lazy=True))

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "address": self.address,
            "phone": self.phone
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
    

class Warehouse(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(255), nullable=False)
    capacity = db.Column(db.Integer, nullable=True)  # Optional field to track storage capacity
    contact_info = db.Column(db.JSON, nullable=True)  # Example: {"phone": "123-456-7890", "email": "info@warehouse.com"}

    def __repr__(self):
        return f'<Warehouse {self.name}>'

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "address": self.address,
            "capacity": self.capacity,
            "contact_info": self.contact_info,
        }


class InventoryLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    transaction_type = db.Column(db.String(20), nullable=False)  # 'restock', 'sale', 'adjustment'
    quantity = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    reason = db.Column(db.String(200), nullable=True)

    product = db.relationship('Product', backref='inventory_logs')

class Inventory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    location_id = db.Column(db.Integer, db.ForeignKey('location.id'), nullable=False)
    warehouse_id = db.Column(db.Integer, db.ForeignKey('warehouse.id'), nullable=False)
    stock_quantity = db.Column(db.Integer, nullable=False)
    reorder_point = db.Column(db.Integer, nullable=False)

    # Relationships
    product = db.relationship('Product', backref=db.backref('inventory_items', lazy=True))   
    location = db.relationship('Location', backref=db.backref('inventory_items', lazy=True))   
    warehouse = db.relationship('Warehouse', backref=db.backref('inventory_items', lazy=True))

    @property
    def is_low_stock(self):
        return self.stock_quantity < self.reorder_point

    def __repr__(self):
        return f'<Inventory Product: {self.product_id}, Location: {self.location_id}, Warehouse: {self.warehouse_id}>'

    def serialize(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "location_id": self.location_id,
            "warehouse_id": self.warehouse_id,
            "stock_quantity": self.stock_quantity,
            "reorder_point": self.reorder_point,
            "is_low_stock": self.is_low_stock,
            "product": self.product.serialize() if self.product else None,
            "location": self.location.serialize() if self.location else None,
            "warehouse": self.warehouse.serialize() if self.warehouse else None,
        }




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
    insurances = db.relationship('Insurance', backref='patient', lazy=True)
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
            "insurances": self.insurances,
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
    __tablename__ = 'invoice'
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    invoice_type = db.Column(db.String(50), nullable=True)  # e.g., proforma, final
    invoice_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)  # renamed from issue_date
    due_date = db.Column(db.DateTime, nullable=True)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    sent_status = db.Column(db.Boolean, default=False, nullable=False)
    payment_status = db.Column(db.String(20), default="unpaid")  # unpaid, paid, overdue
    payments_made = db.Column(db.Numeric(10, 2), default=0.00, nullable=False)
    payment_method = db.Column(db.String(50), nullable=True)
    notes = db.Column(db.Text, nullable=True)

    # Relationships
    customer = db.relationship('Customer', backref='invoices')

    def __repr__(self):
        return f'<Invoice {self.id} - {self.payment_status}>'

    def serialize(self):
        return {
            "id": self.id,
            "customer_id": self.customer_id,
            "customer_name": self.customer.name if self.customer else None,
            "order_id": self.order_id,
            "invoice_type": self.invoice_type,
            "invoice_date": self.invoice_date.isoformat() if self.invoice_date else None,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "total_amount": float(self.total_amount),
            "amount_due": float(self.total_amount - self.payments_made),
            "sent_status": self.sent_status,
            "payment_status": self.payment_status,
            "payment_method": self.payment_method,
            "notes": self.notes,
        }

    
class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    physician_id = db.Column(db.Integer, nullable=False)  # Add a reference to a physician, or use User
    appointment_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(50), default="Scheduled")  # Scheduled, Completed, Canceled
    notes = db.Column(db.Text, nullable=True)

    patient = db.relationship('Patient', backref='appointments')

    def serialize(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "physician_id": self.physician_id,
            "appointment_date": self.appointment_date.isoformat(),
            "status": self.status,
            "notes": self.notes,
        }

class Insurance(db.Model):
    __tablename__ = 'insurances'
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    provider_name = db.Column(db.String(100), nullable=False)
    policy_number = db.Column(db.String(50), nullable=False, unique=True)
    coverage_details = db.Column(db.JSON, nullable=True)
    copay = db.Column(db.Float, nullable=True)
    coverage_limit = db.Column(db.Float, nullable=True)

    def serialize(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "provider_name": self.provider_name,
            "policy_number": self.policy_number,
            "coverage_details": self.coverage_details,
            "copay": self.copay,
            "coverage_limit": self.coverage_limit
        }

class Claim(db.Model):
    __tablename__ = 'claims'
    id = db.Column(db.Integer, primary_key=True)
    insurance_id = db.Column(db.Integer, db.ForeignKey('insurances.id'), nullable=False)
    claim_date = db.Column(db.DateTime, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default='Pending')
    description = db.Column(db.String(255))

    def serialize(self):
        return {
            "id": self.id,
            "insurance_id": self.insurance_id,
            "claim_date": self.claim_date.isoformat(),
            "amount": self.amount,
            "status": self.status,
            "description": self.description
        }

    
class Physician(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    specialty = db.Column(db.String(100), nullable=True)

    


class PatientEducationResource(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    resource_type = db.Column(db.String(50), nullable=False)  # e.g., article, video, guide
    link = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "resource_type": self.resource_type,
            "link": self.link,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class StaffTrainingResource(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    resource_type = db.Column(db.String(50), nullable=False)  # e.g., article, video, module
    link = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "resource_type": self.resource_type,
            "link": self.link,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }



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

# Employee Time Log

class Employee(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(50), nullable=False)  # cashier, manager, etc.
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

class Shift(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    clock_in_time = db.Column(db.DateTime, nullable=True)
    clock_out_time = db.Column(db.DateTime, nullable=True)
    total_hours = db.Column(db.Float, nullable=True, default=0.0)  # Hours worked in this shift
    shift_status = db.Column(db.String(20), default="clocked_out")  # clocked_in, clocked_out

    # Relationships
    employee = db.relationship('User', backref='shifts')

    def calculate_hours(self):
        if self.clock_in_time and self.clock_out_time:
            delta = self.clock_out_time - self.clock_in_time
            self.total_hours = delta.total_seconds() / 3600  # Convert seconds to hours

    def serialize(self):
        return {
            "id": self.id,
            "employee_id": self.employee_id,
            "clock_in_time": self.clock_in_time.isoformat() if self.clock_in_time else None,
            "clock_out_time": self.clock_out_time.isoformat() if self.clock_out_time else None,
            "total_hours": self.total_hours,
            "shift_status": self.shift_status,
        }
    


    

class TimeLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employee.id'), nullable=False)
    shift_id = db.Column(db.Integer, db.ForeignKey('shift.id'), nullable=True)
    clock_in_time = db.Column(db.DateTime, nullable=True)
    clock_out_time = db.Column(db.DateTime, nullable=True)
    total_hours = db.Column(db.Float, nullable=True, default=0.0)  # Hours worked in this session
    status = db.Column(db.String(20), default="clocked_out")  # clocked_in, clocked_out

    employee = db.relationship('Employee', backref='time_logs')
    shift = db.relationship('Shift', backref='time_logs')

    def calculate_hours(self):
        if self.clock_in_time and self.clock_out_time:
            delta = self.clock_out_time - self.clock_in_time
            self.total_hours = delta.total_seconds() / 3600  # Convert seconds to hours

class Payroll(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employee.id'), nullable=False)
    pay_period_start = db.Column(db.Date, nullable=False)
    pay_period_end = db.Column(db.Date, nullable=False)
    total_hours = db.Column(db.Float, nullable=False, default=0.0)
    hourly_rate = db.Column(db.Float, nullable=False)
    total_pay = db.Column(db.Float, nullable=False, default=0.0)

    employee = db.relationship('Employee', backref='payrolls')

    def calculate_pay(self):
        self.total_pay = self.total_hours * self.hourly_rate

class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    action = db.Column(db.String(50), nullable=False)  # e.g., "viewed", "purchased"
    timestamp = db.Column(db.DateTime, default=db.func.now())

class SalesHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sale_id = db.Column(db.Integer, db.ForeignKey('sale.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity_sold = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)  # Price per unit of product
    date_sold = db.Column(db.DateTime, nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "sale_id": self.sale_id,
            "product_id": self.product_id,
            "quantity_sold": self.quantity_sold,
            "unit_price": self.unit_price,
            "subtotal": self.quantity_sold * self.unit_price,
            "date_sold": self.date_sold.isoformat()
        }

    
class Sale(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sale_date = db.Column(db.DateTime, nullable=False)
    total_amount = db.Column(db.Float, nullable=False)  # Total for the entire transaction
    sales_history = db.relationship('SalesHistory', backref='sale', lazy=True)

    def serialize(self):
        return {
            "id": self.id,
            "sale_date": self.sale_date.isoformat(),
            "total_amount": self.total_amount,
            "products": [history.serialize() for history in self.sales_history]
        }

    
class PromotionalDeal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)  # Name of the promotion
    code = db.Column(db.String(50), unique=True, nullable=True)  # Optional promotion code
    discount_percentage = db.Column(db.Float, nullable=False, default=0.0)  # Discount percentage
    tax_rate = db.Column(db.Float, nullable=True, default=0.0)  # Tax percentage
    tier = db.Column(db.String(20), default='All')  # Bronze, Silver, Gold, or All
    start_date = db.Column(db.Date, nullable=True)  # Start date for the promotion
    end_date = db.Column(db.Date, nullable=True)  # End date for the promotion

    def calculate_discount(self, original_price):
        """Calculate the price after discount."""
        return original_price * (1 - (self.discount_percentage / 100))

    def calculate_tax(self, discounted_price):
        """Calculate the price after applying tax."""
        return discounted_price * (1 + (self.tax_rate / 100))

    def is_active(self):
        """Check if the promotion is currently active."""
        from datetime import date
        today = date.today()
        return (self.start_date is None or self.start_date <= today) and (self.end_date is None or self.end_date >= today)

    def serialize(self):
        """Serialize the model for JSON responses."""
        return {
            "id": self.id,
            "title": self.title,
            "code": self.code,
            "discount_percentage": self.discount_percentage,
            "tax_rate": self.tax_rate,
            "tier": self.tier,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
        }
    
# campaign
    
class Campaign(db.Model):
    __tablename__ = 'campaigns'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    target_audience = db.Column(db.JSON, nullable=True)  # Audience details
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(20), default='draft')  # draft, active, completed, etc.

    # Relationships
    metrics = db.relationship('CampaignMetrics', backref='campaign', lazy=True)
    ad_creatives = db.relationship('AdCreative', backref='campaign', lazy=True)
    marketing_events = db.relationship('MarketingEvent', backref='campaign', lazy=True)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "target_audience": self.target_audience,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "status": self.status,
            "metrics": [metric.serialize() for metric in self.metrics] if self.metrics else [],
            "ad_creatives": [creative.serialize() for creative in self.ad_creatives] if self.ad_creatives else [],
            "marketing_events": [event.serialize() for event in self.marketing_events] if self.marketing_events else [],
        }


class CampaignMetrics(db.Model):
    __tablename__ = 'campaign_metrics'

    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)  # Date of metric recording
    impressions = db.Column(db.Integer, default=0)
    clicks = db.Column(db.Integer, default=0)
    conversions = db.Column(db.Integer, default=0)
    revenue_generated = db.Column(db.Float, default=0.0)

    def serialize(self):
        return {
            "id": self.id,
            "campaign_id": self.campaign_id,
            "date": self.date.isoformat(),
            "impressions": self.impressions,
            "clicks": self.clicks,
            "conversions": self.conversions,
            "revenue_generated": self.revenue_generated,
        }


class AudienceSegment(db.Model):
    __tablename__ = 'audience_segments'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    demographics = db.Column(db.JSON, nullable=True)  # Example: age, location, gender
    preferences = db.Column(db.JSON, nullable=True)  # Example: product preferences

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "demographics": self.demographics,
            "preferences": self.preferences,
        }


class AdCreative(db.Model):
    __tablename__ = 'ad_creatives'

    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # image, video, text
    content_url = db.Column(db.String(255), nullable=False)  # URL to the creative file
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def serialize(self):
        return {
            "id": self.id,
            "campaign_id": self.campaign_id,
            "title": self.title,
            "type": self.type,
            "content_url": self.content_url,
            "created_at": self.created_at.isoformat(),
        }


class MarketingEvent(db.Model):
    __tablename__ = 'marketing_events'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    date = db.Column(db.DateTime, nullable=False)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=True)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "date": self.date.isoformat(),
            "campaign_id": self.campaign_id,
        }

class SavedForLater(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "product_id": self.product_id,
            "quantity": self.quantity,
        }

class Cart(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    items = db.relationship('CartItem', backref='cart', lazy=True)

    def serialize(self):
        return {
            "id": self.id,
            "customer_id": self.customer_id,
            "items": [item.serialize() for item in self.items],
        }


class CartItem(db.Model):
    __tablename__ = 'cart_item'

    id = db.Column(db.Integer, primary_key=True)
    cart_id = db.Column(db.Integer, db.ForeignKey('cart.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def serialize(self):
        return {
            "id": self.id,
            "cart_id": self.cart_id,
            "product_id": self.product_id,
            "quantity": self.quantity,
            "last_updated": self.last_updated.isoformat(),
        }



# seedbank

class Seedbank(db.Model):
    __tablename__ = 'seedbanks'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    contact_email = db.Column(db.String(255), unique=True, nullable=False)
    phone_number = db.Column(db.String(50), nullable=True)
    description = db.Column(db.Text, nullable=True)

    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'location': self.location,
            'contact_email': self.contact_email,
            'phone_number': self.phone_number,
            'description': self.description
        }

class SeedBatch(db.Model):
    __tablename__ = 'seed_batches'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    strain = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    harvest_date = db.Column(db.Date, nullable=False)
    grower = db.Column(db.String(100), nullable=True)  # Optional field

    def serialize(self):
        """Serialize the model into a dictionary for JSON responses."""
        return {
            "id": self.id,
            "name": self.name,
            "strain": self.strain,
            "quantity": self.quantity,
            "harvest_date": self.harvest_date.strftime('%Y-%m-%d'),
            "grower": self.grower
        }
    
class StorageConditions(db.Model):
    __tablename__ = 'storage_conditions'

    id = db.Column(db.Integer, primary_key=True)  # Unique identifier
    temperature = db.Column(db.Float, nullable=False)  # Temperature in Celsius
    humidity = db.Column(db.Float, nullable=False)  # Humidity percentage
    light_exposure = db.Column(db.String(50), nullable=False)  # Light exposure condition (e.g., "low", "medium", "high")
    notes = db.Column(db.Text, nullable=True)  # Additional notes or description
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())  # Timestamp of creation
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())  # Timestamp of updates

    def serialize(self):
        """Converts the object to a dictionary for JSON serialization."""
        return {
            "id": self.id,
            "temperature": self.temperature,
            "humidity": self.humidity,
            "light_exposure": self.light_exposure,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
    


class SeedReport(db.Model):
    __tablename__ = 'seed_reports'

    id = db.Column(db.Integer, primary_key=True)  # Unique identifier
    seed_batch_id = db.Column(db.Integer, db.ForeignKey('seed_batches.id'), nullable=False)  # Foreign key to SeedBatch
    germination_rate = db.Column(db.Float, nullable=False)  # Germination success rate (percentage)
    harvest_yield = db.Column(db.Float, nullable=True)  # Yield from the batch (in grams or other unit)
    report_date = db.Column(db.Date, nullable=False)  # Date of the report
    notes = db.Column(db.Text, nullable=True)  # Additional notes or findings
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())  # Timestamp of creation
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())  # Timestamp of updates

    # Relationship to SeedBatch
    seed_batch = db.relationship('SeedBatch', backref=db.backref('reports', lazy=True))

    def serialize(self):
        """Converts the object to a dictionary for JSON serialization."""
        return {
            "id": self.id,
            "seed_batch_id": self.seed_batch_id,
            "germination_rate": self.germination_rate,
            "harvest_yield": self.harvest_yield,
            "report_date": self.report_date.isoformat() if self.report_date else None,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
    
class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    seedbank_id = db.Column(db.Integer, db.ForeignKey('seedbanks.id'), nullable=False)
    message = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    seedbank = db.relationship('Seedbank', backref=db.backref('notifications', lazy=True))

    def serialize(self):
        return {
            "id": self.id,
            "seedbank_id": self.seedbank_id,
            "message": self.message,
            "created_at": self.created_at.isoformat()
        }
    
# customer dashboard



class Wishlist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)

class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)  # e.g., cash, card
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_date = db.Column(db.DateTime, default=db.func.now())

    order = db.relationship('Order', backref='payments')

from api.models import db
from datetime import datetime

class PaymentMethod(db.Model):
    __tablename__ = 'payment_method'

    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    method_type = db.Column(db.String(50), nullable=False)  # E.g., "Credit Card", "Cash", "PayPal"
    provider = db.Column(db.String(100), nullable=True)  # E.g., "Visa", "Mastercard", "PayPal"
    account_number = db.Column(db.String(50), nullable=True)  # Masked or partially stored
    expiry_date = db.Column(db.Date, nullable=True)  # For cards
    is_default = db.Column(db.Boolean, default=False)  # Flag for the default payment method
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship to Customer
    customer = db.relationship('Customer', backref='payment_methods', lazy=True)

    def serialize(self):
        return {
            "id": self.id,
            "customer_id": self.customer_id,
            "method_type": self.method_type,
            "provider": self.provider,
            "account_number": self.account_number[-4:] if self.account_number else None,  # Show only last 4 digits
            "expiry_date": self.expiry_date.isoformat() if self.expiry_date else None,
            "is_default": self.is_default,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


class PaymentLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)
    amount = db.Column(db.Float, nullable=False)


class Subscription(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    plan_id = db.Column(db.Integer, db.ForeignKey('plan.id'), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=True)
    status = db.Column(db.String(50), default='active')


class SupportTicket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    subject = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), default='open')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class LoyaltyHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    points = db.Column(db.Integer, nullable=False)
    description = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Discount(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), nullable=False, unique=True)
    percentage = db.Column(db.Float, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    expires_at = db.Column(db.DateTime, nullable=True)

class Address(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    street = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(50), nullable=False)
    zip_code = db.Column(db.String(20), nullable=False)
    country = db.Column(db.String(100), nullable=False)

class Receipt(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    receipt_number = db.Column(db.String(100), unique=True, nullable=False)
    receipt_date = db.Column(db.DateTime, default=db.func.now())

    order = db.relationship('Order', backref='receipt')



class Refund(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    refund_amount = db.Column(db.Numeric(10, 2), nullable=False)
    refund_reason = db.Column(db.String(255), nullable=True)  # Reason for the refund
    refund_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default='pending')  # pending, approved, rejected

    # Relationships
    order = db.relationship('Order', backref='refunds')

    def serialize(self):
        return {
            "id": self.id,
            "order_id": self.order_id,
            "refund_amount": float(self.refund_amount),
            "refund_reason": self.refund_reason,
            "refund_date": self.refund_date.isoformat() if self.refund_date else None,
            "status": self.status,
        }

class GiftCard(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False)
    initial_balance = db.Column(db.Numeric(10, 2), nullable=False)
    current_balance = db.Column(db.Numeric(10, 2), nullable=False)
    expiry_date = db.Column(db.Date, nullable=True)  # Optional expiry date
    issued_date = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

    def serialize(self):
        return {
            "id": self.id,
            "code": self.code,
            "initial_balance": float(self.initial_balance),
            "current_balance": float(self.current_balance),
            "expiry_date": self.expiry_date.isoformat() if self.expiry_date else None,
            "issued_date": self.issued_date.isoformat(),
            "is_active": self.is_active,
        }


class BillingHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    payment_amount = db.Column(db.Float, nullable=False)
    payment_date = db.Column(db.DateTime, nullable=False)
    payment_status = db.Column(db.String(50), nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "customer_id": self.customer_id,
            "payment_amount": self.payment_amount,
            "payment_date": self.payment_date.isoformat(),
            "payment_status": self.payment_status
        }

class Schedule(db.Model):
    __tablename__ = 'schedule'

    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employee.id'), nullable=False)
    shift_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    shift_type = db.Column(db.String(50), nullable=True)  # e.g., Morning, Evening

    employee = db.relationship('Employee', backref='schedules', lazy=True)

    def serialize(self):
        return {
            "id": self.id,
            "employee_id": self.employee_id,
            "shift_date": self.shift_date.isoformat(),
            "start_time": self.start_time.strftime("%H:%M:%S"),
            "end_time": self.end_time.strftime("%H:%M:%S"),
            "shift_type": self.shift_type,
        }    

