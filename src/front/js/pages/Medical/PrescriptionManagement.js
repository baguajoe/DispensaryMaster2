import React, { useState, useEffect, useContext } from "react";
import { Context } from "../../store/appContext";
import { useSearchParams } from "react-router-dom";

const PrescriptionManagement = () => {
    const { store, actions } = useContext(Context);
    const [searchParams] = useSearchParams();
    const preselectedPatient = searchParams.get("patient_id");
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ patient_id: preselectedPatient||"", product_id:"", dosage:"", frequency:"" });

    useEffect(() => {
        Promise.all([
            actions.fetchPrescriptions(),
            actions.fetchPatients(),
            actions.fetchProducts()
        ]).then(() => setLoading(false));
        if (preselectedPatient) setShowModal(true);
    }, []);

    const prescriptions = store.prescriptions || [];
    const patients = store.patients || [];
    const products = (store.products || []).filter(p => p.is_available_online !== false);

    const filtered = prescriptions.filter(rx => {
        return !search || (rx.patient_name||"").toLowerCase().includes(search.toLowerCase()) ||
            (rx.product_name||"").toLowerCase().includes(search.toLowerCase());
    });

    const handleSave = async () => {
        if (!form.patient_id || !form.product_id || !form.dosage || !form.frequency) {
            return alert("All fields are required");
        }
        setSaving(true);
        const result = await actions.addPrescription({
            ...form,
            patient_id: parseInt(form.patient_id),
            product_id: parseInt(form.product_id)
        });
        if (result?.success) {
            setShowModal(false);
            setForm({ patient_id:"", product_id:"", dosage:"", frequency:"" });
        } else alert(result?.error || "Failed to save prescription");
        setSaving(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this prescription?")) return;
        await actions.deletePrescription(id);
    };

    const FREQUENCIES = ["Once daily","Twice daily","3x daily","4x daily","As needed","Weekly","Every other day","At bedtime"];
    const DOSAGES = ["1 unit","2 units","5mg","10mg","25mg","50mg","100mg","0.25g","0.5g","1g","Custom"];

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header">
                    <h2>💊 Prescription Management</h2>
                    <p>{prescriptions.length} active prescriptions</p>
                </div>
                <button className="btn btn-success" onClick={() => setShowModal(true)}>+ New Prescription</button>
            </div>

            <div className="glass-panel mb-3">
                <input className="form-control" placeholder="Search by patient or product..."
                    value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <div className="glass-panel">
                {loading ? <div className="text-center py-4"><div className="spinner-border text-light" /></div>
                : filtered.length === 0 ? (
                    <div className="text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}>
                        <div style={{fontSize:"3rem"}}>💊</div>
                        <h5>No prescriptions found</h5>
                        <button className="btn btn-success mt-2" onClick={() => setShowModal(true)}>Create First Prescription</button>
                    </div>
                ) : (
                    <table className="table mb-0">
                        <thead><tr><th>Patient</th><th>Product</th><th>Dosage</th><th>Frequency</th><th>Prescribed</th><th>Actions</th></tr></thead>
                        <tbody>
                            {filtered.map(rx => (
                                <tr key={rx.id}>
                                    <td><strong>{rx.patient_name}</strong></td>
                                    <td>
                                        <div>{rx.product_name}</div>
                                        {rx.product_category && <span className="badge bg-secondary" style={{fontSize:"0.7rem"}}>{rx.product_category}</span>}
                                    </td>
                                    <td>{rx.dosage}</td>
                                    <td>{rx.frequency}</td>
                                    <td style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.5)"}}>
                                        {rx.prescribed_date ? new Date(rx.prescribed_date).toLocaleDateString() : "—"}
                                    </td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(rx.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">New Prescription</h5>
                                    <button className="btn-close" onClick={() => setShowModal(false)} />
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Patient *</label>
                                        <select className="form-select" value={form.patient_id} onChange={e => setForm({...form,patient_id:e.target.value})}>
                                            <option value="">-- Select Patient --</option>
                                            {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Product / Medicine *</label>
                                        <select className="form-select" value={form.product_id} onChange={e => setForm({...form,product_id:e.target.value})}>
                                            <option value="">-- Select Product --</option>
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name} — {p.category}</option>)}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Dosage *</label>
                                        <select className="form-select" value={form.dosage} onChange={e => setForm({...form,dosage:e.target.value})}>
                                            <option value="">-- Select Dosage --</option>
                                            {DOSAGES.map(d => <option key={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Frequency *</label>
                                        <select className="form-select" value={form.frequency} onChange={e => setForm({...form,frequency:e.target.value})}>
                                            <option value="">-- Select Frequency --</option>
                                            {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button className="btn btn-success" onClick={handleSave} disabled={saving}>
                                        {saving ? <span className="spinner-border spinner-border-sm" /> : "Create Prescription"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" onClick={() => setShowModal(false)} />
                </>
            )}
        </div>
    );
};
export default PrescriptionManagement;
