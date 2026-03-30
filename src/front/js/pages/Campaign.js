import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";

const Campaign = () => {
    const { store, actions } = useContext(Context);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name:"", description:"", start_date:"", end_date:"", budget:"", status:"active" });

    useEffect(() => { actions.fetchCampaigns(); }, []);

    const campaigns = store.campaigns || [];

    const openNew = () => { setEditing(null); setForm({ name:"", description:"", start_date:"", end_date:"", budget:"", status:"active" }); setShowModal(true); };
    const openEdit = (c) => { setEditing(c); setForm({ name:c.name||"", description:c.description||"", start_date:c.start_date?.split("T")[0]||"", end_date:c.end_date?.split("T")[0]||"", budget:c.budget||"", status:c.status||"active" }); setShowModal(true); };

    const handleSave = async () => {
        setSaving(true);
        if (editing) await actions.editCampaign(editing.id, form);
        else await actions.addCampaign(form);
        await actions.fetchCampaigns();
        setShowModal(false);
        setSaving(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete campaign?")) return;
        await actions.deleteCampaign(id);
        await actions.fetchCampaigns();
    };

    const STATUS_COLORS = { active:"success", paused:"warning", completed:"info", draft:"secondary" };

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2>📢 Campaigns</h2><p>Marketing campaigns and promotions</p></div>
                <button className="btn btn-success" onClick={openNew}>+ New Campaign</button>
            </div>
            {campaigns.length === 0 ? (
                <div className="text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}>
                    <div style={{fontSize:"3rem"}}>📢</div>
                    <h5>No campaigns yet</h5>
                    <button className="btn btn-success mt-2" onClick={openNew}>Create First Campaign</button>
                </div>
            ) : (
                <div className="row g-3">
                    {campaigns.map(c => (
                        <div key={c.id} className="col-md-4">
                            <div className="glass-panel h-100">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h5 className="mb-0">{c.name}</h5>
                                    <span className={`badge bg-${STATUS_COLORS[c.status]||"secondary"} ${c.status==="paused"?"text-dark":""}`}>{c.status}</span>
                                </div>
                                <p style={{color:"rgba(255,255,255,0.6)",fontSize:"0.9rem"}}>{c.description}</p>
                                {c.budget && <div className="mb-2"><span className="badge bg-info">Budget: ${c.budget}</span></div>}
                                {c.start_date && (
                                    <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>
                                        {new Date(c.start_date).toLocaleDateString()} — {c.end_date ? new Date(c.end_date).toLocaleDateString() : "Ongoing"}
                                    </div>
                                )}
                                <div className="d-flex gap-2 mt-3">
                                    <button className="btn btn-sm btn-outline-light flex-grow-1" onClick={() => openEdit(c)}>Edit</button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c.id)}>Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {showModal && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{editing ? "Edit Campaign" : "New Campaign"}</h5>
                                    <button className="btn-close" onClick={() => setShowModal(false)} />
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3"><label className="form-label">Campaign Name</label><input className="form-control" value={form.name} onChange={e => setForm({...form,name:e.target.value})} /></div>
                                    <div className="mb-3"><label className="form-label">Description</label><textarea className="form-control" rows="3" value={form.description} onChange={e => setForm({...form,description:e.target.value})} /></div>
                                    <div className="row g-2 mb-3">
                                        <div className="col-6"><label className="form-label">Start</label><input className="form-control" type="date" value={form.start_date} onChange={e => setForm({...form,start_date:e.target.value})} /></div>
                                        <div className="col-6"><label className="form-label">End</label><input className="form-control" type="date" value={form.end_date} onChange={e => setForm({...form,end_date:e.target.value})} /></div>
                                    </div>
                                    <div className="mb-3"><label className="form-label">Budget ($)</label><input className="form-control" value={form.budget} onChange={e => setForm({...form,budget:e.target.value})} /></div>
                                    <div className="mb-3">
                                        <label className="form-label">Status</label>
                                        <select className="form-select" value={form.status} onChange={e => setForm({...form,status:e.target.value})}>
                                            {["draft","active","paused","completed"].map(s => <option key={s}>{s}</option>)}
                                        </select>
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
export default Campaign;
