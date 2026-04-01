import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ROLES = ["Budtender","Store Manager","Assistant Manager","Delivery Driver","Extraction Tech","Cultivation Tech","Compliance Officer","Security","Receptionist","Inventory Manager"];
const SKILLS = ["Customer Service","POS Systems","Inventory Management","Cannabis Knowledge","Compliance","Cash Handling","Team Leadership","Seed-to-Sale","Metrc","COVA"];
const CERTS = ["MA Cannabis Handler Permit","CA Responsible Vendor","CO MED Badge","OSHA Safety","Food Handler Card","ServSafe","Responsible Vendor Training"];

const ResumeBuilder = () => {
    const navigate = useNavigate();
    const [resume, setResume] = useState({
        full_name:"", email:"", phone:"", location:"", summary:"",
        experience_years:0, cannabis_experience:false, desired_role:"",
        desired_salary:"", linkedin_url:"", certifications:[], skills:[], is_visible:true
    });
    const [file, setFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/resumes/me`, { headers })
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data) setResume(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const toggleItem = (field, item) => {
        const current = resume[field] || [];
        setResume({...resume, [field]: current.includes(item) ? current.filter(i=>i!==item) : [...current, item]});
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/resumes`, { method:"POST", headers, body:JSON.stringify(resume) });
            if (r.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
        } catch(e) { console.error(e); } finally { setSaving(false); }
    };

    const handleFileUpload = async () => {
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const r = await fetch(`${process.env.BACKEND_URL}/api/resumes/upload`, {
                method:"POST", headers:{ Authorization:`Bearer ${token}` }, body:formData
            });
            if (r.ok) { const data = await r.json(); setResume({...resume, resume_url:data.resume_url}); }
        } catch(e) { console.error(e); } finally { setUploading(false); }
    };

    const u = (field, value) => setResume({...resume, [field]:value});

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2 style={{ color: "#ffab00", fontWeight: 800 }}>📄 My Resume</h2><p>Build your cannabis industry profile</p></div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-light" onClick={() => navigate("/job-board")}>Browse Jobs</button>
                    <button className="btn btn-success" onClick={handleSave} disabled={saving}>
                        {saving ? <span className="spinner-border spinner-border-sm"/> : saved ? "✓ Saved!" : "Save Resume"}
                    </button>
                </div>
            </div>

            <div className="row g-4">
                {/* Personal Info */}
                <div className="col-md-6">
                    <div className="glass-panel">
                        <h5 className="mb-3">Personal Information</h5>
                        <div className="row g-3">
                            <div className="col-12"><label className="form-label">Full Name *</label><input className="form-control" value={resume.full_name} onChange={e=>u("full_name",e.target.value)} /></div>
                            <div className="col-6"><label className="form-label">Email *</label><input className="form-control" type="email" value={resume.email} onChange={e=>u("email",e.target.value)} /></div>
                            <div className="col-6"><label className="form-label">Phone</label><input className="form-control" value={resume.phone} onChange={e=>u("phone",e.target.value)} /></div>
                            <div className="col-6"><label className="form-label">Location</label><input className="form-control" placeholder="Boston, MA" value={resume.location} onChange={e=>u("location",e.target.value)} /></div>
                            <div className="col-6"><label className="form-label">LinkedIn</label><input className="form-control" placeholder="linkedin.com/in/..." value={resume.linkedin_url} onChange={e=>u("linkedin_url",e.target.value)} /></div>
                            <div className="col-12"><label className="form-label">Professional Summary</label><textarea className="form-control" rows="3" value={resume.summary} onChange={e=>u("summary",e.target.value)} placeholder="Brief overview of your experience..." /></div>
                        </div>
                    </div>
                </div>

                {/* Job Preferences */}
                <div className="col-md-6">
                    <div className="glass-panel">
                        <h5 className="mb-3">Job Preferences</h5>
                        <div className="row g-3">
                            <div className="col-12">
                                <label className="form-label">Desired Role</label>
                                <select className="form-select" value={resume.desired_role} onChange={e=>u("desired_role",e.target.value)}>
                                    <option value="">Select role...</option>
                                    {ROLES.map(r=><option key={r}>{r}</option>)}
                                </select>
                            </div>
                            <div className="col-6"><label className="form-label">Years Experience</label><input className="form-control" type="number" min="0" value={resume.experience_years} onChange={e=>u("experience_years",parseInt(e.target.value))} /></div>
                            <div className="col-6"><label className="form-label">Desired Salary</label><input className="form-control" placeholder="$18/hr or $45,000/yr" value={resume.desired_salary} onChange={e=>u("desired_salary",e.target.value)} /></div>
                            <div className="col-12">
                                <div className="form-check form-switch">
                                    <input className="form-check-input" type="checkbox" checked={resume.cannabis_experience} onChange={e=>u("cannabis_experience",e.target.checked)} />
                                    <label className="form-check-label">I have cannabis industry experience</label>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="form-check form-switch">
                                    <input className="form-check-input" type="checkbox" checked={resume.is_visible} onChange={e=>u("is_visible",e.target.checked)} />
                                    <label className="form-check-label">Visible to dispensaries searching resumes</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Upload Resume File */}
                    <div className="glass-panel mt-3">
                        <h5 className="mb-3">Upload Resume File</h5>
                        {resume.resume_url && <div className="mb-2"><a href={resume.resume_url} target="_blank" rel="noreferrer" className="btn btn-outline-info btn-sm">📄 View Current Resume</a></div>}
                        <input className="form-control mb-2" type="file" accept=".pdf,.doc,.docx" onChange={e=>setFile(e.target.files[0])} />
                        <button className="btn btn-outline-light btn-sm w-100" onClick={handleFileUpload} disabled={!file||uploading}>
                            {uploading ? <span className="spinner-border spinner-border-sm"/> : "Upload PDF/DOC"}
                        </button>
                    </div>
                </div>

                {/* Skills */}
                <div className="col-md-6">
                    <div className="glass-panel">
                        <h5 className="mb-3">Skills</h5>
                        <div className="d-flex flex-wrap gap-2">
                            {SKILLS.map(s => (
                                <span key={s} className={`badge ${(resume.skills||[]).includes(s)?"bg-success":"bg-secondary"}`}
                                    style={{cursor:"pointer",fontSize:"0.85rem",padding:"8px 12px"}}
                                    onClick={() => toggleItem("skills", s)}>{s}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Certifications */}
                <div className="col-md-6">
                    <div className="glass-panel">
                        <h5 className="mb-3">Certifications</h5>
                        <div className="d-flex flex-wrap gap-2">
                            {CERTS.map(c => (
                                <span key={c} className={`badge ${(resume.certifications||[]).includes(c)?"bg-success":"bg-secondary"}`}
                                    style={{cursor:"pointer",fontSize:"0.85rem",padding:"8px 12px"}}
                                    onClick={() => toggleItem("certifications", c)}>{c}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ResumeBuilder;
