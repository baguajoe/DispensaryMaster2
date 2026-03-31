import React, { useState, useEffect } from "react";

const HealthAnalytics = () => {
    const [summary, setSummary] = useState(null);
    const [patients, setPatients] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization:`Bearer ${token}` };

    useEffect(() => {
        Promise.all([
            fetch(`${process.env.BACKEND_URL}/api/medical/analytics/summary`, { headers }).then(r => r.ok ? r.json() : {}),
            fetch(`${process.env.BACKEND_URL}/api/medical/patients`, { headers }).then(r => r.ok ? r.json() : []),
            fetch(`${process.env.BACKEND_URL}/api/medical/prescriptions`, { headers }).then(r => r.ok ? r.json() : []),
        ]).then(([sum, pats, rx]) => {
            setSummary(sum);
            setPatients(Array.isArray(pats) ? pats : []);
            setPrescriptions(Array.isArray(rx) ? rx : []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const conditions = patients.reduce((acc, p) => {
        if (p.conditions) {
            p.conditions.split(",").forEach(c => {
                const clean = c.trim();
                if (clean) acc[clean] = (acc[clean]||0) + 1;
            });
        }
        return acc;
    }, {});

    const topConditions = Object.entries(conditions).sort((a,b) => b[1]-a[1]).slice(0,8);

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;

    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2>📊 Health Analytics</h2><p>Patient population insights</p></div>

            <div className="row g-3 mb-4">
                {[
                    {l:"Total Patients", v:patients.length, c:"#11cdef"},
                    {l:"Active Prescriptions", v:prescriptions.length, c:"#2dce89"},
                    {l:"Expiring Cards (30d)", v:patients.filter(p=>{if(!p.expiration_date)return false;const d=new Date(p.expiration_date);return (d-new Date())/86400000 < 30 && d > new Date();}).length, c:"#ffd600"},
                    {l:"Expired Cards", v:patients.filter(p=>p.expiration_date && new Date(p.expiration_date)<new Date()).length, c:"#f5365c"},
                ].map((s,i) => (
                    <div key={i} className="col-6 col-md-3"><div className="glass-panel text-center">
                        <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>{s.l}</div>
                        <div style={{fontSize:"1.8rem",fontWeight:700,color:s.c}}>{s.v}</div>
                    </div></div>
                ))}
            </div>

            <div className="row g-4">
                <div className="col-md-6">
                    <div className="glass-panel">
                        <h5 className="mb-3">Top Qualifying Conditions</h5>
                        {topConditions.length === 0 ? <p style={{color:"rgba(255,255,255,0.5)"}}>No condition data yet</p>
                        : topConditions.map(([condition, count], i) => (
                            <div key={i} className="mb-2">
                                <div className="d-flex justify-content-between mb-1">
                                    <span style={{fontSize:"0.85rem"}}>{condition}</span>
                                    <span style={{fontSize:"0.85rem",color:"#2dce89"}}>{count} patients</span>
                                </div>
                                <div className="progress" style={{height:"6px",background:"rgba(255,255,255,0.1)"}}>
                                    <div className="progress-bar bg-success" style={{width:`${(count/patients.length)*100}%`}}/>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="glass-panel">
                        <h5 className="mb-3">Card Expiration Timeline</h5>
                        {[
                            {l:"Expired", v:patients.filter(p=>p.expiration_date && new Date(p.expiration_date)<new Date()).length, c:"#f5365c"},
                            {l:"Expiring in 7 days", v:patients.filter(p=>{if(!p.expiration_date)return false;const d=new Date(p.expiration_date);return (d-new Date())/86400000 < 7 && d>new Date();}).length, c:"#fb6340"},
                            {l:"Expiring in 30 days", v:patients.filter(p=>{if(!p.expiration_date)return false;const d=new Date(p.expiration_date);return (d-new Date())/86400000 < 30 && d>new Date();}).length, c:"#ffd600"},
                            {l:"Valid 30+ days", v:patients.filter(p=>p.expiration_date && (new Date(p.expiration_date)-new Date())/86400000 >= 30).length, c:"#2dce89"},
                        ].map((s,i) => (
                            <div key={i} className="d-flex justify-content-between align-items-center mb-3 p-2 rounded" style={{background:"rgba(255,255,255,0.04)"}}>
                                <span style={{fontSize:"0.9rem"}}>{s.l}</span>
                                <span style={{fontWeight:700,color:s.c,fontSize:"1.2rem"}}>{s.v}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default HealthAnalytics;
