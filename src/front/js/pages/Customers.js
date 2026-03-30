import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";

const Customers = () => {
    const { store, actions } = useContext(Context);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState("");
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ first_name:"", last_name:"", email:"", phone:"", membership_level:"standard", verification_status:"pending" });

    useEffect(() => { actions.fetchCustomers(); }, []);

    const customers = store.customers || [];
    const filtered = customers.filter(c =>
        `${c.first_name} ${c.last_name} ${c.email} ${c.phone}`.toLowerCase().includes(search.toLowerCase())
    );

    const openNew = () => { setEditing(null); setForm({ first_name:"", last_name:"", email:"", phone:"", membership_level:"standard", verification_status:"pending" }); setShowModal(true); };
    const openEdit = (c) => { setEditing(c); setForm({ first_name:c.first_name||"", last_name:c.last_name||"", email:c.email||"", phone:c.phone||"", membership_level:c.membership_level||"standard", verification_status:c.verification_status||"pending" }); setShowModal(true); };

    const handleSave = async () => {
        setSaving(true);
        if (editing) await actions.editCustomer(editing.id, form);
        else await actions.addCustomer(form);
        await actions.fetchCustomers();
        setShowModal(false);
        setSaving(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete customer?")) return;
        await actions.deleteCustomer(id);
        await actions.fetchCustomers();
    };

    const MEMBERSHIP_COLORS = { gold:"bg-warning text-dark", premium:"bg-info", standard:"bg-secondary" };

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2>Customers</h2><p>{customers.length} registered customers</p></div>
                <button className="btn btn-success" onClick={openNew}>+ Add Customer</button>
            </div>
            <div className="glass-panel mb-3">
                <input className="form-control" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="glass-panel">
                <table className="table mb-0">
                    <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Membership</th><th>Loyalty Pts</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        {filtered.map(c => (
                            <tr key={c.id}>
                                <td><strong>{c.first_name} {c.last_name}</strong></td>
                                <td style={{fontSize:"0.85rem"}}>{c.email}</td>
                                <td style={{fontSize:"0.85rem"}}>{c.phone}</td>
                                <td><span className={`badge ${MEMBERSHIP_COLORS[c.membership_level]||"bg-secondary"}`}>{c.membership_level}</span></td>
                                <td>🏆 {c.loyalty_points||0}</td>
                                <td><span className={`badge ${c.verification_status==="verified"?"bg-success":"bg-warning text-dark"}`}>{c.verification_status}</span></td>
                                <td>
                                    <button className="btn btn-sm btn-outline-light me-1" onClick={() => openEdit(c)}>Edit</button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && <tr><td colSpan="7" className="text-center py-4" style={{color:"rgba(255,255,255,0.5)"}}>No customers found</td></tr>}
                    </tbody>
                </table>
            </div>
            {showModal && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{editing ? "Edit Customer" : "Add Customer"}</h5>
                                    <button className="btn-close" onClick={() => setShowModal(false)} />
                                </div>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        <div className="col-6"><label className="form-label">First Name</label><input className="form-control" value={form.first_name} onChange={e => setForm({...form,first_name:e.target.value})} /></div>
                                        <div className="col-6"><label className="form-label">Last Name</label><input className="form-control" value={form.last_name} onChange={e => setForm({...form,last_name:e.target.value})} /></div>
                                        <div className="col-12"><label className="form-label">Email</label><input className="form-control" type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} /></div>
                                        <div className="col-6"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} /></div>
                                        <div className="col-6">
                                            <label className="form-label">Membership</label>
                                            <select className="form-select" value={form.membership_level} onChange={e => setForm({...form,membership_level:e.target.value})}>
                                                <option value="standard">Standard</option>
                                                <option value="gold">Gold</option>
                                                <option value="premium">Premium</option>
                                            </select>
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label">Verification</label>
                                            <select className="form-select" value={form.verification_status} onChange={e => setForm({...form,verification_status:e.target.value})}>
                                                <option value="pending">Pending</option>
                                                <option value="verified">Verified</option>
                                            </select>
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
export default Customers;
