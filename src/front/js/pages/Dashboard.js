import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";
import { Link, useNavigate } from "react-router-dom";

const StatCard = ({ title, value, icon, trend, color }) => (
    <div className="glass-panel d-flex align-items-center gap-3">
        <div style={{fontSize:"2rem"}}>{icon}</div>
        <div>
            <p style={{fontSize:"0.75rem", color:"rgba(255,255,255,0.55)", textTransform:"uppercase", letterSpacing:"0.5px", margin:0}}>{title}</p>
            <p style={{fontSize:"1.6rem", fontWeight:700, color:"#fff8e1", margin:0}}>{value}</p>
            {trend !== undefined && (
                <p style={{fontSize:"0.75rem", color: trend >= 0 ? "#2dce89" : "#f5365c", margin:0}}>
                    {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
                </p>
            )}
        </div>
    </div>
);

const Dashboard = () => {
    const { store, actions } = useContext(Context);
    const [metrics, setMetrics] = useState(null);
    const [lowStock, setLowStock] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        const load = async () => {
            try {
                const [analyticsR, productsR, ordersR] = await Promise.all([
                    fetch(`${process.env.BACKEND_URL}/api/analytics?type=sales`, { headers }),
                    fetch(`${process.env.BACKEND_URL}/api/products`, { headers }),
                    fetch(`${process.env.BACKEND_URL}/api/orders`, { headers })
                ]);
                const analytics = analyticsR.ok ? await analyticsR.json() : {};
                const products = productsR.ok ? await productsR.json() : [];
                const orders = ordersR.ok ? await ordersR.json() : [];

                setMetrics({
                    total_sales: analytics.total_sales || 0,
                    order_count: analytics.order_count || 0,
                    total_products: Array.isArray(products) ? products.length : 0,
                    low_stock: Array.isArray(products) ? products.filter(p => (p.stock || 0) <= (p.reorder_point || 0)).length : 0,
                });
                setLowStock(Array.isArray(products) ? products.filter(p => (p.stock || 0) <= (p.reorder_point || 0)).slice(0, 5) : []);
                setRecentOrders(Array.isArray(orders) ? orders.slice(0, 5) : []);
            } catch(e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    if (loading) return (
        <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}>
            <div className="spinner-border text-light" />
        </div>
    );

    return (
        <div className="main-content p-4">
            <div className="page-header mb-4">
                <h2 style={{ color: "#ffab00", fontWeight: 800 }}>Dashboard</h2>
                <p>Welcome back — here's what's happening today</p>
            </div>

            {/* KPI Cards */}
            <div className="row g-3 mb-4">
                {[
                    { title:"Total Sales", value:`$${(metrics?.total_sales || 0).toFixed(2)}`, icon:"💰", trend: 5 },
                    { title:"Orders", value: metrics?.order_count || 0, icon:"📦", trend: 2 },
                    { title:"Products", value: metrics?.total_products || 0, icon:"🌿", trend: 0 },
                    { title:"Low Stock", value: metrics?.low_stock || 0, icon:"⚠️", trend: metrics?.low_stock > 0 ? -10 : 0 },
                ].map((s, i) => (
                    <div key={i} className="col-6 col-md-3">
                        <StatCard {...s} />
                    </div>
                ))}
            </div>

            <div className="row g-3">
                {/* Recent Orders */}
                <div className="col-md-7">
                    <div className="glass-panel h-100">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">Recent Orders</h5>
                            <Link to="/orders" className="btn btn-sm btn-outline-light">View All</Link>
                        </div>
                        {recentOrders.length === 0 ? (
                            <p style={{color:"rgba(255,255,255,0.5)"}} className="text-center py-3">No orders yet</p>
                        ) : (
                            <table className="table table-sm mb-0">
                                <thead>
                                    <tr>
                                        <th>Order #</th>
                                        <th>Customer</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map(o => (
                                        <tr key={o.id}>
                                            <td>#{o.id}</td>
                                            <td>Customer {o.customer_id}</td>
                                            <td className="text-success">${parseFloat(o.total_amount || 0).toFixed(2)}</td>
                                            <td><span className={`badge bg-${o.status === "completed" ? "success" : o.status === "pending" ? "warning" : "secondary"}`}>{o.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="col-md-5">
                    <div className="glass-panel h-100">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">⚠️ Low Stock</h5>
                            <Link to="/inventory" className="btn btn-sm btn-outline-warning">Manage</Link>
                        </div>
                        {lowStock.length === 0 ? (
                            <p style={{color:"rgba(255,255,255,0.5)"}} className="text-center py-3">✅ All stock levels OK</p>
                        ) : (
                            lowStock.map(p => (
                                <div key={p.id} className="d-flex justify-content-between align-items-center mb-2 p-2 rounded"
                                    style={{background:"rgba(245,54,92,0.1)", border:"1px solid rgba(245,54,92,0.3)"}}>
                                    <div>
                                        <div style={{fontSize:"0.85rem", fontWeight:600}}>{p.name}</div>
                                        <div style={{fontSize:"0.75rem", color:"rgba(255,255,255,0.55)"}}>{p.category}</div>
                                    </div>
                                    <span className={`badge ${p.stock === 0 ? "bg-danger" : "bg-warning text-dark"}`}>
                                        {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="row g-3 mt-1">
                <div className="col-12">
                    <div className="glass-panel">
                        <h5 className="mb-3">Quick Actions</h5>
                        <div className="d-flex flex-wrap gap-2">
                            {[
                                { label:"+ New Product", to:"/products", color:"success" },
                                { label:"+ New Order", to:"/orders", color:"primary" },
                                { label:"Open POS", to:"/pos", color:"warning" },
                                { label:"View Inventory", to:"/inventory", color:"info" },
                                { label:"Post a Job", to:"/jobs/post", color:"secondary" },
                            ].map((a, i) => (
                                <Link key={i} to={a.to} className={`btn btn-${a.color} btn-sm`}>{a.label}</Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Dashboard;
