import React, { useState, useEffect } from "react";

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [form, setForm] = useState({ name:"", contact_name:"", email:"", phone:"", address:"", city:"", state:"", products_supplied:"", payment_terms:"", notes:"" });
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    const load = () => {
        fetch(`${process.env.BACKEND_URL}/api/suppliers`, { headers })
            .then(r => r.ok ? r.json() : [])
            .then(data => { setSuppliers(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            const url = editing ? `${process.env.BACKEND_URL}/api/suppliers/${editing.id}` : `${process.env.BACKEND_URL}/api/suppliers`;
            const r = await fetch(url, { method: editing?"PUT":"POST", headers, body: JSON.stringify(form) });
            if (r.ok) { load(); setShowForm(false); setEditing(null); setForm({ name:"", contact_name:"", email:"", phone:"", address:"", city:"", state:"", products_supplied:"", payment_terms:"", notes:"" }); }
        } catch(e) { console.error(e); } finally { setSaving(false); }
    };

    const filtered = suppliers.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()) || s.contact_name?.toLowerCase().includes(search.toLowerCase()));

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2 style={{ color: "#ffab00", fontWeight: 800 }}>🚚 Suppliers</h2><p>{suppliers.length} suppliers</p></div>
                <button className="btn btn-success" onClick={() => { setEditing(null); setShowForm(!showForm); }}>+ Add Supplier</button>
            </div>

            <div className="glass-panel mb-4">
                <input className="form-control" placeholder="Search suppliers..." value={search} onChange={e=>setSearch(e.target.value)} />
            </div>

            {showForm && (
                <div className="glass-panel mb-4">
                    <h5 className="mb-3">{editing ? "Edit Supplier" : "New Supplier"}</h5>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-4"><label className="form-label">Company Name *</label><input className="form-control" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
                            <div className="col-md-4"><label className="form-label">Contact Name</label><input className="form-control" value={form.contact_name} onChange={e=>setForm({...form,contact_name:e.target.value})} /></div>
                            <div className="col-md-4"><label className="form-label">Email</label><input className="form-control" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></div>
                            <div className="col-md-3"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} /></div>
                            <div className="col-md-3"><label className="form-label">City</label><input className="form-control" value={form.city} onChange={e=>setForm({...form,city:e.target.value})} /></div>
                            <div className="col-md-2"><label className="form-label">State</label><input className="form-control" value={form.state} onChange={e=>setForm({...form,state:e.target.value})} /></div>
                            <div className="col-md-4"><label className="form-label">Products Supplied</label><input className="form-control" value={form.products_supplied} onChange={e=>setForm({...form,products_supplied:e.target.value})} placeholder="Flower, Edibles..." /></div>
                            <div className="col-md-4"><label className="form-label">Payment Terms</label><input className="form-control" value={form.payment_terms} onChange={e=>setForm({...form,payment_terms:e.target.value})} placeholder="Net 30, COD..." /></div>
                            <div className="col-12"><label className="form-label">Notes</label><textarea className="form-control" rows="2" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} /></div>
                            <div className="col-12 d-flex gap-2">
                                <button type="button" className="btn btn-outline-light" onClick={()=>setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-success flex-grow-1" disabled={saving}>{saving?<span className="spinner-border spinner-border-sm"/>:editing?"Update":"Save Supplier"}</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="row g-3">
                {filtered.map(s => (
                    <div key={s.id} className="col-md-6 col-lg-4">
                        <div className="glass-panel h-100">
                            <h5 className="mb-1">{s.name}</h5>
                            {s.contact_name && <p style={{fontSize:"0.85rem",color:"rgba(255,255,255,0.6)",margin:"0 0 0.25rem"}}>👤 {s.contact_name}</p>}
                            {s.email && <p style={{fontSize:"0.85rem",color:"rgba(255,255,255,0.6)",margin:"0 0 0.25rem"}}>✉️ {s.email}</p>}
                            {s.phone && <p style={{fontSize:"0.85rem",color:"rgba(255,255,255,0.6)",margin:"0 0 0.25rem"}}>📞 {s.phone}</p>}
                            {s.products_supplied && <p style={{fontSize:"0.8rem",color:"#2dce89",margin:"0 0 0.75rem"}}>📦 {s.products_supplied}</p>}
                            <div className="d-flex gap-2">
                                <button className="btn btn-outline-light btn-sm flex-grow-1" onClick={()=>{ setEditing(s); setForm(s); setShowForm(true); }}>Edit</button>
                                <button className="btn btn-outline-danger btn-sm" onClick={async()=>{ if(window.confirm("Delete?")){ await fetch(`${process.env.BACKEND_URL}/api/suppliers/${s.id}`,{method:"DELETE",headers}); load(); } }}>Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default Suppliers;
