import React, { useState, useContext, useEffect } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";

const JOB_TYPES = ["Full-Time","Part-Time","Contract","Seasonal","Internship"];
const JOB_CATEGORIES = ["Budtender","Manager","Delivery Driver","Security","Cultivation","Extraction","Marketing","Compliance","IT","Other"];

const PLANS = [
    {
        id: "free", name: "Free", price: "$0", period: "",
        color: "#6c757d", features: ["1 active listing","Basic placement","30 day listing","Email applications"],
        cta: "Get Started Free"
    },
    {
        id: "pro", name: "Pro", price: "$49", period: "/mo",
        color: "#ffab00", badge: "Most Popular",
        features: ["10 active listings","Featured badge","60 day listing","Applicant tracking","Email + SMS alerts","Company profile page"],
        cta: "Start Pro"
    },
    {
        id: "enterprise", name: "Enterprise", price: "$199", period: "/mo",
        color: "#198754", badge: "Best Value",
        features: ["Unlimited listings","Top search placement","90 day listing","Dedicated support","Analytics dashboard","Bulk CSV import","API access"],
        cta: "Start Enterprise"
    },
];

const JobPost = () => {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();
    const [plan, setPlan] = useState("free");
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        title:"", description:"", requirements:"",
        salary:"", location:"", company_id:"",
        job_type:"Full-Time", category:"Budtender"
    });
    const [newCompany, setNewCompany] = useState({ name:"", description:"" });
    const [creatingCompany, setCreatingCompany] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => { actions.fetchCompanies(); }, []);

    const createCompany = async () => {
        if (!newCompany.name) return;
        setCreatingCompany(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/companies`, {
                method:"POST", headers, body: JSON.stringify(newCompany)
            });
            if (r.ok) {
                const d = await r.json();
                await actions.fetchCompanies();
                setFormData({...formData, company_id: String(d.id)});
                setNewCompany({name:"", description:""});
            }
        } catch(e) { console.error(e); }
        finally { setCreatingCompany(false); }
    };

    const handleSubmit = async () => {
        if (!formData.company_id) return alert("Select or create a company first");
        setSubmitting(true);
        const result = await actions.postJob(formData.company_id, formData);
        if (result?.success) {
            setSuccess(true);
            setTimeout(() => navigate("/jobs"), 2000);
        } else {
            alert("Error posting job. Check you are logged in.");
            setSubmitting(false);
        }
    };

    const glassCard = {
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "12px",
        color: "white"
    };

    const inputStyle = {
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.2)",
        color: "white",
        borderRadius: "8px"
    };

    if (success) return (
        <div className="main-content d-flex align-items-center justify-content-center" style={{minHeight:"60vh"}}>
            <div className="text-center text-white">
                <div style={{fontSize:"4rem"}}>✅</div>
                <h2 className="mt-3">Job Posted!</h2>
                <p style={{color:"rgba(255,255,255,0.6)"}}>Your listing is now live on the Cannabis Job Board</p>
            </div>
        </div>
    );

    return (
        <div className="main-content p-4">
            <h2 className="text-white fw-semibold mb-1 text-center">Post a Cannabis Industry Job</h2>
            <p className="text-center mb-4" style={{color:"rgba(255,255,255,0.5)"}}>Reach thousands of cannabis industry professionals</p>

            {/* Step indicator */}
            <div className="d-flex gap-2 mb-4" style={{maxWidth:"700px", margin:"0 auto 1.5rem"}}>
                {["Choose Plan","Job Details","Review & Post"].map((s,i) => (
                    <div key={i} className="flex-grow-1 text-center py-2 rounded fw-semibold small"
                        style={{
                            background: step === i+1 ? "#198754" : "rgba(255,255,255,0.06)",
                            color: step === i+1 ? "white" : "rgba(255,255,255,0.4)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            cursor: step > i+1 ? "pointer" : "default"
                        }}
                        onClick={() => step > i+1 && setStep(i+1)}>
                        {i+1}. {s}
                    </div>
                ))}
            </div>

            {/* Step 1 - Plans */}
            {step === 1 && (
                <div style={{maxWidth:"900px", margin:"0 auto"}}>
                    <div className="row g-3 mb-4">
                        {PLANS.map((p) => (
                            <div key={p.id} className="col-md-4">
                                <div className="h-100 p-4 rounded-3 d-flex flex-column"
                                    style={{
                                        background: plan===p.id ? `${p.color}22` : "rgba(255,255,255,0.05)",
                                        border: plan===p.id ? `2px solid ${p.color}` : "1px solid rgba(255,255,255,0.12)",
                                        cursor:"pointer",
                                        transition:"all 0.2s",
                                        color:"white"
                                    }}
                                    onClick={() => setPlan(p.id)}>
                                    {p.badge && (
                                        <div className="mb-3">
                                            <span className="badge px-3 py-1 rounded-pill"
                                                style={{background:p.color, fontSize:"11px"}}>
                                                {p.badge}
                                            </span>
                                        </div>
                                    )}
                                    {!p.badge && <div className="mb-3" style={{height:"24px"}} />}
                                    <h4 className="fw-bold mb-1">{p.name}</h4>
                                    <div className="mb-3 d-flex align-items-baseline gap-1">
                                        <span style={{fontSize:"2.2rem", fontWeight:"700", color:p.color}}>{p.price}</span>
                                        <span style={{color:"rgba(255,255,255,0.5)", fontSize:"14px"}}>{p.period}</span>
                                    </div>
                                    <ul className="list-unstyled flex-grow-1 mb-4">
                                        {p.features.map((f,j) => (
                                            <li key={j} className="mb-2 small d-flex align-items-center gap-2">
                                                <span style={{color:p.color, fontSize:"12px"}}>✓</span>
                                                <span style={{color:"rgba(255,255,255,0.8)"}}>{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button className="btn w-100 fw-semibold"
                                        style={{
                                            background: plan===p.id ? p.color : "transparent",
                                            border: `1px solid ${p.color}`,
                                            color: plan===p.id ? "white" : p.color
                                        }}>
                                        {plan===p.id ? "✓ Selected" : p.cta}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="rounded p-3 mb-4 small text-center"
                        style={{background:"rgba(0,150,200,0.12)", border:"1px solid rgba(0,150,200,0.25)", color:"rgba(255,255,255,0.7)"}}>
                        💡 Dispensaries using Dutchie, Flowhub, or any other POS can subscribe to this job board independently.
                    </div>
                    <div className="text-center">
                        <button className="btn btn-success px-5 py-2 fw-semibold" onClick={() => setStep(2)}>
                            Continue →
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2 - Job Details */}
            {step === 2 && (
                <div style={{maxWidth:"800px", margin:"0 auto"}}>
                    {/* Company */}
                    <div className="p-4 rounded-3 mb-4" style={glassCard}>
                        <h5 className="fw-semibold mb-3">Your Dispensary / Company</h5>
                        <select className="form-select mb-3" style={inputStyle}
                            value={formData.company_id} onChange={e => setFormData({...formData, company_id:e.target.value})}>
                            <option value="" style={{background:"#0a0800"}}>-- Select your dispensary --</option>
                            {(store.companies||[]).map(c => (
                                <option key={c.id} value={c.id} style={{background:"#0a0800"}}>{c.name}</option>
                            ))}
                        </select>
                        <div className="p-3 rounded" style={{background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)"}}>
                            <p className="small mb-2" style={{color:"rgba(255,255,255,0.6)"}}>Or create a new company profile:</p>
                            <div className="row g-2">
                                <div className="col-md-5">
                                    <input className="form-control" placeholder="Dispensary name" style={inputStyle}
                                        value={newCompany.name} onChange={e => setNewCompany({...newCompany, name:e.target.value})} />
                                </div>
                                <div className="col-md-5">
                                    <input className="form-control" placeholder="Short description" style={inputStyle}
                                        value={newCompany.description} onChange={e => setNewCompany({...newCompany, description:e.target.value})} />
                                </div>
                                <div className="col-md-2">
                                    <button className="btn btn-outline-light w-100" onClick={createCompany} disabled={creatingCompany||!newCompany.name}>
                                        {creatingCompany ? "..." : "Create"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Job fields */}
                    <div className="p-4 rounded-3 mb-4" style={glassCard}>
                        <h5 className="fw-semibold mb-3">Job Details</h5>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label small" style={{color:"rgba(255,255,255,0.7)"}}>Job Title *</label>
                                <input className="form-control" placeholder="e.g. Lead Budtender" style={inputStyle}
                                    value={formData.title} onChange={e => setFormData({...formData, title:e.target.value})} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small" style={{color:"rgba(255,255,255,0.7)"}}>Category</label>
                                <select className="form-select" style={inputStyle} value={formData.category}
                                    onChange={e => setFormData({...formData, category:e.target.value})}>
                                    {JOB_CATEGORIES.map(c => <option key={c} style={{background:"#0a0800"}}>{c}</option>)}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small" style={{color:"rgba(255,255,255,0.7)"}}>Type</label>
                                <select className="form-select" style={inputStyle} value={formData.job_type}
                                    onChange={e => setFormData({...formData, job_type:e.target.value})}>
                                    {JOB_TYPES.map(t => <option key={t} style={{background:"#0a0800"}}>{t}</option>)}
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small" style={{color:"rgba(255,255,255,0.7)"}}>Location *</label>
                                <input className="form-control" placeholder="City, State" style={inputStyle}
                                    value={formData.location} onChange={e => setFormData({...formData, location:e.target.value})} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small" style={{color:"rgba(255,255,255,0.7)"}}>Salary / Pay Rate</label>
                                <input className="form-control" placeholder="e.g. $18-22/hr" style={inputStyle}
                                    value={formData.salary} onChange={e => setFormData({...formData, salary:e.target.value})} />
                            </div>
                            <div className="col-12">
                                <label className="form-label small" style={{color:"rgba(255,255,255,0.7)"}}>Job Description *</label>
                                <textarea className="form-control" rows="5" style={inputStyle}
                                    placeholder="Describe the role, responsibilities, and what a typical day looks like..."
                                    value={formData.description} onChange={e => setFormData({...formData, description:e.target.value})} />
                            </div>
                            <div className="col-12">
                                <label className="form-label small" style={{color:"rgba(255,255,255,0.7)"}}>Requirements</label>
                                <textarea className="form-control" rows="3" style={inputStyle}
                                    placeholder="State cannabis card required, experience needed, etc..."
                                    value={formData.requirements} onChange={e => setFormData({...formData, requirements:e.target.value})} />
                            </div>
                        </div>
                    </div>
                    <div className="d-flex gap-2">
                        <button className="btn btn-outline-light" onClick={() => setStep(1)}>← Back</button>
                        <button className="btn btn-success flex-grow-1 fw-semibold" onClick={() => setStep(3)}
                            disabled={!formData.title||!formData.location||!formData.description||!formData.company_id}>
                            Preview Listing →
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3 - Review */}
            {step === 3 && (
                <div style={{maxWidth:"800px", margin:"0 auto"}}>
                    <div className="p-4 rounded-3 mb-3" style={glassCard}>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <h4 className="fw-bold text-white mb-0">{formData.title}</h4>
                            <span className="badge bg-success">{formData.job_type}</span>
                        </div>
                        <p style={{color:"rgba(255,255,255,0.6)"}} className="mb-3">
                            📍 {formData.location}
                            {formData.salary && ` · 💰 ${formData.salary}`}
                            {` · ${formData.category}`}
                        </p>
                        <p style={{color:"rgba(255,255,255,0.8)", whiteSpace:"pre-wrap"}}>{formData.description}</p>
                        {formData.requirements && (
                            <>
                                <h6 className="text-white mt-3">Requirements</h6>
                                <p style={{color:"rgba(255,255,255,0.8)", whiteSpace:"pre-wrap"}}>{formData.requirements}</p>
                            </>
                        )}
                    </div>
                    <div className="p-3 rounded mb-4 small"
                        style={{background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.7)"}}>
                        Plan: <strong className="text-white text-capitalize">{plan}</strong> —
                        {plan==="free" ? " Free listing, 30 days" : plan==="pro" ? " $49/mo, featured badge, 60 days" : " $199/mo, unlimited, priority placement"}
                    </div>
                    <div className="d-flex gap-2">
                        <button className="btn btn-outline-light" onClick={() => setStep(2)}>← Edit</button>
                        <button className="btn btn-success flex-grow-1 py-2 fw-semibold" onClick={handleSubmit} disabled={submitting}>
                            {submitting ? <><span className="spinner-border spinner-border-sm me-2" />Posting...</> :
                                plan==="free" ? "Publish Free Listing" : `Subscribe & Publish — ${plan==="pro"?"$49":"$199"}/mo`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
export default JobPost;
