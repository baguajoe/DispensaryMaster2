import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ComplianceDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/medical/compliance/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.ok ? r.json() : null)
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light" /></div>;

    const stats = [
        { label:"Total Patients", value: data?.total_patients||0, icon:"👥", color:"#11cdef" },
        { label:"Active Prescriptions", value: data?.active_prescriptions||0, icon:"💊", color:"#2dce89" },
        { label:"Upcoming Appointments", value: data?.upcoming_appointments||0, icon:"📅", color:"#fb6340" },
        { label:"Expired Cards", value: data?.expired_cards||0, icon:"⚠️", color: data?.expired_cards > 0 ? "#f5365c" : "#2dce89" },
    ];

    return (
        <div className="main-content p-4">
            <div className="page-header mb-4">
                <h2>🏥 Compliance Dashboard</h2>
                <p>Monitor medical card compliance, licensing, and audit status</p>
            </div>

            {/* KPI Cards */}
            <div className="row g-3 mb-4">
                {stats.map((s,i) => (
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
                {/* Expired Cards Alert */}
                <div className="col-md-6">
                    <div className="glass-panel h-100">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">⚠️ Expired Medical Cards</h5>
                            <Link to="/medical/patient-list" className="btn btn-sm btn-outline-warning">View All</Link>
                        </div>
                        {(data?.expired_patients||[]).length === 0 ? (
                            <div className="text-center py-3">
                                <div style={{fontSize:"2rem"}}>✅</div>
                                <p style={{color:"rgba(255,255,255,0.5)"}}>No expired cards</p>
                            </div>
                        ) : (data?.expired_patients||[]).map((p,i) => (
                            <div key={i} className="d-flex justify-content-between align-items-center mb-2 p-2 rounded"
                                style={{background:"rgba(245,54,92,0.12)",border:"1px solid rgba(245,54,92,0.3)"}}>
                                <div>
                                    <div style={{fontWeight:600,fontSize:"0.9rem"}}>{p.name}</div>
                                    <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>Card: {p.card}</div>
                                </div>
                                <span className="badge bg-danger">Expired {new Date(p.expired).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Expiring Soon */}
                <div className="col-md-6">
                    <div className="glass-panel h-100">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">📅 Expiring Within 30 Days</h5>
                            <span className="badge bg-warning text-dark">{data?.expiring_soon||0}</span>
                        </div>
                        {(data?.expiring_patients||[]).length === 0 ? (
                            <div className="text-center py-3">
                                <div style={{fontSize:"2rem"}}>✅</div>
                                <p style={{color:"rgba(255,255,255,0.5)"}}>No cards expiring soon</p>
                            </div>
                        ) : (data?.expiring_patients||[]).map((p,i) => (
                            <div key={i} className="d-flex justify-content-between align-items-center mb-2 p-2 rounded"
                                style={{background:"rgba(251,99,64,0.12)",border:"1px solid rgba(251,99,64,0.3)"}}>
                                <div>
                                    <div style={{fontWeight:600,fontSize:"0.9rem"}}>{p.name}</div>
                                    <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>Card: {p.card}</div>
                                </div>
                                <span className="badge bg-warning text-dark">Expires {new Date(p.expires).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Compliance Alerts */}
                <div className="col-12">
                    <div className="glass-panel">
                        <h5 className="mb-3">🔔 Compliance Alerts</h5>
                        {(data?.compliance_alerts||[]).length === 0 ? (
                            <p className="text-center py-3" style={{color:"rgba(255,255,255,0.5)"}}>✅ No active compliance alerts</p>
                        ) : (data?.compliance_alerts||[]).map((a,i) => (
                            <div key={i} className="d-flex justify-content-between align-items-center mb-2 p-2 rounded"
                                style={{background:`rgba(${a.severity==="High"?"245,54,92":a.severity==="Medium"?"251,99,64":"255,214,0"},0.12)`,
                                        border:`1px solid rgba(${a.severity==="High"?"245,54,92":a.severity==="Medium"?"251,99,64":"255,214,0"},0.3)`}}>
                                <span style={{fontSize:"0.9rem"}}>{a.message}</span>
                                <span className={`badge bg-${a.severity==="High"?"danger":a.severity==="Medium"?"warning text-dark":"info"}`}>{a.severity}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="col-12">
                    <div className="glass-panel">
                        <h5 className="mb-3">Quick Actions</h5>
                        <div className="d-flex flex-wrap gap-2">
                            <Link to="/medical/patient-registration" className="btn btn-success btn-sm">+ Register Patient</Link>
                            <Link to="/medical/appointment-management" className="btn btn-primary btn-sm">+ Book Appointment</Link>
                            <Link to="/medical/prescription-management" className="btn btn-info btn-sm">+ New Prescription</Link>
                            <Link to="/medical/compliance-reports" className="btn btn-outline-light btn-sm">View Reports</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ComplianceDashboard;
