import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const STATUSES = ["All","Seedling","Vegetative","Flowering","Drying","Harvested"];
const STATUS_COLORS = { Seedling:"info", Vegetative:"success", Flowering:"warning", Drying:"primary", Harvested:"secondary" };

const PlantBatchList = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ strain:"", yield_amount:"", start_date:"", end_date:"", status:"Seedling", notes:"" });
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => { fetchBatches(); }, []);

    const fetchBatches = async () => {
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/plant_batches`, { headers });
            if (r.ok) setBatches(await r.json());
        } catch(e) { console.error(e); }
        finally { setLoading(false); }
    };

    const filtered = batches.filter(b => {
        const matchFilter = filter === "All" || b.status === filter;
        const matchSearch = !search || b.strain?.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const openNew = () => {
        setEditing(null);
        setForm({ strain:"", yield_amount:"", start_date:new Date().toISOString().split("T")[0], end_date:"", status:"Seedling", notes:"" });
        setShowModal(true);
    };

    const openEdit = (b) => {
        setEditing(b);
        setForm({ strain:b.strain||"", yield_amount:b.yield_amount||"", start_date:b.start_date?.split("T")[0]||"", end_date:b.end_date?.split("T")[0]||"", status:b.status||"Seedling", notes:b.notes||"" });
        setShowModal(true);
    };

    const handleSave = async () => {
        setSaving(true);
        const url = editing ? `${process.env.BACKEND_URL}/api/plant_batches/${editing.id}` : `${process.env.BACKEND_URL}/api/plant_batches`;
        const method = editing ? "PUT" : "POST";
        try {
            const r = await fetch(url, { method, headers, body: JSON.stringify(form) });
            if (r.ok) { await fetchBatches(); setShowModal(false); }
        } catch(e) { console.error(e); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this batch?")) return;
        await fetch(`${process.env.BACKEND_URL}/api/plant_batches/${id}`, { method:"DELETE", headers });
        fetchBatches();
    };

    const getDaysInStage = (start) => {
        if (!start) return 0;
        return Math.floor((new Date() - new Date(start)) / (1000*60*60*24));
    };

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header">
                    <h2>🌿 Plant Batches</h2>
                    <p>{batches.length} total batches · {batches.filter(b=>b.status!=="Harvested").length} active</p>
                </div>
                <button className="btn btn-success" onClick={openNew}>+ New Batch</button>
            </div>

            <div className="glass-panel mb-3">
                <div className="row g-2 align-items-center">
                    <div className="col-md-5">
                        <input className="form-control" placeholder="Search by strain..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="col-md-7 d-flex gap-2 flex-wrap">
                        {STATUSES.map(s => (
                            <button key={s} className={`btn btn-sm ${filter===s?"btn-success":"btn-outline-light"}`} onClick={() => setFilter(s)}>{s}</button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="glass-panel">
                {loading ? <div className="text-center py-4"><div className="spinner-border text-light" /></div>
                : filtered.length === 0 ? (
                    <div className="text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}>
                        <div style={{fontSize:"3rem"}}>🌱</div>
                        <h5>No batches found</h5>
                        <button className="btn btn-success mt-2" onClick={openNew}>Create First Batch</button>
                    </div>
                ) : (
                    <table className="table mb-0">
                        <thead><tr><th>Strain</th><th>Status</th><th>Days Growing</th><th>Started</th><th>Expected End</th><th>Yield (lbs)</th><th>Actions</th></tr></thead>
                        <tbody>
                            {filtered.map(b => (
                                <tr key={b.id}>
                                    <td><strong>{b.strain}</strong><div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>{b.notes}</div></td>
                                    <td><span className={`badge bg-${STATUS_COLORS[b.status]||"secondary"}`}>{b.status}</span></td>
                                    <td>{getDaysInStage(b.start_date)} days</td>
                                    <td style={{fontSize:"0.85rem"}}>{b.start_date ? new Date(b.start_date).toLocaleDateString() : "—"}</td>
                                    <td style={{fontSize:"0.85rem"}}>{b.end_date ? new Date(b.end_date).toLocaleDateString() : "—"}</td>
                                    <td>{b.yield_amount||"—"}</td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-light me-1" onClick={() => openEdit(b)}>Edit</button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(b.id)}>Del</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{editing ? "Edit Batch" : "New Plant Batch"}</h5>
                                    <button className="btn-close" onClick={() => setShowModal(false)} />
                                </div>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        <div className="col-12"><label className="form-label">Strain *</label><input className="form-control" value={form.strain} onChange={e => setForm({...form,strain:e.target.value})} /></div>
                                        <div className="col-6"><label className="form-label">Start Date</label><input className="form-control" type="date" value={form.start_date} onChange={e => setForm({...form,start_date:e.target.value})} /></div>
                                        <div className="col-6"><label className="form-label">Expected End Date</label><input className="form-control" type="date" value={form.end_date} onChange={e => setForm({...form,end_date:e.target.value})} /></div>
                                        <div className="col-6">
                                            <label className="form-label">Status</label>
                                            <select className="form-select" value={form.status} onChange={e => setForm({...form,status:e.target.value})}>
                                                {STATUSES.filter(s=>s!=="All").map(s => <option key={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-6"><label className="form-label">Expected Yield (lbs)</label><input className="form-control" type="number" value={form.yield_amount} onChange={e => setForm({...form,yield_amount:e.target.value})} /></div>
                                        <div className="col-12"><label className="form-label">Notes</label><textarea className="form-control" rows="2" value={form.notes} onChange={e => setForm({...form,notes:e.target.value})} /></div>
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
export default PlantBatchList;
