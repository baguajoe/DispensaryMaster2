import React, { useState, useEffect } from "react";
const RevenueReports = () => {
    const [data, setData] = useState({ data: [], total_revenue: 0, order_count: 0 });
    const [period, setPeriod] = useState("monthly");
    const token = localStorage.getItem("token");
    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/reports/revenue?period=${period}`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.ok ? r.json() : {}).then(d => setData(d || {})).catch(() => {});
    }, [period]);
    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 style={{color:"#ffab00"}}>Revenue Reports</h2>
                <div className="d-flex gap-2">
                    {["daily","weekly","monthly"].map(p => (
                        <button key={p} onClick={() => setPeriod(p)} className={period===p?"btn btn-primary btn-sm":"btn btn-outline-secondary btn-sm"}>{p.charAt(0).toUpperCase()+p.slice(1)}</button>
                    ))}
                </div>
            </div>
            <div className="row g-3 mb-4">
                <div className="col-md-4"><div className="glass-panel text-center"><div style={{fontSize:"2rem"}}>💰</div><div style={{fontSize:"1.5rem",fontWeight:800,color:"#ffab00"}}>${(data.total_revenue||0).toFixed(2)}</div><div style={{color:"rgba(255,248,225,0.6)"}}>Total Revenue</div></div></div>
                <div className="col-md-4"><div className="glass-panel text-center"><div style={{fontSize:"2rem"}}>📦</div><div style={{fontSize:"1.5rem",fontWeight:800,color:"#ffab00"}}>{data.order_count||0}</div><div style={{color:"rgba(255,248,225,0.6)"}}>Total Orders</div></div></div>
                <div className="col-md-4"><div className="glass-panel text-center"><div style={{fontSize:"2rem"}}>📈</div><div style={{fontSize:"1.5rem",fontWeight:800,color:"#ffab00"}}>${(data.avg_order||0).toFixed(2)}</div><div style={{color:"rgba(255,248,225,0.6)"}}>Avg Order Value</div></div></div>
            </div>
            <div className="glass-panel">
                <h5 style={{color:"#ffab00",marginBottom:"1rem"}}>Revenue by Period</h5>
                <table className="table"><thead><tr><th>Period</th><th>Revenue</th></tr></thead>
                <tbody>{(data.data||[]).map((row,i)=><tr key={i}><td>{row.label}</td><td style={{color:"#ffab00",fontWeight:700}}>${(row.revenue||0).toFixed(2)}</td></tr>)}</tbody></table>
            </div>
        </div>
    );
};
export default RevenueReports;