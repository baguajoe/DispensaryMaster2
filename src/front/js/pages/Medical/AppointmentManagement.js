import React, { useState, useEffect, useContext } from "react";
import { Context } from "../../store/appContext";

const STATUS_COLORS = { Scheduled:"primary", Completed:"success", Canceled:"danger", "No-Show":"warning" };

const AppointmentManagement = () => {
    const { store, actions } = useContext(Context);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        patient_id:"", appointment_date:"", status:"Scheduled", notes:"", physician_id:1
    });

    useEffect(() => {
        Promise.all([
            actions.fetchAppointments(),
            actions.fetchPatients()
        ]).then(() => setLoading(false));
    }, []);

    const appointments = store.appointments || [];
    const patients = store.patients || [];

    const filtered = appointments.filter(a => {
        const matchSearch = !search || (a.patient_name||"").toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "All" || a.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const openNew = () => {
        setEditing(null);
        const now = new Date();
        now.setHours(now.getHours() + 1, 0, 0, 0);
        setForm({ patient_id:"", appointment_date:now.toISOString().slice(0,16), status:"Scheduled", notes:"", physician_id:1 });
        setShowModal(true);
    };

    const openEdit = (a) => {
        setEditing(a);
        setForm({
            patient_id: String(a.patient_id),
            appointment_date: a.appointment_date?.slice(0,16)||"",
            status: a.status||"Scheduled",
            notes: a.notes||"",
            physician_id: a.physician_id||1
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.patient_id || !form.appointment_date) return alert("Patient and date are required");
        setSaving(true);
        const data = { ...form, patient_id: parseInt(form.patient_id) };
        const result = editing
            ? await actions.updateAppointment(editing.id, data)
            : await actions.addAppointment(data);
        if (result?.success) setShowModal(false);
        else alert(result?.error || "Failed to save appointment");
        setSaving(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this appointment?")) return;
        await actions.deleteAppointment(id);
    };

    const handleStatusChange = async (id, status) => {
        await actions.updateAppointment(id, { status });
    };

    const today = appointments.filter(a => {
        const d = new Date(a.appointment_date);
        const now = new Date();
        return d.toDateString() === now.toDateString();
    });

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header">
                    <h2>📅 Appointment Management</h2>
                    <p>{today.length} appointments today · {appointments.filter(a=>a.status==="Scheduled").length} scheduled total</p>
                </div>
                <button className="btn btn-success" onClick={openNew}>+ Book Appointment</button>
            </div>

            {/* Today's appointments */}
            {today.length > 0 && (
                <div className="glass-panel mb-4" style={{borderColor:"rgba(45,206,137,0.4)"}}>
                    <h6 className="text-success mb-3">📅 Today's Appointments ({today.length})</h6>
                    <div className="d-flex flex-wrap gap-2">
                        {today.map(a => (
                            <div key={a.id} className="p-2 rounded" style={{background:"rgba(45,206,137,0.1)",border:"1px solid rgba(45,206,137,0.3)",minWidth:"180px"}}>
                                <div style={{fontWeight:600,fontSize:"0.9rem"}}>{a.patient_name}</div>
                                <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.6)"}}>
                                    {new Date(a.appointment_date).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}
                                </div>
                                <span className={`badge bg-${STATUS_COLORS[a.status]||"secondary"} mt-1`}>{a.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="glass-panel mb-3">
                <div className="row g-2 align-items-center">
                    <div className="col-md-5">
                        <input className="form-control" placeholder="Search by patient name..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="col-md-7 d-flex gap-2 flex-wrap">
                        {["All","Scheduled","Completed","Canceled","No-Show"].map(s => (
                            <button key={s} className={`btn btn-sm ${statusFilter===s?"btn-success":"btn-outline-light"}`}
                                onClick={() => setStatusFilter(s)}>{s}</button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="glass-panel">
                {loading ? <div className="text-center py-4"><div className="spinner-border text-light" /></div>
                : filtered.length === 0 ? (
                    <div className="text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}>
                        <div style={{fontSize:"3rem"}}>📅</div>
                        <h5>No appointments found</h5>
                        <button className="btn btn-success mt-2" onClick={openNew}>Book First Appointment</button>
                    </div>
                ) : (
                    <table className="table mb-0">
                        <thead><tr><th>Patient</th><th>Date & Time</th><th>Status</th><th>Notes</th><th>Actions</th></tr></thead>
                        <tbody>
                            {filtered.map(a => (
                                <tr key={a.id}>
                                    <td><strong>{a.patient_name}</strong></td>
                                    <td>{a.appointment_date ? new Date(a.appointment_date).toLocaleString() : "—"}</td>
                                    <td>
                                        <select className="form-select form-select-sm"
                                            style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"white",width:"130px"}}
                                            value={a.status} onChange={e => handleStatusChange(a.id, e.target.value)}>
                                            {["Scheduled","Completed","Canceled","No-Show"].map(s => <option key={s} style={{background:"#1a2f3a"}}>{s}</option>)}
                                        </select>
                                    </td>
                                    <td style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.6)",maxWidth:"200px"}}>{a.notes||"—"}</td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-light me-1" onClick={() => openEdit(a)}>Edit</button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(a.id)}>Del</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{editing ? "Edit Appointment" : "Book Appointment"}</h5>
                                    <button className="btn-close" onClick={() => setShowModal(false)} />
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Patient *</label>
                                        <select className="form-select" value={form.patient_id} onChange={e => setForm({...form,patient_id:e.target.value})}>
                                            <option value="">-- Select Patient --</option>
                                            {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name} — {p.medical_card_number}</option>)}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Date & Time *</label>
                                        <input className="form-control" type="datetime-local" value={form.appointment_date} onChange={e => setForm({...form,appointment_date:e.target.value})} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Status</label>
                                        <select className="form-select" value={form.status} onChange={e => setForm({...form,status:e.target.value})}>
                                            {["Scheduled","Completed","Canceled","No-Show"].map(s => <option key={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Notes</label>
                                        <textarea className="form-control" rows="3" value={form.notes} onChange={e => setForm({...form,notes:e.target.value})} />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button className="btn btn-success" onClick={handleSave} disabled={saving}>
                                        {saving ? <span className="spinner-border spinner-border-sm" /> : "Save"}
                                    </button>
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
export default AppointmentManagement;
