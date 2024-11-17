from flask import Blueprint, request, jsonify
from app.models import db, Order, OrderItem, Product, Customer

order_bp = Blueprint('orders', __name__)

# ---------------------
# Create an Order
# ---------------------
@order_bp.route('/api/orders', methods=['POST'])
def create_order():
    data = request.json

    try:
        # Validate input
        customer_id = data['customer_id']
        items = data['items']  # List of { "product_id": X, "quantity": Y }

        # Check if customer exists
        customer = Customer.query.get(customer_id)
        if not customer:
            return jsonify({"error": "Customer not found"}), 404

        # Calculate total amount and create order
        total_amount = 0
        order_items = []
        for item in items:
            product = Product.query.get(item['product_id'])
            if not product:
                return jsonify({"error": f"Product with ID {item['product_id']} not found"}), 404
            if product.current_stock < item['quantity']:
                return jsonify({"error": f"Not enough stock for product {product.name}"}), 400

            total_amount += product.unit_price * item['quantity']
            order_item = OrderItem(
                product_id=item['product_id'],
                quantity=item['quantity'],
                unit_price=product.unit_price
            )
            order_items.append(order_item)
            # Reduce stock
            product.current_stock -= item['quantity']

        # Create the order
        order = Order(
            customer_id=customer_id,
            total_amount=total_amount,
            status="pending"
        )
        db.session.add(order)
        db.session.commit()

        # Link items to order
        for order_item in order_items:
            order_item.order_id = order.id
            db.session.add(order_item)
        db.session.commit()

        return jsonify(order.serialize()), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ---------------------
# Update Order Status
# ---------------------
@order_bp.route('/api/orders/<int:order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    data = request.json
    new_status = data.get('status')

    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404

    try:
        order.status = new_status
        db.session.commit()
        return jsonify(order.serialize()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ---------------------
# Get All Orders
# ---------------------
@order_bp.route('/api/orders', methods=['GET'])
def get_all_orders():
    orders = Order.query.all()
    return jsonify([order.serialize() for order in orders]), 200


# ---------------------
# Get Order by ID
# ---------------------
@order_bp.route('/api/orders/<int:order_id>', methods=['GET'])
def get_order_by_id(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404
    return jsonify(order.serialize()), 200
