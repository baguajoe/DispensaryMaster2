import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Customers = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ first_name:"", last_name:"", email:"", phone:"", membership_level:"standard", verification_status:"pending" });
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    const load = () => {
        fetch(`${process.env.BACKEND_URL}/api/customers`, { headers })
            .then(r => r.ok ? r.json() : [])
            .then(data => { setCustomers(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/customers`, { method:"POST", headers, body:JSON.stringify(form) });
            if (r.ok) { load(); setShowForm(false); setForm({ first_name:"", last_name:"", email:"", phone:"", membership_level:"standard", verification_status:"pending" }); }
        } catch(e) { console.error(e); } finally { setSaving(false); }
    };

    const filtered = customers.filter(c => {
        const matchSearch = `${c.first_name} ${c.last_name} ${c.email}`.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === "all" || c.membership_level === filter;
        return matchSearch && matchFilter;
    });

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2 style={{ color: "#ffab00", fontWeight: 800 }}>👥 Customers</h2><p>{customers.length} total customers</p></div>
                <button className="btn btn-success" onClick={()=>setShowForm(!showForm)}>+ Add Customer</button>
            </div>

            <div className="row g-3 mb-4">
                {[{l:"Total",v:customers.length,c:"#11cdef"},{l:"Premium",v:customers.filter(c=>c.membership_level==="premium").length,c:"#ffd600"},{l:"Verified",v:customers.filter(c=>c.verification_status==="verified").length,c:"#2dce89"},{l:"Pending",v:customers.filter(c=>c.verification_status==="pending").length,c:"#fb6340"}].map((s,i)=>(
                    <div key={i} className="col-6 col-md-3"><div className="glass-panel text-center">
                        <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>{s.l}</div>
                        <div style={{fontSize:"1.8rem",fontWeight:700,color:s.c}}>{s.v}</div>
                    </div></div>
                ))}
            </div>

            {showForm && (
                <div className="glass-panel mb-4">
                    <h5 className="mb-3">New Customer</h5>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-3"><label className="form-label">First Name *</label><input className="form-control" required value={form.first_name} onChange={e=>setForm({...form,first_name:e.target.value})} /></div>
                            <div className="col-md-3"><label className="form-label">Last Name *</label><input className="form-control" required value={form.last_name} onChange={e=>setForm({...form,last_name:e.target.value})} /></div>
                            <div className="col-md-3"><label className="form-label">Email *</label><input className="form-control" type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></div>
                            <div className="col-md-3"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} /></div>
                            <div className="col-md-4">
                                <label className="form-label">Membership</label>
                                <select className="form-select" value={form.membership_level} onChange={e=>setForm({...form,membership_level:e.target.value})}>
                                    <option value="standard">Standard</option>
                                    <option value="premium">Premium</option>
                                    <option value="vip">VIP</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Verification</label>
                                <select className="form-select" value={form.verification_status} onChange={e=>setForm({...form,verification_status:e.target.value})}>
                                    <option value="pending">Pending</option>
                                    <option value="verified">Verified</option>
                                </select>
                            </div>
                            <div className="col-12 d-flex gap-2">
                                <button type="button" className="btn btn-outline-light" onClick={()=>setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-success flex-grow-1" disabled={saving}>{saving?<span className="spinner-border spinner-border-sm"/>:"Save Customer"}</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="glass-panel">
                <div className="d-flex gap-3 mb-3">
                    <input className="form-control" placeholder="Search customers..." value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:"300px"}} />
                    <select className="form-select" value={filter} onChange={e=>setFilter(e.target.value)} style={{maxWidth:"200px"}}>
                        <option value="all">All Members</option>
                        <option value="standard">Standard</option>
                        <option value="premium">Premium</option>
                        <option value="vip">VIP</option>
                    </select>
                </div>
                <div className="table-responsive">
                    <table className="table table-dark table-hover mb-0">
                        <thead><tr style={{color:"rgba(255,255,255,0.5)",fontSize:"0.8rem",textTransform:"uppercase"}}>
                            <th>Name</th><th>Email</th><th>Phone</th><th>Membership</th><th>Status</th><th>Actions</th>
                        </tr></thead>
                        <tbody>
                            {filtered.map(c => (
                                <tr key={c.id}>
                                    <td style={{fontWeight:600}}>{c.first_name} {c.last_name}</td>
                                    <td style={{fontSize:"0.85rem"}}>{c.email}</td>
                                    <td style={{fontSize:"0.85rem"}}>{c.phone}</td>
                                    <td><span className={`badge bg-${c.membership_level==="premium"?"warning text-dark":c.membership_level==="vip"?"success":"secondary"}`}>{c.membership_level}</span></td>
                                    <td><span className={`badge bg-${c.verification_status==="verified"?"success":"warning text-dark"}`}>{c.verification_status}</span></td>
                                    <td><button className="btn btn-outline-light btn-sm" onClick={()=>navigate(`/customer-dashboard`)}>View</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
export default Customers;
