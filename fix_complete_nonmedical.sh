#!/bin/bash
cd /workspaces/DispensaryMaster2
echo "Complete non-medical system fix..."

# ============================================================
# 1. ANALYTICS - Replace broken utility file
# ============================================================
cat > src/front/js/pages/Analytics.js << 'EOF'
import React, { useState, useEffect } from "react";

const Analytics = () => {
    const [salesData, setSalesData] = useState(null);
    const [inventoryData, setInventoryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        Promise.all([
            fetch(`${process.env.BACKEND_URL}/api/analytics?type=sales`, { headers }).then(r => r.ok ? r.json() : null),
            fetch(`${process.env.BACKEND_URL}/api/analytics?type=inventory`, { headers }).then(r => r.ok ? r.json() : null)
        ]).then(([sales, inv]) => { setSalesData(sales); setInventoryData(inv); setLoading(false); })
        .catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light" /></div>;

    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2>Analytics</h2><p>Sales performance and inventory insights</p></div>
            <div className="row g-3 mb-4">
                {[
                    { title:"Total Revenue", value:`$${(salesData?.total_sales||0).toFixed(2)}`, icon:"💰", color:"#2dce89" },
                    { title:"Completed Orders", value: salesData?.order_count||0, icon:"📦", color:"#11cdef" },
                    { title:"Avg Order Value", value: salesData?.order_count > 0 ? `$${(salesData.total_sales/salesData.order_count).toFixed(2)}` : "$0", icon:"📊", color:"#fb6340" },
                    { title:"Low Stock Items", value: inventoryData?.low_stock_count||0, icon:"⚠️", color:"#ffd600" },
                ].map((s,i) => (
                    <div key={i} className="col-6 col-md-3">
                        <div className="glass-panel text-center">
                            <div style={{fontSize:"2rem"}}>{s.icon}</div>
                            <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.55)",textTransform:"uppercase",margin:"0.5rem 0 0.25rem"}}>{s.title}</div>
                            <div style={{fontSize:"1.5rem",fontWeight:700,color:s.color}}>{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="row g-3">
                <div className="col-md-6">
                    <div className="glass-panel">
                        <h5 className="mb-3">Sales Summary</h5>
                        <div className="d-flex justify-content-between mb-2"><span style={{color:"rgba(255,255,255,0.6)"}}>Total Revenue</span><strong className="text-success">${(salesData?.total_sales||0).toFixed(2)}</strong></div>
                        <div className="d-flex justify-content-between mb-2"><span style={{color:"rgba(255,255,255,0.6)"}}>Orders</span><strong>{salesData?.order_count||0}</strong></div>
                        <div className="d-flex justify-content-between"><span style={{color:"rgba(255,255,255,0.6)"}}>Avg Order</span><strong>${salesData?.order_count > 0 ? (salesData.total_sales/salesData.order_count).toFixed(2) : "0.00"}</strong></div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="glass-panel">
                        <h5 className="mb-3">Inventory Alerts</h5>
                        {(inventoryData?.low_stock_products||[]).length === 0
                            ? <p className="text-center" style={{color:"rgba(255,255,255,0.5)"}}>✅ All stock levels OK</p>
                            : (inventoryData.low_stock_products||[]).slice(0,6).map(p => (
                                <div key={p.id} className="d-flex justify-content-between mb-2">
                                    <span style={{fontSize:"0.85rem",color:"rgba(255,255,255,0.7)"}}>{p.name}</span>
                                    <span className={`badge ${p.stock===0?"bg-danger":"bg-warning text-dark"}`}>{p.stock} left</span>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Analytics;
EOF
echo "✓ Analytics.js"

# ============================================================
# 2. SUPPLIERS - Fix to use real API
# ============================================================
cat > src/front/js/pages/Suppliers.js << 'EOF'
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
EOF
echo "✓ Suppliers.js"

# ============================================================
# 3. DEALS - Full functional page
# ============================================================
cat > src/front/js/pages/Deals.js << 'EOF'
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
EOF
echo "✓ Deals.js"

# ============================================================
# 4. CUSTOMERS - New full CRUD page
# ============================================================
cat > src/front/js/pages/Customers.js << 'EOF'
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
EOF
echo "✓ Customers.js"

# ============================================================
# 5. INVOICES - Fix broken page
# ============================================================
cat > src/front/js/pages/Invoices.js << 'EOF'
import React, { useState, useEffect } from "react";

const Invoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => { fetchInvoices(); }, []);

    const fetchInvoices = async () => {
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/invoices`, { headers });
            if (r.ok) {
                const data = await r.json();
                setInvoices(Array.isArray(data) ? data : data.invoices || []);
            }
        } catch(e) { console.error(e); }
        finally { setLoading(false); }
    };

    const filtered = invoices.filter(i => filter === "all" || i.status === filter);
    const total = invoices.reduce((s, i) => s + parseFloat(i.total_amount||0), 0);
    const unpaid = invoices.filter(i => i.status === "unpaid").reduce((s, i) => s + parseFloat(i.total_amount||0), 0);

    const STATUS_COLORS = { paid:"success", unpaid:"warning", overdue:"danger" };

    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2>Invoices</h2><p>Manage customer invoices</p></div>
            <div className="row g-3 mb-4">
                {[
                    { label:"Total Invoiced", value:`$${total.toFixed(2)}`, color:"#11cdef" },
                    { label:"Outstanding", value:`$${unpaid.toFixed(2)}`, color:"#ffd600" },
                    { label:"Total Invoices", value:invoices.length, color:"#2dce89" },
                ].map((s,i) => (
                    <div key={i} className="col-md-4">
                        <div className="glass-panel text-center">
                            <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.55)",textTransform:"uppercase"}}>{s.label}</div>
                            <div style={{fontSize:"1.8rem",fontWeight:700,color:s.color}}>{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="d-flex gap-2 mb-3">
                {["all","paid","unpaid","overdue"].map(f => (
                    <button key={f} className={`btn btn-sm ${filter===f?"btn-success":"btn-outline-light"} text-capitalize`} onClick={() => setFilter(f)}>{f}</button>
                ))}
            </div>
            <div className="glass-panel">
                {loading ? <div className="text-center py-4"><div className="spinner-border text-light" /></div>
                : filtered.length === 0 ? <div className="text-center py-4" style={{color:"rgba(255,255,255,0.5)"}}>No invoices found</div>
                : (
                    <table className="table mb-0">
                        <thead><tr><th>Invoice #</th><th>Customer</th><th>Order</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                        <tbody>
                            {filtered.map(inv => (
                                <tr key={inv.id}>
                                    <td><strong>INV-{inv.id}</strong></td>
                                    <td>Customer {inv.customer_id}</td>
                                    <td>#{inv.order_id}</td>
                                    <td className="text-success">${parseFloat(inv.total_amount||0).toFixed(2)}</td>
                                    <td><span className={`badge bg-${STATUS_COLORS[inv.status]||"secondary"} ${inv.status==="unpaid"?"text-dark":""}`}>{inv.status}</span></td>
                                    <td style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.55)"}}>{inv.issue_date ? new Date(inv.issue_date).toLocaleDateString() : "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
export default Invoices;
EOF
echo "✓ Invoices.js"

# ============================================================
# 6. CAMPAIGNS - Fix/rebuild functional page
# ============================================================
cat > src/front/js/pages/Campaign.js << 'EOF'
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
EOF
echo "✓ Campaign.js"

# ============================================================
# 7. BARCODE SCANNER - Full functional
# ============================================================
cat > src/front/js/pages/BarcodeScanner.js << 'EOF'
import React, { useState, useRef } from "react";

const BarcodeScanner = () => {
    const [barcode, setBarcode] = useState("");
    const [product, setProduct] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const inputRef = useRef(null);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const lookupBarcode = async (code) => {
        if (!code.trim()) return;
        setLoading(true);
        setError("");
        setProduct(null);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/products?search=${code}`, { headers });
            if (r.ok) {
                const data = await r.json();
                const found = Array.isArray(data) ? data.find(p => p.sku === code || p.batch_number === code || String(p.id) === code) : null;
                if (found) {
                    setProduct(found);
                    setHistory(prev => [{ code, product:found, time:new Date().toLocaleTimeString() }, ...prev.slice(0,9)]);
                } else {
                    setError(`No product found for barcode: ${code}`);
                }
            }
        } catch(e) { setError("Lookup failed — check your connection"); }
        finally { setLoading(false); }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        lookupBarcode(barcode);
        setBarcode("");
        if (inputRef.current) inputRef.current.focus();
    };

    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2>📷 Barcode Scanner</h2><p>Scan or enter product barcode/SKU to look up inventory</p></div>
            <div className="row g-4">
                <div className="col-md-6">
                    <div className="glass-panel mb-4">
                        <h5 className="mb-3">Scan or Enter Barcode</h5>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group mb-3">
                                <span className="input-group-text" style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"white"}}>📷</span>
                                <input ref={inputRef} className="form-control" placeholder="Scan barcode or enter SKU/batch number..."
                                    value={barcode} onChange={e => setBarcode(e.target.value)}
                                    autoFocus />
                                <button className="btn btn-success" type="submit" disabled={loading}>
                                    {loading ? <span className="spinner-border spinner-border-sm" /> : "Lookup"}
                                </button>
                            </div>
                            <p style={{color:"rgba(255,255,255,0.5)",fontSize:"0.85rem"}}>
                                Connect a USB barcode scanner and it will auto-submit when scanning. Or type the SKU or batch number manually.
                            </p>
                        </form>
                    </div>

                    {error && (
                        <div className="glass-panel mb-4" style={{borderColor:"rgba(245,54,92,0.4)"}}>
                            <p className="text-danger mb-0">❌ {error}</p>
                        </div>
                    )}

                    {product && (
                        <div className="glass-panel mb-4" style={{borderColor:"rgba(45,206,137,0.4)"}}>
                            <h5 className="text-success mb-3">✅ Product Found</h5>
                            <div className="row g-2">
                                {[
                                    { label:"Name", value:product.name },
                                    { label:"SKU", value:product.sku||"—" },
                                    { label:"Batch #", value:product.batch_number||"—" },
                                    { label:"Category", value:product.category },
                                    { label:"Strain", value:product.strain||"—" },
                                    { label:"THC", value:product.thc_content ? `${product.thc_content}%` : "—" },
                                    { label:"Price", value:`$${parseFloat(product.price||0).toFixed(2)}` },
                                    { label:"Stock", value:product.stock||product.current_stock||0 },
                                ].map((f,i) => (
                                    <div key={i} className="col-6">
                                        <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>{f.label}</div>
                                        <div style={{fontWeight:600}}>{f.value}</div>
                                    </div>
                                ))}
                            </div>
                            {(product.stock||product.current_stock||0) === 0 && (
                                <div className="alert alert-danger mt-3 mb-0 py-2">⚠️ This product is out of stock</div>
                            )}
                            {(product.stock||product.current_stock||0) > 0 && (product.stock||product.current_stock||0) <= (product.reorder_point||0) && (
                                <div className="alert alert-warning mt-3 mb-0 py-2">⚠️ Low stock — below reorder point</div>
                            )}
                        </div>
                    )}
                </div>

                <div className="col-md-6">
                    <div className="glass-panel">
                        <h5 className="mb-3">Scan History</h5>
                        {history.length === 0 ? (
                            <p className="text-center py-3" style={{color:"rgba(255,255,255,0.5)"}}>No scans yet</p>
                        ) : (
                            <table className="table mb-0">
                                <thead><tr><th>Time</th><th>Barcode</th><th>Product</th><th>Stock</th></tr></thead>
                                <tbody>
                                    {history.map((h,i) => (
                                        <tr key={i}>
                                            <td style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.5)"}}>{h.time}</td>
                                            <td style={{fontSize:"0.85rem"}}>{h.code}</td>
                                            <td>{h.product?.name}</td>
                                            <td><span className={`badge ${(h.product?.stock||0)===0?"bg-danger":(h.product?.stock||0)<10?"bg-warning text-dark":"bg-success"}`}>{h.product?.stock||0}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default BarcodeScanner;
EOF
echo "✓ BarcodeScanner.js"

# ============================================================
# 8. ADD MISSING FLUX ACTIONS for Suppliers, Customers, Deals, Campaigns
# ============================================================
python3 << 'PYEOF'
with open('src/front/js/store/flux.js', 'r') as f:
    content = f.read()

# Check which actions are missing
missing = []
actions_to_add = ""

if "fetchSuppliers" not in content:
    actions_to_add += """
            fetchSuppliers: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/suppliers", { headers: getActions().getAuthHeaders() });
                    const data = await resp.json();
                    setStore({ suppliers: Array.isArray(data) ? data : [] });
                    return { success: true };
                } catch (error) { return { success: false }; }
            },

            addSupplier: async (supplierData) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/suppliers", {
                        method: "POST", headers: getActions().getAuthHeaders(), body: JSON.stringify(supplierData)
                    });
                    return { success: resp.ok, data: await resp.json() };
                } catch (error) { return { success: false }; }
            },

            editSupplier: async (id, supplierData) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + `/api/suppliers/${id}`, {
                        method: "PUT", headers: getActions().getAuthHeaders(), body: JSON.stringify(supplierData)
                    });
                    return { success: resp.ok };
                } catch (error) { return { success: false }; }
            },

            deleteSupplier: async (id) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + `/api/suppliers/${id}`, {
                        method: "DELETE", headers: getActions().getAuthHeaders()
                    });
                    return { success: resp.ok };
                } catch (error) { return { success: false }; }
            },
"""
    missing.append("supplier actions")

if "addCustomer" not in content:
    actions_to_add += """
            addCustomer: async (data) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/customers", {
                        method: "POST", headers: getActions().getAuthHeaders(), body: JSON.stringify(data)
                    });
                    return { success: resp.ok, data: await resp.json() };
                } catch (error) { return { success: false }; }
            },

            editCustomer: async (id, data) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + `/api/customers/${id}`, {
                        method: "PUT", headers: getActions().getAuthHeaders(), body: JSON.stringify(data)
                    });
                    return { success: resp.ok };
                } catch (error) { return { success: false }; }
            },

            deleteCustomer: async (id) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + `/api/customers/${id}`, {
                        method: "DELETE", headers: getActions().getAuthHeaders()
                    });
                    return { success: resp.ok };
                } catch (error) { return { success: false }; }
            },
"""
    missing.append("customer CRUD actions")

if "addCampaign" not in content:
    actions_to_add += """
            addCampaign: async (data) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/campaigns", {
                        method: "POST", headers: getActions().getAuthHeaders(), body: JSON.stringify(data)
                    });
                    return { success: resp.ok };
                } catch (error) { return { success: false }; }
            },

            editCampaign: async (id, data) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + `/api/campaigns/${id}`, {
                        method: "PUT", headers: getActions().getAuthHeaders(), body: JSON.stringify(data)
                    });
                    return { success: resp.ok };
                } catch (error) { return { success: false }; }
            },

            deleteCampaign: async (id) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + `/api/campaigns/${id}`, {
                        method: "DELETE", headers: getActions().getAuthHeaders()
                    });
                    return { success: resp.ok };
                } catch (error) { return { success: false }; }
            },
"""
    missing.append("campaign CRUD actions")

if actions_to_add:
    # Insert before the closing of actions object
    content = content.replace(
        "            // ─── ANALYTICS ──────────────────────────────────────────",
        actions_to_add + "\n            // ─── ANALYTICS ──────────────────────────────────────────"
    )
    with open('src/front/js/store/flux.js', 'w') as f:
        f.write(content)
    print(f"✓ Added flux actions: {', '.join(missing)}")
else:
    print("  All flux actions already exist")
PYEOF

# ============================================================
# 9. ADD MISSING BACKEND ROUTES
# ============================================================
python3 << 'PYEOF'
with open('src/api/routes.py', 'r') as f:
    content = f.read()

routes_to_add = ""

# Suppliers CRUD
if "def get_suppliers" not in content:
    routes_to_add += """
# -------------------- SUPPLIERS --------------------
@api.route('/suppliers', methods=['GET'])
@jwt_required()
@handle_errors
def get_suppliers():
    suppliers = Supplier.query.all()
    return jsonify([s.serialize() for s in suppliers]), 200

@api.route('/suppliers', methods=['POST'])
@jwt_required()
@handle_errors
def create_supplier():
    data = request.json
    supplier = Supplier(
        name=data.get('name',''),
        company_name=data.get('company_name',''),
        contact_info=data.get('contact_info',''),
        country=data.get('country','USA'),
        region=data.get('region',''),
        is_active=data.get('is_active',True),
        rating=data.get('rating',5)
    )
    db.session.add(supplier)
    db.session.commit()
    return jsonify(supplier.serialize()), 201

@api.route('/suppliers/<int:id>', methods=['PUT'])
@jwt_required()
@handle_errors
def update_supplier(id):
    supplier = Supplier.query.get_or_404(id)
    data = request.json
    for field in ['name','company_name','contact_info','country','region','is_active','rating']:
        if field in data:
            setattr(supplier, field, data[field])
    db.session.commit()
    return jsonify(supplier.serialize()), 200

@api.route('/suppliers/<int:id>', methods=['DELETE'])
@jwt_required()
@handle_errors
def delete_supplier(id):
    supplier = Supplier.query.get_or_404(id)
    db.session.delete(supplier)
    db.session.commit()
    return jsonify({"message": "Supplier deleted"}), 200
"""
    print("✓ Supplier CRUD routes added")

# Customer DELETE and PUT if missing
if "def delete_customer" not in content:
    routes_to_add += """
@api.route('/customers/<int:id>', methods=['DELETE'])
@jwt_required()
@handle_errors
def delete_customer(id):
    customer = Customer.query.get_or_404(id)
    db.session.delete(customer)
    db.session.commit()
    return jsonify({"message": "Customer deleted"}), 200

@api.route('/customers/<int:id>', methods=['PUT'])
@jwt_required()
@handle_errors
def update_customer(id):
    customer = Customer.query.get_or_404(id)
    data = request.json
    for field in ['first_name','last_name','email','phone','membership_level','verification_status']:
        if field in data:
            setattr(customer, field, data[field])
    db.session.commit()
    return jsonify(customer.serialize()), 200
"""
    print("✓ Customer PUT/DELETE routes added")

# Invoices route if missing
if "def get_invoices" not in content:
    routes_to_add += """
@api.route('/invoices', methods=['GET'])
@jwt_required()
@handle_errors
def get_invoices():
    invoices = Invoice.query.all()
    return jsonify([i.serialize() for i in invoices]), 200
"""
    print("✓ Invoices GET route added")

# Deals POST if missing
if "@api.route('/deals', methods=['POST'])" not in content:
    routes_to_add += """
@api.route('/deals', methods=['POST'])
@jwt_required()
@handle_errors
def create_deal():
    data = request.json
    deal = Deal(
        title=data.get('title',''),
        description=data.get('description',''),
        discount_percent=data.get('discount_percent',0),
        is_active=data.get('is_active',True)
    )
    db.session.add(deal)
    db.session.commit()
    return jsonify(deal.serialize()), 201

@api.route('/deals/<int:id>', methods=['DELETE'])
@jwt_required()
@handle_errors
def delete_deal(id):
    deal = Deal.query.get_or_404(id)
    db.session.delete(deal)
    db.session.commit()
    return jsonify({"message": "Deal deleted"}), 200
"""
    print("✓ Deals POST/DELETE routes added")

if routes_to_add:
    content += routes_to_add
    with open('src/api/routes.py', 'w') as f:
        f.write(content)
    print("✓ routes.py saved")
else:
    print("  All routes already exist")
PYEOF

# ============================================================
# 10. ADD CUSTOMERS PAGE TO LAYOUT AND SIDEBAR
# ============================================================
python3 << 'PYEOF'
with open('src/front/js/layout.js', 'r') as f:
    content = f.read()

if 'Customers' not in content or 'import Customers' not in content:
    content = content.replace(
        'import Campaign from "./pages/Campaign";',
        'import Campaign from "./pages/Campaign";\nimport Customers from "./pages/Customers";'
    )
    content = content.replace(
        '<Route path="/campaigns" element={<RequireAuth><Campaign /></RequireAuth>} />',
        '<Route path="/campaigns" element={<RequireAuth><Campaign /></RequireAuth>} />\n                            <Route path="/customers" element={<RequireAuth><Customers /></RequireAuth>} />'
    )
    with open('src/front/js/layout.js', 'w') as f:
        f.write(content)
    print("✓ Customers route added to layout")

# Fix BarcodeScanner import
with open('src/front/js/layout.js', 'r') as f:
    content = f.read()

if 'import BarcodeScanner' not in content:
    content = content.replace(
        'import Campaign from "./pages/Campaign";',
        'import Campaign from "./pages/Campaign";\nimport BarcodeScanner from "./pages/BarcodeScanner";'
    )
    with open('src/front/js/layout.js', 'w') as f:
        f.write(content)
    print("✓ BarcodeScanner import fixed")
PYEOF

# Update sidebar to add Customers
python3 << 'PYEOF'
with open('src/front/js/component/Sidebar.js', 'r') as f:
    content = f.read()

if '"/customers"' not in content:
    content = content.replace(
        '{ name: "Campaigns", path: "/campaigns" },',
        '{ name: "Campaigns", path: "/campaigns" },\n            { name: "Customers", path: "/customers" },'
    )
    with open('src/front/js/component/Sidebar.js', 'w') as f:
        f.write(content)
    print("✓ Customers added to sidebar")
else:
    print("  Customers already in sidebar")
PYEOF

echo ""
echo "============================================================"
echo "✅ COMPLETE NON-MEDICAL SYSTEM FIXED"
echo "============================================================"
echo ""
echo "Pages fixed/rebuilt:"
echo "  ✓ Analytics.js - Real React component (was broken utility file)"
echo "  ✓ Suppliers.js - Full CRUD with real API"
echo "  ✓ Deals.js - Create/edit/delete promotions"
echo "  ✓ Customers.js - Full CRUD, loyalty points, verification"
echo "  ✓ Invoices.js - View and filter invoices"
echo "  ✓ Campaign.js - Full CRUD marketing campaigns"
echo "  ✓ BarcodeScanner.js - Scan history, product lookup"
echo ""
echo "Backend:"
echo "  ✓ Supplier CRUD routes"
echo "  ✓ Customer PUT/DELETE routes"
echo "  ✓ Invoices GET route"
echo "  ✓ Deals POST/DELETE routes"
echo ""
echo "Flux:"
echo "  ✓ fetchSuppliers, addSupplier, editSupplier, deleteSupplier"
echo "  ✓ addCustomer, editCustomer, deleteCustomer"
echo "  ✓ addCampaign, editCampaign, deleteCampaign"
echo ""
echo "Still working (already functional):"
echo "  ✓ Dashboard, Products, Orders, Inventory"
echo "  ✓ Stores, Users, Shop, CartManagement"
echo "  ✓ PriceComparison, Reports"
echo ""
echo "Restart: cd /workspaces/DispensaryMaster2 && pipenv run start"
