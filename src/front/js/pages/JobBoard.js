import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";

const JOB_CATEGORIES = ["All","Budtender","Manager","Delivery Driver","Security","Cultivation","Extraction","Marketing","Compliance","IT","Other"];
const PLANS = [
    { name: "Free", price: 0, color: "secondary", features: ["1 active listing", "30 days"] },
    { name: "Pro", price: 49, color: "primary", features: ["10 listings", "Featured badge", "60 days", "Applicant tracking"] },
    { name: "Enterprise", price: 199, color: "success", features: ["Unlimited listings", "Featured + highlighted", "90 days", "Priority support"] },
];

const JobBoard = () => {
    const { store, actions } = useContext(Context);
    const [search, setSearch] = useState("");
    const [location, setLocation] = useState("");
    const [category, setCategory] = useState("All");
    const [selectedJob, setSelectedJob] = useState(null);
    const [applyForm, setApplyForm] = useState({ name: "", email: "", phone: "", cover_letter: "" });
    const [applied, setApplied] = useState({});
    const [showPlans, setShowPlans] = useState(false);
    const [applying, setApplying] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        actions.fetchJobs().then(() => setLoading(false));
        actions.fetchCompanies();
    }, []);

    const filteredJobs = (store.jobs || []).filter(job => {
        const matchSearch = !search || job.title?.toLowerCase().includes(search.toLowerCase()) || job.description?.toLowerCase().includes(search.toLowerCase());
        const matchLocation = !location || job.location?.toLowerCase().includes(location.toLowerCase());
        const matchCategory = category === "All" || job.title?.toLowerCase().includes(category.toLowerCase());
        return matchSearch && matchLocation && matchCategory;
    });

    const getCompany = (id) => (store.companies || []).find(c => c.id === id);

    const handleApply = async (e) => {
        e.preventDefault();
        setApplying(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/apply`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ job_id: selectedJob.id, company_id: selectedJob.company_id, ...applyForm })
            });
            if (r.ok) { setApplied(prev => ({ ...prev, [selectedJob.id]: true })); setSelectedJob(null); }
        } catch(e) { console.error(e); } finally { setApplying(false); }
    };

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h2 mb-0">🌿 Cannabis Industry Jobs</h1>
                    <p className="text-muted mb-0">{filteredJobs.length} positions available</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-success" onClick={() => setShowPlans(!showPlans)}>💼 Post a Job</button>
                    {token && <button className="btn btn-success" onClick={() => navigate("/jobs/post")}>+ Free Listing</button>}
                </div>
            </div>

            {showPlans && (
                <div className="card mb-4 border-success">
                    <div className="card-header bg-success text-white"><h5 className="mb-0">Job Listing Plans</h5></div>
                    <div className="card-body">
                        <div className="row g-3">
                            {PLANS.map((plan, i) => (
                                <div key={i} className="col-md-4">
                                    <div className={`card h-100 border-${plan.color}`}>
                                        <div className="card-body text-center">
                                            <h4>{plan.name}</h4>
                                            <div className="display-6 fw-bold mb-3">{plan.price === 0 ? "Free" : `$${plan.price}/mo`}</div>
                                            <ul className="list-unstyled text-start">{plan.features.map((f,j) => <li key={j}>✓ {f}</li>)}</ul>
                                            <button className={`btn btn-${plan.color} w-100 mt-2`} onClick={() => { setShowPlans(false); navigate("/jobs/post"); }}>
                                                {plan.price === 0 ? "Get Started Free" : `Subscribe — $${plan.price}/mo`}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-muted small text-center mt-3">Works standalone — dispensaries using Dutchie, Flowhub, or any POS can subscribe.</p>
                    </div>
                </div>
            )}

            <div className="row g-2 mb-3">
                <div className="col-md-4"><input className="form-control" placeholder="🔍 Search jobs..." value={search} onChange={e => setSearch(e.target.value)} /></div>
                <div className="col-md-3"><input className="form-control" placeholder="📍 Location..." value={location} onChange={e => setLocation(e.target.value)} /></div>
                <div className="col-md-3">
                    <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                        {JOB_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                </div>
                <div className="col-md-2"><button className="btn btn-outline-secondary w-100" onClick={() => { setSearch(""); setLocation(""); setCategory("All"); }}>Clear</button></div>
            </div>

            {loading ? <div className="text-center py-5"><div className="spinner-border text-success" /></div>
            : filteredJobs.length === 0 ? (
                <div className="text-center py-5">
                    <div style={{fontSize:"3rem"}}>🌿</div>
                    <h4>No jobs posted yet</h4>
                    <button className="btn btn-success" onClick={() => navigate("/jobs/post")}>Post the First Job</button>
                </div>
            ) : (
                <div className="row g-3">
                    {filteredJobs.map(job => {
                        const company = getCompany(job.company_id);
                        return (
                            <div key={job.id} className="col-md-6">
                                <div className={`card h-100 ${applied[job.id] ? "border-success" : ""}`} style={{cursor:"pointer"}} onClick={() => setSelectedJob(job)}>
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <h5 className="mb-0">{job.title}</h5>
                                            {applied[job.id] && <span className="badge bg-success">Applied ✓</span>}
                                        </div>
                                        <h6 className="text-muted mb-2">🏢 {company?.name || "Cannabis Company"}</h6>
                                        <p className="small text-muted mb-2" style={{display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{job.description}</p>
                                        <div className="d-flex flex-wrap gap-1">
                                            {job.location && <span className="badge bg-light text-dark">📍 {job.location}</span>}
                                            {job.salary && <span className="badge bg-success">💰 {job.salary}</span>}
                                        </div>
                                    </div>
                                    <div className="card-footer bg-transparent d-flex justify-content-between">
                                        <small className="text-muted">{job.posted_at ? new Date(job.posted_at).toLocaleDateString() : "Recently posted"}</small>
                                        <button className="btn btn-sm btn-outline-success" onClick={e => { e.stopPropagation(); setSelectedJob(job); }}>View & Apply</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedJob && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <div>
                                        <h4 className="modal-title">{selectedJob.title}</h4>
                                        <p className="text-muted mb-0">🏢 {getCompany(selectedJob.company_id)?.name || "Cannabis Company"}{selectedJob.location && ` · 📍 ${selectedJob.location}`}{selectedJob.salary && ` · 💰 ${selectedJob.salary}`}</p>
                                    </div>
                                    <button className="btn-close" onClick={() => setSelectedJob(null)} />
                                </div>
                                <div className="modal-body">
                                    <h6>Job Description</h6><p>{selectedJob.description}</p>
                                    {selectedJob.requirements && <><h6>Requirements</h6><p>{selectedJob.requirements}</p></>}
                                    <hr />
                                    {applied[selectedJob.id] ? (
                                        <div className="alert alert-success text-center">✅ You have already applied!</div>
                                    ) : token ? (
                                        <>
                                            <h5>Apply Now</h5>
                                            <form onSubmit={handleApply}>
                                                <div className="row g-2 mb-3">
                                                    <div className="col-md-6"><input className="form-control" placeholder="Full Name" required value={applyForm.name} onChange={e => setApplyForm({...applyForm, name: e.target.value})} /></div>
                                                    <div className="col-md-6"><input className="form-control" placeholder="Email" type="email" required value={applyForm.email} onChange={e => setApplyForm({...applyForm, email: e.target.value})} /></div>
                                                </div>
                                                <div className="mb-3"><input className="form-control" placeholder="Phone" value={applyForm.phone} onChange={e => setApplyForm({...applyForm, phone: e.target.value})} /></div>
                                                <div className="mb-3"><textarea className="form-control" rows="4" placeholder="Cover letter..." value={applyForm.cover_letter} onChange={e => setApplyForm({...applyForm, cover_letter: e.target.value})} /></div>
                                                <button className="btn btn-success w-100" type="submit" disabled={applying}>{applying ? <span className="spinner-border spinner-border-sm me-2" /> : null}Submit Application</button>
                                            </form>
                                        </>
                                    ) : <div className="alert alert-info text-center"><a href="/login" className="btn btn-primary">Login to Apply</a></div>}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" onClick={() => setSelectedJob(null)} />
                </>
            )}
        </div>
    );
};
export default JobBoard;
