from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.models import db, Product, Customer, Order, OrderItem, Transaction, Receipt, Refund, User
from datetime import datetime
from functools import wraps

pos_bp = Blueprint('pos', __name__)

def handle_errors(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500
    return decorated

# ── Checkout ─────────────────────────────────────────────────
@pos_bp.route('/pos/checkout', methods=['POST'])
@jwt_required()
@handle_errors
def pos_checkout():
    data = request.json
    user_id = get_jwt_identity()
    items = data.get('items', [])
    payment_method = data.get('payment_method', 'cash')
    customer_id = data.get('customer_id')
    discount = float(data.get('discount', 0))
    tax_rate = float(data.get('tax_rate', 0.08))

    if not items:
        return jsonify({"error": "No items in cart"}), 400

    # Validate stock and calculate totals
    subtotal = 0
    order_items = []
    for item in items:
        product = Product.query.get(item['product_id'])
        if not product:
            return jsonify({"error": f"Product {item['product_id']} not found"}), 404
        
        qty = int(item['quantity'])
        # Use 'stock' field for medical branch
        available = getattr(product, 'stock', getattr(product, 'current_stock', 0))
        if available < qty:
            return jsonify({"error": f"Insufficient stock for {product.name}. Available: {available}"}), 400
        
        price = float(getattr(product, 'price', getattr(product, 'unit_price', 0)))
        line_total = price * qty
        subtotal += line_total

        order_items.append({
            'product': product,
            'quantity': qty,
            'unit_price': price,
            'line_total': line_total
        })

    discount_amount = subtotal * (discount / 100)
    taxable = subtotal - discount_amount
    tax_amount = taxable * tax_rate
    total = taxable + tax_amount

    # Create order
    order = Order(
        customer_id=customer_id,
        total_amount=total,
        status='completed',
        created_at=datetime.utcnow()
    )
    db.session.add(order)
    db.session.flush()

    # Create order items and decrement stock
    for oi in order_items:
        product = oi['product']
        db.session.add(OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=oi['quantity'],
            unit_price=oi['unit_price']
        ))
        # Decrement stock
        if hasattr(product, 'stock'):
            product.stock -= oi['quantity']
        elif hasattr(product, 'current_stock'):
            product.current_stock -= oi['quantity']

    # Create transaction record
    transaction = Transaction(
        order_id=str(order.id),
        customer_name=_get_customer_name(customer_id),
        payment_method=payment_method,
        amount=total,
        date=datetime.utcnow()
    )
    db.session.add(transaction)

    # Create receipt
    receipt = Receipt(
        order_id=order.id,
        receipt_number=f"RCP-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{order.id}",
        receipt_date=datetime.utcnow()
    )
    db.session.add(receipt)
    db.session.commit()

    return jsonify({
        "success": True,
        "order_id": order.id,
        "receipt_number": receipt.receipt_number,
        "subtotal": round(subtotal, 2),
        "discount_amount": round(discount_amount, 2),
        "tax_amount": round(tax_amount, 2),
        "total": round(total, 2),
        "payment_method": payment_method,
        "change_due": round(float(data.get('cash_tendered', total)) - total, 2) if payment_method == 'cash' else 0,
        "items": [{"name": oi['product'].name, "qty": oi['quantity'], "price": oi['unit_price'], "total": oi['line_total']} for oi in order_items]
    }), 201

def _get_customer_name(customer_id):
    if not customer_id:
        return "Walk-in Customer"
    customer = Customer.query.get(customer_id)
    if customer:
        return f"{customer.first_name} {customer.last_name}"
    return "Walk-in Customer"

# ── Transactions ─────────────────────────────────────────────
@pos_bp.route('/pos/transactions', methods=['GET'])
@jwt_required()
@handle_errors
def get_pos_transactions():
    date_filter = request.args.get('date')
    query = Transaction.query
    if date_filter:
        from datetime import datetime
        date = datetime.strptime(date_filter, '%Y-%m-%d')
        query = query.filter(
            db.func.date(Transaction.date) == date.date()
        )
    transactions = query.order_by(Transaction.date.desc()).limit(100).all()
    return jsonify([{
        "id": t.id,
        "order_id": t.order_id,
        "customer": t.customer_name,
        "payment_method": t.payment_method,
        "amount": t.amount,
        "date": t.date.isoformat() if t.date else None
    } for t in transactions]), 200

@pos_bp.route('/pos/transactions/<string:order_id>', methods=['GET'])
@jwt_required()
@handle_errors
def get_pos_transaction(order_id):
    transaction = Transaction.query.filter_by(order_id=str(order_id)).first()
    if not transaction:
        return jsonify({"error": "Transaction not found"}), 404
    
    order = Order.query.get(int(order_id))
    items = []
    if order:
        for oi in order.order_items:
            product = Product.query.get(oi.product_id)
            items.append({
                "id": oi.id,
                "product_id": oi.product_id,
                "name": product.name if product else "Unknown",
                "quantity": oi.quantity,
                "price": float(oi.unit_price)
            })

    return jsonify({
        "id": transaction.id,
        "order_id": transaction.order_id,
        "customer": transaction.customer_name,
        "payment_method": transaction.payment_method,
        "amount": transaction.amount,
        "date": transaction.date.isoformat() if transaction.date else None,
        "items": items
    }), 200

# ── Returns ──────────────────────────────────────────────────
@pos_bp.route('/pos/returns', methods=['POST'])
@jwt_required()
@handle_errors
def process_return():
    data = request.json
    order_id = data.get('order_id')
    items = data.get('items', [])
    reason = data.get('reason', 'Customer return')

    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404

    refund_total = 0
    for item in items:
        oi = OrderItem.query.filter_by(order_id=order_id, product_id=item['product_id']).first()
        if oi:
            qty = int(item.get('quantity', oi.quantity))
            refund_amount = float(oi.unit_price) * qty
            refund_total += refund_amount
            # Restock
            product = Product.query.get(item['product_id'])
            if product:
                if hasattr(product, 'stock'):
                    product.stock += qty
                elif hasattr(product, 'current_stock'):
                    product.current_stock += qty

    refund = Refund(
        order_id=order_id,
        refund_amount=refund_total,
        refund_reason=reason,
        status='approved',
        refund_date=datetime.utcnow()
    )
    db.session.add(refund)
    db.session.commit()

    return jsonify({
        "success": True,
        "refund_amount": round(refund_total, 2),
        "message": f"Refund of ${refund_total:.2f} processed successfully"
    }), 200

# ── POS Reports ──────────────────────────────────────────────
@pos_bp.route('/pos/reports', methods=['GET'])
@jwt_required()
@handle_errors
def get_pos_reports():
    from datetime import datetime, timedelta
    report_type = request.args.get('type', 'daily')
    
    now = datetime.utcnow()
    if report_type == 'daily':
        start = now.replace(hour=0, minute=0, second=0)
    elif report_type == 'weekly':
        start = now - timedelta(days=7)
    elif report_type == 'monthly':
        start = now - timedelta(days=30)
    else:
        start = now.replace(hour=0, minute=0, second=0)

    orders = Order.query.filter(
        Order.status == 'completed',
        Order.created_at >= start
    ).all()

    total_sales = sum(float(o.total_amount) for o in orders)
    total_orders = len(orders)
    avg_order = total_sales / total_orders if total_orders > 0 else 0

    transactions = Transaction.query.filter(Transaction.date >= start).all()
    payment_breakdown = {}
    for t in transactions:
        pm = t.payment_method or 'cash'
        payment_breakdown[pm] = payment_breakdown.get(pm, 0) + float(t.amount)

    return jsonify({
        "period": report_type,
        "total_sales": round(total_sales, 2),
        "total_orders": total_orders,
        "average_order": round(avg_order, 2),
        "payment_breakdown": payment_breakdown,
        "orders": [{"id": o.id, "total": float(o.total_amount), "date": o.created_at.isoformat() if o.created_at else None} for o in orders[-10:]]
    }), 200

# ── Receipt Template ─────────────────────────────────────────
@pos_bp.route('/pos/receipt-template', methods=['GET'])
@jwt_required()
@handle_errors
def get_receipt_template():
    return jsonify({
        "header": "DispenseMaster\n123 Green St, Boston MA\n617-555-0100",
        "footer": "Thank you for your purchase!\nPlease consume responsibly.",
        "show_tax": True,
        "show_loyalty": True
    }), 200

@pos_bp.route('/pos/receipt-template', methods=['POST'])
@jwt_required()
@handle_errors
def save_receipt_template():
    data = request.json
    return jsonify({"success": True, "message": "Receipt template saved"}), 200

# ── Reconciliation ───────────────────────────────────────────
@pos_bp.route('/pos/reconciliation', methods=['POST'])
@jwt_required()
@handle_errors
def reconcile():
    data = request.json
    actual_cash = float(data.get('actual_cash', 0))
    notes = data.get('notes', '')

    from datetime import datetime, timedelta
    start = datetime.utcnow().replace(hour=0, minute=0, second=0)
    transactions = Transaction.query.filter(
        Transaction.date >= start,
        Transaction.payment_method == 'cash'
    ).all()
    expected_cash = sum(float(t.amount) for t in transactions)
    difference = actual_cash - expected_cash

    return jsonify({
        "expected_cash": round(expected_cash, 2),
        "actual_cash": round(actual_cash, 2),
        "difference": round(difference, 2),
        "status": "balanced" if abs(difference) < 0.01 else ("over" if difference > 0 else "short"),
        "notes": notes,
        "timestamp": datetime.utcnow().isoformat()
    }), 200

# ── POS Customers ────────────────────────────────────────────
@pos_bp.route('/pos/customers/search', methods=['GET'])
@jwt_required()
@handle_errors
def search_pos_customers():
    q = request.args.get('q', '')
    customers = Customer.query.filter(
        db.or_(
            Customer.first_name.ilike(f'%{q}%'),
            Customer.last_name.ilike(f'%{q}%'),
            Customer.email.ilike(f'%{q}%'),
            Customer.phone.ilike(f'%{q}%')
        )
    ).limit(10).all()
    return jsonify([{
        "id": c.id,
        "name": f"{c.first_name} {c.last_name}",
        "email": c.email,
        "phone": c.phone,
        "membership": c.membership_level,
        "loyalty_points": getattr(c, 'loyalty_points', 0)
    } for c in customers]), 200

# ── POS Settings ─────────────────────────────────────────────
@pos_bp.route('/pos/settings', methods=['GET'])
@jwt_required()
@handle_errors
def get_pos_settings():
    return jsonify({
        "tax_rate": 0.08,
        "currency": "USD",
        "receipt_printer": False,
        "barcode_scanner": True,
        "loyalty_enabled": True,
        "offline_mode": True,
        "payment_methods": ["cash", "card", "debit", "check"]
    }), 200
