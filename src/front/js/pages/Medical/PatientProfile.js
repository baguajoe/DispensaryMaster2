import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const PatientProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [prescriptions, setPrescriptions] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        if (!id) return;
        Promise.all([
            fetch(`${process.env.BACKEND_URL}/api/medical/patients/${id}`, { headers }).then(r => r.ok ? r.json() : null),
            fetch(`${process.env.BACKEND_URL}/api/medical/prescriptions?patient_id=${id}`, { headers }).then(r => r.ok ? r.json() : []),
            fetch(`${process.env.BACKEND_URL}/api/appointments?patient_id=${id}`, { headers }).then(r => r.ok ? r.json() : []),
        ]).then(([p, rx, appts]) => {
            setPatient(p);
            setPrescriptions(Array.isArray(rx) ? rx : []);
            setAppointments(Array.isArray(appts) ? appts : []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light" /></div>;
    if (!patient) return <div className="main-content p-4"><div className="alert alert-danger">Patient not found. <button className="btn btn-link" onClick={() => navigate("/medical/patient-list")}>Back</button></div></div>;

    const expired = patient.expiration_date && new Date(patient.expiration_date) < new Date();

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header">
                    <h2 style={{ color: "#ffab00", fontWeight: 800 }}>👤 {patient.first_name} {patient.last_name}</h2>
                    <p style={{color:"rgba(255,255,255,0.6)"}}>Patient #{patient.id} · Card: {patient.medical_card_number || "N/A"}</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-info btn-sm" onClick={() => navigate(`/medical/billing/${id}`)}>🏥 Billing</button>
                    <button className="btn btn-outline-warning btn-sm" onClick={() => navigate(`/medical/patient-registration?id=${id}`)}>Edit</button>
                    <button className="btn btn-outline-light btn-sm" onClick={() => navigate("/medical/patient-list")}> Back</button>
                </div>
            </div>
            <div className="row g-3">
                <div className="col-md-4"><div className="glass-panel h-100">
                    <h5 className="mb-3">Personal Info</h5>
                    {[{l:"Email",v:patient.email},{l:"Phone",v:patient.phone},{l:"Physician",v:patient.physician_name||"\u2014"},{l:"Conditions",v:patient.conditions||"\u2014"}].map((f,i)=>(
                        <div key={i} className="mb-3"><div style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.45)",textTransform:"uppercase"}}>{f.l}</div><div style={{fontWeight:500}}>{f.v}</div></div>
                    ))}
                </div></div>
                <div className="col-md-4"><div className="glass-panel h-100">
                    <h5 className="mb-3">Medical Card</h5>
                    <div className="text-center mb-3">
                        <div style={{fontSize:"2.5rem",fontWeight:800,color:expired?"#f5365c":"#2dce89"}}>{expired?"EXPIRED":"VALID"}</div>
                        <div style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.5)"}}>Expires: {patient.expiration_date ? new Date(patient.expiration_date).toLocaleDateString() : "\u2014"}</div>
                    </div>
                    <div className="mb-2"><div style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.45)"}}>CARD NUMBER</div><div style={{fontWeight:600,fontFamily:"monospace"}}>{patient.medical_card_number||"\u2014"}</div></div>
                    <div className="row g-2 mt-2 text-center">
                        <div className="col-6"><div style={{fontSize:"1.5rem",fontWeight:700,color:"#11cdef"}}>{prescriptions.length}</div><div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)"}}>Rx</div></div>
                        <div className="col-6"><div style={{fontSize:"1.5rem",fontWeight:700,color:"#2dce89"}}>{appointments.length}</div><div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)"}}>Appts</div></div>
                    </div>
                </div></div>
                <div className="col-md-4"><div className="glass-panel h-100">
                    <h5 className="mb-3">Recent Prescriptions</h5>
                    {prescriptions.slice(0,5).map((rx,i)=>(
                        <div key={i} className="mb-2 p-2 rounded" style={{background:"rgba(255,255,255,0.06)"}}>
                            <div style={{fontWeight:500,fontSize:"0.9rem"}}>Rx #{rx.id}</div>
                            <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>{rx.dosage||"\u2014"} · {rx.frequency||"\u2014"}</div>
                        </div>
                    ))}
                    {prescriptions.length===0 && <p style={{color:"rgba(255,255,255,0.4)",fontSize:"0.85rem"}}>No prescriptions</p>}
                    <button className="btn btn-outline-info btn-sm w-100 mt-2" onClick={()=>navigate(`/medical/prescription-management?patient_id=${id}`)}>+ New Rx</button>
                </div></div>
            </div>
        </div>
    );
};
export default PatientProfile;
