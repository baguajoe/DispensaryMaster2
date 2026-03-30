import React, { useState, useEffect, useContext } from "react";
import { Context } from "../../store/appContext";

const AppointmentManagement = () => {
    const { store, actions } = useContext(Context);
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [filter, setFilter] = useState("all");
    const [form, setForm] = useState({ patient_id:"", date:"", time:"", appointment_type:"Consultation", notes:"", status:"Pending" });
    const [saving, setSaving] = useState(false);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        Promise.all([
            fetch(`${process.env.BACKEND_URL}/api/appointments`, { headers }).then(r => r.ok ? r.json() : []),
            fetch(`${process.env.BACKEND_URL}/api/medical/patients`, { headers }).then(r => r.ok ? r.json() : []),
        ]).then(([appts, pats]) => {
            setAppointments(Array.isArray(appts) ? appts : []);
            setPatients(Array.isArray(pats) ? pats : []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const method = editId ? "PUT" : "POST";
            const url = editId
                ? `${process.env.BACKEND_URL}/api/appointments/${editId}`
                : `${process.env.BACKEND_URL}/api/appointments`;
            const r = await fetch(url, { method, headers, body: JSON.stringify(form) });
            if (r.ok) {
                const data = await r.json();
                if (editId) {
                    setAppointments(prev => prev.map(a => a.id === editId ? data : a));
                } else {
                    setAppointments(prev => [...prev, data]);
                }
                setShowForm(false);
                setEditId(null);
                setForm({ patient_id:"", date:"", time:"", appointment_type:"Consultation", notes:"", status:"Pending" });
            }
        } catch(e) { console.error(e); } finally { setSaving(false); }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/appointments/${id}`, {
                method:"PUT", headers, body: JSON.stringify({ status: newStatus })
            });
            if (r.ok) {
                setAppointments(prev => prev.map(a => a.id === id ? {...a, status: newStatus} : a));
            }
        } catch(e) { console.error(e); }
    };

    const handleEdit = (appt) => {
        setForm({ patient_id: appt.patient_id, date: appt.date?.split("T")[0] || "", time: appt.time || "", appointment_type: appt.appointment_type || "Consultation", notes: appt.notes || "", status: appt.status || "Pending" });
        setEditId(appt.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this appointment?")) return;
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/appointments/${id}`, { method:"DELETE", headers });
            if (r.ok) setAppointments(prev => prev.filter(a => a.id !== id));
        } catch(e) { console.error(e); }
    };

    const today = new Date().toDateString();
    const filtered = appointments.filter(a => {
        if (filter === "today") return a.date && new Date(a.date).toDateString() === today;
        if (filter === "pending") return a.status === "Pending";
        if (filter === "confirmed") return a.status === "Confirmed";
        return true;
    });

    const getPatientName = (pid) => {
        const p = patients.find(pt => pt.id === parseInt(pid));
        return p ? `${p.first_name} ${p.last_name}` : `Patient #${pid}`;
    };

    const STATUS_COLORS = { Pending:"warning", Confirmed:"success", Cancelled:"danger", "No-Show":"secondary", Completed:"info" };

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light" /></div>;

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header">
                    <h2>📅 Appointment Management</h2>
                    <p>{appointments.length} total · {appointments.filter(a => a.date && new Date(a.date).toDateString()===today).length} today</p>
                </div>
                <button className="btn btn-success" onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ patient_id:"", date:"", time:"", appointment_type:"Consultation", notes:"", status:"Pending" }); }}>
                    + New Appointment
                </button>
            </div>

            {/* Stats */}
            <div className="row g-3 mb-4">
                {[
                    { label:"Today", value:appointments.filter(a => a.date && new Date(a.date).toDateString()===today).length, color:"#11cdef" },
                    { label:"Pending", value:appointments.filter(a=>a.status==="Pending").length, color:"#ffd600" },
                    { label:"Confirmed", value:appointments.filter(a=>a.status==="Confirmed").length, color:"#2dce89" },
                    { label:"No-Show", value:appointments.filter(a=>a.status==="No-Show").length, color:"#f5365c" },
                ].map((s,i) => (
                    <div key={i} className="col-6 col-md-3">
                        <div className="glass-panel text-center">
                            <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>{s.label}</div>
                            <div style={{fontSize:"1.8rem",fontWeight:700,color:s.color}}>{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* New/Edit Form */}
            {showForm && (
                <div className="glass-panel mb-4">
                    <h5 className="mb-3">{editId ? "Edit Appointment" : "Schedule New Appointment"}</h5>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Patient *</label>
                                <select className="form-select" required value={form.patient_id} onChange={e => setForm({...form, patient_id:e.target.value})}>
                                    <option value="">Select patient...</option>
                                    {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Date *</label>
                                <input className="form-control" type="date" required value={form.date} onChange={e => setForm({...form, date:e.target.value})} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Time</label>
                                <input className="form-control" type="time" value={form.time} onChange={e => setForm({...form, time:e.target.value})} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Type</label>
                                <select className="form-select" value={form.appointment_type} onChange={e => setForm({...form, appointment_type:e.target.value})}>
                                    {["Consultation","Follow-Up","Card Renewal","New Patient","Urgent Care"].map(t => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Status</label>
                                <select className="form-select" value={form.status} onChange={e => setForm({...form, status:e.target.value})}>
                                    {["Pending","Confirmed","Cancelled","Completed","No-Show"].map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="col-12">
                                <label className="form-label">Notes</label>
                                <textarea className="form-control" rows="2" value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} />
                            </div>
                            <div className="col-12 d-flex gap-2">
                                <button type="button" className="btn btn-outline-light" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
                                <button type="submit" className="btn btn-success flex-grow-1" disabled={saving}>
                                    {saving ? <span className="spinner-border spinner-border-sm" /> : editId ? "Update" : "Schedule"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Filter Bar */}
            <div className="glass-panel mb-3">
                <div className="d-flex gap-2 flex-wrap">
                    {["all","today","pending","confirmed"].map(f => (
                        <button key={f} className={`btn btn-sm ${filter===f?"btn-success":"btn-outline-light"} text-capitalize`} onClick={() => setFilter(f)}>{f}</button>
                    ))}
                    <span className="ms-auto text-muted small align-self-center">{filtered.length} results</span>
                </div>
            </div>

            {/* Appointments List */}
            <div className="glass-panel">
                {filtered.length === 0 ? (
                    <div className="text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}>
                        <div style={{fontSize:"3rem"}}>📅</div>
                        <h5>No appointments found</h5>
                    </div>
                ) : filtered.map(a => (
                    <div key={a.id} className="d-flex justify-content-between align-items-start mb-3 p-3 rounded"
                        style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)"}}>
                        <div>
                            <div style={{fontWeight:600}}>{getPatientName(a.patient_id)}</div>
                            <div style={{fontSize:"0.85rem",color:"rgba(255,255,255,0.6)"}}>
                                {a.date ? new Date(a.date).toLocaleDateString() : "—"} {a.time ? `at ${a.time}` : ""}
                                {a.appointment_type && ` · ${a.appointment_type}`}
                            </div>
                            {a.notes && <div style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.4)",marginTop:"4px"}}>{a.notes}</div>}
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <select className={`form-select form-select-sm bg-${STATUS_COLORS[a.status]||"secondary"}`}
                                style={{width:"130px",fontSize:"0.8rem"}}
                                value={a.status}
                                onChange={e => handleStatusUpdate(a.id, e.target.value)}>
                                {["Pending","Confirmed","Cancelled","Completed","No-Show"].map(s => <option key={s}>{s}</option>)}
                            </select>
                            <button className="btn btn-sm btn-outline-light" onClick={() => handleEdit(a)}>✏️</button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(a.id)}>🗑</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default AppointmentManagement;
