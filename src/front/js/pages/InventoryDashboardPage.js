import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const InventoryDashboardPage = () => {
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [warehouse, setWarehouse] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        Promise.all([
            fetch(`${process.env.BACKEND_URL}/api/inventory/analytics`, { headers }).then(r => r.ok ? r.json() : {}),
            fetch(`${process.env.BACKEND_URL}/api/warehouse/inventory`, { headers }).then(r => r.ok ? r.json() : {}),
        ]).then(([ana, ware]) => {
            setAnalytics(ana);
            setWarehouse(ware);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const QUICK_LINKS = [
        {label:"Inventory List", path:"/inventory-page", icon:"📦", color:"#11cdef"},
        {label:"Stock Alerts", path:"/stock-alerts", icon:"⚠️", color:"#ffd600"},
        {label:"Products", path:"/products", icon:"🌿", color:"#2dce89"},
        {label:"Metrc Sync", path:"/metrc", icon:"🔄", color:"#fb6340"},
        {label:"Multi-Location", path:"/multi-location", icon:"🏪", color:"#f5365c"},
        {label:"Suppliers", path:"/suppliers", icon:"🚚", color:"#2dce89"},
    ];

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;

    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2 style={{ color: "#ffab00", fontWeight: 800 }}>📊 Inventory Dashboard</h2><p>Stock overview and analytics</p></div>

            <div className="row g-3 mb-4">
                {[
                    {l:"Total Products", v:analytics?.total_products||0, c:"#11cdef"},
                    {l:"Total Value", v:`$${(analytics?.total_inventory_value||0).toFixed(0)}`, c:"#2dce89"},
                    {l:"Low Stock Items", v:analytics?.low_stock_count||0, c:"#ffd600"},
                    {l:"Out of Stock", v:analytics?.out_of_stock_count||0, c:"#f5365c"},
                ].map((s,i) => (
                    <div key={i} className="col-6 col-md-3"><div className="glass-panel text-center">
                        <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>{s.l}</div>
                        <div style={{fontSize:"1.8rem",fontWeight:700,color:s.c,marginTop:"4px"}}>{s.v}</div>
                    </div></div>
                ))}
            </div>

            <h5 className="mb-3">Quick Access</h5>
            <div className="row g-3 mb-4">
                {QUICK_LINKS.map((link,i) => (
                    <div key={i} className="col-6 col-md-4">
                        <div className="glass-panel text-center py-3" style={{cursor:"pointer",borderColor:`${link.color}33`}}
                            onClick={() => navigate(link.path)}
                            onMouseEnter={e=>e.currentTarget.style.borderColor=link.color}
                            onMouseLeave={e=>e.currentTarget.style.borderColor=`${link.color}33`}>
                            <div style={{fontSize:"1.8rem"}}>{link.icon}</div>
                            <div style={{fontWeight:600,color:link.color,marginTop:"4px",fontSize:"0.9rem"}}>{link.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {analytics?.low_stock_products?.length > 0 && (
                <div className="glass-panel">
                    <h5 className="mb-3" style={{color:"#ffd600"}}>⚠️ Low Stock Alert</h5>
                    <div className="table-responsive">
                        <table className="table table-dark table-hover mb-0">
                            <thead><tr style={{color:"rgba(255,255,255,0.5)",fontSize:"0.8rem"}}><th>Product</th><th>Category</th><th>Stock</th><th>Reorder At</th></tr></thead>
                            <tbody>
                                {analytics.low_stock_products.slice(0,10).map(p => (
                                    <tr key={p.id}>
                                        <td style={{fontWeight:600}}>{p.name}</td>
                                        <td><span className="badge bg-secondary">{p.category}</span></td>
                                        <td style={{color:"#ffd600",fontWeight:700}}>{p.current_stock}</td>
                                        <td style={{color:"rgba(255,255,255,0.5)"}}>{p.reorder_point}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
export default InventoryDashboardPage;
