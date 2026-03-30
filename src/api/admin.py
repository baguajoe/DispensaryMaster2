import os
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from .models import (db, User, Plan, Product, OrderItem, Order, Customer,
    Business, Compliance, Invoice, Store, Transaction, GrowFarm, Seedbank,
    Employee, Payroll, Patient, Prescription, Appointment)

def setup_admin(app):
    app.secret_key = os.environ.get('FLASK_APP_KEY', 'sample key')
    app.config['FLASK_ADMIN_SWATCH'] = 'cerulean'
    admin = Admin(app, name='DispenseMaster Admin')

    # Core
    admin.add_view(ModelView(User, db.session))
    admin.add_view(ModelView(Product, db.session))
    admin.add_view(ModelView(Order, db.session))
    admin.add_view(ModelView(OrderItem, db.session))
    admin.add_view(ModelView(Customer, db.session))
    admin.add_view(ModelView(Invoice, db.session))
    admin.add_view(ModelView(Store, db.session))
    admin.add_view(ModelView(Transaction, db.session))

    # HR/Payroll
    admin.add_view(ModelView(Employee, db.session))
    admin.add_view(ModelView(Payroll, db.session))

    # Medical
    admin.add_view(ModelView(Patient, db.session))
    admin.add_view(ModelView(Prescription, db.session))
    admin.add_view(ModelView(Appointment, db.session))

    # Compliance
    admin.add_view(ModelView(Business, db.session))
    admin.add_view(ModelView(Compliance, db.session))

    # Grow
    admin.add_view(ModelView(GrowFarm, db.session))
    admin.add_view(ModelView(Seedbank, db.session))

    # Plans
    admin.add_view(ModelView(Plan, db.session))
