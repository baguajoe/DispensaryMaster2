# utils.py or services/inventory.py
from datetime import datetime, timedelta
from sqlalchemy import func
from api.models import Order, OrderItem, Product  # Adjust based on your models

def calculate_lead_time(product_id):
    # Fetch past order and delivery data to compute average lead time
    lead_times = db.session.query(Order.delivery_date - Order.order_date).filter(
        Order.product_id == product_id
    ).all()
    return sum(lead_times, timedelta(0)) / len(lead_times) if lead_times else timedelta(days=7)

def calculate_sales_velocity(product_id):
    # Fetch recent sales data to compute the average sales velocity
    sales = db.session.query(func.sum(OrderItem.quantity)).filter(
        OrderItem.product_id == product_id,
        OrderItem.date >= datetime.utcnow() - timedelta(days=30)
    ).scalar()
    return sales / 30 if sales else 0

def predict_restock(db, product_id, reorder_point, lead_time, sales_velocity):
    # Compute when stock will reach the reorder point
    current_stock = db.session.query(Product.current_stock).filter(
        Product.id == product_id
    ).scalar()
    days_to_reorder = (current_stock - reorder_point) / sales_velocity if sales_velocity > 0 else float('inf')
    return (datetime.utcnow() + timedelta(days=days_to_reorder) + lead_time).strftime('%Y-%m-%d')
