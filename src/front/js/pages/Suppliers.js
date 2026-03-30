import React, { useEffect, useContext, useState } from "react";
import { Context } from "../store/appContext";

const Suppliers = () => {
    const { store, actions } = useContext(Context);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState("");
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name:"", company_name:"", contact_info:"", email:"", phone:"", address:"", country:"USA", region:"", is_active:true, rating:5 });

    useEffect(() => { actions.fetchSuppliers(); }, []);

    const suppliers = store.suppliers || [];
    const filtered = suppliers.filter(s =>
        (s.name||s.company_name||"").toLowerCase().includes(search.toLowerCase()) ||
        (s.contact_info||"").toLowerCase().includes(search.toLowerCase())
    );

    const openNew = () => { setEditing(null); setForm({ name:"", company_name:"", contact_info:"", email:"", phone:"", address:"", country:"USA", region:"", is_active:true, rating:5 }); setShowModal(true); };
    const openEdit = (s) => { setEditing(s); setForm({ name:s.name||"", company_name:s.company_name||"", contact_info:s.contact_info||"", email:s.email||"", phone:s.phone||"", address:s.address||"", country:s.country||"USA", region:s.region||"", is_active:s.is_active!==false, rating:s.rating||5 }); setShowModal(true); };

    const handleSave = async () => {
        setSaving(true);
        if (editing) await actions.editSupplier(editing.id, form);
        else await actions.addSupplier(form);
        await actions.fetchSuppliers();
        setShowModal(false);
        setSaving(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this supplier?")) {
            await actions.deleteSupplier(id);
            await actions.fetchSuppliers();
        }
    };

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2>Suppliers</h2><p>{suppliers.length} suppliers registered</p></div>
                <button className="btn btn-success" onClick={openNew}>+ Add Supplier</button>
            </div>
            <div className="glass-panel mb-3">
                <input className="form-control" placeholder="Search suppliers..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="glass-panel">
                {filtered.length === 0 ? (
                    <div className="text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}>
                        <div style={{fontSize:"3rem"}}>🏭</div>
                        <h5>No suppliers yet</h5>
                        <button className="btn btn-success mt-2" onClick={openNew}>Add First Supplier</button>
                    </div>
                ) : (
                    <table className="table mb-0">
                        <thead><tr><th>Company</th><th>Contact</th><th>Region</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {filtered.map(s => (
                                <tr key={s.id}>
                                    <td><strong>{s.company_name||s.name}</strong><div style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.5)"}}>{s.name}</div></td>
                                    <td><div>{s.contact_info||s.email}</div><div style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.5)"}}>{s.phone}</div></td>
                                    <td>{s.region||s.country||"—"}</td>
                                    <td>{"⭐".repeat(Math.min(5, Math.round(s.rating||0)))}</td>
                                    <td><span className={`badge ${s.is_active!==false?"bg-success":"bg-secondary"}`}>{s.is_active!==false?"Active":"Inactive"}</span></td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-light me-1" onClick={() => openEdit(s)}>Edit</button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(s.id)}>Delete</button>
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
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{editing ? "Edit Supplier" : "Add Supplier"}</h5>
                                    <button className="btn-close" onClick={() => setShowModal(false)} />
                                </div>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        {[
                                            { label:"Contact Name", key:"name" },
                                            { label:"Company Name", key:"company_name" },
                                            { label:"Contact Info / Email", key:"contact_info" },
                                            { label:"Phone", key:"phone" },
                                            { label:"Address", key:"address" },
                                            { label:"Country", key:"country" },
                                            { label:"Region / State", key:"region" },
                                        ].map(f => (
                                            <div key={f.key} className="col-md-6">
                                                <label className="form-label">{f.label}</label>
                                                <input className="form-control" value={form[f.key]} onChange={e => setForm({...form, [f.key]:e.target.value})} />
                                            </div>
                                        ))}
                                        <div className="col-md-3">
                                            <label className="form-label">Rating (1-5)</label>
                                            <input className="form-control" type="number" min="1" max="5" value={form.rating} onChange={e => setForm({...form, rating:parseFloat(e.target.value)})} />
                                        </div>
                                        <div className="col-md-3 d-flex align-items-end">
                                            <div className="form-check">
                                                <input className="form-check-input" type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active:e.target.checked})} />
                                                <label className="form-check-label">Active</label>
                                            </div>
                                        </div>
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
export default Suppliers;
