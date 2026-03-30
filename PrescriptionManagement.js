import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const PrescriptionManagement = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedPatient = searchParams.get("patient_id");

    const [prescriptions, setPrescriptions] = useState([]);
    const [patients, setPatients] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(!!preselectedPatient);
    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState("");
    const [form, setForm] = useState({
        patient_id: preselectedPatient || "",
        product_id:"", dosage:"", frequency:"", duration:"",
        refills:"0", notes:"", status:"active"
    });
    const [saving, setSaving] = useState(false);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        Promise.all([
            fetch(`${process.env.BACKEND_URL}/api/medical/prescriptions`, { headers }).then(r => r.ok ? r.json() : []),
            fetch(`${process.env.BACKEND_URL}/api/medical/patients`, { headers }).then(r => r.ok ? r.json() : []),
            fetch(`${process.env.BACKEND_URL}/api/products`, { headers }).then(r => r.ok ? r.json() : []),
        ]).then(([rx, pats, prods]) => {
            setPrescriptions(Array.isArray(rx) ? rx : []);
            setPatients(Array.isArray(pats) ? pats : []);
            setProducts(Array.isArray(prods) ? prods : []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const method = editId ? "PUT" : "POST";
            const url = editId
                ? `${process.env.BACKEND_URL}/api/medical/prescriptions/${editId}`
                : `${process.env.BACKEND_URL}/api/medical/prescriptions`;
            const r = await fetch(url, { method, headers, body: JSON.stringify(form) });
            if (r.ok) {
                const data = await r.json();
                if (editId) {
                    setPrescriptions(prev => prev.map(rx => rx.id === editId ? data : rx));
                } else {
                    setPrescriptions(prev => [...prev, data]);
                }
                setShowForm(false);
                setEditId(null);
                setForm({ patient_id:"", product_id:"", dosage:"", frequency:"", duration:"", refills:"0", notes:"", status:"active" });
            }
        } catch(e) { console.error(e); } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this prescription?")) return;
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/medical/prescriptions/${id}`, { method:"DELETE", headers });
            if (r.ok) setPrescriptions(prev => prev.filter(rx => rx.id !== id));
        } catch(e) { console.error(e); }
    };

    const handleEdit = (rx) => {
        setForm({
            patient_id: rx.patient_id || "",
            product_id: rx.product_id || "",
            dosage: rx.dosage || "",
            frequency: rx.frequency || "",
            duration: rx.duration || "",
            refills: rx.refills || "0",
            notes: rx.notes || "",
            status: rx.status || "active",
        });
        setEditId(rx.id);
        setShowForm(true);
    };

    const getPatientName = (pid) => {
        const p = patients.find(pt => pt.id === parseInt(pid));
        return p ? `${p.first_name} ${p.last_name}` : `Patient #${pid}`;
    };

    const getProductName = (pid) => {
        const p = products.find(pr => pr.id === parseInt(pid));
        return p ? p.name : `Product #${pid}`;
    };

    const filtered = prescriptions.filter(rx => {
        if (!search) return true;
        const s = search.toLowerCase();
        return getPatientName(rx.patient_id).toLowerCase().includes(s) ||
               (rx.dosage || "").toLowerCase().includes(s);
    });

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light" /></div>;

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header">
                    <h2>💊 Prescription Management</h2>
                    <p>{prescriptions.length} total prescriptions</p>
                </div>
                <button className="btn btn-success" onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ patient_id:"", product_id:"", dosage:"", frequency:"", duration:"", refills:"0", notes:"", status:"active" }); }}>
                    + New Prescription
                </button>
            </div>

            {/* Stats */}
            <div className="row g-3 mb-4">
                {[
                    { label:"Total", value:prescriptions.length, color:"#11cdef" },
                    { label:"Active", value:prescriptions.filter(rx=>rx.status==="active").length, color:"#2dce89" },
                    { label:"Expired", value:prescriptions.filter(rx=>rx.status==="expired").length, color:"#f5365c" },
                    { label:"Pending Refill", value:prescriptions.filter(rx=>rx.refill_status==="Pending").length, color:"#ffd600" },
                ].map((s,i) => (
                    <div key={i} className="col-6 col-md-3">
                        <div className="glass-panel text-center">
                            <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>{s.label}</div>
                            <div style={{fontSize:"1.8rem",fontWeight:700,color:s.color}}>{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* New/Edit Form */}
            {showForm && (
                <div className="glass-panel mb-4">
                    <h5 className="mb-3">{editId ? "Edit Prescription" : "New Prescription"}</h5>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Patient *</label>
                                <select className="form-select" required value={form.patient_id} onChange={e => setForm({...form, patient_id:e.target.value})}>
                                    <option value="">Select patient...</option>
                                    {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Product / Strain</label>
                                <select className="form-select" value={form.product_id} onChange={e => setForm({...form, product_id:e.target.value})}>
                                    <option value="">Select product...</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Dosage *</label>
                                <input className="form-control" required value={form.dosage} onChange={e => setForm({...form, dosage:e.target.value})} placeholder="e.g. 10mg, 1g" />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Frequency *</label>
                                <input className="form-control" required value={form.frequency} onChange={e => setForm({...form, frequency:e.target.value})} placeholder="e.g. Twice daily" />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Duration</label>
                                <input className="form-control" value={form.duration} onChange={e => setForm({...form, duration:e.target.value})} placeholder="e.g. 30 days" />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Refills</label>
                                <input className="form-control" type="number" min="0" value={form.refills} onChange={e => setForm({...form, refills:e.target.value})} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Status</label>
                                <select className="form-select" value={form.status} onChange={e => setForm({...form, status:e.target.value})}>
                                    <option value="active">Active</option>
                                    <option value="expired">Expired</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className="col-md-12">
                                <label className="form-label">Notes</label>
                                <textarea className="form-control" rows="2" value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} />
                            </div>
                            <div className="col-12 d-flex gap-2">
                                <button type="button" className="btn btn-outline-light" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
                                <button type="submit" className="btn btn-success flex-grow-1" disabled={saving}>
                                    {saving ? <span className="spinner-border spinner-border-sm" /> : editId ? "Update" : "Create Prescription"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Search */}
            <div className="glass-panel mb-3">
                <input className="form-control" placeholder="Search by patient name or dosage..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {/* Prescriptions Table */}
            <div className="glass-panel">
                {filtered.length === 0 ? (
                    <div className="text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}>
                        <div style={{fontSize:"3rem"}}>💊</div>
                        <h5>No prescriptions found</h5>
                        <button className="btn btn-success mt-2" onClick={() => setShowForm(true)}>Create First Prescription</button>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-dark table-hover mb-0">
                            <thead>
                                <tr><th>Patient</th><th>Product</th><th>Dosage</th><th>Frequency</th><th>Refills</th><th>Status</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {filtered.map(rx => (
                                    <tr key={rx.id}>
                                        <td>
                                            <div style={{fontWeight:600}}>{getPatientName(rx.patient_id)}</div>
                                        </td>
                                        <td>{rx.product_id ? getProductName(rx.product_id) : "—"}</td>
                                        <td>{rx.dosage || "—"}</td>
                                        <td>{rx.frequency || "—"}</td>
                                        <td>{rx.refills ?? "0"}</td>
                                        <td>
                                            <span className={`badge bg-${rx.status==="active"?"success":rx.status==="expired"?"danger":"secondary"}`}>
                                                {rx.status || "active"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-1">
                                                <button className="btn btn-sm btn-outline-warning" onClick={() => handleEdit(rx)}>Edit</button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(rx.id)}>Del</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
export default PrescriptionManagement;
