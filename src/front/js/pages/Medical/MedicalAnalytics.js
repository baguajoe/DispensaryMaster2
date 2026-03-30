import React, { useState, useEffect } from "react";

const MedicalAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/medical/analytics/summary`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.ok ? r.json() : null)
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light" /></div>;

    const aptTotal = (data?.total_appointments||0);
    const completedPct = aptTotal > 0 ? Math.round(((data?.completed_appointments||0)/aptTotal)*100) : 0;
    const canceledPct = aptTotal > 0 ? Math.round(((data?.canceled_appointments||0)/aptTotal)*100) : 0;

    return (
        <div className="main-content p-4">
            <div className="page-header mb-4">
                <h2>📊 Medical Analytics</h2>
                <p>Patient activity, prescriptions, and appointment trends</p>
            </div>

            {/* KPIs */}
            <div className="row g-3 mb-4">
                {[
                    { label:"Total Patients", value:data?.total_patients||0, icon:"👥", color:"#11cdef" },
                    { label:"Total Prescriptions", value:data?.total_prescriptions||0, icon:"💊", color:"#2dce89" },
                    { label:"Total Appointments", value:data?.total_appointments||0, icon:"📅", color:"#fb6340" },
                    { label:"Expired Cards", value:data?.expired_cards||0, icon:"⚠️", color: data?.expired_cards > 0 ? "#f5365c" : "#2dce89" },
                ].map((s,i) => (
                    <div key={i} className="col-6 col-md-3">
                        <div className="glass-panel text-center">
                            <div style={{fontSize:"2rem"}}>{s.icon}</div>
                            <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.55)",textTransform:"uppercase",margin:"0.5rem 0 0.25rem"}}>{s.label}</div>
                            <div style={{fontSize:"1.8rem",fontWeight:700,color:s.color}}>{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row g-3">
                {/* Appointment Breakdown */}
                <div className="col-md-6">
                    <div className="glass-panel">
                        <h5 className="mb-3">Appointment Breakdown</h5>
                        {[
                            { label:"Completed", value:data?.completed_appointments||0, pct:completedPct, color:"#2dce89" },
                            { label:"Scheduled", value:data?.scheduled_appointments||0, pct: aptTotal > 0 ? Math.round(((data?.scheduled_appointments||0)/aptTotal)*100) : 0, color:"#11cdef" },
                            { label:"Canceled", value:data?.canceled_appointments||0, pct:canceledPct, color:"#f5365c" },
                        ].map((s,i) => (
                            <div key={i} className="mb-3">
                                <div className="d-flex justify-content-between mb-1">
                                    <span style={{fontSize:"0.85rem"}}>{s.label}</span>
                                    <span style={{fontSize:"0.85rem",color:s.color}}>{s.value} ({s.pct}%)</span>
                                </div>
                                <div className="progress" style={{height:"8px",background:"rgba(255,255,255,0.1)"}}>
                                    <div className="progress-bar" style={{width:`${s.pct}%`,background:s.color}} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Conditions */}
                <div className="col-md-6">
                    <div className="glass-panel">
                        <h5 className="mb-3">Top Qualifying Conditions</h5>
                        {(data?.top_conditions||[]).length === 0 ? (
                            <p className="text-center" style={{color:"rgba(255,255,255,0.5)"}}>No condition data yet</p>
                        ) : (data?.top_conditions||[]).map(([condition, count], i) => {
                            const max = data.top_conditions[0][1];
                            return (
                                <div key={i} className="mb-2">
                                    <div className="d-flex justify-content-between mb-1">
                                        <span style={{fontSize:"0.85rem"}}>{condition}</span>
                                        <span style={{fontSize:"0.85rem",color:"#11cdef"}}>{count} patients</span>
                                    </div>
                                    <div className="progress" style={{height:"6px",background:"rgba(255,255,255,0.1)"}}>
                                        <div className="progress-bar bg-info" style={{width:`${(count/max)*100}%`}} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default MedicalAnalytics;
