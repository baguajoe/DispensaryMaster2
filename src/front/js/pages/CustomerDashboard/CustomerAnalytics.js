import React, { useState, useEffect } from "react";

const CustomerAnalytics = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/customer/orders`, {
            headers: { Authorization:`Bearer ${token}` }
        })
            .then(r => r.ok ? r.json() : [])
            .then(data => { setOrders(Array.isArray(data)?data:[]); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const totalSpent = orders.reduce((s,o) => s+parseFloat(o.total_amount||0), 0);
    const avgOrder = orders.length > 0 ? totalSpent/orders.length : 0;
    const completed = orders.filter(o=>o.status==="completed").length;

    // Spending by month
    const byMonth = {};
    orders.forEach(o => {
        if (!o.created_at) return;
        const month = new Date(o.created_at).toLocaleDateString("en-US",{month:"short",year:"2-digit"});
        byMonth[month] = (byMonth[month]||0) + parseFloat(o.total_amount||0);
    });

    // Category breakdown from order items
    const byCategory = {};
    orders.forEach(o => {
        (o.items||[]).forEach(item => {
            const cat = "Cannabis Products";
            byCategory[cat] = (byCategory[cat]||0) + parseFloat(item.subtotal||0);
        });
    });

    const maxMonthly = Math.max(...Object.values(byMonth), 1);

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light" /></div>;

    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2 style={{ color: "#ffab00", fontWeight: 800 }}>📊 My Analytics</h2><p>Your purchase history and spending insights</p></div>

            <div className="row g-3 mb-4">
                {[
                    { label:"Total Orders", value:orders.length, color:"#11cdef" },
                    { label:"Total Spent", value:`$${totalSpent.toFixed(2)}`, color:"#2dce89" },
                    { label:"Avg Order", value:`$${avgOrder.toFixed(2)}`, color:"#fb6340" },
                    { label:"Completed", value:completed, color:"#2dce89" },
                ].map((s,i) => (
                    <div key={i} className="col-6 col-md-3">
                        <div className="glass-panel text-center">
                            <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>{s.label}</div>
                            <div style={{fontSize:"1.8rem",fontWeight:700,color:s.color}}>{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row g-3">
                <div className="col-md-8">
                    <div className="glass-panel">
                        <h5 className="mb-3">Monthly Spending</h5>
                        {Object.keys(byMonth).length === 0 ? (
                            <p className="text-center" style={{color:"rgba(255,255,255,0.5)"}}>No spending data yet</p>
                        ) : Object.entries(byMonth).slice(-6).map(([month, amount]) => (
                            <div key={month} className="mb-3">
                                <div className="d-flex justify-content-between mb-1">
                                    <span style={{fontSize:"0.85rem"}}>{month}</span>
                                    <span style={{fontSize:"0.85rem",color:"#2dce89"}}>${amount.toFixed(2)}</span>
                                </div>
                                <div className="progress" style={{height:"8px",background:"rgba(255,255,255,0.1)"}}>
                                    <div className="progress-bar bg-success" style={{width:`${(amount/maxMonthly)*100}%`}} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="glass-panel">
                        <h5 className="mb-3">Order Status</h5>
                        {[
                            { label:"Completed", count:orders.filter(o=>o.status==="completed").length, color:"#2dce89" },
                            { label:"Pending", count:orders.filter(o=>o.status==="pending").length, color:"#ffd600" },
                            { label:"Cancelled", count:orders.filter(o=>o.status==="cancelled"||o.status==="canceled").length, color:"#f5365c" },
                        ].map((s,i) => (
                            <div key={i} className="d-flex justify-content-between align-items-center mb-3">
                                <div className="d-flex align-items-center gap-2">
                                    <div style={{width:"10px",height:"10px",borderRadius:"50%",background:s.color}} />
                                    <span style={{fontSize:"0.85rem"}}>{s.label}</span>
                                </div>
                                <span style={{fontWeight:600,color:s.color}}>{s.count}</span>
                            </div>
                        ))}
                        <hr style={{borderColor:"rgba(255,255,255,0.1)"}} />
                        <div className="text-center">
                            <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>Completion Rate</div>
                            <div style={{fontSize:"1.5rem",fontWeight:700,color:"#2dce89"}}>
                                {orders.length > 0 ? Math.round((orders.filter(o=>o.status==="completed").length/orders.length)*100) : 0}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default CustomerAnalytics;
