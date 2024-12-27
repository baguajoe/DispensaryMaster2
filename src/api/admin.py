import os
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from .models import db, User, Plan, Product, OrderItem, Order, Customer, Business, Compliance, Invoice, Store, Lead, Campaign, Task, Transaction, GrowFarm, Seedbank

def setup_admin(app):
    app.secret_key = os.environ.get('FLASK_APP_KEY', 'sample key')
    app.config['FLASK_ADMIN_SWATCH'] = 'cerulean'
    admin = Admin(app, name='DispenseMaster Admin', template_mode='bootstrap3')

    # Add models to the admin interface
    admin.add_view(ModelView(User, db.session))
    admin.add_view(ModelView(Plan, db.session))
    admin.add_view(ModelView(Product, db.session))
    admin.add_view(ModelView(OrderItem, db.session))
    admin.add_view(ModelView(Order, db.session))
    admin.add_view(ModelView(Customer, db.session))
    admin.add_view(ModelView(Business, db.session))
    admin.add_view(ModelView(Compliance, db.session))
    admin.add_view(ModelView(Invoice, db.session))
    admin.add_view(ModelView(Store, db.session))
    admin.add_view(ModelView(Lead, db.session))
    admin.add_view(ModelView(Campaign, db.session))
    admin.add_view(ModelView(Task, db.session))
    admin.add_view(ModelView(Transaction, db.session))

    # Add GrowFarm and Seedbank models
    admin.add_view(ModelView(GrowFarm, db.session))
    admin.add_view(ModelView(Seedbank, db.session))
    # admin.add_view(ModelView(Crop, db.session))
    # admin.add_view(ModelView(Seed, db.session))pip
    

    # You can duplicate that line to add mew models
    # admin.add_view(ModelView(YourModelName, db.session))

      # POS System Models
    # admin.add_view(ModelView(Transaction, db.session))  # Add the Transaction model for POS
    # admin.add_view(ModelView(Transaction, db.session, name='transaction_admin'))