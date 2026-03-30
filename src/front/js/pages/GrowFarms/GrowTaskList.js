import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PRIORITY_COLORS = { Low:"info", Medium:"warning", High:"danger", Critical:"danger" };

const GrowTaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => { fetchTasks(); }, []);

    const fetchTasks = async () => {
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/grow_tasks`, { headers });
            if (r.ok) setTasks(await r.json());
        } catch(e) { console.error(e); }
        finally { setLoading(false); }
    };

    const updateStatus = async (id, status) => {
        await fetch(`${process.env.BACKEND_URL}/api/grow_tasks/${id}`, {
            method:"PUT", headers, body: JSON.stringify({ status })
        });
        fetchTasks();
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete task?")) return;
        await fetch(`${process.env.BACKEND_URL}/api/grow_tasks/${id}`, { method:"DELETE", headers });
        fetchTasks();
    };

    const filtered = filter === "All" ? tasks : tasks.filter(t => t.status === filter);

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header">
                    <h2>📋 Grow Task List</h2>
                    <p>{tasks.filter(t=>t.status==="Pending").length} pending · {tasks.filter(t=>t.status==="Completed").length} completed</p>
                </div>
                <button className="btn btn-success" onClick={() => navigate("/growfarms/add-grow-task")}>+ Add Task</button>
            </div>

            <div className="d-flex gap-2 mb-3">
                {["All","Pending","In Progress","Completed","Skipped"].map(s => (
                    <button key={s} className={`btn btn-sm ${filter===s?"btn-success":"btn-outline-light"}`} onClick={() => setFilter(s)}>{s}</button>
                ))}
            </div>

            <div className="glass-panel">
                {loading ? <div className="text-center py-4"><div className="spinner-border text-light" /></div>
                : filtered.length === 0 ? (
                    <div className="text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}>
                        <div style={{fontSize:"3rem"}}>📋</div>
                        <h5>No tasks found</h5>
                        <button className="btn btn-success mt-2" onClick={() => navigate("/growfarms/add-grow-task")}>Create First Task</button>
                    </div>
                ) : (
                    <table className="table mb-0">
                        <thead><tr><th>Task</th><th>Batch</th><th>Assigned To</th><th>Priority</th><th>Due Date</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {filtered.map(t => (
                                <tr key={t.id}>
                                    <td><div style={{fontWeight:600}}>{t.task_name}</div><div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>{t.task_description}</div></td>
                                    <td style={{fontSize:"0.85rem"}}>{t.batch_id ? `Batch #${t.batch_id}` : "—"}</td>
                                    <td style={{fontSize:"0.85rem"}}>{t.assigned_to||"—"}</td>
                                    <td><span className={`badge bg-${PRIORITY_COLORS[t.priority]||"secondary"}`}>{t.priority}</span></td>
                                    <td style={{fontSize:"0.85rem",color: t.due_date && new Date(t.due_date) < new Date() && t.status !== "Completed" ? "#f5365c" : "inherit"}}>
                                        {t.due_date ? new Date(t.due_date).toLocaleDateString() : "—"}
                                    </td>
                                    <td>
                                        <select className="form-select form-select-sm"
                                            style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"white",width:"130px"}}
                                            value={t.status} onChange={e => updateStatus(t.id, e.target.value)}>
                                            {["Pending","In Progress","Completed","Skipped"].map(s => <option key={s} style={{background:"#1a2f3a"}}>{s}</option>)}
                                        </select>
                                    </td>
                                    <td><button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(t.id)}>Del</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
export default GrowTaskList;
