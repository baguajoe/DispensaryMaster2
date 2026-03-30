import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EmployeeDashboard = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name:"", role:"budtender", email:"", password:"changeme123" });
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    const ROLES = ["budtender","manager","assistant_manager","security","receptionist","delivery_driver","inventory","compliance"];

    const load = () => {
        fetch(`${process.env.BACKEND_URL}/api/employees`, { headers })
            .then(r => r.ok ? r.json() : [])
            .then(data => { setEmployees(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/employees`, { method:"POST", headers, body:JSON.stringify(form) });
            if (r.ok) { load(); setShowForm(false); setForm({ name:"", role:"budtender", email:"", password:"changeme123" }); }
        } catch(e) { console.error(e); } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Remove this employee?")) return;
        await fetch(`${process.env.BACKEND_URL}/api/employees/${id}`, { method:"DELETE", headers });
        load();
    };

    const ROLE_COLORS = { manager:"#f5365c", assistant_manager:"#fb6340", budtender:"#2dce89", security:"#11cdef", compliance:"#ffd600" };

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2>👔 Employee Management</h2><p>{employees.length} employees</p></div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-light" onClick={()=>navigate("/payroll")}>💰 Payroll</button>
                    <button className="btn btn-outline-light" onClick={()=>navigate("/manager-shifts")}>📅 Shifts</button>
                    <button className="btn btn-success" onClick={()=>setShowForm(!showForm)}>+ Add Employee</button>
                </div>
            </div>

            <div className="row g-3 mb-4">
                {Object.entries(employees.reduce((acc, e) => { acc[e.role] = (acc[e.role]||0)+1; return acc; }, {})).map(([role, count]) => (
                    <div key={role} className="col-6 col-md-3">
                        <div className="glass-panel text-center">
                            <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>{role.replace("_"," ")}</div>
                            <div style={{fontSize:"1.8rem",fontWeight:700,color:ROLE_COLORS[role]||"#11cdef"}}>{count}</div>
                        </div>
                    </div>
                ))}
            </div>

            {showForm && (
                <div className="glass-panel mb-4">
                    <h5 className="mb-3">Add Employee</h5>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-3"><label className="form-label">Full Name *</label><input className="form-control" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
                            <div className="col-md-3"><label className="form-label">Email *</label><input className="form-control" type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></div>
                            <div className="col-md-3">
                                <label className="form-label">Role</label>
                                <select className="form-select" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
                                    {ROLES.map(r=><option key={r} value={r}>{r.replace("_"," ")}</option>)}
                                </select>
                            </div>
                            <div className="col-md-3"><label className="form-label">Temp Password</label><input className="form-control" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} /></div>
                            <div className="col-12 d-flex gap-2">
                                <button type="button" className="btn btn-outline-light" onClick={()=>setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-success flex-grow-1" disabled={saving}>{saving?<span className="spinner-border spinner-border-sm"/>:"Add Employee"}</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="row g-3">
                {employees.map(emp => (
                    <div key={emp.id} className="col-md-6 col-lg-4">
                        <div className="glass-panel">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <h5 className="mb-0">{emp.name}</h5>
                                    <span className="badge mt-1" style={{background:(ROLE_COLORS[emp.role]||"#11cdef")+"33",color:ROLE_COLORS[emp.role]||"#11cdef"}}>{emp.role?.replace("_"," ")}</span>
                                </div>
                                <div style={{width:"40px",height:"40px",borderRadius:"50%",background:"rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"1.1rem"}}>{emp.name?.charAt(0)}</div>
                            </div>
                            <p style={{fontSize:"0.85rem",color:"rgba(255,255,255,0.5)",margin:"0 0 0.75rem"}}>✉️ {emp.email}</p>
                            <div className="d-flex gap-2">
                                <button className="btn btn-outline-light btn-sm flex-grow-1" onClick={()=>navigate("/performance-reviews")}>Review</button>
                                <button className="btn btn-outline-danger btn-sm" onClick={()=>handleDelete(emp.id)}>Remove</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default EmployeeDashboard;
