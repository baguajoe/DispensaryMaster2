import React, { useState } from "react";
import "../../../styles/training.css";
import { useNavigate } from "react-router-dom";

const TYPES = [
    { value:"video", label:"Video", icon:"▶", desc:"MP4, MOV, WebM" },
    { value:"article", label:"Document", icon:"📄", desc:"PDF, DOC" },
    { value:"module", label:"Module", icon:"📚", desc:"Text-based" },
    { value:"compliance", label:"Compliance", icon:"✓", desc:"Required" },
    { value:"quiz", label:"Quiz", icon:"?", desc:"Knowledge check" },
];

const CATEGORIES = ["Compliance","Product Knowledge","Customer Service","Safety","Cash Handling","ID Verification","Seed-to-Sale","HR & Workplace","Operations","State Law"];

const TEMPLATES = [
    { topic:"ID Verification (21+)", category:"Compliance", content:"All staff must verify customer age before any transaction.\n\nRequirements:\n• Check government-issued photo ID\n• Customer must be 21 or older\n• Valid IDs: Driver License, Passport, Military ID, State ID\n• Expired IDs are NOT acceptable\n\nProcedure:\n1. Ask for ID before discussing products\n2. Check expiration date\n3. Verify date of birth confirms 21+\n4. Compare photo to customer\n5. Log all refusals in the daily log\n\nFailure to verify age can result in license suspension." },
    { topic:"Cash Handling", category:"Operations", content:"Proper cash handling protects you and the dispensary.\n\nOpening:\n• Count drawer with manager present\n• Document starting amount\n• Report discrepancies immediately\n\nDuring shift:\n• Count back change to customer\n• Never leave drawer open\n• Verify large bills\n\nClosing:\n• Count drawer with manager\n• Complete reconciliation form\n• Discrepancies over $5 require incident report" },
    { topic:"State Cannabis Regulations", category:"Compliance", content:"Key regulations all staff must follow:\n\n• Purchase limits: 1 oz flower or equivalent per transaction\n• No sales to visibly intoxicated customers\n• All products must have state-required labels\n• Seed-to-sale tracking is mandatory\n• No product leaves without a receipt\n• Surveillance cameras must be operational at all times\n\nViolations can result in fines, license suspension, or criminal charges." },
    { topic:"Product Safety & Storage", category:"Safety", content:"Storage requirements:\n• Temperature: 60-70°F for flower\n• Humidity: 55-62% RH for flower\n• Edibles: refrigerate if label requires\n• Concentrates: cool, dark, airtight containers\n\nHandling:\n• Wear gloves when handling product\n• Label all containers with product name and batch number\n• Pull recalled product immediately and notify manager" },
];

const CreateTraining = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ title:"", content:"", resource_type:"video", category:"", is_required:false });
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedUrl, setUploadedUrl] = useState("");
    const [showTemplates, setShowTemplates] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const token = localStorage.getItem("token");

    const applyTemplate = (t) => {
        setFormData({ ...formData, title:`${t.topic} Training`, content:t.content, resource_type:"compliance", category:t.category, is_required:true });
        setShowTemplates(false);
    };

    const handleFile = (f) => {
        if (!f) return;
        setFile(f);
        setUploadedUrl("");
        setUploadProgress(0);
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setUploadProgress(20);
        const data = new FormData();
        data.append("file", file);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/training/upload-video`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: data
            });
            setUploadProgress(90);
            if (r.ok) {
                const result = await r.json();
                setUploadedUrl(result.url);
                setFormData(f => ({ ...f, link: result.url }));
                setUploadProgress(100);
            } else {
                alert("Upload failed — check file type and size");
            }
        } catch(e) { alert("Upload error: " + e.message); }
        finally { setUploading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/training-resources`, {
                method: "POST",
                headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
                body: JSON.stringify({ ...formData, link: uploadedUrl || formData.link })
            });
            if (r.ok) navigate("/training");
            else { alert("Failed to save"); setSubmitting(false); }
        } catch(e) { console.error(e); setSubmitting(false); }
    };

    const needsUpload = formData.resource_type === "video" || formData.resource_type === "article";

    return (
        <div className="main-content p-0 training-form">
            {/* Top bar */}
            <div className="d-flex justify-content-between align-items-center px-4 py-3 training-top-bar">
                <div>
                    <h4 className="mb-0 fw-semibold">Add Training Resource</h4>
                    <small className="text-muted">🔒 Private to your dispensary only</small>
                </div>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate("/training")}>← Back</button>
            </div>

            <div className="p-4" style={{maxWidth:"860px", margin:"0 auto"}}>

                {/* Compliance Templates */}
                <div className="card border mb-4">
                    <div className="card-header bg-white d-flex justify-content-between align-items-center py-2">
                        <span className="fw-semibold small">📋 Compliance Training Templates</span>
                        <button className="btn btn-sm btn-outline-primary py-0" onClick={() => setShowTemplates(!showTemplates)}>
                            {showTemplates ? "Hide" : "Use Template"}
                        </button>
                    </div>
                    {showTemplates && (
                        <div className="card-body pt-3">
                            <p className="text-muted small mb-3">Click a topic to pre-fill the form with required compliance training content:</p>
                            <div className="row g-2">
                                {TEMPLATES.map((t,i) => (
                                    <div key={i} className="col-6 col-md-3">
                                        <div className="border rounded p-3 text-center h-100"
                                            style={{cursor:"pointer", transition:"background 0.15s"}}
                                            onMouseEnter={e => e.currentTarget.style.background="#f0f7ff"}
                                            onMouseLeave={e => e.currentTarget.style.background=""}
                                            onClick={() => applyTemplate(t)}>
                                            <div className="mb-1" style={{fontSize:"1.4rem"}}>📋</div>
                                            <div className="small fw-semibold mb-1">{t.topic}</div>
                                            <span className="badge bg-danger" style={{fontSize:"10px"}}>Required</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Content Type */}
                    <div className="mb-4">
                        <label className="form-label fw-semibold small text-uppercase text-muted ls-1">Content Type</label>
                        <div className="d-flex gap-2 flex-wrap">
                            {TYPES.map(t => (
                                <button key={t.value} type="button"
                                    className={`btn btn-sm ${formData.resource_type===t.value?"btn-dark":"btn-outline-secondary"}`}
                                    onClick={() => setFormData({...formData, resource_type:t.value})}>
                                    {t.label}
                                    <span className="d-none d-md-inline text-muted ms-1" style={{fontSize:"11px"}}>— {t.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Title + Category */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-8">
                            <label className="form-label fw-semibold small">Title <span className="text-danger">*</span></label>
                            <input className="form-control" placeholder="e.g. ID Verification Training"
                                value={formData.title} onChange={e => setFormData({...formData, title:e.target.value})} required />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-semibold small">Category</label>
                            <select className="form-select" value={formData.category} onChange={e => setFormData({...formData, category:e.target.value})}>
                                <option value="">Select category...</option>
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* File Upload */}
                    {needsUpload && (
                        <div className="mb-4">
                            <label className="form-label fw-semibold small">
                                {formData.resource_type === "video" ? "Video File" : "Document File"}
                                <span className="text-muted fw-normal ms-2">
                                    {formData.resource_type === "video" ? "MP4, MOV, WebM — max 500MB" : "PDF, DOC, DOCX"}
                                </span>
                            </label>

                            {uploadedUrl ? (
                                <div className="border rounded p-3 d-flex justify-content-between align-items-center bg-light">
                                    <div>
                                        <span className="text-success fw-semibold me-2">✓ Uploaded</span>
                                        <span className="text-muted small">{file?.name}</span>
                                    </div>
                                    <button type="button" className="btn btn-sm btn-outline-secondary"
                                        onClick={() => { setUploadedUrl(""); setFile(null); setUploadProgress(0); }}>
                                        Change file
                                    </button>
                                </div>
                            ) : (
                                <div
                                    className={`upload-zone rounded p-4 text-center ${dragOver ? "drag-over" : ""}`}
                                    className="upload-zone rounded" style={{cursor:"pointer"}}
                                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                                    onClick={() => document.getElementById("fileInput").click()}>
                                    <input type="file" id="fileInput" className="d-none"
                                        accept={formData.resource_type === "video" ? "video/*" : ".pdf,.doc,.docx"}
                                        onChange={e => handleFile(e.target.files[0])} />
                                    <div className="mb-2 text-muted" style={{fontSize:"2rem"}}>⬆</div>
                                    {file ? (
                                        <div>
                                            <p className="mb-1 fw-semibold">{file.name}</p>
                                            <p className="text-muted small mb-3">{(file.size/1024/1024).toFixed(1)} MB</p>
                                            {uploading ? (
                                                <div>
                                                    <div className="progress mb-2" style={{height:"6px"}}>
                                                        <div className="progress-bar bg-success progress-bar-striped progress-bar-animated"
                                                            style={{width:`${uploadProgress}%`}} />
                                                    </div>
                                                    <small className="text-muted">Uploading to secure storage...</small>
                                                </div>
                                            ) : (
                                                <button type="button" className="btn btn-primary btn-sm px-4" onClick={handleUpload}>
                                                    Upload File
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="mb-1 fw-semibold">Drag & drop or click to select</p>
                                            <p className="text-muted small mb-0">Files are stored securely — only your staff can access them</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Content */}
                    <div className="mb-4">
                        <label className="form-label fw-semibold small">Content / Description <span className="text-danger">*</span></label>
                        <textarea className="form-control" rows="7"
                            placeholder="Training content, key points, procedures, or a description of what this module covers..."
                            value={formData.content} onChange={e => setFormData({...formData, content:e.target.value})} required />
                    </div>

                    {/* Required toggle */}
                    <div className="form-check mb-4 p-3 border rounded bg-light">
                        <input className="form-check-input" type="checkbox" id="isRequired"
                            checked={formData.is_required} onChange={e => setFormData({...formData, is_required:e.target.checked})} />
                        <label className="form-check-label fw-semibold" htmlFor="isRequired">
                            Mark as Required Training
                        </label>
                        <div className="text-muted small mt-1">Staff must complete this before starting work. Shows with a red Required banner.</div>
                    </div>

                    <button type="submit" className="btn btn-success w-100 py-2 fw-semibold"
                        disabled={submitting || (needsUpload && !uploadedUrl)}>
                        {submitting ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : "Publish Training Resource"}
                    </button>
                </form>
            </div>
        </div>
    );
};
export default CreateTraining;
