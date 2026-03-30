#!/bin/bash
# ============================================================
# Fix all non-medical frontend pages
# Run from: /workspaces/DispensaryMaster2
# ============================================================

echo "Fixing non-medical frontend pages..."

# ============================================================
# 1. DASHBOARD - Replace static/placeholder data with real API
# ============================================================
cat > src/front/js/pages/Dashboard.js << 'EOF'
import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";
import { Link } from "react-router-dom";
import "../../styles/dashboard.css";

const StatCard = ({ title, value, icon, trend, color }) => (
    <div className={`stat-card ${color || "bg-white"}`}>
        <div className="stat-icon">{icon}</div>
        <div className="stat-info">
            <p className="stat-title">{title}</p>
            <p className="stat-value">{value}</p>
            {trend !== undefined && (
                <p className={`stat-trend ${trend >= 0 ? "trend-up" : "trend-down"}`}>
                    {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
                </p>
            )}
        </div>
    </div>
);

const Dashboard = () => {
    const { store, actions } = useContext(Context);
    const [metrics, setMetrics] = useState(null);
    const [topCategories, setTopCategories] = useState([]);
    const [salesPerformance, setSalesPerformance] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        Promise.all([
            fetch(`${process.env.BACKEND_URL}/api/products`, { headers }).then(r => r.json()),
            fetch(`${process.env.BACKEND_URL}/api/orders`, { headers }).then(r => r.json()),
            fetch(`${process.env.BACKEND_URL}/api/customers`, { headers }).then(r => r.json()),
            fetch(`${process.env.BACKEND_URL}/api/analytics/sales`, { headers }).then(r => r.json()).catch(() => ({})),
        ]).then(([products, orders, customers, sales]) => {
            const totalRevenue = Array.isArray(orders)
                ? orders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0)
                : 0;
            const completedOrders = Array.isArray(orders)
                ? orders.filter(o => o.status === "completed").length
                : 0;
            const lowStockItems = Array.isArray(products)
                ? products.filter(p => p.current_stock <= p.reorder_point)
                : [];

            setMetrics({
                totalRevenue: totalRevenue.toFixed(2),
                totalOrders: Array.isArray(orders) ? orders.length : 0,
                completedOrders,
                totalProducts: Array.isArray(products) ? products.length : 0,
                totalCustomers: Array.isArray(customers) ? customers.length : 0,
                lowStockCount: lowStockItems.length,
            });

            setLowStock(lowStockItems.slice(0, 5));

            const recent = Array.isArray(orders)
                ? [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)
                : [];
            setRecentOrders(recent);

            // Category breakdown
            if (Array.isArray(products)) {
                const cats = {};
                products.forEach(p => {
                    cats[p.category] = (cats[p.category] || 0) + 1;
                });
                const catList = Object.entries(cats)
                    .map(([category, count]) => ({ category, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);
                setTopCategories(catList);
            }

            if (sales.daily_sales) {
                setSalesPerformance(sales.daily_sales.slice(-7));
            }

            setLoading(false);
        }).catch(err => {
            console.error("Dashboard fetch error:", err);
            setLoading(false);
        });
    }, []);

    if (loading) return (
        <div className="main-content d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
            <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3 mb-0">Dispensary Dashboard</h1>
                <span className="text-muted">{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
            </div>

            {/* KPI Cards */}
            <div className="row g-3 mb-4">
                {[
                    { title: "Total Revenue", value: `$${parseFloat(metrics?.totalRevenue || 0).toLocaleString()}`, icon: "💰", color: "border-success" },
                    { title: "Total Orders", value: metrics?.totalOrders || 0, icon: "📋", color: "border-primary" },
                    { title: "Completed Orders", value: metrics?.completedOrders || 0, icon: "✅", color: "border-info" },
                    { title: "Products", value: metrics?.totalProducts || 0, icon: "🌿", color: "border-warning" },
                    { title: "Customers", value: metrics?.totalCustomers || 0, icon: "👥", color: "border-secondary" },
                    { title: "Low Stock Alerts", value: metrics?.lowStockCount || 0, icon: "⚠️", color: "border-danger" },
                ].map((card, i) => (
                    <div key={i} className="col-6 col-md-4 col-lg-2">
                        <div className={`card h-100 border-start border-3 ${card.color}`}>
                            <div className="card-body p-3">
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <p className="text-muted small mb-1">{card.title}</p>
                                        <h4 className="mb-0 fw-bold">{card.value}</h4>
                                    </div>
                                    <span style={{ fontSize: "1.8rem" }}>{card.icon}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row g-3 mb-4">
                {/* Recent Orders */}
                <div className="col-md-7">
                    <div className="card h-100">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Recent Orders</h5>
                            <Link to="/orders" className="btn btn-sm btn-outline-primary">View All</Link>
                        </div>
                        <div className="card-body p-0">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.length > 0 ? recentOrders.map(order => (
                                        <tr key={order.id}>
                                            <td>#{order.id}</td>
                                            <td>{order.customer_id}</td>
                                            <td>${parseFloat(order.total_amount).toFixed(2)}</td>
                                            <td>
                                                <span className={`badge ${
                                                    order.status === "completed" ? "bg-success" :
                                                    order.status === "pending" ? "bg-warning text-dark" :
                                                    "bg-secondary"
                                                }`}>{order.status}</span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="4" className="text-center text-muted py-3">No orders yet</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Top Categories */}
                <div className="col-md-5">
                    <div className="card h-100">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Product Categories</h5>
                            <Link to="/products" className="btn btn-sm btn-outline-primary">Manage</Link>
                        </div>
                        <div className="card-body">
                            {topCategories.length > 0 ? topCategories.map((cat, i) => (
                                <div key={i} className="mb-3">
                                    <div className="d-flex justify-content-between mb-1">
                                        <span>{cat.category}</span>
                                        <span className="text-muted">{cat.count} products</span>
                                    </div>
                                    <div className="progress" style={{ height: "6px" }}>
                                        <div
                                            className="progress-bar bg-success"
                                            style={{ width: `${(cat.count / (topCategories[0]?.count || 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )) : <p className="text-muted text-center py-3">No products yet</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Low Stock Alerts */}
            {lowStock.length > 0 && (
                <div className="card border-danger">
                    <div className="card-header bg-danger text-white d-flex justify-content-between">
                        <h5 className="mb-0">⚠️ Low Stock Alerts</h5>
                        <Link to="/inventory" className="btn btn-sm btn-light">Manage Inventory</Link>
                    </div>
                    <div className="card-body p-0">
                        <table className="table mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Current Stock</th>
                                    <th>Reorder Point</th>
                                    <th>Batch</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStock.map(p => (
                                    <tr key={p.id}>
                                        <td>{p.name}</td>
                                        <td>{p.category}</td>
                                        <td><span className="badge bg-danger">{p.current_stock}</span></td>
                                        <td>{p.reorder_point}</td>
                                        <td><code>{p.batch_number}</code></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="row g-3 mt-2">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header"><h5 className="mb-0">Quick Actions</h5></div>
                        <div className="card-body d-flex flex-wrap gap-2">
                            <Link to="/products" className="btn btn-success">+ Add Product</Link>
                            <Link to="/orders" className="btn btn-primary">+ New Order</Link>
                            <Link to="/pos" className="btn btn-warning text-dark">Open POS</Link>
                            <Link to="/barcode-scanner" className="btn btn-info text-white">Scan Barcode</Link>
                            <Link to="/inventory" className="btn btn-secondary">Update Inventory</Link>
                            <Link to="/reports" className="btn btn-outline-dark">View Reports</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
EOF
echo "✓ Dashboard.js"

# ============================================================
# 2. SHOP - Cannabis product storefront
# ============================================================
cat > src/front/js/pages/Shop.js << 'EOF'
import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";

const CATEGORIES = ["All", "Flower", "Edibles", "Concentrates", "Vapes", "Tinctures", "Topicals", "Pre-Rolls", "Accessories"];

const Shop = () => {
    const { store, actions } = useContext(Context);
    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [category, setCategory] = useState("All");
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("name");
    const [loading, setLoading] = useState(true);
    const [cartMsg, setCartMsg] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/products`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
            .then(r => r.json())
            .then(data => {
                const available = Array.isArray(data) ? data.filter(p => p.current_stock > 0) : [];
                setProducts(available);
                setFiltered(available);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        let result = [...products];
        if (category !== "All") result = result.filter(p => p.category === category);
        if (search) result = result.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.strain || "").toLowerCase().includes(search.toLowerCase())
        );
        if (sort === "price-asc") result.sort((a, b) => a.unit_price - b.unit_price);
        else if (sort === "price-desc") result.sort((a, b) => b.unit_price - a.unit_price);
        else if (sort === "thc") result.sort((a, b) => (b.thc_content || 0) - (a.thc_content || 0));
        else result.sort((a, b) => a.name.localeCompare(b.name));
        setFiltered(result);
    }, [category, search, sort, products]);

    const handleAddToCart = async (product) => {
        const result = await actions.addToCart(product, 1);
        if (result.success) {
            setCartMsg(`${product.name} added to cart!`);
            setTimeout(() => setCartMsg(""), 2500);
        }
    };

    const getStrainBadge = (strain) => {
        if (!strain) return null;
        const colors = { Sativa: "bg-warning text-dark", Indica: "bg-primary", Hybrid: "bg-success" };
        return <span className={`badge ${colors[strain] || "bg-secondary"} me-1`}>{strain}</span>;
    };

    if (loading) return (
        <div className="main-content d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
            <div className="spinner-border text-success" />
        </div>
    );

    return (
        <div className="main-content p-4">
            {cartMsg && (
                <div className="alert alert-success alert-dismissible position-fixed top-0 end-0 m-3" style={{ zIndex: 9999 }}>
                    {cartMsg}
                </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3 mb-0">🌿 Shop</h1>
                <button className="btn btn-outline-success" onClick={() => navigate("/cart-management")}>
                    🛒 Cart ({store.cartItems?.length || 0})
                </button>
            </div>

            {/* Filters */}
            <div className="row g-2 mb-4">
                <div className="col-md-4">
                    <input className="form-control" placeholder="Search strains, products..."
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="col-md-4">
                    <select className="form-select" value={sort} onChange={e => setSort(e.target.value)}>
                        <option value="name">Sort: Name</option>
                        <option value="price-asc">Sort: Price Low → High</option>
                        <option value="price-desc">Sort: Price High → Low</option>
                        <option value="thc">Sort: THC %</option>
                    </select>
                </div>
                <div className="col-md-4 text-muted d-flex align-items-center">
                    {filtered.length} product{filtered.length !== 1 ? "s" : ""} available
                </div>
            </div>

            {/* Category Tabs */}
            <div className="d-flex flex-wrap gap-2 mb-4">
                {CATEGORIES.map(cat => (
                    <button key={cat}
                        className={`btn btn-sm ${category === cat ? "btn-success" : "btn-outline-success"}`}
                        onClick={() => setCategory(cat)}>
                        {cat}
                    </button>
                ))}
            </div>

            {/* Product Grid */}
            {filtered.length === 0 ? (
                <div className="text-center py-5 text-muted">
                    <p className="fs-4">No products found</p>
                    <p>Try a different category or search term</p>
                </div>
            ) : (
                <div className="row g-3">
                    {filtered.map(product => (
                        <div key={product.id} className="col-sm-6 col-md-4 col-lg-3">
                            <div className="card h-100 product-card">
                                <div className="card-body d-flex flex-column">
                                    <div className="mb-2">
                                        {getStrainBadge(product.strain)}
                                        <span className="badge bg-light text-dark">{product.category}</span>
                                    </div>
                                    <h5 className="card-title">{product.name}</h5>
                                    {product.thc_content > 0 && (
                                        <p className="small text-muted mb-1">
                                            THC: {product.thc_content}%
                                            {product.cbd_content > 0 && ` | CBD: ${product.cbd_content}%`}
                                        </p>
                                    )}
                                    <p className="small text-muted mb-2">
                                        Stock: <span className={product.current_stock < 10 ? "text-danger fw-bold" : "text-success"}>
                                            {product.current_stock} units
                                        </span>
                                    </p>
                                    <div className="mt-auto d-flex justify-content-between align-items-center">
                                        <span className="fs-5 fw-bold text-success">
                                            ${parseFloat(product.unit_price).toFixed(2)}
                                        </span>
                                        <button
                                            className="btn btn-sm btn-success"
                                            onClick={() => handleAddToCart(product)}
                                            disabled={product.current_stock === 0}
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Shop;
EOF
echo "✓ Shop.js"

# ============================================================
# 3. INVENTORY - Full inventory management
# ============================================================
cat > src/front/js/pages/Inventory.js << 'EOF'
import React, { useState, useEffect } from "react";

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState({});
    const [stockInputs, setStockInputs] = useState({});

    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

    useEffect(() => { fetchInventory(); }, []);

    useEffect(() => {
        let result = [...products];
        if (filter === "low") result = result.filter(p => p.current_stock <= p.reorder_point);
        else if (filter === "out") result = result.filter(p => p.current_stock === 0);
        else if (filter === "ok") result = result.filter(p => p.current_stock > p.reorder_point);
        if (search) result = result.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.batch_number?.toLowerCase().includes(search.toLowerCase()) ||
            p.category?.toLowerCase().includes(search.toLowerCase())
        );
        setFiltered(result);
    }, [products, search, filter]);

    const fetchInventory = async () => {
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/products`, { headers });
            const data = await r.json();
            setProducts(Array.isArray(data) ? data : []);
            const inputs = {};
            if (Array.isArray(data)) data.forEach(p => { inputs[p.id] = p.current_stock; });
            setStockInputs(inputs);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const updateStock = async (productId) => {
        const newStock = parseInt(stockInputs[productId]);
        if (isNaN(newStock) || newStock < 0) return alert("Invalid stock value");
        setUpdating(prev => ({ ...prev, [productId]: true }));
        try {
            const product = products.find(p => p.id === productId);
            const r = await fetch(`${process.env.BACKEND_URL}/api/products/${productId}`, {
                method: "PUT",
                headers,
                body: JSON.stringify({ ...product, current_stock: newStock })
            });
            if (r.ok) {
                setProducts(prev => prev.map(p => p.id === productId ? { ...p, current_stock: newStock } : p));
            }
        } catch (e) { console.error(e); }
        finally { setUpdating(prev => ({ ...prev, [productId]: false })); }
    };

    const getStockStatus = (product) => {
        if (product.current_stock === 0) return { label: "Out of Stock", color: "danger" };
        if (product.current_stock <= product.reorder_point) return { label: "Low Stock", color: "warning" };
        return { label: "In Stock", color: "success" };
    };

    const stats = {
        total: products.length,
        low: products.filter(p => p.current_stock <= p.reorder_point && p.current_stock > 0).length,
        out: products.filter(p => p.current_stock === 0).length,
        value: products.reduce((sum, p) => sum + (p.current_stock * p.unit_price), 0).toFixed(2)
    };

    if (loading) return (
        <div className="main-content d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
            <div className="spinner-border text-success" />
        </div>
    );

    return (
        <div className="main-content p-4">
            <h1 className="h3 mb-4">Inventory Management</h1>

            {/* Stats */}
            <div className="row g-3 mb-4">
                {[
                    { label: "Total SKUs", value: stats.total, color: "primary" },
                    { label: "Low Stock", value: stats.low, color: "warning" },
                    { label: "Out of Stock", value: stats.out, color: "danger" },
                    { label: "Total Value", value: `$${parseFloat(stats.value).toLocaleString()}`, color: "success" },
                ].map((s, i) => (
                    <div key={i} className="col-6 col-md-3">
                        <div className={`card border-${s.color} border-start border-3`}>
                            <div className="card-body py-3">
                                <p className="text-muted small mb-1">{s.label}</p>
                                <h4 className={`mb-0 text-${s.color}`}>{s.value}</h4>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="row g-2 mb-3">
                <div className="col-md-5">
                    <input className="form-control" placeholder="Search by name, batch, category..."
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="col-md-4">
                    <div className="btn-group w-100">
                        {["all", "low", "out", "ok"].map(f => (
                            <button key={f} className={`btn btn-sm ${filter === f ? "btn-success" : "btn-outline-success"}`}
                                onClick={() => setFilter(f)}>
                                {f === "all" ? "All" : f === "low" ? "Low Stock" : f === "out" ? "Out of Stock" : "In Stock"}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead className="table-dark">
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Batch #</th>
                                <th>THC/CBD</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Update Stock</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? filtered.map(product => {
                                const status = getStockStatus(product);
                                return (
                                    <tr key={product.id}>
                                        <td><strong>{product.name}</strong></td>
                                        <td>{product.category}</td>
                                        <td><code>{product.batch_number}</code></td>
                                        <td>
                                            {product.thc_content > 0 && <span className="badge bg-warning text-dark me-1">THC {product.thc_content}%</span>}
                                            {product.cbd_content > 0 && <span className="badge bg-info me-1">CBD {product.cbd_content}%</span>}
                                        </td>
                                        <td>${parseFloat(product.unit_price).toFixed(2)}</td>
                                        <td><span className={`badge bg-${status.color}`}>{status.label} ({product.current_stock})</span></td>
                                        <td>
                                            <div className="d-flex gap-1">
                                                <input type="number" className="form-control form-control-sm" style={{ width: "80px" }}
                                                    value={stockInputs[product.id] ?? product.current_stock}
                                                    min="0"
                                                    onChange={e => setStockInputs(prev => ({ ...prev, [product.id]: e.target.value }))} />
                                                <button className="btn btn-sm btn-success"
                                                    onClick={() => updateStock(product.id)}
                                                    disabled={updating[product.id]}>
                                                    {updating[product.id] ? "..." : "Save"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr><td colSpan="7" className="text-center py-4 text-muted">No inventory items found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Inventory;
EOF
echo "✓ Inventory.js"

# ============================================================
# 4. PRICE COMPARISON - Fix hardcoded localhost
# ============================================================
cat > src/front/js/pages/PriceComparison.js << 'EOF'
import React, { useState, useEffect } from "react";

const PriceComparison = () => {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [strainFilter, setStrainFilter] = useState("All");
    const [sortBy, setSortBy] = useState("price-asc");
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/products`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => {
                setProducts(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const strains = ["All", "Sativa", "Indica", "Hybrid"];

    const filtered = products
        .filter(p => strainFilter === "All" || p.strain === strainFilter)
        .filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.strain || "").toLowerCase().includes(search.toLowerCase()) ||
            p.category.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === "price-asc") return a.unit_price - b.unit_price;
            if (sortBy === "price-desc") return b.unit_price - a.unit_price;
            if (sortBy === "thc") return (b.thc_content || 0) - (a.thc_content || 0);
            if (sortBy === "name") return a.name.localeCompare(b.name);
            return 0;
        });

    const avgPrice = filtered.length
        ? (filtered.reduce((s, p) => s + parseFloat(p.unit_price), 0) / filtered.length).toFixed(2)
        : "0.00";
    const minPrice = filtered.length
        ? Math.min(...filtered.map(p => parseFloat(p.unit_price))).toFixed(2)
        : "0.00";
    const maxPrice = filtered.length
        ? Math.max(...filtered.map(p => parseFloat(p.unit_price))).toFixed(2)
        : "0.00";

    if (loading) return (
        <div className="main-content d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
            <div className="spinner-border text-success" />
        </div>
    );

    return (
        <div className="main-content p-4">
            <h1 className="h3 mb-4">Price Comparison</h1>

            {/* Summary */}
            <div className="row g-3 mb-4">
                {[
                    { label: "Products Compared", value: filtered.length, icon: "🌿" },
                    { label: "Lowest Price", value: `$${minPrice}`, icon: "⬇️" },
                    { label: "Average Price", value: `$${avgPrice}`, icon: "📊" },
                    { label: "Highest Price", value: `$${maxPrice}`, icon: "⬆️" },
                ].map((s, i) => (
                    <div key={i} className="col-6 col-md-3">
                        <div className="card text-center">
                            <div className="card-body py-3">
                                <div style={{ fontSize: "1.5rem" }}>{s.icon}</div>
                                <h5 className="mb-0">{s.value}</h5>
                                <small className="text-muted">{s.label}</small>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="row g-2 mb-3">
                <div className="col-md-4">
                    <input className="form-control" placeholder="Search by name, strain, category..."
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="col-md-3">
                    <select className="form-select" value={strainFilter} onChange={e => setStrainFilter(e.target.value)}>
                        {strains.map(s => <option key={s}>{s}</option>)}
                    </select>
                </div>
                <div className="col-md-3">
                    <select className="form-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                        <option value="price-asc">Price: Low → High</option>
                        <option value="price-desc">Price: High → Low</option>
                        <option value="thc">Highest THC</option>
                        <option value="name">Name A→Z</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead className="table-dark">
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Strain</th>
                                <th>THC %</th>
                                <th>CBD %</th>
                                <th>Price/Unit</th>
                                <th>Stock</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? filtered.map((p, i) => (
                                <tr key={p.id} className={i === 0 && sortBy === "price-asc" ? "table-success" : ""}>
                                    <td>
                                        <strong>{p.name}</strong>
                                        {i === 0 && sortBy === "price-asc" && (
                                            <span className="badge bg-success ms-2">Best Price</span>
                                        )}
                                    </td>
                                    <td>{p.category}</td>
                                    <td>
                                        {p.strain && (
                                            <span className={`badge ${
                                                p.strain === "Sativa" ? "bg-warning text-dark" :
                                                p.strain === "Indica" ? "bg-primary" : "bg-success"
                                            }`}>{p.strain}</span>
                                        )}
                                    </td>
                                    <td>{p.thc_content > 0 ? `${p.thc_content}%` : "-"}</td>
                                    <td>{p.cbd_content > 0 ? `${p.cbd_content}%` : "-"}</td>
                                    <td><strong>${parseFloat(p.unit_price).toFixed(2)}</strong></td>
                                    <td>
                                        <span className={`badge ${p.current_stock === 0 ? "bg-danger" : p.current_stock < 10 ? "bg-warning text-dark" : "bg-success"}`}>
                                            {p.current_stock}
                                        </span>
                                    </td>
                                    <td>${(p.current_stock * parseFloat(p.unit_price)).toFixed(2)}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan="8" className="text-center py-4 text-muted">No products found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PriceComparison;
EOF
echo "✓ PriceComparison.js"

# ============================================================
# 5. CART - Fix API URLs (remove hardcoded /cart, use BACKEND_URL)
# ============================================================
cat > src/front/js/pages/CartManagement.js << 'EOF'
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

    const cart = store.cartItems || [];

    const subtotal = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
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
                                                <span className="text-success fw-bold">${parseFloat(item.unit_price).toFixed(2)}</span>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="input-group input-group-sm">
                                                    <button className="btn btn-outline-secondary" onClick={() => handleUpdateQty(item, item.quantity - 1)}>-</button>
                                                    <span className="input-group-text">{item.quantity}</span>
                                                    <button className="btn btn-outline-secondary" onClick={() => handleUpdateQty(item, item.quantity + 1)}>+</button>
                                                </div>
                                            </div>
                                            <div className="col-md-2 text-end">
                                                <div className="fw-bold">${(item.unit_price * item.quantity).toFixed(2)}</div>
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
EOF
echo "✓ CartManagement.js"

# ============================================================
# 6. INVENTORY COMPONENT - Fix socket and API URLs
# ============================================================
cat > src/front/js/component/InventoryComponent.js << 'EOF'
import React, { useEffect, useState } from "react";

const InventoryComponent = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [updating, setUpdating] = useState({});

    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/products`, { headers });
            const data = await r.json();
            setProducts(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const updateStock = async (product, delta) => {
        const newStock = Math.max(0, product.current_stock + delta);
        setUpdating(prev => ({ ...prev, [product.id]: true }));
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/products/${product.id}`, {
                method: "PUT", headers,
                body: JSON.stringify({ ...product, current_stock: newStock })
            });
            if (r.ok) {
                setProducts(prev => prev.map(p => p.id === product.id ? { ...p, current_stock: newStock } : p));
            }
        } catch (e) { console.error(e); }
        finally { setUpdating(prev => ({ ...prev, [product.id]: false })); }
    };

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.batch_number?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="text-center py-4"><div className="spinner-border text-success" /></div>;

    return (
        <div>
            <input className="form-control mb-3" placeholder="Search products..."
                value={search} onChange={e => setSearch(e.target.value)} />
            <div className="row g-3">
                {filtered.map(item => (
                    <div key={item.id} className="col-md-4">
                        <div className={`card ${item.current_stock <= item.reorder_point ? "border-danger" : ""}`}>
                            <div className="card-body">
                                <h6 className="card-title">{item.name}</h6>
                                <p className="small text-muted mb-1">{item.category} {item.strain && `· ${item.strain}`}</p>
                                <p className="small mb-1">Batch: <code>{item.batch_number}</code></p>
                                <div className="d-flex align-items-center gap-2 mt-2">
                                    <button className="btn btn-sm btn-outline-danger"
                                        onClick={() => updateStock(item, -1)}
                                        disabled={updating[item.id]}>-</button>
                                    <span className={`badge ${item.current_stock === 0 ? "bg-danger" : item.current_stock <= item.reorder_point ? "bg-warning text-dark" : "bg-success"}`}>
                                        {item.current_stock} units
                                    </span>
                                    <button className="btn btn-sm btn-outline-success"
                                        onClick={() => updateStock(item, 1)}
                                        disabled={updating[item.id]}>+</button>
                                </div>
                                {item.current_stock <= item.reorder_point && (
                                    <small className="text-danger d-block mt-1">⚠️ Below reorder point ({item.reorder_point})</small>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && <p className="text-muted text-center py-3">No inventory items found</p>}
            </div>
        </div>
    );
};

export default InventoryComponent;
EOF
echo "✓ InventoryComponent.js"

echo ""
echo "============================================================"
echo "✅ ALL NON-MEDICAL PAGES FIXED"
echo "============================================================"
echo ""
echo "Pages updated:"
echo "  ✓ Dashboard.js - Real API data, KPIs, low stock alerts, quick actions"
echo "  ✓ Shop.js - Full cannabis storefront with cart integration"
echo "  ✓ Inventory.js - Full inventory management with stock updates"
echo "  ✓ PriceComparison.js - Fixed localhost, real product comparison"
echo "  ✓ CartManagement.js - Fixed API URLs, quantity controls, discount codes"
echo "  ✓ InventoryComponent.js - Fixed socket issues, real API calls"
echo ""
echo "Deals, Orders, Products, Stores, Suppliers, Users, BarcodeScanner"
echo "were already functional - no changes needed."
