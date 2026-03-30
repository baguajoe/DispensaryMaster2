import React, { useState, useEffect } from "react";

const Analytics = () => {
    const [salesData, setSalesData] = useState(null);
    const [inventoryData, setInventoryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        Promise.all([
            fetch(`${process.env.BACKEND_URL}/api/analytics?type=sales`, { headers }).then(r => r.ok ? r.json() : null),
            fetch(`${process.env.BACKEND_URL}/api/analytics?type=inventory`, { headers }).then(r => r.ok ? r.json() : null)
        ]).then(([sales, inv]) => { setSalesData(sales); setInventoryData(inv); setLoading(false); })
        .catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light" /></div>;

    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2>Analytics</h2><p>Sales performance and inventory insights</p></div>
            <div className="row g-3 mb-4">
                {[
                    { title:"Total Revenue", value:`$${(salesData?.total_sales||0).toFixed(2)}`, icon:"💰", color:"#2dce89" },
                    { title:"Completed Orders", value: salesData?.order_count||0, icon:"📦", color:"#11cdef" },
                    { title:"Avg Order Value", value: salesData?.order_count > 0 ? `$${(salesData.total_sales/salesData.order_count).toFixed(2)}` : "$0", icon:"📊", color:"#fb6340" },
                    { title:"Low Stock Items", value: inventoryData?.low_stock_count||0, icon:"⚠️", color:"#ffd600" },
                ].map((s,i) => (
                    <div key={i} className="col-6 col-md-3">
                        <div className="glass-panel text-center">
                            <div style={{fontSize:"2rem"}}>{s.icon}</div>
                            <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.55)",textTransform:"uppercase",margin:"0.5rem 0 0.25rem"}}>{s.title}</div>
                            <div style={{fontSize:"1.5rem",fontWeight:700,color:s.color}}>{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="row g-3">
                <div className="col-md-6">
                    <div className="glass-panel">
                        <h5 className="mb-3">Sales Summary</h5>
                        <div className="d-flex justify-content-between mb-2"><span style={{color:"rgba(255,255,255,0.6)"}}>Total Revenue</span><strong className="text-success">${(salesData?.total_sales||0).toFixed(2)}</strong></div>
                        <div className="d-flex justify-content-between mb-2"><span style={{color:"rgba(255,255,255,0.6)"}}>Orders</span><strong>{salesData?.order_count||0}</strong></div>
                        <div className="d-flex justify-content-between"><span style={{color:"rgba(255,255,255,0.6)"}}>Avg Order</span><strong>${salesData?.order_count > 0 ? (salesData.total_sales/salesData.order_count).toFixed(2) : "0.00"}</strong></div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="glass-panel">
                        <h5 className="mb-3">Inventory Alerts</h5>
                        {(inventoryData?.low_stock_products||[]).length === 0
                            ? <p className="text-center" style={{color:"rgba(255,255,255,0.5)"}}>✅ All stock levels OK</p>
                            : (inventoryData.low_stock_products||[]).slice(0,6).map(p => (
                                <div key={p.id} className="d-flex justify-content-between mb-2">
                                    <span style={{fontSize:"0.85rem",color:"rgba(255,255,255,0.7)"}}>{p.name}</span>
                                    <span className={`badge ${p.stock===0?"bg-danger":"bg-warning text-dark"}`}>{p.stock} left</span>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Analytics;
