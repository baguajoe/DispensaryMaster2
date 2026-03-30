import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const GrowFarmDashboard = () => {
    const [overview, setOverview] = useState(null);
    const [batches, setBatches] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        Promise.all([
            fetch(`${process.env.BACKEND_URL}/api/grow_farms/overview`, { headers }).then(r => r.ok ? r.json() : null),
            fetch(`${process.env.BACKEND_URL}/api/plant_batches`, { headers }).then(r => r.ok ? r.json() : []),
            fetch(`${process.env.BACKEND_URL}/api/grow_tasks`, { headers }).then(r => r.ok ? r.json() : []),
        ]).then(([ov, b, t]) => {
            setOverview(ov);
            setBatches(Array.isArray(b) ? b : []);
            setTasks(Array.isArray(t) ? t : []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light" /></div>;

    const STAGE_COLORS = { Seedling:"info", Vegetative:"success", Flowering:"warning", Harvested:"secondary", Drying:"primary" };

    return (
        <div className="main-content p-4">
            <div className="page-header mb-4">
                <h2>🌱 Grow Farm Dashboard</h2>
                <p>Monitor all active plant batches, tasks, and harvest tracking</p>
            </div>

            {/* KPIs */}
            <div className="row g-3 mb-4">
                {[
                    { label:"Active Batches", value:overview?.active_batches||0, icon:"🌱", color:"#2dce89" },
                    { label:"Total Batches", value:overview?.total_batches||0, icon:"🪴", color:"#11cdef" },
                    { label:"Pending Tasks", value:overview?.pending_tasks||0, icon:"📋", color:"#fb6340" },
                    { label:"Total Yield (lbs)", value:`${overview?.total_yield_lbs||0}`, icon:"⚖️", color:"#ffd600" },
                ].map((s,i) => (
                    <div key={i} className="col-6 col-md-3">
                        <div className="glass-panel text-center">
                            <div style={{fontSize:"2rem"}}>{s.icon}</div>
                            <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.55)",textTransform:"uppercase",margin:"0.5rem 0 0.25rem"}}>{s.label}</div>
                            <div style={{fontSize:"1.8rem",fontWeight:700,color:s.color}}>{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row g-3">
                {/* Active Batches */}
                <div className="col-md-7">
                    <div className="glass-panel">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">🌿 Active Plant Batches</h5>
                            <Link to="/growfarms/plant-batch-list" className="btn btn-sm btn-outline-success">View All</Link>
                        </div>
                        {batches.filter(b => b.status !== 'Harvested').slice(0,6).map(b => (
                            <div key={b.id} className="d-flex justify-content-between align-items-center mb-2 p-2 rounded"
                                style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)"}}>
                                <div>
                                    <div style={{fontWeight:600}}>{b.strain}</div>
                                    <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>
                                        Started: {b.start_date ? new Date(b.start_date).toLocaleDateString() : "—"}
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <span style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.6)"}}>Yield: {b.yield_amount||0} lbs</span>
                                    <span className={`badge bg-${STAGE_COLORS[b.status]||"secondary"}`}>{b.status}</span>
                                </div>
                            </div>
                        ))}
                        {batches.length === 0 && <p className="text-center" style={{color:"rgba(255,255,255,0.5)"}}>No batches yet</p>}
                    </div>
                </div>

                {/* Pending Tasks */}
                <div className="col-md-5">
                    <div className="glass-panel">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">📋 Pending Tasks</h5>
                            <Link to="/growfarms/task-list" className="btn btn-sm btn-outline-light">View All</Link>
                        </div>
                        {tasks.filter(t => t.status === 'Pending').slice(0,5).map(t => (
                            <div key={t.id} className="mb-2 p-2 rounded"
                                style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)"}}>
                                <div className="d-flex justify-content-between">
                                    <span style={{fontWeight:600,fontSize:"0.9rem"}}>{t.task_name}</span>
                                    <span className={`badge bg-${t.priority==="High"?"danger":t.priority==="Medium"?"warning text-dark":"info"}`}>{t.priority}</span>
                                </div>
                                <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>Due: {t.due_date ? new Date(t.due_date).toLocaleDateString() : "—"}</div>
                            </div>
                        ))}
                        {tasks.filter(t => t.status === 'Pending').length === 0 && (
                            <p className="text-center" style={{color:"rgba(255,255,255,0.5)"}}>✅ No pending tasks</p>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="col-12">
                    <div className="glass-panel">
                        <h5 className="mb-3">Quick Actions</h5>
                        <div className="d-flex flex-wrap gap-2">
                            <Link to="/growfarms/add-plant-batch" className="btn btn-success btn-sm">+ New Batch</Link>
                            <Link to="/growfarms/add-grow-task" className="btn btn-primary btn-sm">+ Add Task</Link>
                            <Link to="/growfarms/harvest-log" className="btn btn-warning btn-sm text-dark">🌾 Log Harvest</Link>
                            <Link to="/growfarms/pest-disease" className="btn btn-danger btn-sm">🐛 Report Issue</Link>
                            <Link to="/growfarms/yield-prediction" className="btn btn-info btn-sm">📊 Yield Forecast</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default GrowFarmDashboard;
