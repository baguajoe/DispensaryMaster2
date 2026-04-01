import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ResumeSearch = () => {
    const navigate = useNavigate();
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ desired_role:"", location:"", cannabis_experience:"", min_years:"" });
    const token = localStorage.getItem("token");

    const search = () => {
        setLoading(true);
        const params = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([,v])=>v)));
        fetch(`${process.env.BACKEND_URL}/api/resumes?${params}`, { headers:{ Authorization:`Bearer ${token}` } })
            .then(r => r.ok ? r.json() : [])
            .then(data => { setResumes(Array.isArray(data)?data:[]); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { search(); }, []);

    const ROLES = ["Budtender","Store Manager","Assistant Manager","Delivery Driver","Extraction Tech","Compliance Officer"];

    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2 style={{ color: "#ffab00", fontWeight: 800 }}>🔍 Resume Database</h2><p>Find qualified cannabis professionals</p></div>

            {/* Search Filters */}
            <div className="glass-panel mb-4">
                <div className="row g-3 align-items-end">
                    <div className="col-md-3">
                        <label className="form-label">Role</label>
                        <select className="form-select" value={filters.desired_role} onChange={e=>setFilters({...filters,desired_role:e.target.value})}>
                            <option value="">All Roles</option>
                            {ROLES.map(r=><option key={r}>{r}</option>)}
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Location</label>
                        <input className="form-control" placeholder="Boston, MA" value={filters.location} onChange={e=>setFilters({...filters,location:e.target.value})} />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label">Min Years</label>
                        <input className="form-control" type="number" min="0" value={filters.min_years} onChange={e=>setFilters({...filters,min_years:e.target.value})} />
                    </div>
                    <div className="col-md-2">
                        <div className="form-check mt-4">
                            <input className="form-check-input" type="checkbox" checked={filters.cannabis_experience==="true"}
                                onChange={e=>setFilters({...filters,cannabis_experience:e.target.checked?"true":""})} />
                            <label className="form-check-label">Cannabis Exp Only</label>
                        </div>
                    </div>
                    <div className="col-md-2">
                        <button className="btn btn-success w-100" onClick={search}>Search</button>
                    </div>
                </div>
            </div>

            {/* Results */}
            {loading ? <div className="text-center py-4"><div className="spinner-border text-light"/></div>
            : resumes.length === 0 ? (
                <div className="glass-panel text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}>
                    <div style={{fontSize:"3rem"}}>📄</div><h5>No resumes found</h5><p>Try adjusting your filters</p>
                </div>
            ) : (
                <div className="row g-3">
                    {resumes.map(r => (
                        <div key={r.id} className="col-md-6 col-lg-4">
                            <div className="glass-panel h-100">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h5 className="mb-0">{r.full_name}</h5>
                                    {r.cannabis_experience && <span className="badge bg-success">🌿 Cannabis Exp</span>}
                                </div>
                                <p style={{color:"rgba(255,255,255,0.6)",fontSize:"0.9rem",margin:"0 0 0.5rem"}}>{r.desired_role || "Open to opportunities"}</p>
                                <p style={{color:"rgba(255,255,255,0.5)",fontSize:"0.8rem",margin:"0 0 0.75rem"}}>📍 {r.location || "Location not specified"} · {r.experience_years} yrs exp</p>
                                {r.summary && <p style={{fontSize:"0.85rem",color:"rgba(255,255,255,0.7)",margin:"0 0 0.75rem"}}>{r.summary.slice(0,120)}{r.summary.length>120?"...":""}</p>}
                                <div className="d-flex flex-wrap gap-1 mb-3">
                                    {(r.skills||[]).slice(0,4).map(s=><span key={s} className="badge bg-secondary" style={{fontSize:"0.75rem"}}>{s}</span>)}
                                </div>
                                <div className="d-flex gap-2">
                                    {r.resume_url && <a href={r.resume_url} target="_blank" rel="noreferrer" className="btn btn-outline-info btn-sm">📄 Resume</a>}
                                    <a href={`mailto:${r.email}`} className="btn btn-success btn-sm flex-grow-1">Contact</a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
export default ResumeSearch;
