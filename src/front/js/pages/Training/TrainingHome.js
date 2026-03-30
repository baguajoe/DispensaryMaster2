import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TrainingHome = () => {
    const [resources, setResources] = useState([]);
    const [completions, setCompletions] = useState([]);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        Promise.all([
            fetch(`${process.env.BACKEND_URL}/api/training-resources`, { headers }).then(r => r.ok ? r.json() : []),
            fetch(`${process.env.BACKEND_URL}/api/training-completions`, { headers }).then(r => r.ok ? r.json() : [])
        ]).then(([res, comp]) => {
            setResources(Array.isArray(res) ? res : []);
            setCompletions(Array.isArray(comp) ? comp : []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const markComplete = async (id) => {
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/training-completions`, {
                method: "POST",
                headers: { ...headers, "Content-Type": "application/json" },
                body: JSON.stringify({ resource_id: id })
            });
            if (r.ok) setCompletions(prev => [...prev, { resource_id: id, completed_at: new Date().toISOString() }]);
        } catch(e) { console.error(e); }
    };

    const isCompleted = (id) => completions.some(c => c.resource_id === id);
    const types = ["All", ...new Set(resources.map(r => r.resource_type).filter(Boolean))];
    const filtered = resources.filter(r => {
        const matchType = typeFilter === "All" || r.resource_type === typeFilter;
        const matchSearch = !search || r.title?.toLowerCase().includes(search.toLowerCase());
        return matchType && matchSearch;
    });
    const required = filtered.filter(r => r.is_required);
    const optional = filtered.filter(r => !r.is_required);
    const totalCompleted = resources.filter(r => isCompleted(r.id)).length;
    const pct = resources.length > 0 ? Math.round((totalCompleted / resources.length) * 100) : 0;
    const requiredDone = required.filter(r => isCompleted(r.id)).length;

    const ICONS = { video:"▶", article:"📄", module:"📚", quiz:"❓", compliance:"📋" };
    const COLORS = { video:"danger", article:"primary", module:"success", quiz:"warning", compliance:"dark" };

    const Card = ({ r }) => {
        const done = isCompleted(r.id);
        return (
            <div className="col-md-4 mb-3">
                <div className="card h-100" style={{background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", color:"white"}}>
                    {r.is_required && <div className="card-header py-1 text-center bg-danger text-white small fw-bold">REQUIRED</div>}
                    <div className="card-body d-flex flex-column">
                        <div className="d-flex justify-content-between mb-2">
                            <span style={{fontSize:"1.6rem"}}>{ICONS[r.resource_type] || "📄"}</span>
                            <div className="d-flex gap-1 flex-wrap justify-content-end">
                                <span className={`badge bg-${COLORS[r.resource_type] || "secondary"}`}>{r.resource_type}</span>
                                {r.category && <span className="badge" style={{background:"rgba(255,255,255,0.2)"}}>{r.category}</span>}
                                {done && <span className="badge bg-success">✓ Done</span>}
                            </div>
                        </div>
                        <h6 className="fw-semibold mb-1">{r.title}</h6>
                        <p className="small mb-3 flex-grow-1" style={{color:"rgba(255,255,255,0.6)", display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden"}}>
                            {r.content}
                        </p>
                        <div className="d-flex gap-2">
                            <button className="btn btn-sm flex-grow-1" style={{background:"rgba(255,255,255,0.15)", color:"white", border:"1px solid rgba(255,255,255,0.2)"}}
                                onClick={() => setSelected(r)}>
                                {r.resource_type === "video" ? "▶ Watch" : "📖 Open"}
                            </button>
                            {!done && (
                                <button className="btn btn-sm btn-outline-success" onClick={() => markComplete(r.id)} title="Mark complete">✓</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="main-content p-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="text-white mb-0">🎓 Staff Training Center</h3>
                    <small style={{color:"rgba(255,255,255,0.6)"}}>Private compliance & training library</small>
                </div>
                <button className="btn btn-success" onClick={() => navigate("/training/create")}>+ Add Training</button>
            </div>

            {/* Stats */}
            <div className="row g-3 mb-4">
                {[
                    { label:"Total Modules", value:resources.length, icon:"📚", color:"#4dabf7" },
                    { label:"Required", value:resources.filter(r=>r.is_required).length, icon:"⚠️", color:"#ff6b6b" },
                    { label:"You Completed", value:totalCompleted, icon:"✅", color:"#51cf66" },
                    { label:"Progress", value:`${pct}%`, icon:"📈", color:"#74c0fc" },
                ].map((s,i) => (
                    <div key={i} className="col-6 col-md-3">
                        <div className="rounded p-3 d-flex justify-content-between align-items-center" style={{background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)"}}>
                            <div>
                                <div className="small mb-1" style={{color:"rgba(255,255,255,0.6)"}}>{s.label}</div>
                                <div className="fw-bold fs-4" style={{color:s.color}}>{s.value}</div>
                            </div>
                            <span style={{fontSize:"1.5rem"}}>{s.icon}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Progress bar */}
            <div className="rounded p-3 mb-4" style={{background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)"}}>
                <div className="d-flex justify-content-between mb-2">
                    <span className="small text-white fw-semibold">Overall Progress</span>
                    <span className="small" style={{color:"rgba(255,255,255,0.6)"}}>{totalCompleted} / {resources.length} modules</span>
                </div>
                <div className="progress mb-2" style={{height:"10px", background:"rgba(255,255,255,0.1)"}}>
                    <div className="progress-bar bg-success" style={{width:`${pct}%`, transition:"width 0.5s"}} />
                </div>
                {required.length > 0 && (
                    <div className="small" style={{color: requiredDone < required.length ? "#ff6b6b" : "#51cf66"}}>
                        {requiredDone < required.length
                            ? `⚠️ ${required.length - requiredDone} required module${required.length - requiredDone > 1 ? "s" : ""} not yet completed`
                            : "✓ All required training complete"}
                    </div>
                )}
            </div>

            {/* Standalone pitch */}
            <div className="rounded p-3 mb-4 d-flex justify-content-between align-items-center" style={{background:"rgba(0,150,200,0.15)", border:"1px solid rgba(0,150,200,0.3)"}}>
                <div>
                    <span className="text-white fw-semibold">💼 Using Dutchie or another POS?</span>
                    <span className="small ms-2" style={{color:"rgba(255,255,255,0.7)"}}>License this training platform standalone — $99/mo per dispensary</span>
                </div>
                <button className="btn btn-sm btn-info text-white ms-3">Learn More</button>
            </div>

            {/* Filters */}
            <div className="d-flex gap-2 mb-4 flex-wrap">
                <input className="form-control flex-grow-1" placeholder="Search training..."
                    style={{background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", color:"white", maxWidth:"320px"}}
                    value={search} onChange={e => setSearch(e.target.value)} />
                {types.map(t => (
                    <button key={t} className={`btn btn-sm ${typeFilter===t?"btn-light":"btn-outline-light"}`}
                        onClick={() => setTypeFilter(t)}>{t}</button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-light" /></div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}>
                    <div style={{fontSize:"3rem"}}>🎓</div>
                    <h5 className="text-white">No training materials yet</h5>
                    <button className="btn btn-success mt-2" onClick={() => navigate("/training/create")}>Add First Module</button>
                </div>
            ) : (
                <>
                    {required.length > 0 && (
                        <div className="mb-4">
                            <h6 className="text-danger fw-bold mb-3">⚠️ Required Training ({required.length})</h6>
                            <div className="row">{required.map(r => <Card key={r.id} r={r} />)}</div>
                        </div>
                    )}
                    {optional.length > 0 && (
                        <div>
                            <h6 className="text-white fw-bold mb-3">{required.length > 0 ? "Additional Training" : "All Training"} ({optional.length})</h6>
                            <div className="row">{optional.map(r => <Card key={r.id} r={r} />)}</div>
                        </div>
                    )}
                </>
            )}

            {/* Modal */}
            {selected && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-lg modal-dialog-scrollable">
                            <div className="modal-content" style={{background:"#1a2a3a", color:"white", border:"1px solid rgba(255,255,255,0.2)"}}>
                                <div className="modal-header" style={{borderBottom:"1px solid rgba(255,255,255,0.15)"}}>
                                    <div>
                                        <h5 className="modal-title fw-bold">{ICONS[selected.resource_type]} {selected.title}</h5>
                                        <div className="d-flex gap-2 mt-1">
                                            <span className={`badge bg-${COLORS[selected.resource_type]}`}>{selected.resource_type}</span>
                                            {selected.category && <span className="badge" style={{background:"rgba(255,255,255,0.2)"}}>{selected.category}</span>}
                                            {selected.is_required && <span className="badge bg-danger">Required</span>}
                                        </div>
                                    </div>
                                    <button className="btn-close btn-close-white ms-auto" onClick={() => setSelected(null)} />
                                </div>
                                <div className="modal-body">
                                    {selected.resource_type === "video" && selected.link && (
                                        <div className="ratio ratio-16x9 mb-3 rounded overflow-hidden">
                                            <iframe
                                                src={selected.link.includes("youtube.com/watch?v=")
                                                    ? `https://www.youtube.com/embed/${new URL(selected.link).searchParams.get("v")}`
                                                    : selected.link.includes("youtu.be/")
                                                    ? `https://www.youtube.com/embed/${selected.link.split("youtu.be/")[1]}`
                                                    : selected.link}
                                                allowFullScreen
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            />
                                        </div>
                                    )}
                                    {selected.link && selected.resource_type !== "video" && (
                                        <a href={selected.link} target="_blank" rel="noreferrer" className="btn btn-outline-light mb-3">🔗 Open Resource</a>
                                    )}
                                    <div className="rounded p-3" style={{background:"rgba(255,255,255,0.05)", whiteSpace:"pre-wrap", color:"rgba(255,255,255,0.85)"}}>
                                        {selected.content}
                                    </div>
                                </div>
                                <div className="modal-footer" style={{borderTop:"1px solid rgba(255,255,255,0.15)"}}>
                                    <button className="btn btn-outline-light" onClick={() => setSelected(null)}>Close</button>
                                    {!isCompleted(selected.id) ? (
                                        <button className="btn btn-success px-4"
                                            onClick={() => { markComplete(selected.id); setSelected(null); }}>
                                            ✓ Mark as Complete
                                        </button>
                                    ) : (
                                        <span className="text-success fw-bold">✅ Completed</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" onClick={() => setSelected(null)} />
                </>
            )}
        </div>
    );
};
export default TrainingHome;
