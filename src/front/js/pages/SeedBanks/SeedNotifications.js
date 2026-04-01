import React, { useState, useEffect } from "react";
const SeedNotifications = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/seed_batches`, { headers:{ Authorization:`Bearer ${token}` } })
            .then(r=>r.ok?r.json():[]).then(d=>{setBatches(Array.isArray(d)?d:[]);setLoading(false);}).catch(()=>setLoading(false));
    }, []);
    const lowStock = batches.filter(b=>(b.quantity||0)<50);
    const expiring = batches.filter(b=>b.expiration_date&&(new Date(b.expiration_date)-new Date())/86400000<90);
    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;
    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2 style={{ color: "#ffab00", fontWeight: 800 }}>🔔 Seed Notifications</h2><p>{lowStock.length+expiring.length} alerts</p></div>
            {lowStock.length>0&&<div className="glass-panel mb-3"><h5 style={{color:"#ffd600"}}>⚠️ Low Stock ({lowStock.length})</h5>{lowStock.map((b,i)=><div key={i} className="d-flex justify-content-between py-2" style={{borderBottom:"1px solid rgba(255,255,255,0.08)"}}><span>{b.strain_name||`Batch #${b.id}`}</span><span style={{color:"#ffd600",fontWeight:700}}>{b.quantity} seeds</span></div>)}</div>}
            {expiring.length>0&&<div className="glass-panel mb-3"><h5 style={{color:"#f5365c"}}>📅 Expiring Soon ({expiring.length})</h5>{expiring.map((b,i)=><div key={i} className="d-flex justify-content-between py-2" style={{borderBottom:"1px solid rgba(255,255,255,0.08)"}}><span>{b.strain_name||`Batch #${b.id}`}</span><span style={{color:"#f5365c"}}>{b.expiration_date}</span></div>)}</div>}
            {lowStock.length===0&&expiring.length===0&&<div className="glass-panel text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}><div style={{fontSize:"3rem"}}>✅</div><h5>No alerts — all seeds healthy!</h5></div>}
        </div>
    );
};
export default SeedNotifications;
