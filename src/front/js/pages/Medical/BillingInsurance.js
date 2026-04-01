import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BillingInsurance = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [insurance, setInsurance] = useState([]);
    const [patient, setPatient] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ provider_name:"", policy_number:"", copay:"", coverage_limit:"" });
    const [saving, setSaving] = useState(false);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        if (!id) { setLoading(false); return; }
        Promise.all([
            fetch(`${process.env.BACKEND_URL}/api/medical/patients/${id}`, { headers }).then(r => r.ok ? r.json() : null),
            fetch(`${process.env.BACKEND_URL}/api/insurances/patient/${id}`, { headers }).then(r => r.ok ? r.json() : []),
        ]).then(([p, ins]) => {
            setPatient(p);
            setInsurance(Array.isArray(ins) ? ins : []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [id]);

    const handleAdd = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/insurances`, {
                method:"POST", headers, body:JSON.stringify({...form, patient_id:parseInt(id)})
            });
            if (r.ok) { const d = await r.json(); setInsurance(p=>[...p,d]); setShowForm(false); setForm({provider_name:"",policy_number:"",copay:"",coverage_limit:""}); }
        } catch(e){ console.error(e); } finally { setSaving(false); }
    };

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light" /></div>;

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header">
                    <h2 style={{ color: "#ffab00", fontWeight: 800 }}>🏥 Billing & Insurance</h2>
                    {patient && <p style={{color:"rgba(255,255,255,0.6)"}}>Patient: {patient.first_name} {patient.last_name}</p>}
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-success btn-sm" onClick={()=>setShowForm(!showForm)}>+ Add Insurance</button>
                    {id && <button className="btn btn-outline-light btn-sm" onClick={()=>navigate(`/medical/patient-profile/${id}`)}> Profile</button>}
                </div>
            </div>
            {showForm && (
                <div className="glass-panel mb-4">
                    <h5 className="mb-3">Add Insurance Record</h5>
                    <form onSubmit={handleAdd}>
                        <div className="row g-3">
                            <div className="col-md-6"><label className="form-label">Provider *</label><input className="form-control" required value={form.provider_name} onChange={e=>setForm({...form,provider_name:e.target.value})} /></div>
                            <div className="col-md-6"><label className="form-label">Policy # *</label><input className="form-control" required value={form.policy_number} onChange={e=>setForm({...form,policy_number:e.target.value})} /></div>
                            <div className="col-md-6"><label className="form-label">Copay ($)</label><input className="form-control" type="number" value={form.copay} onChange={e=>setForm({...form,copay:e.target.value})} /></div>
                            <div className="col-md-6"><label className="form-label">Coverage Limit ($)</label><input className="form-control" type="number" value={form.coverage_limit} onChange={e=>setForm({...form,coverage_limit:e.target.value})} /></div>
                            <div className="col-12 d-flex gap-2">
                                <button type="button" className="btn btn-outline-light" onClick={()=>setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-success flex-grow-1" disabled={saving}>{saving?<span className="spinner-border spinner-border-sm"/>:"Save"}</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
            {insurance.length===0
                ? <div className="glass-panel text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}><div style={{fontSize:"3rem"}}>🏥</div><h5>No insurance records on file</h5></div>
                : <div className="row g-3">{insurance.map((ins,i)=>(
                    <div key={i} className="col-md-6"><div className="glass-panel">
                        <div className="d-flex justify-content-between mb-2"><h5 className="mb-0">{ins.provider_name}</h5><span className="badge bg-success">Active</span></div>
                        <div><span style={{color:"rgba(255,255,255,0.5)",fontSize:"0.8rem"}}>Policy: </span>{ins.policy_number}</div>
                        {ins.copay&&<div><span style={{color:"rgba(255,255,255,0.5)",fontSize:"0.8rem"}}>Copay: </span><span className="text-success">${ins.copay}</span></div>}
                        {ins.coverage_limit&&<div><span style={{color:"rgba(255,255,255,0.5)",fontSize:"0.8rem"}}>Limit: </span><span className="text-info">${ins.coverage_limit}</span></div>}
                    </div></div>
                ))}</div>
            }
        </div>
    );
};
export default BillingInsurance;
