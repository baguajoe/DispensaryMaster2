from flask import jsonify, url_for
from flask_jwt_extended import get_jwt_identity
from sqlalchemy import func
from functools import wraps
from api.models import User, Order, OrderItem, SalesHistory, Product
from api.extensions import socketio 

from prophet import Prophet
import pandas as pd
from datetime  import timedelta

def calculate_lead_time(db, product_id):
    # Fetch past order and delivery data to compute average lead time
    lead_times = db.session.query(Order.delivery_date - Order.order_date).filter(
        Order.product_id == product_id
    ).all()
    return sum(lead_times, timedelta(0)) / len(lead_times) if lead_times else timedelta(days=7)

def calculate_sales_velocity(db, product_id):
    # Fetch recent sales data to compute the average sales velocity
    sales = db.session.query(func.sum(OrderItem.quantity)).filter(
        OrderItem.product_id == product_id,
        OrderItem.date >= datetime.utcnow() - timedelta(days=30)
    ).scalar()
    return sales / 30 if sales else 0

def predict_restock(db, product_id, reorder_point):
    # Fetch sales data for the product
    sales_data = db.session.query(SalesHistory).filter_by(product_id=product_id).all()
    df = pd.DataFrame([(s.date_sold, s.quantity_sold) for s in sales_data], columns=["ds", "y"])

    # Train Prophet model
    model = Prophet()
    model.fit(df)

    # Predict next 30 days
    future = model.make_future_dataframe(periods=30)
    forecast = model.predict(future)

    # Find the day where stock reaches the reorder point
    reorder_date = forecast[forecast['yhat'] <= reorder_point].iloc[0]['ds']
    return reorder_date

def check_and_alert_low_stock():
    """
    Checks inventory levels for all products and emits alerts for low stock.
    """
    # Define the threshold for low stock
    low_stock_threshold = 10  # Adjust this value based on your needs

    # Query products with stock below the threshold
    low_stock_products = Product.query.filter(Product.current_stock <= low_stock_threshold).all()

    # Emit alerts for each low-stock product
    for product in low_stock_products:
        alert_message = {
            "product_id": product.id,
            "product_name": product.name,
            "current_stock": product.current_stock,
            "message": f"Low stock alert: {product.name} has only {product.current_stock} items left!"
        }

        # Emit WebSocket event for low stock
        socketio.emit('low_stock_alert', alert_message, broadcast=True)

        # Optionally, log or store the alert in the database (e.g., Notifications table)
        print(alert_message)  # For debugging purposes

# ---------------------
# Role-Based Access Control
# ---------------------
def role_required(required_role):
    """
    Decorator to enforce role-based access control.
    """
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            if not user or user.role != required_role:
                return jsonify({"error": "Access denied"}), 403
            return f(*args, **kwargs)
        return wrapper
    return decorator

# ---------------------
# API Exception Handling
# ---------------------
class APIException(Exception):
    """
    Custom Exception class for API errors.
    """
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv

# ---------------------
# Utility Functions
# ---------------------
def has_no_empty_params(rule):
    """
    Helper function to check if a rule has no empty parameters.
    """
    defaults = rule.defaults if rule.defaults is not None else ()
    arguments = rule.arguments if rule.arguments is not None else ()
    return len(defaults) >= len(arguments)

def generate_sitemap(app):
    """
    Generates an HTML sitemap for the application.
    """
    links = ['/admin/']
    for rule in app.url_map.iter_rules():
        if "GET" in rule.methods and has_no_empty_params(rule):
            url = url_for(rule.endpoint, **(rule.defaults or {}))
            if "/admin/" not in url:
                links.append(url)

    links_html = "".join(["<li><a href='" + y + "'>" + y + "</a></li>" for y in links])
    return """
        <div style="text-align: center;">
        <img style="max-height: 80px" src='https://storage.googleapis.com/breathecode/boilerplates/rigo-baby.jpeg' />
        <h1>Rigo welcomes you to your API!!</h1>
        <p>API HOST: <script>document.write('<input style="padding: 5px; width: 300px" type="text" value="'+window.location.href+'" />');</script></p>
        <p>Start working on your project by following the <a href="https://start.4geeksacademy.com/starters/full-stack" target="_blank">Quick Start</a></p>
        <p>Remember to specify a real endpoint path like: </p>
        <ul style="text-align: left;">""" + links_html + "</ul></div>"


