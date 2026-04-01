import React, { useState, useEffect } from "react";
const SeedAnalytics = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/seed_batches`, { headers:{ Authorization:`Bearer ${token}` } })
            .then(r=>r.ok?r.json():[]).then(d=>{setBatches(Array.isArray(d)?d:[]);setLoading(false);}).catch(()=>setLoading(false));
    }, []);
    const total = batches.reduce((s,b)=>s+(b.quantity||0),0);
    const strains = [...new Set(batches.map(b=>b.strain_name).filter(Boolean))];
    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;
    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2 style={{ color: "#ffab00", fontWeight: 800 }}>📊 Seed Analytics</h2></div>
            <div className="row g-3 mb-4">
                {[{l:"Total Batches",v:batches.length,c:"#11cdef"},{l:"Total Seeds",v:total,c:"#2dce89"},{l:"Strains",v:strains.length,c:"#ffd600"}].map((s,i)=>(
                    <div key={i} className="col-4"><div className="glass-panel text-center"><div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>{s.l}</div><div style={{fontSize:"1.8rem",fontWeight:700,color:s.c}}>{s.v}</div></div></div>
                ))}
            </div>
            <div className="glass-panel">
                <h5 className="mb-3">By Strain</h5>
                {strains.map(strain=>{const count=batches.filter(b=>b.strain_name===strain).reduce((s,b)=>s+(b.quantity||0),0);return(<div key={strain} className="mb-3"><div className="d-flex justify-content-between mb-1"><span>{strain}</span><span style={{color:"#2dce89"}}>{count} seeds</span></div><div className="progress" style={{height:"6px",background:"rgba(255,255,255,0.1)"}}><div className="progress-bar bg-success" style={{width:`${total?(count/total)*100:0}%`}}/></div></div>);})}
                {strains.length===0&&<p style={{color:"rgba(255,255,255,0.5)"}}>No seed data yet</p>}
            </div>
        </div>
    );
};
export default SeedAnalytics;
