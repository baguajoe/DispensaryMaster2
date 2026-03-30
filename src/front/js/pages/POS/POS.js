import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const PAYMENT_METHODS = ["cash", "card", "debit", "check"];
const TAX_RATE = 0.08;

const POS = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [categories, setCategories] = useState(["All"]);
    const [customer, setCustomer] = useState(null);
    const [customerSearch, setCustomerSearch] = useState("");
    const [customerResults, setCustomerResults] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [cashTendered, setCashTendered] = useState("");
    const [discount, setDiscount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [receipt, setReceipt] = useState(null);
    const [settings, setSettings] = useState({ tax_rate: TAX_RATE });
    const [notification, setNotification] = useState(null);
    const searchRef = useRef(null);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetchProducts();
        fetchSettings();
        if (searchRef.current) searchRef.current.focus();
    }, []);

    useEffect(() => {
        let result = products;
        if (categoryFilter !== "All") result = result.filter(p => p.category === categoryFilter);
        if (search) result = result.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.strain || "").toLowerCase().includes(search.toLowerCase()) ||
            (p.sku || "").toLowerCase().includes(search.toLowerCase())
        );
        setFilteredProducts(result);
    }, [products, search, categoryFilter]);

    const fetchProducts = async () => {
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/products`, { headers });
            const data = await r.json();
            if (Array.isArray(data)) {
                const available = data.filter(p => (p.stock || p.current_stock || 0) > 0);
                setProducts(available);
                setFilteredProducts(available);
                const cats = ["All", ...new Set(available.map(p => p.category).filter(Boolean))];
                setCategories(cats);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchSettings = async () => {
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/pos/settings`, { headers });
            if (r.ok) {
                const data = await r.json();
                setSettings(data);
            }
        } catch (e) { console.error(e); }
    };

    const searchCustomers = async (q) => {
        if (q.length < 2) { setCustomerResults([]); return; }
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/pos/customers/search?q=${q}`, { headers });
            if (r.ok) setCustomerResults(await r.json());
        } catch (e) { console.error(e); }
    };

    const addToCart = (product) => {
        const stock = product.stock || product.current_stock || 0;
        setCart(prev => {
            const existing = prev.find(i => i.id === product.id);
            if (existing) {
                if (existing.quantity >= stock) {
                    showNotification(`Max stock reached for ${product.name}`, "warning");
                    return prev;
                }
                return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        showNotification(`${product.name} added`, "success");
    };

    const updateQty = (id, delta) => {
        setCart(prev => prev.map(i => {
            if (i.id !== id) return i;
            const newQty = i.quantity + delta;
            return newQty < 1 ? null : { ...i, quantity: newQty };
        }).filter(Boolean));
    };

    const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));
    const clearCart = () => { setCart([]); setCustomer(null); setDiscount(0); setCashTendered(""); setReceipt(null); };

    const getPrice = (p) => parseFloat(p.price || p.unit_price || 0);
    const subtotal = cart.reduce((sum, i) => sum + getPrice(i) * i.quantity, 0);
    const discountAmount = subtotal * (discount / 100);
    const taxable = subtotal - discountAmount;
    const taxAmount = taxable * (settings.tax_rate || TAX_RATE);
    const total = taxable + taxAmount;
    const changeDue = paymentMethod === "cash" && cashTendered ? Math.max(0, parseFloat(cashTendered) - total) : 0;

    const showNotification = (msg, type = "info") => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 2000);
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return showNotification("Cart is empty", "warning");
        if (paymentMethod === "cash" && cashTendered && parseFloat(cashTendered) < total) {
            return showNotification("Insufficient cash tendered", "warning");
        }

        setProcessing(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/pos/checkout`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    items: cart.map(i => ({ product_id: i.id, quantity: i.quantity })),
                    customer_id: customer?.id || null,
                    payment_method: paymentMethod,
                    discount,
                    tax_rate: settings.tax_rate || TAX_RATE,
                    cash_tendered: parseFloat(cashTendered) || total
                })
            });
            const data = await r.json();
            if (r.ok) {
                setReceipt({ ...data, customer, cart: [...cart], paymentMethod, cashTendered });
                fetchProducts();
                showNotification("Sale completed!", "success");
            } else {
                showNotification(data.error || "Checkout failed", "danger");
            }
        } catch (e) {
            showNotification("Network error", "danger");
        } finally {
            setProcessing(false);
        }
    };

    const printReceipt = () => window.print();

    if (receipt) {
        return (
            <div className="main-content p-4">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card" id="receipt">
                            <div className="card-body text-center">
                                <h3 className="fw-bold">DispenseMaster</h3>
                                <p className="text-muted small mb-1">123 Green St, Boston MA | 617-555-0100</p>
                                <hr />
                                <p className="small mb-1">Receipt #: {receipt.receipt_number}</p>
                                <p className="small mb-3">{new Date().toLocaleString()}</p>
                                {receipt.customer && <p className="small mb-3">Customer: {receipt.customer.name}</p>}
                                <table className="table table-sm">
                                    <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
                                    <tbody>
                                        {receipt.cart.map(i => (
                                            <tr key={i.id}>
                                                <td className="text-start small">{i.name}</td>
                                                <td>{i.quantity}</td>
                                                <td>${getPrice(i).toFixed(2)}</td>
                                                <td>${(getPrice(i) * i.quantity).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <hr />
                                <div className="d-flex justify-content-between"><span>Subtotal</span><span>${receipt.subtotal?.toFixed(2)}</span></div>
                                {receipt.discount_amount > 0 && <div className="d-flex justify-content-between text-success"><span>Discount</span><span>-${receipt.discount_amount?.toFixed(2)}</span></div>}
                                <div className="d-flex justify-content-between"><span>Tax (8%)</span><span>${receipt.tax_amount?.toFixed(2)}</span></div>
                                <div className="d-flex justify-content-between fw-bold fs-5"><span>Total</span><span>${receipt.total?.toFixed(2)}</span></div>
                                <div className="d-flex justify-content-between"><span>Payment</span><span className="text-capitalize">{receipt.paymentMethod}</span></div>
                                {receipt.paymentMethod === "cash" && receipt.change_due > 0 && (
                                    <div className="d-flex justify-content-between text-success"><span>Change Due</span><span>${receipt.change_due?.toFixed(2)}</span></div>
                                )}
                                <hr />
                                <p className="small text-muted">Thank you for your purchase!</p>
                                <p className="small text-muted">Please consume responsibly.</p>
                            </div>
                        </div>
                        <div className="d-flex gap-2 mt-3">
                            <button className="btn btn-primary flex-grow-1" onClick={printReceipt}>🖨️ Print Receipt</button>
                            <button className="btn btn-success flex-grow-1" onClick={clearCart}>New Sale</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="main-content" style={{ height: "calc(100vh - 60px)", overflow: "hidden" }}>
            {notification && (
                <div className={`alert alert-${notification.type} position-fixed top-0 start-50 translate-middle-x mt-2`}
                    style={{ zIndex: 9999, minWidth: 250 }}>
                    {notification.msg}
                </div>
            )}

            <div className="d-flex h-100">
                {/* LEFT - Product Grid */}
                <div className="flex-grow-1 d-flex flex-column p-3" style={{ overflow: "hidden" }}>
                    {/* Search + Category */}
                    <div className="mb-2">
                        <input ref={searchRef} className="form-control mb-2" placeholder="🔍 Search products, strains, SKU..."
                            value={search} onChange={e => setSearch(e.target.value)} />
                        <div className="d-flex flex-wrap gap-1">
                            {categories.map(cat => (
                                <button key={cat} className={`btn btn-sm ${categoryFilter === cat ? "btn-success" : "btn-outline-success"}`}
                                    onClick={() => setCategoryFilter(cat)}>{cat}</button>
                            ))}
                        </div>
                    </div>

                    {/* Products */}
                    <div className="flex-grow-1 overflow-auto">
                        {loading ? (
                            <div className="text-center pt-5"><div className="spinner-border text-success" /></div>
                        ) : (
                            <div className="row g-2">
                                {filteredProducts.map(product => {
                                    const price = getPrice(product);
                                    const stock = product.stock || product.current_stock || 0;
                                    const inCart = cart.find(i => i.id === product.id);
                                    return (
                                        <div key={product.id} className="col-6 col-md-4 col-lg-3">
                                            <div className={`card h-100 pos-product-card ${inCart ? "border-success border-2" : ""}`}
                                                onClick={() => addToCart(product)}
                                                style={{ cursor: "pointer" }}>
                                                <div className="card-body p-2">
                                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                                        <span className={`badge ${product.strain === "Sativa" ? "bg-warning text-dark" : product.strain === "Indica" ? "bg-primary" : "bg-success"}`}>
                                                            {product.strain || product.category}
                                                        </span>
                                                        {inCart && <span className="badge bg-success">{inCart.quantity} in cart</span>}
                                                    </div>
                                                    <p className="fw-bold mb-1 small">{product.name}</p>
                                                    {product.thc_content > 0 && (
                                                        <p className="text-muted" style={{ fontSize: "11px" }}>THC: {product.thc_content}%</p>
                                                    )}
                                                    <div className="d-flex justify-content-between align-items-center mt-1">
                                                        <span className="text-success fw-bold">${price.toFixed(2)}</span>
                                                        <span className={`badge ${stock < 10 ? "bg-danger" : "bg-light text-dark"}`}>{stock} left</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {filteredProducts.length === 0 && (
                                    <div className="col-12 text-center py-5 text-muted">No products found</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT - Cart + Checkout */}
                <div className="d-flex flex-column bg-dark text-white" style={{ width: "380px", minWidth: "380px", overflow: "hidden" }}>
                    {/* Customer */}
                    <div className="p-3 border-bottom border-secondary">
                        {customer ? (
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>{customer.name}</strong>
                                    <span className={`badge ms-2 ${customer.membership === "gold" ? "bg-warning text-dark" : customer.membership === "premium" ? "bg-info" : "bg-secondary"}`}>
                                        {customer.membership}
                                    </span>
                                    <div className="small text-muted">🏆 {customer.loyalty_points || 0} points</div>
                                </div>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => setCustomer(null)}>✕</button>
                            </div>
                        ) : (
                            <div className="position-relative">
                                <input className="form-control form-control-sm bg-secondary text-white border-0"
                                    placeholder="👤 Search customer..."
                                    value={customerSearch}
                                    onChange={e => { setCustomerSearch(e.target.value); searchCustomers(e.target.value); }} />
                                {customerResults.length > 0 && (
                                    <div className="position-absolute w-100 bg-white text-dark rounded shadow" style={{ zIndex: 100, top: "100%" }}>
                                        {customerResults.map(c => (
                                            <div key={c.id} className="p-2 border-bottom" style={{ cursor: "pointer" }}
                                                onClick={() => { setCustomer(c); setCustomerSearch(""); setCustomerResults([]); }}>
                                                <strong>{c.name}</strong> <small className="text-muted">{c.phone}</small>
                                                <span className={`badge ms-1 ${c.membership === "gold" ? "bg-warning text-dark" : "bg-secondary"}`}>{c.membership}</span>
                                            </div>
                                        ))}
                                        <div className="p-2 text-muted small" style={{ cursor: "pointer" }}
                                            onClick={() => { setCustomerSearch(""); setCustomerResults([]); }}>
                                            Continue as Walk-in
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Cart Items */}
                    <div className="flex-grow-1 overflow-auto p-2">
                        {cart.length === 0 ? (
                            <div className="text-center text-muted pt-5">
                                <div style={{ fontSize: "3rem" }}>🛒</div>
                                <p>Cart is empty</p>
                                <p className="small">Click products to add</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="d-flex align-items-center gap-2 mb-2 p-2 bg-secondary rounded">
                                    <div className="flex-grow-1">
                                        <div className="small fw-bold">{item.name}</div>
                                        <div className="small text-light">${getPrice(item).toFixed(2)} each</div>
                                    </div>
                                    <div className="d-flex align-items-center gap-1">
                                        <button className="btn btn-sm btn-outline-light py-0 px-1" onClick={() => updateQty(item.id, -1)}>-</button>
                                        <span className="px-2">{item.quantity}</span>
                                        <button className="btn btn-sm btn-outline-light py-0 px-1" onClick={() => updateQty(item.id, 1)}>+</button>
                                    </div>
                                    <div className="text-end" style={{ minWidth: "60px" }}>
                                        <div className="small fw-bold">${(getPrice(item) * item.quantity).toFixed(2)}</div>
                                        <button className="btn btn-link btn-sm text-danger p-0" onClick={() => removeFromCart(item.id)}>✕</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Totals + Payment */}
                    <div className="p-3 border-top border-secondary">
                        {/* Discount */}
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <label className="small text-muted mb-0">Discount %</label>
                            <input type="number" className="form-control form-control-sm bg-secondary text-white border-0"
                                style={{ width: "80px" }} min="0" max="100" value={discount}
                                onChange={e => setDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))} />
                        </div>

                        {/* Totals */}
                        <div className="small mb-1 d-flex justify-content-between">
                            <span className="text-muted">Subtotal</span><span>${subtotal.toFixed(2)}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="small mb-1 d-flex justify-content-between text-success">
                                <span>Discount ({discount}%)</span><span>-${discountAmount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="small mb-2 d-flex justify-content-between">
                            <span className="text-muted">Tax (8%)</span><span>${taxAmount.toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between fw-bold fs-5 mb-3">
                            <span>TOTAL</span><span className="text-success">${total.toFixed(2)}</span>
                        </div>

                        {/* Payment Method */}
                        <div className="d-flex gap-1 mb-2">
                            {PAYMENT_METHODS.map(pm => (
                                <button key={pm} className={`btn btn-sm flex-grow-1 ${paymentMethod === pm ? "btn-success" : "btn-outline-secondary"}`}
                                    onClick={() => setPaymentMethod(pm)}>
                                    {pm === "cash" ? "💵" : pm === "card" ? "💳" : pm === "debit" ? "🏦" : "📝"}
                                    <span className="d-none d-md-inline ms-1 text-capitalize">{pm}</span>
                                </button>
                            ))}
                        </div>

                        {/* Cash Tendered */}
                        {paymentMethod === "cash" && (
                            <div className="mb-2">
                                <input type="number" className="form-control form-control-sm bg-secondary text-white border-0"
                                    placeholder="Cash tendered..." value={cashTendered}
                                    onChange={e => setCashTendered(e.target.value)} />
                                {cashTendered && parseFloat(cashTendered) >= total && (
                                    <div className="text-success small mt-1">Change due: ${changeDue.toFixed(2)}</div>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-danger btn-sm" onClick={clearCart} disabled={cart.length === 0}>
                                Clear
                            </button>
                            <button className="btn btn-success flex-grow-1"
                                onClick={handleCheckout}
                                disabled={cart.length === 0 || processing}>
                                {processing ? (
                                    <span className="spinner-border spinner-border-sm me-1" />
                                ) : "💰 "}
                                {processing ? "Processing..." : `Charge $${total.toFixed(2)}`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default POS;
