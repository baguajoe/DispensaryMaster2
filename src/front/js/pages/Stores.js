import React, { useState, useEffect } from "react";

const Stores = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name:"", address:"", city:"", state:"", zip_code:"", phone:"", email:"", is_active:true });
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    const load = () => {
        fetch(`${process.env.BACKEND_URL}/api/stores`, { headers })
            .then(r => r.ok ? r.json() : [])
            .then(data => { setStores(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            const url = editing ? `${process.env.BACKEND_URL}/api/stores/${editing.id}` : `${process.env.BACKEND_URL}/api/stores`;
            const method = editing ? "PUT" : "POST";
            const r = await fetch(url, { method, headers, body: JSON.stringify(form) });
            if (r.ok) { load(); setShowForm(false); setEditing(null); setForm({ name:"", address:"", city:"", state:"", zip_code:"", phone:"", email:"", is_active:true }); }
        } catch(e) { console.error(e); } finally { setSaving(false); }
    };

    const handleEdit = (store) => { setEditing(store); setForm(store); setShowForm(true); };
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this store?")) return;
        await fetch(`${process.env.BACKEND_URL}/api/stores/${id}`, { method:"DELETE", headers });
        load();
    };

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2 style={{ color: "#ffab00", fontWeight: 800 }}>🏪 Stores</h2><p>{stores.length} locations</p></div>
                <button className="btn btn-success" onClick={() => { setEditing(null); setForm({ name:"", address:"", city:"", state:"", zip_code:"", phone:"", email:"", is_active:true }); setShowForm(!showForm); }}>+ Add Store</button>
            </div>

            {showForm && (
                <div className="glass-panel mb-4">
                    <h5 className="mb-3">{editing ? "Edit Store" : "New Store"}</h5>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-6"><label className="form-label">Store Name *</label><input className="form-control" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
                            <div className="col-md-6"><label className="form-label">Address</label><input className="form-control" value={form.address||""} onChange={e=>setForm({...form,address:e.target.value})} /></div>
                            <div className="col-md-3"><label className="form-label">City</label><input className="form-control" value={form.city||""} onChange={e=>setForm({...form,city:e.target.value})} /></div>
                            <div className="col-md-2"><label className="form-label">State</label><input className="form-control" value={form.state||""} onChange={e=>setForm({...form,state:e.target.value})} /></div>
                            <div className="col-md-2"><label className="form-label">Zip</label><input className="form-control" value={form.zip_code||""} onChange={e=>setForm({...form,zip_code:e.target.value})} /></div>
                            <div className="col-md-3"><label className="form-label">Phone</label><input className="form-control" value={form.phone||""} onChange={e=>setForm({...form,phone:e.target.value})} /></div>
                            <div className="col-md-3"><label className="form-label">Email</label><input className="form-control" type="email" value={form.email||""} onChange={e=>setForm({...form,email:e.target.value})} /></div>
                            <div className="col-md-3 d-flex align-items-end">
                                <div className="form-check form-switch">
                                    <input className="form-check-input" type="checkbox" checked={form.is_active} onChange={e=>setForm({...form,is_active:e.target.checked})} />
                                    <label className="form-check-label">Active</label>
                                </div>
                            </div>
                            <div className="col-12 d-flex gap-2">
                                <button type="button" className="btn btn-outline-light" onClick={()=>setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-success flex-grow-1" disabled={saving}>{saving?<span className="spinner-border spinner-border-sm"/>:editing?"Update Store":"Create Store"}</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="row g-3">
                {stores.length === 0 ? (
                    <div className="col-12"><div className="glass-panel text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}><div style={{fontSize:"3rem"}}>🏪</div><h5>No stores yet</h5></div></div>
                ) : stores.map(store => (
                    <div key={store.id} className="col-md-6 col-lg-4">
                        <div className="glass-panel h-100">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <h5 className="mb-0">{store.name}</h5>
                                <span className={`badge bg-${store.is_active !== false ? "success" : "secondary"}`}>{store.is_active !== false ? "Active" : "Inactive"}</span>
                            </div>
                            {store.address && <p style={{fontSize:"0.85rem",color:"rgba(255,255,255,0.6)",margin:"0 0 0.5rem"}}>📍 {store.address}, {store.city}, {store.state}</p>}
                            {store.phone && <p style={{fontSize:"0.85rem",color:"rgba(255,255,255,0.6)",margin:"0 0 0.25rem"}}>📞 {store.phone}</p>}
                            {store.email && <p style={{fontSize:"0.85rem",color:"rgba(255,255,255,0.6)",margin:"0 0 0.75rem"}}>✉️ {store.email}</p>}
                            <div className="d-flex gap-2 mt-2">
                                <button className="btn btn-outline-light btn-sm flex-grow-1" onClick={()=>handleEdit(store)}>Edit</button>
                                <button className="btn btn-outline-danger btn-sm" onClick={()=>handleDelete(store.id)}>Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default Stores;
