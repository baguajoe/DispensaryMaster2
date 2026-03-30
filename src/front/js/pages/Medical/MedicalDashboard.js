import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MedicalDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ patients:0, today_appts:0, expired:0 });
    const token = localStorage.getItem("token");

    useEffect(() => {
        const headers = { Authorization: `Bearer ${token}` };
        Promise.all([
            fetch(`${process.env.BACKEND_URL}/api/medical/patients`, { headers }).then(r => r.ok ? r.json() : []),
            fetch(`${process.env.BACKEND_URL}/api/appointments`, { headers }).then(r => r.ok ? r.json() : []),
        ]).then(([patients, appts]) => {
            const today = new Date().toDateString();
            setStats({
                patients: Array.isArray(patients) ? patients.length : 0,
                today_appts: Array.isArray(appts) ? appts.filter(a => a.date && new Date(a.date).toDateString()===today).length : 0,
                expired: Array.isArray(patients) ? patients.filter(p => p.expiration_date && new Date(p.expiration_date)<new Date()).length : 0,
            });
        }).catch(console.error);
    }, []);

    const MODULES = [
        {l:"Compliance Dashboard",p:"/medical/compliance-dashboard",i:"\u{1F4CB}",c:"#11cdef"},
        {l:"Compliance Reports",p:"/medical/compliance-reports",i:"\u{1F4CA}",c:"#2dce89"},
        {l:"Patient List",p:"/medical/patient-list",i:"\u{1F465}",c:"#fb6340"},
        {l:"Register Patient",p:"/medical/patient-registration",i:"\u2795",c:"#2dce89"},
        {l:"Appointments",p:"/medical/appointment-management",i:"\u{1F4C5}",c:"#ffd600"},
        {l:"Prescriptions",p:"/medical/prescription-management",i:"\u{1F48A}",c:"#11cdef"},
        {l:"Medical Analytics",p:"/medical/medical-analytics",i:"\u{1F4C8}",c:"#f5365c"},
    ];

    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2>\u{1F3E5} Medical Dashboard</h2></div>
            <div className="row g-3 mb-4">
                {[{l:"Total Patients",v:stats.patients,c:"#11cdef"},{l:"Today Appts",v:stats.today_appts,c:"#2dce89"},{l:"Expired Cards",v:stats.expired,c:"#f5365c"}].map((k,i)=>(
                    <div key={i} className="col-4"><div className="glass-panel text-center">
                        <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>{k.l}</div>
                        <div style={{fontSize:"2rem",fontWeight:700,color:k.c}}>{k.v}</div>
                    </div></div>
                ))}
            </div>
            <div className="row g-3">
                {MODULES.map((m,i)=>(
                    <div key={i} className="col-md-4 col-lg-3">
                        <div className="glass-panel" style={{cursor:"pointer",borderColor:`${m.c}33`}} onClick={()=>navigate(m.p)}>
                            <div style={{fontSize:"2rem"}}>{m.i}</div>
                            <h6 style={{color:m.c,marginTop:"0.5rem"}}>{m.l}</h6>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default MedicalDashboard;
