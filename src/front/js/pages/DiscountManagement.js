import React, { useState, useEffect } from "react";

const DiscountManagement = () => {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ title:"", description:"", discount_percent:0, discount_type:"percent", min_purchase:0, start_date:"", end_date:"", is_active:true, code:"" });
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    const load = () => {
        fetch(`${process.env.BACKEND_URL}/api/deals`, { headers })
            .then(r => r.ok ? r.json() : [])
            .then(data => { setDeals(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            const url = editing ? `${process.env.BACKEND_URL}/api/deals/${editing.id}` : `${process.env.BACKEND_URL}/api/deals`;
            const r = await fetch(url, { method:editing?"PUT":"POST", headers, body:JSON.stringify(form) });
            if (r.ok) { load(); setShowForm(false); setEditing(null); }
        } catch(e) { console.error(e); } finally { setSaving(false); }
    };

    const handleToggle = async (deal) => {
        await fetch(`${process.env.BACKEND_URL}/api/deals/${deal.id}`, {
            method:"PUT", headers, body:JSON.stringify({...deal, is_active:!deal.is_active})
        });
        load();
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this deal?")) return;
        await fetch(`${process.env.BACKEND_URL}/api/deals/${id}`, { method:"DELETE", headers });
        load();
    };

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2>🏷️ Discount Management</h2><p>{deals.filter(d=>d.is_active).length} active deals</p></div>
                <button className="btn btn-success" onClick={()=>{ setEditing(null); setForm({ title:"", description:"", discount_percent:0, discount_type:"percent", min_purchase:0, start_date:"", end_date:"", is_active:true, code:"" }); setShowForm(!showForm); }}>+ New Deal</button>
            </div>

            <div className="row g-3 mb-4">
                {[{l:"Total Deals",v:deals.length,c:"#11cdef"},{l:"Active",v:deals.filter(d=>d.is_active).length,c:"#2dce89"},{l:"Inactive",v:deals.filter(d=>!d.is_active).length,c:"#fb6340"}].map((s,i)=>(
                    <div key={i} className="col-4"><div className="glass-panel text-center">
                        <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>{s.l}</div>
                        <div style={{fontSize:"1.8rem",fontWeight:700,color:s.c}}>{s.v}</div>
                    </div></div>
                ))}
            </div>

            {showForm && (
                <div className="glass-panel mb-4">
                    <h5 className="mb-3">{editing?"Edit Deal":"New Deal"}</h5>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-4"><label className="form-label">Title *</label><input className="form-control" required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} /></div>
                            <div className="col-md-4"><label className="form-label">Promo Code</label><input className="form-control" value={form.code||""} onChange={e=>setForm({...form,code:e.target.value})} placeholder="SAVE20" /></div>
                            <div className="col-md-2"><label className="form-label">Discount %</label><input className="form-control" type="number" min="0" max="100" value={form.discount_percent} onChange={e=>setForm({...form,discount_percent:parseFloat(e.target.value)})} /></div>
                            <div className="col-md-2"><label className="form-label">Min Purchase ($)</label><input className="form-control" type="number" min="0" value={form.min_purchase||0} onChange={e=>setForm({...form,min_purchase:parseFloat(e.target.value)})} /></div>
                            <div className="col-md-3"><label className="form-label">Start Date</label><input className="form-control" type="date" value={form.start_date||""} onChange={e=>setForm({...form,start_date:e.target.value})} /></div>
                            <div className="col-md-3"><label className="form-label">End Date</label><input className="form-control" type="date" value={form.end_date||""} onChange={e=>setForm({...form,end_date:e.target.value})} /></div>
                            <div className="col-md-6"><label className="form-label">Description</label><input className="form-control" value={form.description||""} onChange={e=>setForm({...form,description:e.target.value})} /></div>
                            <div className="col-12 d-flex gap-2">
                                <button type="button" className="btn btn-outline-light" onClick={()=>setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-success flex-grow-1" disabled={saving}>{saving?<span className="spinner-border spinner-border-sm"/>:editing?"Update Deal":"Create Deal"}</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="row g-3">
                {deals.map(deal => (
                    <div key={deal.id} className="col-md-6 col-lg-4">
                        <div className="glass-panel h-100" style={{borderColor:deal.is_active?"rgba(45,206,137,0.3)":"rgba(255,255,255,0.1)"}}>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <h5 className="mb-0">{deal.title}</h5>
                                <div className="form-check form-switch mb-0">
                                    <input className="form-check-input" type="checkbox" checked={deal.is_active} onChange={()=>handleToggle(deal)} />
                                </div>
                            </div>
                            {deal.code && <div className="mb-2"><span className="badge bg-info">{deal.code}</span></div>}
                            <div style={{fontSize:"2rem",fontWeight:800,color:"#2dce89"}}>{deal.discount_percent}% OFF</div>
                            {deal.min_purchase > 0 && <div style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.5)"}}>Min purchase: ${deal.min_purchase}</div>}
                            {deal.description && <p style={{fontSize:"0.85rem",color:"rgba(255,255,255,0.6)",margin:"0.5rem 0"}}>{deal.description}</p>}
                            {(deal.start_date||deal.end_date) && <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.4)"}}>{deal.start_date} → {deal.end_date}</div>}
                            <div className="d-flex gap-2 mt-3">
                                <button className="btn btn-outline-light btn-sm flex-grow-1" onClick={()=>{ setEditing(deal); setForm(deal); setShowForm(true); }}>Edit</button>
                                <button className="btn btn-outline-danger btn-sm" onClick={()=>handleDelete(deal.id)}>Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default DiscountManagement;
