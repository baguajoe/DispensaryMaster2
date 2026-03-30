import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";

const Deals = () => {
    const { store, actions } = useContext(Context);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ title:"", description:"", discount_percent:0, start_date:"", end_date:"", is_active:true });
    const token = localStorage.getItem("token");

    useEffect(() => { actions.fetchDeals(); }, []);

    const deals = store.deals || [];

    const openNew = () => { setEditing(null); setForm({ title:"", description:"", discount_percent:0, start_date:"", end_date:"", is_active:true }); setShowModal(true); };
    const openEdit = (d) => { setEditing(d); setForm({ title:d.title||"", description:d.description||"", discount_percent:d.discount_percent||0, start_date:d.start_date?.split("T")[0]||"", end_date:d.end_date?.split("T")[0]||"", is_active:d.is_active!==false }); setShowModal(true); };

    const handleSave = async () => {
        setSaving(true);
        try {
            const url = editing ? `${process.env.BACKEND_URL}/api/deals/${editing.id}` : `${process.env.BACKEND_URL}/api/deals`;
            const method = editing ? "PUT" : "POST";
            const r = await fetch(url, {
                method, headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
                body: JSON.stringify(form)
            });
            if (r.ok) { await actions.fetchDeals(); setShowModal(false); }
        } catch(e) { console.error(e); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this deal?")) return;
        await fetch(`${process.env.BACKEND_URL}/api/deals/${id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` } });
        await actions.fetchDeals();
    };

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2>🏷️ Deals & Promotions</h2><p>Manage dispensary promotions and discounts</p></div>
                <button className="btn btn-success" onClick={openNew}>+ Create Deal</button>
            </div>
            {deals.length === 0 ? (
                <div className="text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}>
                    <div style={{fontSize:"3rem"}}>🏷️</div>
                    <h5>No deals yet</h5>
                    <button className="btn btn-success mt-2" onClick={openNew}>Create First Deal</button>
                </div>
            ) : (
                <div className="row g-3">
                    {deals.map(d => (
                        <div key={d.id} className="col-md-4">
                            <div className="glass-panel h-100">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h5 className="mb-0">{d.title}</h5>
                                    <span className={`badge ${d.is_active!==false?"bg-success":"bg-secondary"}`}>{d.is_active!==false?"Active":"Inactive"}</span>
                                </div>
                                <p style={{color:"rgba(255,255,255,0.6)",fontSize:"0.9rem"}}>{d.description}</p>
                                <div className="d-flex justify-content-between align-items-center mt-2">
                                    <span className="badge bg-warning text-dark fs-6">{d.discount_percent}% OFF</span>
                                    <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>
                                        {d.start_date && `${new Date(d.start_date).toLocaleDateString()} — ${new Date(d.end_date).toLocaleDateString()}`}
                                    </div>
                                </div>
                                <div className="d-flex gap-2 mt-3">
                                    <button className="btn btn-sm btn-outline-light flex-grow-1" onClick={() => openEdit(d)}>Edit</button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(d.id)}>Delete</button>
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
                                    <h5 className="modal-title">{editing ? "Edit Deal" : "Create Deal"}</h5>
                                    <button className="btn-close" onClick={() => setShowModal(false)} />
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3"><label className="form-label">Title</label><input className="form-control" value={form.title} onChange={e => setForm({...form,title:e.target.value})} /></div>
                                    <div className="mb-3"><label className="form-label">Description</label><textarea className="form-control" rows="3" value={form.description} onChange={e => setForm({...form,description:e.target.value})} /></div>
                                    <div className="mb-3"><label className="form-label">Discount %</label><input className="form-control" type="number" min="0" max="100" value={form.discount_percent} onChange={e => setForm({...form,discount_percent:parseFloat(e.target.value)||0})} /></div>
                                    <div className="row g-2 mb-3">
                                        <div className="col-6"><label className="form-label">Start Date</label><input className="form-control" type="date" value={form.start_date} onChange={e => setForm({...form,start_date:e.target.value})} /></div>
                                        <div className="col-6"><label className="form-label">End Date</label><input className="form-control" type="date" value={form.end_date} onChange={e => setForm({...form,end_date:e.target.value})} /></div>
                                    </div>
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" checked={form.is_active} onChange={e => setForm({...form,is_active:e.target.checked})} />
                                        <label className="form-check-label">Active</label>
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
export default Deals;
