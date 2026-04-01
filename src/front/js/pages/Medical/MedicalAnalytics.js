import React, { useState, useEffect } from "react";
const MedicalAnalytics = () => {
    const [summary, setSummary] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization:`Bearer ${token}` };
    useEffect(() => {
        Promise.all([
            fetch(`${process.env.BACKEND_URL}/api/medical/analytics/summary`, { headers }).then(r => r.ok ? r.json() : {}),
            fetch(`${process.env.BACKEND_URL}/api/medical/analytics`, { headers }).then(r => r.ok ? r.json() : {}),
        ]).then(([sum, ana]) => { setSummary(sum); setAnalytics(ana); setLoading(false); })
        .catch(() => setLoading(false));
    }, []);
    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;
    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2 style={{ color: "#ffab00", fontWeight: 800 }}>📊 Medical Analytics</h2><p>Patient and prescription insights</p></div>
            <div className="row g-3 mb-4">
                {[
                    {l:"Total Patients", v:summary?.total_patients||0, c:"#11cdef"},
                    {l:"Active Prescriptions", v:summary?.active_prescriptions||0, c:"#2dce89"},
                    {l:"Today's Appointments", v:summary?.today_appointments||0, c:"#ffd600"},
                    {l:"Pending Insurance", v:summary?.pending_insurance_claims||0, c:"#f5365c"},
                ].map((s,i) => (
                    <div key={i} className="col-6 col-md-3"><div className="glass-panel text-center">
                        <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>{s.l}</div>
                        <div style={{fontSize:"1.8rem",fontWeight:700,color:s.c}}>{s.v}</div>
                    </div></div>
                ))}
            </div>
            <div className="glass-panel">
                <h5 className="mb-3">Revenue Overview</h5>
                {analytics?.revenue ? (
                    <div className="row g-3">
                        {Object.entries(analytics.revenue).map(([k,v],i) => (
                            <div key={i} className="col-md-3"><div style={{background:"rgba(255,255,255,0.06)",borderRadius:"8px",padding:"1rem",textAlign:"center"}}>
                                <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>{k}</div>
                                <div style={{fontSize:"1.5rem",fontWeight:700,color:"#2dce89"}}>${typeof v === "number" ? v.toFixed(2) : v}</div>
                            </div></div>
                        ))}
                    </div>
                ) : <p style={{color:"rgba(255,255,255,0.5)"}}>Revenue data will appear as transactions are processed</p>}
            </div>
        </div>
    );
};
export default MedicalAnalytics;
