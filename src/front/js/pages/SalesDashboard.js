import React, { useState, useEffect } from "react";

const SalesDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("week");
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        Promise.all([
            fetch(`${process.env.BACKEND_URL}/api/orders`, { headers }).then(r => r.ok ? r.json() : []),
            fetch(`${process.env.BACKEND_URL}/api/analytics?type=sales`, { headers }).then(r => r.ok ? r.json() : {}),
            fetch(`${process.env.BACKEND_URL}/api/dashboard/metrics`, { headers }).then(r => r.ok ? r.json() : []),
        ]).then(([orders, analytics, metrics]) => {
            const orderList = Array.isArray(orders) ? orders : [];
            const completed = orderList.filter(o => o.status === "completed");
            const pending = orderList.filter(o => o.status === "pending");
            const totalRevenue = completed.reduce((s, o) => s + parseFloat(o.total_amount || 0), 0);
            const avgOrder = completed.length > 0 ? totalRevenue / completed.length : 0;
            setData({ orders: orderList, completed, pending, totalRevenue, avgOrder, analytics, metrics: Array.isArray(metrics) ? metrics : [] });
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2>📊 Sales Dashboard</h2><p>Revenue and order overview</p></div>
                <div className="d-flex gap-2">
                    {["day","week","month","year"].map(p => (
                        <button key={p} className={`btn btn-sm ${period===p?"btn-success":"btn-outline-light"}`} onClick={()=>setPeriod(p)}>{p.charAt(0).toUpperCase()+p.slice(1)}</button>
                    ))}
                </div>
            </div>

            <div className="row g-3 mb-4">
                {[
                    {l:"Total Revenue",v:`$${data?.totalRevenue?.toFixed(2)||"0.00"}`,c:"#2dce89"},
                    {l:"Total Orders",v:data?.orders?.length||0,c:"#11cdef"},
                    {l:"Completed",v:data?.completed?.length||0,c:"#2dce89"},
                    {l:"Pending",v:data?.pending?.length||0,c:"#ffd600"},
                    {l:"Avg Order Value",v:`$${data?.avgOrder?.toFixed(2)||"0.00"}`,c:"#fb6340"},
                ].map((s,i) => (
                    <div key={i} className="col-6 col-md">
                        <div className="glass-panel text-center">
                            <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>{s.l}</div>
                            <div style={{fontSize:"1.5rem",fontWeight:700,color:s.c,marginTop:"4px"}}>{s.v}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass-panel">
                <h5 className="mb-3">Recent Orders</h5>
                <div className="table-responsive">
                    <table className="table table-dark table-hover mb-0">
                        <thead><tr style={{color:"rgba(255,255,255,0.5)",fontSize:"0.8rem",textTransform:"uppercase"}}>
                            <th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th>
                        </tr></thead>
                        <tbody>
                            {(data?.orders||[]).slice(0,20).map(o => (
                                <tr key={o.id}>
                                    <td style={{fontWeight:600}}>#{o.id}</td>
                                    <td>Customer #{o.customer_id}</td>
                                    <td style={{color:"#2dce89",fontWeight:700}}>${parseFloat(o.total_amount||0).toFixed(2)}</td>
                                    <td><span className={`badge bg-${o.status==="completed"?"success":o.status==="pending"?"warning text-dark":"secondary"}`}>{o.status}</span></td>
                                    <td style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.5)"}}>{o.created_at?new Date(o.created_at).toLocaleDateString():"-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
export default SalesDashboard;
