import React, { useState, useEffect } from "react";

const PrescriptionManagement = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [patients, setPatients] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState("");
    const [form, setForm] = useState({ patient_id:"", product_id:"", dosage:"", frequency:"", notes:"" });
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    const load = () => {
        Promise.all([
            fetch(`${process.env.BACKEND_URL}/api/medical/prescriptions`, { headers }).then(r => r.ok ? r.json() : []),
            fetch(`${process.env.BACKEND_URL}/api/medical/patients`, { headers }).then(r => r.ok ? r.json() : []),
            fetch(`${process.env.BACKEND_URL}/api/products`, { headers }).then(r => r.ok ? r.json() : {}),
        ]).then(([rx, pats, prods]) => {
            setPrescriptions(Array.isArray(rx) ? rx : []);
            setPatients(Array.isArray(pats) ? pats : []);
            const prodList = Array.isArray(prods) ? prods : (prods.products || []);
            setProducts(prodList);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/medical/prescriptions`, {
                method:"POST", headers, body:JSON.stringify(form)
            });
            if (r.ok) { load(); setShowForm(false); setForm({ patient_id:"", product_id:"", dosage:"", frequency:"", notes:"" }); }
        } catch(e) { console.error(e); } finally { setSaving(false); }
    };

    const getPatient = (id) => patients.find(p => p.id === id || p.id === parseInt(id));
    const getProduct = (id) => products.find(p => p.id === id || p.id === parseInt(id));

    const filtered = selectedPatient ? prescriptions.filter(rx => rx.patient_id === parseInt(selectedPatient)) : prescriptions;

    const FREQUENCIES = ["Once daily","Twice daily","Three times daily","As needed","Weekly","Before bed","With meals"];

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2 style={{ color: "#ffab00", fontWeight: 800 }}>💊 Prescription Management</h2><p>{prescriptions.length} active prescriptions</p></div>
                <button className="btn btn-success" onClick={() => setShowForm(!showForm)}>+ New Prescription</button>
            </div>

            {showForm && (
                <div className="glass-panel mb-4">
                    <h5 className="mb-3">New Prescription</h5>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label">Patient *</label>
                                <select className="form-select" required value={form.patient_id} onChange={e=>setForm({...form,patient_id:e.target.value})}>
                                    <option value="">Select patient...</option>
                                    {patients.map(p=><option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Product/Medicine *</label>
                                <select className="form-select" required value={form.product_id} onChange={e=>setForm({...form,product_id:e.target.value})}>
                                    <option value="">Select product...</option>
                                    {products.map(p=><option key={p.id} value={p.id}>{p.name} ({p.category})</option>)}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Frequency *</label>
                                <select className="form-select" required value={form.frequency} onChange={e=>setForm({...form,frequency:e.target.value})}>
                                    <option value="">Select frequency...</option>
                                    {FREQUENCIES.map(f=><option key={f}>{f}</option>)}
                                </select>
                            </div>
                            <div className="col-md-6"><label className="form-label">Dosage *</label><input className="form-control" required placeholder="e.g. 10mg, 1 gummy, 0.5g" value={form.dosage} onChange={e=>setForm({...form,dosage:e.target.value})} /></div>
                            <div className="col-12 d-flex gap-2">
                                <button type="button" className="btn btn-outline-light" onClick={()=>setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-success flex-grow-1" disabled={saving}>{saving?<span className="spinner-border spinner-border-sm"/>:"Create Prescription"}</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="glass-panel mb-3">
                <select className="form-select" value={selectedPatient} onChange={e=>setSelectedPatient(e.target.value)}>
                    <option value="">All Patients</option>
                    {patients.map(p=><option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
                </select>
            </div>

            <div className="row g-3">
                {filtered.map(rx => {
                    const patient = getPatient(rx.patient_id);
                    const product = getProduct(rx.product_id);
                    return (
                        <div key={rx.id} className="col-md-6 col-lg-4">
                            <div className="glass-panel h-100">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div>
                                        <h5 className="mb-0">{product?.name || `Product #${rx.product_id}`}</h5>
                                        <small style={{color:"rgba(255,255,255,0.5)"}}>{product?.category}</small>
                                    </div>
                                    <span className="badge bg-success">{product?.thc_content ? `${product.thc_content}% THC` : ""}</span>
                                </div>
                                <div className="mb-2">
                                    <span className="badge bg-info me-1">👤 {patient ? `${patient.first_name} ${patient.last_name}` : `Patient #${rx.patient_id}`}</span>
                                </div>
                                <div className="row g-2 mb-2">
                                    <div className="col-6"><div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)"}}>DOSAGE</div><div style={{fontWeight:600}}>{rx.dosage}</div></div>
                                    <div className="col-6"><div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)"}}>FREQUENCY</div><div style={{fontWeight:600}}>{rx.frequency}</div></div>
                                </div>
                                <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.4)"}}>Prescribed: {rx.prescribed_date || "—"}</div>
                            </div>
                        </div>
                    );
                })}
                {filtered.length === 0 && <div className="col-12"><div className="glass-panel text-center py-4" style={{color:"rgba(255,255,255,0.5)"}}><div style={{fontSize:"2rem"}}>💊</div><p>No prescriptions found</p></div></div>}
            </div>
        </div>
    );
};
export default PrescriptionManagement;
