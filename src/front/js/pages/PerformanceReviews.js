import React, { useState, useEffect } from "react";

const RATING_LABELS = { 1:"Poor", 2:"Below Average", 3:"Meets Expectations", 4:"Exceeds Expectations", 5:"Outstanding" };

const StarRating = ({ value, onChange, readOnly }) => (
    <div className="d-flex gap-1">
        {[1,2,3,4,5].map(star => (
            <span key={star} style={{fontSize:"1.5rem",cursor:readOnly?"default":"pointer",color:star<=value?"#ffd600":"rgba(255,255,255,0.2)"}}
                onClick={() => !readOnly && onChange(star)}>★</span>
        ))}
        {value > 0 && <span style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.5)",alignSelf:"center",marginLeft:"4px"}}>{RATING_LABELS[value]}</span>}
    </div>
);

const PerformanceReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState({
        employee_id:"", company_id:"", review_period:"",
        attendance_rating:0, performance_rating:0, teamwork_rating:0,
        knowledge_rating:0, customer_service_rating:0,
        strengths:"", improvements:"", goals:"", manager_comments:""
    });
    const [saving, setSaving] = useState(false);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/performance-reviews`, { headers })
            .then(r => r.ok ? r.json() : [])
            .then(data => { setReviews(Array.isArray(data)?data:[]); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/performance-reviews`, { method:"POST", headers, body:JSON.stringify(form) });
            if (r.ok) {
                const data = await r.json();
                setReviews(prev => [data, ...prev]);
                setShowForm(false);
                setForm({ employee_id:"", company_id:"", review_period:"", attendance_rating:0, performance_rating:0, teamwork_rating:0, knowledge_rating:0, customer_service_rating:0, strengths:"", improvements:"", goals:"", manager_comments:"" });
            }
        } catch(e) { console.error(e); } finally { setSaving(false); }
    };

    const handleAcknowledge = async (id) => {
        const comments = window.prompt("Add your comments (optional):");
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/performance-reviews/${id}/acknowledge`, {
                method:"PUT", headers, body:JSON.stringify({ employee_comments: comments||"" })
            });
            if (r.ok) { const data = await r.json(); setReviews(prev => prev.map(rv => rv.id===id ? data : rv)); setSelected(data); }
        } catch(e) { console.error(e); }
    };

    const ratingColor = (r) => r >= 4 ? "#2dce89" : r >= 3 ? "#ffd600" : "#f5365c";

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2 style={{ color: "#ffab00", fontWeight: 800 }}>⭐ Performance Reviews</h2><p>{reviews.length} reviews on record</p></div>
                <button className="btn btn-success" onClick={() => setShowForm(!showForm)}>+ New Review</button>
            </div>

            {showForm && (
                <div className="glass-panel mb-4">
                    <h5 className="mb-4">New Performance Review</h5>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-4"><label className="form-label">Employee ID *</label><input className="form-control" required value={form.employee_id} onChange={e=>setForm({...form,employee_id:e.target.value})} /></div>
                            <div className="col-md-4"><label className="form-label">Company ID *</label><input className="form-control" required value={form.company_id} onChange={e=>setForm({...form,company_id:e.target.value})} /></div>
                            <div className="col-md-4"><label className="form-label">Review Period</label><input className="form-control" placeholder="Q1 2025 / Annual 2024" value={form.review_period} onChange={e=>setForm({...form,review_period:e.target.value})} /></div>

                            <div className="col-12"><hr style={{borderColor:"rgba(255,255,255,0.1)"}}/><h6 className="mb-3">Ratings</h6></div>
                            {[
                                {k:"attendance_rating",l:"Attendance & Punctuality"},
                                {k:"performance_rating",l:"Job Performance"},
                                {k:"teamwork_rating",l:"Teamwork & Collaboration"},
                                {k:"knowledge_rating",l:"Cannabis Knowledge"},
                                {k:"customer_service_rating",l:"Customer Service"},
                            ].map(field => (
                                <div key={field.k} className="col-md-6">
                                    <label className="form-label">{field.l}</label>
                                    <StarRating value={form[field.k]} onChange={v => setForm({...form,[field.k]:v})} />
                                </div>
                            ))}

                            <div className="col-12"><hr style={{borderColor:"rgba(255,255,255,0.1)"}}/></div>
                            <div className="col-md-4"><label className="form-label">Strengths</label><textarea className="form-control" rows="3" value={form.strengths} onChange={e=>setForm({...form,strengths:e.target.value})} placeholder="What does this employee do well?" /></div>
                            <div className="col-md-4"><label className="form-label">Areas for Improvement</label><textarea className="form-control" rows="3" value={form.improvements} onChange={e=>setForm({...form,improvements:e.target.value})} placeholder="What could be better?" /></div>
                            <div className="col-md-4"><label className="form-label">Goals for Next Period</label><textarea className="form-control" rows="3" value={form.goals} onChange={e=>setForm({...form,goals:e.target.value})} placeholder="Set targets for next review" /></div>
                            <div className="col-12"><label className="form-label">Manager Comments</label><textarea className="form-control" rows="2" value={form.manager_comments} onChange={e=>setForm({...form,manager_comments:e.target.value})} /></div>

                            <div className="col-12 d-flex gap-2">
                                <button type="button" className="btn btn-outline-light" onClick={()=>setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-success flex-grow-1" disabled={saving}>{saving?<span className="spinner-border spinner-border-sm"/>:"Submit Review"}</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="row g-3">
                <div className="col-md-4">
                    <div className="glass-panel">
                        <h5 className="mb-3">Reviews</h5>
                        {reviews.length===0 ? <p style={{color:"rgba(255,255,255,0.5)"}}>No reviews yet</p>
                        : reviews.map(r => (
                            <div key={r.id} className="mb-2 p-3 rounded" style={{background:selected?.id===r.id?"rgba(45,206,137,0.15)":"rgba(255,255,255,0.06)",border:`1px solid ${selected?.id===r.id?"rgba(45,206,137,0.4)":"rgba(255,255,255,0.1)"}`,cursor:"pointer"}}
                                onClick={() => setSelected(r)}>
                                <div className="d-flex justify-content-between">
                                    <div style={{fontWeight:600,fontSize:"0.9rem"}}>Employee #{r.employee_id}</div>
                                    {r.overall_rating && <span style={{color:ratingColor(r.overall_rating),fontWeight:700}}>★ {r.overall_rating}</span>}
                                </div>
                                <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>{r.review_period}</div>
                                <span className={`badge mt-1 bg-${r.status==="acknowledged"?"success":r.status==="submitted"?"info":"secondary"}`}>{r.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="col-md-8">
                    {!selected ? (
                        <div className="glass-panel text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}><div style={{fontSize:"3rem"}}>⭐</div><h5>Select a review to view details</h5></div>
                    ) : (
                        <div className="glass-panel">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h5 className="mb-0">Employee #{selected.employee_id} · {selected.review_period}</h5>
                                    <small style={{color:"rgba(255,255,255,0.5)"}}>Reviewed by #{selected.reviewer_id} · {selected.training_completed} trainings completed</small>
                                </div>
                                {selected.overall_rating && <div className="text-center"><div style={{fontSize:"2.5rem",fontWeight:800,color:ratingColor(selected.overall_rating)}}>★ {selected.overall_rating}</div><div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)"}}>Overall</div></div>}
                            </div>

                            <div className="row g-3 mb-4">
                                {[
                                    {k:"attendance_rating",l:"Attendance"},
                                    {k:"performance_rating",l:"Performance"},
                                    {k:"teamwork_rating",l:"Teamwork"},
                                    {k:"knowledge_rating",l:"Knowledge"},
                                    {k:"customer_service_rating",l:"Customer Service"},
                                ].map(f => selected[f.k] && (
                                    <div key={f.k} className="col-6 col-md-4">
                                        <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>{f.l}</div>
                                        <StarRating value={selected[f.k]} readOnly />
                                    </div>
                                ))}
                            </div>

                            <div className="row g-3 mb-3">
                                {selected.strengths && <div className="col-md-4"><div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>STRENGTHS</div><p style={{fontSize:"0.9rem"}}>{selected.strengths}</p></div>}
                                {selected.improvements && <div className="col-md-4"><div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>IMPROVEMENTS</div><p style={{fontSize:"0.9rem"}}>{selected.improvements}</p></div>}
                                {selected.goals && <div className="col-md-4"><div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>GOALS</div><p style={{fontSize:"0.9rem"}}>{selected.goals}</p></div>}
                            </div>

                            {selected.manager_comments && <div className="mb-3"><div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>MANAGER COMMENTS</div><p style={{fontSize:"0.9rem"}}>{selected.manager_comments}</p></div>}
                            {selected.employee_comments && <div className="mb-3 p-3 rounded" style={{background:"rgba(45,206,137,0.1)",border:"1px solid rgba(45,206,137,0.3)"}}><div style={{fontSize:"0.75rem",color:"#2dce89"}}>EMPLOYEE RESPONSE</div><p style={{fontSize:"0.9rem",margin:0}}>{selected.employee_comments}</p></div>}

                            {selected.status === "submitted" && (
                                <button className="btn btn-success w-100 mt-2" onClick={() => handleAcknowledge(selected.id)}>
                                    ✓ Acknowledge Review
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default PerformanceReviews;
