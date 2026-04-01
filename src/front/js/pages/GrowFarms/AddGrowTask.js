import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AddGrowTask = () => {
    const [batches, setBatches] = useState([]);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ task_name:"", task_description:"", assigned_to:"", priority:"Medium", due_date:"", batch_id:"", status:"Pending" });
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/plant_batches`, { headers })
            .then(r => r.ok ? r.json() : [])
            .then(data => setBatches(Array.isArray(data) ? data : []))
            .catch(console.error);
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/grow_tasks`, { method:"POST", headers, body: JSON.stringify(form) });
            if (r.ok) navigate("/growfarms/task-list");
        } catch(e) { console.error(e); }
        finally { setSaving(false); }
    };

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2 style={{ color: "#ffab00", fontWeight: 800 }}>📋 Add Grow Task</h2><p>Assign tasks to plant batches or staff</p></div>
                <button className="btn btn-outline-light" onClick={() => navigate("/growfarms/task-list")}>← Back to Tasks</button>
            </div>
            <div className="glass-panel" style={{maxWidth:"700px"}}>
                <form onSubmit={handleSave}>
                    <div className="row g-3">
                        <div className="col-12"><label className="form-label">Task Name *</label><input className="form-control" required value={form.task_name} onChange={e => setForm({...form,task_name:e.target.value})} placeholder="e.g. Water plants, Check pH levels..." /></div>
                        <div className="col-12"><label className="form-label">Description</label><textarea className="form-control" rows="3" value={form.task_description} onChange={e => setForm({...form,task_description:e.target.value})} /></div>
                        <div className="col-md-6">
                            <label className="form-label">Plant Batch</label>
                            <select className="form-select" value={form.batch_id} onChange={e => setForm({...form,batch_id:e.target.value})}>
                                <option value="">-- Select Batch (Optional) --</option>
                                {batches.map(b => <option key={b.id} value={b.id}>{b.strain} — {b.status}</option>)}
                            </select>
                        </div>
                        <div className="col-md-6"><label className="form-label">Assign To</label><input className="form-control" value={form.assigned_to} onChange={e => setForm({...form,assigned_to:e.target.value})} placeholder="Staff name or team" /></div>
                        <div className="col-md-4">
                            <label className="form-label">Priority</label>
                            <select className="form-select" value={form.priority} onChange={e => setForm({...form,priority:e.target.value})}>
                                {["Low","Medium","High","Critical"].map(p => <option key={p}>{p}</option>)}
                            </select>
                        </div>
                        <div className="col-md-4"><label className="form-label">Due Date</label><input className="form-control" type="date" value={form.due_date} onChange={e => setForm({...form,due_date:e.target.value})} /></div>
                        <div className="col-md-4">
                            <label className="form-label">Status</label>
                            <select className="form-select" value={form.status} onChange={e => setForm({...form,status:e.target.value})}>
                                {["Pending","In Progress","Completed","Skipped"].map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="col-12 d-flex gap-2">
                            <button type="button" className="btn btn-outline-light" onClick={() => navigate("/growfarms/task-list")}>Cancel</button>
                            <button type="submit" className="btn btn-success flex-grow-1" disabled={saving}>
                                {saving ? <span className="spinner-border spinner-border-sm" /> : "Create Task"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default AddGrowTask;
