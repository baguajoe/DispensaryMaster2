import React, { useState, useEffect } from "react";
const CustomerDashboard = () => {
    const [stats, setStats] = useState({});
    const token = localStorage.getItem("token");
    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/dashboard/metrics`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.ok ? r.json() : {}).then(setStats).catch(() => {});
    }, []);
    return (
        <div className="main-content p-4">
            <h2 style={{color:"#ffab00"}}>Customer Dashboard</h2>
            <div className="row g-3 mt-2">
                {[{label:"Total Orders",value:stats.order_count||0,icon:"📦"},{label:"Total Sales",value:`$${(stats.total_sales||0).toFixed(2)}`,icon:"💰"},{label:"Active Patients",value:stats.active_patients||0,icon:"💊"},{label:"Low Stock Items",value:stats.low_stock_count||0,icon:"⚠️"}].map((s,i)=>(
                    <div key={i} className="col-6 col-md-3">
                        <div className="glass-panel text-center">
                            <div style={{fontSize:"2rem"}}>{s.icon}</div>
                            <div style={{fontSize:"1.5rem",fontWeight:800,color:"#ffab00"}}>{s.value}</div>
                            <div style={{fontSize:"0.8rem",color:"rgba(255,248,225,0.6)"}}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default CustomerDashboard;