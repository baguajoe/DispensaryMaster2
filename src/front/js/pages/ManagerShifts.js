import React, { useState, useEffect } from "react";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const ManagerShifts = () => {
    const [shifts, setShifts] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ employee_id:"", shift_date:"", start_time:"09:00", end_time:"17:00", role:"budtender", notes:"" });
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        Promise.all([
            fetch(`${process.env.BACKEND_URL}/api/shifts`, { headers }).then(r => r.ok ? r.json() : []),
            fetch(`${process.env.BACKEND_URL}/api/employees`, { headers }).then(r => r.ok ? r.json() : []),
        ]).then(([shiftsData, empData]) => {
            setShifts(Array.isArray(shiftsData) ? shiftsData : []);
            setEmployees(Array.isArray(empData) ? empData : []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/shifts`, { method:"POST", headers, body:JSON.stringify(form) });
            if (r.ok) {
                const data = await r.json();
                setShifts(prev => [...prev, data]);
                setShowForm(false);
            }
        } catch(e) { console.error(e); } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        await fetch(`${process.env.BACKEND_URL}/api/shifts/${id}`, { method:"DELETE", headers });
        setShifts(prev => prev.filter(s => s.id !== id));
    };

    const getEmployee = (id) => employees.find(e => e.id === id || e.id === parseInt(id));

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2 style={{ color: "#ffab00", fontWeight: 800 }}>📅 Shift Management</h2><p>{shifts.length} shifts scheduled</p></div>
                <button className="btn btn-success" onClick={()=>setShowForm(!showForm)}>+ Schedule Shift</button>
            </div>

            {showForm && (
                <div className="glass-panel mb-4">
                    <h5 className="mb-3">Schedule New Shift</h5>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="form-label">Employee *</label>
                                <select className="form-select" required value={form.employee_id} onChange={e=>setForm({...form,employee_id:e.target.value})}>
                                    <option value="">Select employee...</option>
                                    {employees.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-2"><label className="form-label">Date *</label><input className="form-control" type="date" required value={form.shift_date||""} onChange={e=>setForm({...form,shift_date:e.target.value})} /></div>
                            <div className="col-md-2"><label className="form-label">Start Time</label><input className="form-control" type="time" value={form.start_time} onChange={e=>setForm({...form,start_time:e.target.value})} /></div>
                            <div className="col-md-2"><label className="form-label">End Time</label><input className="form-control" type="time" value={form.end_time} onChange={e=>setForm({...form,end_time:e.target.value})} /></div>
                            <div className="col-md-3"><label className="form-label">Notes</label><input className="form-control" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Opening, closing..." /></div>
                            <div className="col-12 d-flex gap-2">
                                <button type="button" className="btn btn-outline-light" onClick={()=>setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-success flex-grow-1" disabled={saving}>{saving?<span className="spinner-border spinner-border-sm"/>:"Schedule Shift"}</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="glass-panel">
                <h5 className="mb-3">Upcoming Shifts</h5>
                {shifts.length === 0 ? (
                    <div className="text-center py-4" style={{color:"rgba(255,255,255,0.5)"}}><div style={{fontSize:"3rem"}}>📅</div><p>No shifts scheduled yet</p></div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-dark table-hover mb-0">
                            <thead><tr style={{color:"rgba(255,255,255,0.5)",fontSize:"0.8rem",textTransform:"uppercase"}}>
                                <th>Employee</th><th>Date</th><th>Hours</th><th>Status</th><th>Actions</th>
                            </tr></thead>
                            <tbody>
                                {shifts.map(s => {
                                    const emp = getEmployee(s.employee_id);
                                    return (
                                        <tr key={s.id}>
                                            <td style={{fontWeight:600}}>{emp?.name || `Employee #${s.employee_id}`}</td>
                                            <td>{s.shift_date || s.clock_in_time?.split("T")[0] || "-"}</td>
                                            <td>{s.total_hours ? `${s.total_hours}h` : `${s.start_time||""} - ${s.end_time||""}`}</td>
                                            <td><span className={`badge bg-${s.shift_status==="clocked_in"?"success":s.shift_status==="clocked_out"?"secondary":"warning text-dark"}`}>{s.shift_status||"scheduled"}</span></td>
                                            <td><button className="btn btn-outline-danger btn-sm" onClick={()=>handleDelete(s.id)}>Remove</button></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
export default ManagerShifts;
