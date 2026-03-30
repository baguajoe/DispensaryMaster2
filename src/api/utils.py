from flask import jsonify, url_for

class APIException(Exception):
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

def has_no_empty_params(rule):
    defaults = rule.defaults if rule.defaults is not None else ()
    arguments = rule.arguments if rule.arguments is not None else ()
    return len(defaults) >= len(arguments)

def generate_sitemap(app):
    links = ['/admin/']
    for rule in app.url_map.iter_rules():
        if "GET" in rule.methods and has_no_empty_params(rule):
            url = url_for(rule.endpoint, **(rule.defaults or {}))
            if "/admin/" not in url:
                links.append(url)
    links_html = "".join(["<li><a href='" + y + "'>" + y + "</a></li>" for y in links])
    return """
        <div style="text-align: center;">
        <h1>DispenseMaster API</h1>
        <p>API HOST: <script>document.write('<input style="padding: 5px; width: 300px" type="text" value="'+window.location.href+'" />');</script></p>
        <ul style="text-align: left;">""" + links_html + "</ul></div>"

def calculate_lead_time(supplier_id, product_id):
    """Calculate average lead time for a supplier/product combo."""
    try:
        from api.models import db
        # Returns average days between order and delivery
        # Stub: return 7 days default
        return 7
    except Exception:
        return 7

def calculate_sales_velocity(product_id, days=30):
    """Calculate how many units sold per day over the last N days."""
    try:
        from api.models import db, OrderItem, Order
        from datetime import datetime, timedelta
        cutoff = datetime.utcnow() - timedelta(days=days)
        result = db.session.query(
            db.func.sum(OrderItem.quantity)
        ).join(Order).filter(
            OrderItem.product_id == product_id,
            Order.created_at >= cutoff,
            Order.status == 'completed'
        ).scalar()
        total_sold = result or 0
        return round(total_sold / days, 2)
    except Exception:
        return 0.0

def predict_restock(product_id, days_ahead=30):
    """Predict when a product will need restocking."""
    try:
        from api.models import Product
        product = Product.query.get(product_id)
        if not product:
            return None
        velocity = calculate_sales_velocity(product_id)
        if velocity == 0:
            return {"days_until_restock": None, "recommended_order_qty": product.reorder_point * 2}
        days_until_empty = product.current_stock / velocity
        lead_time = calculate_lead_time(None, product_id)
        reorder_in = max(0, days_until_empty - lead_time)
        return {
            "product_id": product_id,
            "current_stock": product.current_stock,
            "daily_velocity": velocity,
            "days_until_empty": round(days_until_empty, 1),
            "lead_time_days": lead_time,
            "reorder_in_days": round(reorder_in, 1),
            "recommended_order_qty": max(product.reorder_point * 2, int(velocity * 30))
        }
    except Exception as e:
        return {"error": str(e)}
