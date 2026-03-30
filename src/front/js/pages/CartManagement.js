import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";

const CartManagement = () => {
    const { store, actions } = useContext(Context);
    const [discountCode, setDiscountCode] = useState("");
    const [discountApplied, setDiscountApplied] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        actions.fetchCart().then(() => setLoading(false));
    }, []);

    const cart = Array.isArray(store.cartItems) ? store.cartItems : [];

    const subtotal = cart.length > 0 ? cart.reduce((sum, item) => sum + ((item.price || item.unit_price || 0) * (item.quantity || 1)), 0) : 0;
    const discountAmount = discountApplied ? subtotal * (discountApplied / 100) : 0;
    const total = subtotal - discountAmount;

    const handleRemove = async (itemId) => {
        await actions.removeFromCart(itemId);
    };

    const handleClear = async () => {
        if (window.confirm("Clear your entire cart?")) {
            await actions.clearCart();
        }
    };

    const handleApplyDiscount = async () => {
        const token = localStorage.getItem("token");
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/cart/apply_discount`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ code: discountCode })
            });
            const data = await r.json();
            if (data.success) {
                setDiscountApplied(data.discount);
            } else {
                alert("Invalid discount code");
            }
        } catch (e) {
            alert("Failed to apply discount");
        }
    };

    const handleUpdateQty = async (item, qty) => {
        if (qty < 1) return handleRemove(item.id);
        const token = localStorage.getItem("token");
        try {
            await fetch(`${process.env.BACKEND_URL}/api/cart/${item.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ quantity: qty })
            });
            await actions.fetchCart();
        } catch (e) { console.error(e); }
    };

    if (loading) return (
        <div className="main-content d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
            <div className="spinner-border text-success" />
        </div>
    );

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3 mb-0">🛒 Shopping Cart</h1>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate("/shop")}>
                    ← Continue Shopping
                </button>
            </div>

            {cart.length === 0 ? (
                <div className="text-center py-5">
                    <div style={{ fontSize: "4rem" }}>🛒</div>
                    <h4 className="mt-3">Your cart is empty</h4>
                    <p className="text-muted">Add some products from the shop</p>
                    <button className="btn btn-success" onClick={() => navigate("/shop")}>
                        Browse Products
                    </button>
                </div>
            ) : (
                <div className="row g-4">
                    {/* Cart Items */}
                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-header d-flex justify-content-between">
                                <span>{cart.length} item{cart.length !== 1 ? "s" : ""}</span>
                                <button className="btn btn-sm btn-outline-danger" onClick={handleClear}>Clear Cart</button>
                            </div>
                            <div className="list-group list-group-flush">
                                {cart.map(item => (
                                    <div key={item.id} className="list-group-item">
                                        <div className="row align-items-center">
                                            <div className="col-md-5">
                                                <h6 className="mb-0">{item.name}</h6>
                                                <small className="text-muted">{item.category} {item.strain && `· ${item.strain}`}</small>
                                                {item.thc_content > 0 && (
                                                    <small className="d-block text-muted">THC: {item.thc_content}%</small>
                                                )}
                                            </div>
                                            <div className="col-md-2">
                                                <span className="text-success fw-bold">${parseFloat(item.price).toFixed(2)}</span>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="input-group input-group-sm">
                                                    <button className="btn btn-outline-secondary" onClick={() => handleUpdateQty(item, item.quantity - 1)}>-</button>
                                                    <span className="input-group-text">{item.quantity}</span>
                                                    <button className="btn btn-outline-secondary" onClick={() => handleUpdateQty(item, item.quantity + 1)}>+</button>
                                                </div>
                                            </div>
                                            <div className="col-md-2 text-end">
                                                <div className="fw-bold">${(item.price * item.quantity).toFixed(2)}</div>
                                                <button className="btn btn-link btn-sm text-danger p-0" onClick={() => handleRemove(item.id)}>Remove</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="col-md-4">
                        <div className="card">
                            <div className="card-header"><h5 className="mb-0">Order Summary</h5></div>
                            <div className="card-body">
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                {discountApplied && (
                                    <div className="d-flex justify-content-between mb-2 text-success">
                                        <span>Discount ({discountApplied}%)</span>
                                        <span>-${discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <hr />
                                <div className="d-flex justify-content-between mb-3 fw-bold fs-5">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>

                                {/* Discount Code */}
                                <div className="input-group mb-3">
                                    <input className="form-control" placeholder="Discount code"
                                        value={discountCode} onChange={e => setDiscountCode(e.target.value)} />
                                    <button className="btn btn-outline-secondary" onClick={handleApplyDiscount}>Apply</button>
                                </div>

                                <button className="btn btn-success w-100 mb-2" onClick={() => navigate("/pos")}>
                                    Proceed to Checkout
                                </button>
                                <button className="btn btn-outline-secondary w-100" onClick={() => navigate("/shop")}>
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartManagement;
