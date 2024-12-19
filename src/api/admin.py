  
import os
from flask_admin import Admin
from .models import db, User, Plan, Product,OrderItem, Order, Customer, Business, Compliance, Invoice, Store, Lead, CampaignManagement, TaskManagement
from flask_admin.contrib.sqla import ModelView

def setup_admin(app):
    app.secret_key = os.environ.get('FLASK_APP_KEY', 'sample key')
    app.config['FLASK_ADMIN_SWATCH'] = 'cerulean'
    admin = Admin(app, name='4Geeks Admin', template_mode='bootstrap3')

    
    # Add your models here, for example this is how we add a the User model to the admin
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
    admin.add_view(ModelView(Lead, db.session))  # Add Lead model
    admin.add_view(ModelView(CampaignManagement, db.session))  # Add Campaign model
    admin.add_view(ModelView(TaskManagement, db.session))      # Add Task model
    

    # You can duplicate that line to add mew models
    # admin.add_view(ModelView(YourModelName, db.session))