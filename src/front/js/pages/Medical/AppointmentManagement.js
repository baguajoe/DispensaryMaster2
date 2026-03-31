import React, { useState, useEffect } from "react";

const STATUS_COLORS = { Scheduled:"#11cdef", Completed:"#2dce89", Canceled:"#f5365c" };

const AppointmentManagement = () => {
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [filter, setFilter] = useState("all");
    const [form, setForm] = useState({ patient_id:"", physician_id:"1", appointment_date:"", status:"Scheduled", notes:"" });
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    const load = () => {
        Promise.all([
            fetch(`${process.env.BACKEND_URL}/api/appointments`, { headers }).then(r => r.ok ? r.json() : []),
            fetch(`${process.env.BACKEND_URL}/api/medical/patients`, { headers }).then(r => r.ok ? r.json() : []),
        ]).then(([appts, pats]) => {
            setAppointments(Array.isArray(appts) ? appts : []);
            setPatients(Array.isArray(pats) ? pats : []);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/appointments`, {
                method:"POST", headers, body:JSON.stringify(form)
            });
            if (r.ok) { load(); setShowForm(false); setForm({ patient_id:"", physician_id:"1", appointment_date:"", status:"Scheduled", notes:"" }); }
        } catch(e) { console.error(e); } finally { setSaving(false); }
    };

    const handleStatus = async (id, status) => {
        await fetch(`${process.env.BACKEND_URL}/api/appointments/${id}`, {
            method:"PUT", headers, body:JSON.stringify({ status })
        });
        load();
    };

    const getPatient = (id) => patients.find(p => p.id === id || p.id === parseInt(id));
    const filtered = filter === "all" ? appointments : appointments.filter(a => a.status === filter);

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;

    const today = appointments.filter(a => a.appointment_date && a.appointment_date.startsWith(new Date().toISOString().split("T")[0]));

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2>📅 Appointment Management</h2><p>{appointments.length} total · {today.length} today</p></div>
                <button className="btn btn-success" onClick={() => setShowForm(!showForm)}>+ Schedule Appointment</button>
            </div>

            <div className="row g-3 mb-4">
                {["Scheduled","Completed","Canceled"].map(status => (
                    <div key={status} className="col-4"><div className="glass-panel text-center">
                        <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>{status}</div>
                        <div style={{fontSize:"1.8rem",fontWeight:700,color:STATUS_COLORS[status]}}>{appointments.filter(a=>a.status===status).length}</div>
                    </div></div>
                ))}
            </div>

            {showForm && (
                <div className="glass-panel mb-4">
                    <h5 className="mb-3">Schedule Appointment</h5>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label">Patient *</label>
                                <select className="form-select" required value={form.patient_id} onChange={e=>setForm({...form,patient_id:e.target.value})}>
                                    <option value="">Select patient...</option>
                                    {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-4"><label className="form-label">Date & Time *</label><input className="form-control" type="datetime-local" required value={form.appointment_date} onChange={e=>setForm({...form,appointment_date:e.target.value})} /></div>
                            <div className="col-md-4">
                                <label className="form-label">Status</label>
                                <select className="form-select" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                                    <option>Scheduled</option><option>Completed</option><option>Canceled</option>
                                </select>
                            </div>
                            <div className="col-12"><label className="form-label">Notes</label><textarea className="form-control" rows="2" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} /></div>
                            <div className="col-12 d-flex gap-2">
                                <button type="button" className="btn btn-outline-light" onClick={()=>setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-success flex-grow-1" disabled={saving}>{saving?<span className="spinner-border spinner-border-sm"/>:"Schedule"}</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="d-flex gap-2 mb-3">
                {["all","Scheduled","Completed","Canceled"].map(s => (
                    <button key={s} className={`btn btn-sm ${filter===s?"btn-success":"btn-outline-light"}`} onClick={()=>setFilter(s)}>{s==="all"?"All":s}</button>
                ))}
            </div>

            <div className="glass-panel">
                <div className="table-responsive">
                    <table className="table table-dark table-hover mb-0">
                        <thead><tr style={{color:"rgba(255,255,255,0.5)",fontSize:"0.8rem",textTransform:"uppercase"}}>
                            <th>Patient</th><th>Date & Time</th><th>Status</th><th>Notes</th><th>Actions</th>
                        </tr></thead>
                        <tbody>
                            {filtered.map(a => {
                                const patient = getPatient(a.patient_id);
                                return (
                                    <tr key={a.id}>
                                        <td style={{fontWeight:600}}>{patient ? `${patient.first_name} ${patient.last_name}` : `Patient #${a.patient_id}`}</td>
                                        <td style={{fontSize:"0.85rem"}}>{a.appointment_date ? new Date(a.appointment_date).toLocaleString() : "—"}</td>
                                        <td><span className="badge" style={{background:STATUS_COLORS[a.status]+"33",color:STATUS_COLORS[a.status]}}>{a.status}</span></td>
                                        <td style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.6)",maxWidth:"200px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.notes||"—"}</td>
                                        <td>
                                            <div className="d-flex gap-1">
                                                {a.status === "Scheduled" && <>
                                                    <button className="btn btn-success btn-sm" onClick={()=>handleStatus(a.id,"Completed")}>✓</button>
                                                    <button className="btn btn-danger btn-sm" onClick={()=>handleStatus(a.id,"Canceled")}>✕</button>
                                                </>}
                                                {a.status !== "Scheduled" && <span style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.4)"}}>—</span>}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && <div className="text-center py-4" style={{color:"rgba(255,255,255,0.5)"}}>No appointments found</div>}
            </div>
        </div>
    );
};
export default AppointmentManagement;
