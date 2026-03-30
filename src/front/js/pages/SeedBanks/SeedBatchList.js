import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SeedBatchList = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ strain:"", batch_number:"", quantity:"", storage_location:"", expiration_date:"", germination_rate:"" });
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };
    const today = new Date();

    useEffect(() => { fetchBatches(); }, []);

    const fetchBatches = async () => {
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/seed_batches`, { headers });
            if (r.ok) setBatches(await r.json());
        } catch(e) { console.error(e); }
        finally { setLoading(false); }
    };

    const filtered = batches.filter(b =>
        b.strain?.toLowerCase().includes(search.toLowerCase()) ||
        b.batch_number?.toLowerCase().includes(search.toLowerCase())
    );

    const openEdit = (b) => {
        setEditing(b);
        setForm({ strain:b.strain||"", batch_number:b.batch_number||"", quantity:b.quantity||"", storage_location:b.storage_location||"", expiration_date:b.expiration_date?.split("T")[0]||"", germination_rate:b.germination_rate||"" });
        setShowModal(true);
    };

    const handleSave = async () => {
        setSaving(true);
        const url = editing ? `${process.env.BACKEND_URL}/api/seed_batches/${editing.id}` : `${process.env.BACKEND_URL}/api/seed_batches`;
        const method = editing ? "PUT" : "POST";
        try {
            const r = await fetch(url, { method, headers, body: JSON.stringify({ ...form, quantity: parseInt(form.quantity) }) });
            if (r.ok) { await fetchBatches(); setShowModal(false); }
        } catch(e) { console.error(e); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this seed batch?")) return;
        await fetch(`${process.env.BACKEND_URL}/api/seed_batches/${id}`, { method:"DELETE", headers });
        fetchBatches();
    };

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2>📦 Seed Batch List</h2><p>{batches.length} total batches · {batches.reduce((s,b) => s+(b.quantity||0), 0)} total seeds</p></div>
                <button className="btn btn-success" onClick={() => navigate("/seedbanks/add-seed-batch")}>+ Add Batch</button>
            </div>

            <div className="glass-panel mb-3">
                <input className="form-control" placeholder="Search by strain or batch number..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <div className="glass-panel">
                {loading ? <div className="text-center py-4"><div className="spinner-border text-light" /></div>
                : filtered.length === 0 ? (
                    <div className="text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}>
                        <div style={{fontSize:"3rem"}}>🌰</div><h5>No seed batches found</h5>
                        <button className="btn btn-success mt-2" onClick={() => navigate("/seedbanks/add-seed-batch")}>Add First Batch</button>
                    </div>
                ) : (
                    <table className="table mb-0">
                        <thead><tr><th>Strain</th><th>Batch #</th><th>Qty</th><th>Germ Rate</th><th>Storage</th><th>Expires</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {filtered.map(b => {
                                const expired = b.expiration_date && new Date(b.expiration_date) < today;
                                const expiringSoon = !expired && b.expiration_date && (new Date(b.expiration_date) - today)/(1000*60*60*24) <= 30;
                                return (
                                    <tr key={b.id}>
                                        <td><strong>{b.strain}</strong></td>
                                        <td style={{fontSize:"0.85rem"}}>{b.batch_number}</td>
                                        <td><span className={`badge ${b.quantity < 10?"bg-warning text-dark":"bg-success"}`}>{b.quantity}</span></td>
                                        <td>{b.germination_rate ? `${b.germination_rate}%` : "—"}</td>
                                        <td style={{fontSize:"0.85rem"}}>{b.storage_location||"—"}</td>
                                        <td style={{fontSize:"0.85rem"}}>{b.expiration_date ? new Date(b.expiration_date).toLocaleDateString() : "—"}</td>
                                        <td><span className={`badge ${expired?"bg-danger":expiringSoon?"bg-warning text-dark":b.quantity<10?"bg-warning text-dark":"bg-success"}`}>{expired?"Expired":expiringSoon?"Exp. Soon":b.quantity<10?"Low Stock":"Good"}</span></td>
                                        <td>
                                            <button className="btn btn-sm btn-outline-light me-1" onClick={() => openEdit(b)}>Edit</button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(b.id)}>Del</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header"><h5 className="modal-title">Edit Seed Batch</h5><button className="btn-close" onClick={() => setShowModal(false)} /></div>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        <div className="col-12"><label className="form-label">Strain</label><input className="form-control" value={form.strain} onChange={e => setForm({...form,strain:e.target.value})} /></div>
                                        <div className="col-6"><label className="form-label">Quantity</label><input className="form-control" type="number" value={form.quantity} onChange={e => setForm({...form,quantity:e.target.value})} /></div>
                                        <div className="col-6"><label className="form-label">Germination Rate (%)</label><input className="form-control" type="number" value={form.germination_rate} onChange={e => setForm({...form,germination_rate:e.target.value})} /></div>
                                        <div className="col-6"><label className="form-label">Storage Location</label><input className="form-control" value={form.storage_location} onChange={e => setForm({...form,storage_location:e.target.value})} /></div>
                                        <div className="col-6"><label className="form-label">Expiration Date</label><input className="form-control" type="date" value={form.expiration_date} onChange={e => setForm({...form,expiration_date:e.target.value})} /></div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button className="btn btn-success" onClick={handleSave} disabled={saving}>{saving ? <span className="spinner-border spinner-border-sm" /> : "Save"}</button>
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
export default SeedBatchList;
