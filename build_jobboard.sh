#!/bin/bash
echo "Building Job Board + Training Platform..."

cat > src/front/js/pages/JobBoard.js << 'EOF'
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
EOF

cat > src/front/js/pages/JobPost.js << 'EOF'
import React, { useState, useContext, useEffect } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";

const JOB_TYPES = ["Full-Time","Part-Time","Contract","Seasonal","Internship"];
const JOB_CATEGORIES = ["Budtender","Manager","Delivery Driver","Security","Cultivation","Extraction","Marketing","Compliance","IT","Other"];

const JobPost = () => {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();
    const [plan, setPlan] = useState("free");
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ title:"", description:"", requirements:"", salary:"", location:"", company_id:"", job_type:"Full-Time", category:"Budtender" });
    const [newCompany, setNewCompany] = useState({ name:"", description:"" });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

    useEffect(() => { actions.fetchCompanies(); }, []);

    const createCompany = async () => {
        const r = await fetch(`${process.env.BACKEND_URL}/api/companies`, { method:"POST", headers, body: JSON.stringify(newCompany) });
        if (r.ok) { const d = await r.json(); await actions.fetchCompanies(); setFormData({...formData, company_id: d.id}); setNewCompany({name:"",description:""}); }
    };

    const handleSubmit = async () => {
        if (!formData.company_id) return alert("Select or create a company first");
        setSubmitting(true);
        const result = await actions.postJob(formData.company_id, formData);
        if (result.success) { setSuccess(true); setTimeout(() => navigate("/jobs"), 2000); }
        else { alert("Error: " + result.error); setSubmitting(false); }
    };

    if (success) return <div className="main-content p-4 text-center py-5"><div style={{fontSize:"4rem"}}>✅</div><h2 className="text-success">Job Posted!</h2><p>Redirecting to job board...</p></div>;

    return (
        <div className="main-content p-4">
            <h1 className="h3 mb-4">Post a Cannabis Industry Job</h1>
            <div className="d-flex gap-2 mb-4">
                {["Choose Plan","Job Details","Review & Post"].map((s,i) => (
                    <div key={i} className={`flex-grow-1 text-center py-2 rounded ${step===i+1?"bg-success text-white":"bg-light text-muted"}`}><strong>{i+1}. {s}</strong></div>
                ))}
            </div>

            {step === 1 && (
                <div>
                    <div className="row g-3 mb-4">
                        {[{id:"free",name:"Free",price:"$0",color:"secondary",features:["1 listing","30 days"]},
                          {id:"pro",name:"Pro",price:"$49/mo",color:"primary",features:["10 listings","Featured badge","60 days","Applicant tracking"]},
                          {id:"enterprise",name:"Enterprise",price:"$199/mo",color:"success",features:["Unlimited listings","Featured","90 days","Priority support","Analytics"]}
                        ].map(p => (
                            <div key={p.id} className="col-md-4">
                                <div className={`card h-100 ${plan===p.id?`border-${p.color} border-3`:""}`} style={{cursor:"pointer"}} onClick={() => setPlan(p.id)}>
                                    <div className="card-body text-center">
                                        <h4>{p.name}</h4>
                                        <div className="display-6 fw-bold mb-3">{p.price}</div>
                                        <ul className="list-unstyled text-start">{p.features.map((f,j) => <li key={j}>✓ {f}</li>)}</ul>
                                        <div className={`btn btn-${plan===p.id?p.color:`outline-${p.color}`} w-100 mt-2`}>{plan===p.id?"✓ Selected":"Select"}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="alert alert-info">💡 Dispensaries using Dutchie, Flowhub, or any other POS can subscribe to this job board independently.</div>
                    <button className="btn btn-success" onClick={() => setStep(2)}>Continue →</button>
                </div>
            )}

            {step === 2 && (
                <div>
                    <div className="card mb-4">
                        <div className="card-header"><h5 className="mb-0">Company</h5></div>
                        <div className="card-body">
                            <select className="form-select mb-3" value={formData.company_id} onChange={e => setFormData({...formData, company_id: e.target.value})}>
                                <option value="">-- Select your dispensary --</option>
                                {(store.companies||[]).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <div className="border rounded p-3 bg-light">
                                <p className="fw-bold mb-2">Or create new:</p>
                                <div className="row g-2">
                                    <div className="col-md-5"><input className="form-control" placeholder="Company name" value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} /></div>
                                    <div className="col-md-5"><input className="form-control" placeholder="Description" value={newCompany.description} onChange={e => setNewCompany({...newCompany, description: e.target.value})} /></div>
                                    <div className="col-md-2"><button className="btn btn-outline-primary w-100" onClick={createCompany} disabled={!newCompany.name}>Create</button></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card mb-4">
                        <div className="card-header"><h5 className="mb-0">Job Details</h5></div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-6"><label className="form-label">Job Title *</label><input className="form-control" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required /></div>
                                <div className="col-md-3"><label className="form-label">Category</label><select className="form-select" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>{JOB_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
                                <div className="col-md-3"><label className="form-label">Type</label><select className="form-select" value={formData.job_type} onChange={e => setFormData({...formData, job_type: e.target.value})}>{JOB_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                                <div className="col-md-6"><label className="form-label">Location *</label><input className="form-control" placeholder="City, State" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} /></div>
                                <div className="col-md-6"><label className="form-label">Salary</label><input className="form-control" placeholder="e.g. $18-22/hr" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} /></div>
                                <div className="col-12"><label className="form-label">Description *</label><textarea className="form-control" rows="5" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required /></div>
                                <div className="col-12"><label className="form-label">Requirements</label><textarea className="form-control" rows="3" placeholder="State cannabis card required, experience, etc..." value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} /></div>
                            </div>
                        </div>
                    </div>
                    <div className="d-flex gap-2">
                        <button className="btn btn-outline-secondary" onClick={() => setStep(1)}>← Back</button>
                        <button className="btn btn-success" onClick={() => setStep(3)} disabled={!formData.title||!formData.location||!formData.description||!formData.company_id}>Preview →</button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div>
                    <div className="card mb-4">
                        <div className="card-header bg-success text-white"><h5 className="mb-0">Preview — {formData.title}</h5></div>
                        <div className="card-body">
                            <div className="d-flex gap-2 mb-3">
                                {formData.location && <span className="badge bg-secondary">📍 {formData.location}</span>}
                                {formData.salary && <span className="badge bg-success">💰 {formData.salary}</span>}
                                <span className="badge bg-info text-dark">{formData.job_type}</span>
                            </div>
                            <p>{formData.description}</p>
                            {formData.requirements && <><h6>Requirements</h6><p>{formData.requirements}</p></>}
                        </div>
                    </div>
                    <div className="d-flex gap-2">
                        <button className="btn btn-outline-secondary" onClick={() => setStep(2)}>← Edit</button>
                        <button className="btn btn-success flex-grow-1" onClick={handleSubmit} disabled={submitting}>
                            {submitting ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                            {plan==="free" ? "Publish Free Listing" : `Subscribe & Publish — ${plan==="pro"?"$49":"$199"}/mo`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
export default JobPost;
EOF

cat > src/front/js/pages/Companies.js << 'EOF'
import React, { useEffect, useContext, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";

const Companies = () => {
    const { store, actions } = useContext(Context);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    useEffect(() => { actions.fetchCompanies(); actions.fetchJobs(); }, []);

    const filtered = (store.companies||[]).filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase())
    );
    const getJobCount = (id) => (store.jobs||[]).filter(j => j.company_id === id).length;

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3 mb-0">🏢 Cannabis Companies</h1>
                <button className="btn btn-success" onClick={() => navigate("/jobs/post")}>+ Register Your Dispensary</button>
            </div>
            <input className="form-control mb-4" placeholder="Search companies..." value={search} onChange={e => setSearch(e.target.value)} />
            {filtered.length === 0 ? (
                <div className="text-center py-5 text-muted">
                    <div style={{fontSize:"3rem"}}>🏢</div>
                    <h4>No companies yet</h4>
                    <button className="btn btn-success" onClick={() => navigate("/jobs/post")}>Register Now</button>
                </div>
            ) : (
                <div className="row g-3">
                    {filtered.map(c => (
                        <div key={c.id} className="col-md-4">
                            <div className="card h-100">
                                <div className="card-body">
                                    <h5>{c.name}</h5>
                                    <p className="text-muted small">{c.description || "Cannabis company"}</p>
                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                        <span className="badge bg-success">{getJobCount(c.id)} open positions</span>
                                        <button className="btn btn-sm btn-outline-success" onClick={() => navigate("/jobs")}>View Jobs</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
export default Companies;
EOF

cat > src/front/js/pages/JobApplications.js << 'EOF'
import React, { useEffect, useState } from "react";

const JobApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/my-applications`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.ok ? r.json() : [])
            .then(data => { setApplications(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="main-content p-4 text-center py-5"><div className="spinner-border text-success" /></div>;

    return (
        <div className="main-content p-4">
            <h1 className="h3 mb-4">My Applications</h1>
            {applications.length === 0 ? (
                <div className="text-center py-5 text-muted">
                    <div style={{fontSize:"3rem"}}>📋</div>
                    <h4>No applications yet</h4>
                    <a href="/jobs" className="btn btn-success mt-2">Browse Jobs</a>
                </div>
            ) : (
                <div className="card">
                    <table className="table table-hover mb-0">
                        <thead className="table-dark"><tr><th>Position</th><th>Company</th><th>Location</th><th>Applied</th><th>Status</th></tr></thead>
                        <tbody>
                            {applications.map((app, i) => (
                                <tr key={i}>
                                    <td><strong>{app.job_title||"Position"}</strong></td>
                                    <td>{app.company_name||"Company"}</td>
                                    <td>{app.location||"-"}</td>
                                    <td className="small text-muted">{app.applied_at ? new Date(app.applied_at).toLocaleDateString() : "Recently"}</td>
                                    <td><span className="badge bg-warning text-dark">Under Review</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
export default JobApplications;
EOF

mkdir -p src/front/js/pages/Training

cat > src/front/js/pages/Training/TrainingHome.js << 'EOF'
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TrainingHome = () => {
    const [resources, setResources] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [completed, setCompleted] = useState(JSON.parse(localStorage.getItem("completed_training")||"[]"));
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/training-resources`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.ok ? r.json() : [])
            .then(data => { setResources(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const markComplete = (id) => {
        const updated = [...new Set([...completed, id])];
        setCompleted(updated);
        localStorage.setItem("completed_training", JSON.stringify(updated));
    };

    const types = ["All", ...new Set(resources.map(r => r.resource_type))];
    const filtered = resources.filter(r => {
        const matchType = filter === "All" || r.resource_type === filter;
        const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase());
        return matchType && matchSearch;
    });

    const icons = { video:"🎥", article:"📄", module:"📚", quiz:"❓", compliance:"📋" };
    const colors = { video:"danger", article:"primary", module:"success", quiz:"warning", compliance:"dark" };
    const pct = resources.length > 0 ? Math.round((completed.length/resources.length)*100) : 0;

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 mb-0">🎓 Staff Training Center</h1>
                    <p className="text-muted mb-0">Compliance, product knowledge & procedures</p>
                </div>
                <button className="btn btn-success" onClick={() => navigate("/training/create")}>+ Add Training</button>
            </div>

            <div className="card mb-4 border-success">
                <div className="card-body">
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            <div className="d-flex justify-content-between mb-1">
                                <span className="fw-bold">Your Progress</span>
                                <span>{completed.length} / {resources.length} completed</span>
                            </div>
                            <div className="progress" style={{height:"12px"}}><div className="progress-bar bg-success" style={{width:`${pct}%`}} /></div>
                        </div>
                        <div className="col-md-4 text-center">
                            <div className="display-6 fw-bold text-success">{pct}%</div>
                            <small className="text-muted">Complete</small>
                        </div>
                    </div>
                </div>
            </div>

            <div className="alert alert-info d-flex justify-content-between align-items-center mb-4">
                <span>💼 <strong>Using Dutchie or another POS?</strong> License this training platform standalone — $99/mo per dispensary</span>
                <button className="btn btn-info btn-sm text-white">Learn More</button>
            </div>

            <div className="row g-2 mb-3">
                <div className="col-md-5"><input className="form-control" placeholder="Search training..." value={search} onChange={e => setSearch(e.target.value)} /></div>
                <div className="col-md-7 d-flex flex-wrap gap-1">
                    {types.map(t => <button key={t} className={`btn btn-sm ${filter===t?"btn-success":"btn-outline-success"}`} onClick={() => setFilter(t)}>{t}</button>)}
                </div>
            </div>

            {loading ? <div className="text-center py-5"><div className="spinner-border text-success" /></div>
            : filtered.length === 0 ? (
                <div className="text-center py-5 text-muted">
                    <div style={{fontSize:"3rem"}}>🎓</div>
                    <h4>No training materials yet</h4>
                    <button className="btn btn-success" onClick={() => navigate("/training/create")}>Add First Module</button>
                </div>
            ) : (
                <div className="row g-3">
                    {filtered.map(r => (
                        <div key={r.id} className="col-md-4">
                            <div className={`card h-100 ${completed.includes(r.id)?"border-success":""}`}>
                                <div className="card-body d-flex flex-column">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span style={{fontSize:"2rem"}}>{icons[r.resource_type]||"📄"}</span>
                                        <div className="d-flex gap-1">
                                            <span className={`badge bg-${colors[r.resource_type]||"secondary"}`}>{r.resource_type}</span>
                                            {completed.includes(r.id) && <span className="badge bg-success">✓</span>}
                                        </div>
                                    </div>
                                    <h5>{r.title}</h5>
                                    <p className="small text-muted flex-grow-1" style={{display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{r.content}</p>
                                    <div className="d-flex gap-2 mt-2">
                                        <button className="btn btn-outline-primary btn-sm flex-grow-1" onClick={() => setSelected(r)}>{r.resource_type==="video"?"▶ Watch":"📖 Read"}</button>
                                        {!completed.includes(r.id) && <button className="btn btn-outline-success btn-sm" onClick={() => markComplete(r.id)}>✓</button>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selected && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h4>{icons[selected.resource_type]} {selected.title}</h4>
                                    <button className="btn-close" onClick={() => setSelected(null)} />
                                </div>
                                <div className="modal-body">
                                    {selected.resource_type==="video" && selected.link && (
                                        <div className="ratio ratio-16x9 mb-3">
                                            <iframe src={selected.link.includes("youtube.com/watch") ? selected.link.replace("watch?v=","embed/") : selected.link} allowFullScreen className="rounded" />
                                        </div>
                                    )}
                                    {selected.link && selected.resource_type!=="video" && <a href={selected.link} target="_blank" rel="noreferrer" className="btn btn-outline-primary mb-3">🔗 Open Resource</a>}
                                    <div className="p-3 bg-light rounded"><p style={{whiteSpace:"pre-wrap"}}>{selected.content}</p></div>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>
                                    {!completed.includes(selected.id) && <button className="btn btn-success" onClick={() => { markComplete(selected.id); setSelected(null); }}>✓ Mark Complete</button>}
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
EOF

cat > src/front/js/pages/Training/CreateTraining.js << 'EOF'
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const TYPES = ["video","article","module","quiz","compliance"];
const TEMPLATES = ["State Cannabis Laws","ID Verification (21+)","HIPAA & Patient Privacy","Seed-to-Sale Tracking","Cash Handling","Product Safety","Fire Safety","Workplace Harassment","Loss Prevention","Dosing Guidelines"];

const CreateTraining = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ title:"", content:"", resource_type:"video", link:"" });
    const [showTemplates, setShowTemplates] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const token = localStorage.getItem("token");

    const applyTemplate = (topic) => {
        setFormData({ title:`${topic} Training`, content:`This module covers ${topic} requirements for cannabis dispensary employees.\n\nKey Points:\n• Understanding regulations\n• Proper procedures\n• Documentation requirements\n\nAll staff must complete this before working with customers.`, resource_type:"compliance", link:"" });
        setShowTemplates(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const r = await fetch(`${process.env.BACKEND_URL}/api/training-resources`, {
            method:"POST",
            headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
            body: JSON.stringify(formData)
        });
        if (r.ok) navigate("/training");
        else { alert("Failed to create"); setSubmitting(false); }
    };

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3 mb-0">Add Training Resource</h1>
                <button className="btn btn-outline-secondary" onClick={() => navigate("/training")}>← Back</button>
            </div>

            <div className="card mb-4 border-info">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">📋 Compliance Templates</h5>
                    <button className="btn btn-sm btn-outline-info" onClick={() => setShowTemplates(!showTemplates)}>Use Template</button>
                </div>
                {showTemplates && (
                    <div className="card-body">
                        <div className="d-flex flex-wrap gap-2">
                            {TEMPLATES.map(t => <button key={t} className="btn btn-sm btn-outline-info" onClick={() => applyTemplate(t)}>{t}</button>)}
                        </div>
                    </div>
                )}
            </div>

            <div className="card">
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-8"><label className="form-label">Title *</label><input className="form-control" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required /></div>
                            <div className="col-md-4">
                                <label className="form-label">Type *</label>
                                <select className="form-select" value={formData.resource_type} onChange={e => setFormData({...formData, resource_type: e.target.value})}>
                                    {TYPES.map(t => <option key={t} value={t}>{t==="video"?"🎥 Video":t==="article"?"📄 Article":t==="module"?"📚 Module":t==="quiz"?"❓ Quiz":"📋 Compliance"}</option>)}
                                </select>
                            </div>
                            {(formData.resource_type==="video"||formData.resource_type==="article") && (
                                <div className="col-12">
                                    <label className="form-label">{formData.resource_type==="video"?"🎥 YouTube/Vimeo URL":"🔗 Article URL"}</label>
                                    <input className="form-control" placeholder={formData.resource_type==="video"?"https://youtube.com/watch?v=...":"https://..."} value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} />
                                    {formData.resource_type==="video" && <div className="form-text">YouTube URLs will embed directly in the training module</div>}
                                </div>
                            )}
                            <div className="col-12"><label className="form-label">Content / Description *</label><textarea className="form-control" rows="8" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} required /></div>
                        </div>
                        <button type="submit" className="btn btn-success w-100 mt-3" disabled={submitting}>
                            {submitting ? <span className="spinner-border spinner-border-sm me-2" /> : null}Publish Training Resource
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default CreateTraining;
EOF

# Update layout.js
python3 << 'PYEOF'
with open('src/front/js/layout.js', 'r') as f:
    content = f.read()
if 'TrainingHome' not in content:
    content = content.replace(
        'import JobApplications from "./pages/JobApplications";',
        'import JobApplications from "./pages/JobApplications";\nimport TrainingHome from "./pages/Training/TrainingHome";\nimport CreateTraining from "./pages/Training/CreateTraining";'
    )
    content = content.replace(
        '<Route path="/jobs/applications" element={<RequireAuth><JobApplications /></RequireAuth>} />',
        '<Route path="/jobs/applications" element={<RequireAuth><JobApplications /></RequireAuth>} />\n                            <Route path="/training" element={<RequireAuth><TrainingHome /></RequireAuth>} />\n                            <Route path="/training/create" element={<RequireAuth><CreateTraining /></RequireAuth>} />'
    )
    with open('src/front/js/layout.js', 'w') as f:
        f.write(content)
    print("✓ Layout updated")
PYEOF

# Update sidebar
python3 << 'PYEOF'
with open('src/front/js/component/Sidebar.js', 'r') as f:
    content = f.read()
if 'Training Center' not in content:
    content = content.replace(
        '{ name: "My Applications", path: "/jobs/applications" },',
        '{ name: "My Applications", path: "/jobs/applications" },\n        ],\n        training: [\n            { name: "Training Center", path: "/training" },\n            { name: "Add Training", path: "/training/create" },'
    )
    with open('src/front/js/component/Sidebar.js', 'w') as f:
        f.write(content)
    print("✓ Sidebar updated")
PYEOF

# Add missing routes to routes.py
python3 << 'PYEOF'
with open('src/api/routes.py', 'r') as f:
    content = f.read()
if 'my-applications' not in content:
    content += '''
@api.route('/my-applications', methods=['GET'])
@jwt_required()
@handle_errors
def get_my_applications():
    user_id = get_jwt_identity()
    apps = JobApplication.query.filter_by(user_id=user_id).all()
    result = []
    for app in apps:
        job = Job.query.get(app.job_id)
        company = Company.query.get(app.company_id) if app.company_id else None
        result.append({"id": app.id, "job_id": app.job_id, "job_title": job.title if job else "Unknown", "company_name": company.name if company else "Unknown", "location": job.location if job else "", "applied_at": app.applied_at.isoformat() if app.applied_at else None})
    return jsonify(result), 200

@api.route('/companies', methods=['GET'])
@handle_errors
def get_all_companies():
    companies = Company.query.all()
    return jsonify([c.serialize() for c in companies]), 200
'''
    with open('src/api/routes.py', 'w') as f:
        f.write(content)
    print("✓ Routes added")
PYEOF

echo "✅ Job Board + Training Platform complete"
echo "Restart backend: cd /workspaces/DispensaryMaster2 && pipenv run start"
