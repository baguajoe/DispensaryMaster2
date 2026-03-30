import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CATEGORY_ICONS = { paperwork:"📝", compliance:"⚖️", training:"📚", equipment:"💻", general:"✅" };
const CATEGORY_COLORS = { paperwork:"#11cdef", compliance:"#f5365c", training:"#2dce89", equipment:"#ffd600", general:"#fb6340" };

const Onboarding = () => {
    const navigate = useNavigate();
    const [checklists, setChecklists] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showNew, setShowNew] = useState(false);
    const [form, setForm] = useState({ company_id:"", employee_id:"", state:"MA", title:"New Employee Onboarding" });
    const [creating, setCreating] = useState(false);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/onboarding`, { headers })
            .then(r => r.ok ? r.json() : [])
            .then(data => { setChecklists(Array.isArray(data)?data:[]); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/onboarding`, { method:"POST", headers, body:JSON.stringify(form) });
            if (r.ok) {
                const data = await r.json();
                setChecklists(prev => [...prev, data]);
                setSelected(data);
                setShowNew(false);
            }
        } catch(e) { console.error(e); } finally { setCreating(false); }
    };

    const handleComplete = async (taskId) => {
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/onboarding/tasks/${taskId}/complete`, { method:"PUT", headers });
            if (r.ok) {
                const updatedTask = await r.json();
                setSelected(prev => ({
                    ...prev,
                    tasks: prev.tasks.map(t => t.id === taskId ? updatedTask : t),
                    progress: Math.round(prev.tasks.filter(t => t.id === taskId ? updatedTask.completed : t.completed).length / prev.tasks.length * 100)
                }));
                setChecklists(prev => prev.map(c => c.id === selected.id ? {...c, tasks: c.tasks.map(t => t.id === taskId ? updatedTask : t)} : c));
            }
        } catch(e) { console.error(e); }
    };

    const groupedTasks = (tasks) => {
        const groups = {};
        (tasks||[]).forEach(t => {
            const cat = t.category || 'general';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(t);
        });
        return groups;
    };

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2>📋 Employee Onboarding</h2><p>State-specific new hire checklists</p></div>
                <button className="btn btn-success" onClick={() => setShowNew(!showNew)}>+ New Onboarding</button>
            </div>

            {showNew && (
                <div className="glass-panel mb-4">
                    <h5 className="mb-3">Create Onboarding Checklist</h5>
                    <form onSubmit={handleCreate}>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label">State *</label>
                                <select className="form-select" value={form.state} onChange={e=>setForm({...form,state:e.target.value})}>
                                    {["MA","CA","CO","IL","NY","NV","OR","WA","AZ","MI"].map(s=><option key={s}>{s}</option>)}
                                    <option value="DEFAULT">Other State</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Employee ID</label>
                                <input className="form-control" type="number" value={form.employee_id} onChange={e=>setForm({...form,employee_id:e.target.value})} placeholder="User ID" />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Company ID</label>
                                <input className="form-control" type="number" value={form.company_id} onChange={e=>setForm({...form,company_id:e.target.value})} placeholder="Company ID" />
                            </div>
                            <div className="col-12 d-flex gap-2">
                                <button type="button" className="btn btn-outline-light" onClick={()=>setShowNew(false)}>Cancel</button>
                                <button type="submit" className="btn btn-success flex-grow-1" disabled={creating}>
                                    {creating?<span className="spinner-border spinner-border-sm"/>:"Create with State Template"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="row g-3">
                {/* Checklist List */}
                <div className="col-md-4">
                    <div className="glass-panel">
                        <h5 className="mb-3">Checklists ({checklists.length})</h5>
                        {checklists.length === 0 ? (
                            <p style={{color:"rgba(255,255,255,0.5)"}}>No checklists yet</p>
                        ) : checklists.map(c => (
                            <div key={c.id} className="mb-2 p-3 rounded" style={{background:selected?.id===c.id?"rgba(45,206,137,0.15)":"rgba(255,255,255,0.06)",border:`1px solid ${selected?.id===c.id?"rgba(45,206,137,0.4)":"rgba(255,255,255,0.1)"}`,cursor:"pointer"}}
                                onClick={() => setSelected(c)}>
                                <div style={{fontWeight:600,fontSize:"0.9rem"}}>{c.title}</div>
                                <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>State: {c.state} · {c.tasks?.length||0} tasks</div>
                                <div className="progress mt-2" style={{height:"4px",background:"rgba(255,255,255,0.1)"}}>
                                    <div className="progress-bar bg-success" style={{width:`${c.progress||0}%`}} />
                                </div>
                                <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.4)",marginTop:"4px"}}>{c.progress||0}% complete</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Task Detail */}
                <div className="col-md-8">
                    {!selected ? (
                        <div className="glass-panel text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}>
                            <div style={{fontSize:"3rem"}}>📋</div>
                            <h5>Select a checklist to view tasks</h5>
                        </div>
                    ) : (
                        <div className="glass-panel">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <h5 className="mb-0">{selected.title}</h5>
                                    <small style={{color:"rgba(255,255,255,0.5)"}}>State: {selected.state} · {selected.progress||0}% complete</small>
                                </div>
                                <span className={`badge bg-${selected.status==="completed"?"success":"warning text-dark"}`}>{selected.status}</span>
                            </div>
                            <div className="progress mb-4" style={{height:"8px",background:"rgba(255,255,255,0.1)"}}>
                                <div className="progress-bar bg-success" style={{width:`${selected.progress||0}%`,transition:"width 0.5s"}} />
                            </div>
                            {Object.entries(groupedTasks(selected.tasks)).map(([category, tasks]) => (
                                <div key={category} className="mb-4">
                                    <h6 style={{color:CATEGORY_COLORS[category]||"#fff",marginBottom:"0.75rem"}}>
                                        {CATEGORY_ICONS[category]||"✅"} {category.charAt(0).toUpperCase()+category.slice(1)}
                                    </h6>
                                    {tasks.map(task => (
                                        <div key={task.id} className="d-flex align-items-start gap-3 mb-2 p-2 rounded"
                                            style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
                                            <input type="checkbox" className="form-check-input mt-1" checked={task.completed}
                                                onChange={() => handleComplete(task.id)} style={{cursor:"pointer"}} />
                                            <div className="flex-grow-1">
                                                <div style={{fontWeight:500,textDecoration:task.completed?"line-through":"none",color:task.completed?"rgba(255,255,255,0.4)":"white"}}>{task.title}</div>
                                                {task.description && <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.4)"}}>{task.description}</div>}
                                                <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.35)"}}>Due within {task.due_days} day{task.due_days!==1?"s":""} {task.required?"· Required":""}</div>
                                            </div>
                                            {task.completed && <span className="badge bg-success">Done</span>}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default Onboarding;
