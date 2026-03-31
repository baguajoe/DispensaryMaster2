import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MedicalDashboard = () => {
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization:`Bearer ${token}` };

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/medical/analytics/summary`, { headers })
            .then(r => r.ok ? r.json() : null)
            .then(data => { setSummary(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const QUICK_LINKS = [
        {label:"Patient List", path:"/medical/patients", icon:"👥", color:"#11cdef"},
        {label:"Register Patient", path:"/medical/register", icon:"➕", color:"#2dce89"},
        {label:"Appointments", path:"/medical/appointments", icon:"📅", color:"#ffd600"},
        {label:"Prescriptions", path:"/medical/prescriptions", icon:"💊", color:"#fb6340"},
        {label:"Billing & Insurance", path:"/medical/billing", icon:"💳", color:"#f5365c"},
        {label:"Compliance", path:"/medical/compliance", icon:"⚖️", color:"#2dce89"},
    ];

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;

    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2>🏥 Medical Dashboard</h2><p>Patient care and compliance overview</p></div>

            <div className="row g-3 mb-4">
                {[
                    {l:"Total Patients", v:summary?.total_patients||0, c:"#11cdef"},
                    {l:"Active Prescriptions", v:summary?.active_prescriptions||0, c:"#2dce89"},
                    {l:"Today's Appointments", v:summary?.today_appointments||0, c:"#ffd600"},
                    {l:"Pending Insurance", v:summary?.pending_insurance_claims||0, c:"#f5365c"},
                ].map((s,i) => (
                    <div key={i} className="col-6 col-md-3"><div className="glass-panel text-center">
                        <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>{s.l}</div>
                        <div style={{fontSize:"2rem",fontWeight:700,color:s.c,marginTop:"4px"}}>{s.v}</div>
                    </div></div>
                ))}
            </div>

            <h5 className="mb-3">Quick Access</h5>
            <div className="row g-3">
                {QUICK_LINKS.map((link, i) => (
                    <div key={i} className="col-6 col-md-4">
                        <div className="glass-panel text-center py-4" style={{cursor:"pointer",borderColor:`${link.color}33`,transition:"all 0.2s"}}
                            onClick={() => navigate(link.path)}
                            onMouseEnter={e=>e.currentTarget.style.borderColor=link.color}
                            onMouseLeave={e=>e.currentTarget.style.borderColor=`${link.color}33`}>
                            <div style={{fontSize:"2rem",marginBottom:"0.5rem"}}>{link.icon}</div>
                            <div style={{fontWeight:600,color:link.color}}>{link.label}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default MedicalDashboard;
