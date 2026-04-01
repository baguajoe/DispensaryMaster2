import React, { useState, useEffect } from "react";

const STATE_REQUIREMENTS = {
    MA: ["Cannabis Control Commission License", "CORI Background Check", "Metrc Registration", "Municipal License", "Certificate of Occupancy", "Annual Inspection Report"],
    CA: ["DCC License", "Local Permit", "Live Scan Background Check", "Metrc Registration", "Annual Renewal", "Lab Test Results"],
    CO: ["MED License", "Local License", "Background Check", "Metrc Registration", "Annual Report", "Inventory Audit"],
    IL: ["IDFPR License", "Local Authorization", "Background Investigation", "BioTrack Registration", "Annual Renewal"],
    NY: ["OCM License", "Local Authorization", "Background Check", "Metrc Registration", "Annual Compliance Report"],
    DEFAULT: ["State Cannabis License", "Local Business Permit", "Background Check", "Seed-to-Sale Registration", "Annual Renewal", "Compliance Report"]
};

const ComplianceMonitoringPage = () => {
    const [alerts, setAlerts] = useState([]);
    const [licenses, setLicenses] = useState([]);
    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [state, setState] = useState("MA");
    const [showLicenseForm, setShowLicenseForm] = useState(false);
    const [showAuditForm, setShowAuditForm] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [licenseForm, setLicenseForm] = useState({ license_type:"", license_number:"", expiry_date:"", status:"active", notes:"" });
    const [auditForm, setAuditForm] = useState({ audit_type:"internal", audit_date:"", findings:"", status:"pending" });
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    const load = () => {
        Promise.all([
            fetch(`${process.env.BACKEND_URL}/api/compliance/alerts`, { headers }).then(r => r.ok ? r.json() : []),
            fetch(`${process.env.BACKEND_URL}/api/compliance/licenses`, { headers }).then(r => r.ok ? r.json() : []),
            fetch(`${process.env.BACKEND_URL}/api/compliance/audit-reports`, { headers }).then(r => r.ok ? r.json() : []),
        ]).then(([a, l, au]) => {
            setAlerts(Array.isArray(a) ? a : []);
            setLicenses(Array.isArray(l) ? l : []);
            setAudits(Array.isArray(au) ? au : []);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleLicenseSubmit = async (e) => {
        e.preventDefault();
        await fetch(`${process.env.BACKEND_URL}/api/compliance/licenses`, { method:"POST", headers, body:JSON.stringify(licenseForm) });
        load(); setShowLicenseForm(false);
    };

    const handleAuditSubmit = async (e) => {
        e.preventDefault();
        await fetch(`${process.env.BACKEND_URL}/api/compliance/audit-reports`, { method:"POST", headers, body:JSON.stringify(auditForm) });
        load(); setShowAuditForm(false);
    };

    const handleDocUpload = async (file, docType) => {
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('doc_type', docType);
            await fetch(`${process.env.BACKEND_URL}/api/compliance/upload-document`, {
                method:"POST", headers:{ Authorization:`Bearer ${token}` }, body:formData
            });
            alert(`${docType} uploaded successfully`);
        } catch(e) { console.error(e); }
        finally { setUploading(false); }
    };

    const requirements = STATE_REQUIREMENTS[state] || STATE_REQUIREMENTS.DEFAULT;
    const completedReqs = requirements.filter(req => licenses.some(l => l.type?.includes(req.split(" ")[0]) || l.license_type?.includes(req.split(" ")[0])));

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;

    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2 style={{ color: "#ffab00", fontWeight: 800 }}>⚖️ Compliance Monitoring</h2><p>License tracking, audits, and document management</p></div>

            {/* State selector */}
            <div className="glass-panel mb-4">
                <div className="d-flex align-items-center gap-3">
                    <label className="form-label mb-0 fw-bold">Your State:</label>
                    <select className="form-select" style={{maxWidth:"200px"}} value={state} onChange={e=>setState(e.target.value)}>
                        {["MA","CA","CO","IL","NY","NV","OR","WA","AZ","MI","PA","NJ","CT","RI","VT","ME","MN"].map(s=><option key={s}>{s}</option>)}
                        <option value="DEFAULT">Other</option>
                    </select>
                    <div className="ms-auto">
                        <span style={{fontSize:"0.9rem",color:"rgba(255,255,255,0.6)"}}>Compliance Score: </span>
                        <span style={{fontWeight:800,fontSize:"1.2rem",color:completedReqs.length/requirements.length > 0.7 ? "#2dce89" : "#ffd600"}}>
                            {Math.round((completedReqs.length/requirements.length)*100)}%
                        </span>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* State Requirements Checklist */}
                <div className="col-md-4">
                    <div className="glass-panel">
                        <h5 className="mb-3">📋 {state} Requirements</h5>
                        {requirements.map((req, i) => {
                            const done = completedReqs.includes(req);
                            return (
                                <div key={i} className="d-flex align-items-center gap-2 mb-2 p-2 rounded" style={{background:"rgba(255,255,255,0.04)"}}>
                                    <span style={{color:done?"#2dce89":"rgba(255,255,255,0.3)",fontSize:"1.1rem"}}>{done?"✓":"○"}</span>
                                    <span style={{fontSize:"0.85rem",color:done?"white":"rgba(255,255,255,0.5)"}}>{req}</span>
                                </div>
                            );
                        })}
                        <div className="mt-3">
                            <div className="progress" style={{height:"8px",background:"rgba(255,255,255,0.1)"}}>
                                <div className="progress-bar bg-success" style={{width:`${(completedReqs.length/requirements.length)*100}%`}}/>
                            </div>
                            <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)",marginTop:"4px"}}>{completedReqs.length}/{requirements.length} complete</div>
                        </div>
                    </div>
                </div>

                {/* Licenses */}
                <div className="col-md-4">
                    <div className="glass-panel">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">📜 Licenses</h5>
                            <button className="btn btn-success btn-sm" onClick={()=>setShowLicenseForm(!showLicenseForm)}>+ Add</button>
                        </div>

                        {showLicenseForm && (
                            <form onSubmit={handleLicenseSubmit} className="mb-3 p-3 rounded" style={{background:"rgba(255,255,255,0.06)"}}>
                                <div className="mb-2"><input className="form-control form-control-sm" placeholder="License Type" value={licenseForm.license_type} onChange={e=>setLicenseForm({...licenseForm,license_type:e.target.value})} /></div>
                                <div className="mb-2"><input className="form-control form-control-sm" placeholder="License Number" value={licenseForm.license_number} onChange={e=>setLicenseForm({...licenseForm,license_number:e.target.value})} /></div>
                                <div className="mb-2"><input className="form-control form-control-sm" type="date" placeholder="Expiry Date" value={licenseForm.expiry_date} onChange={e=>setLicenseForm({...licenseForm,expiry_date:e.target.value})} /></div>
                                <div className="mb-2">
                                    <label className="form-label" style={{fontSize:"0.75rem"}}>Upload License Document</label>
                                    <input className="form-control form-control-sm" type="file" accept=".pdf,.jpg,.png" onChange={e=>handleDocUpload(e.target.files[0], licenseForm.license_type)} />
                                </div>
                                <button type="submit" className="btn btn-success btn-sm w-100">Save License</button>
                            </form>
                        )}

                        {licenses.length === 0 ? <p style={{color:"rgba(255,255,255,0.5)",fontSize:"0.85rem"}}>No licenses added yet</p>
                        : licenses.map((l,i) => {
                            const expiry = l.expiry || l.expiry_date;
                            const daysLeft = expiry ? Math.floor((new Date(expiry)-new Date())/86400000) : null;
                            return (
                                <div key={i} className="mb-2 p-2 rounded" style={{background:"rgba(255,255,255,0.06)"}}>
                                    <div style={{fontWeight:600,fontSize:"0.85rem"}}>{l.type || l.license_type}</div>
                                    <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)",fontFamily:"monospace"}}>{l.number || l.license_number}</div>
                                    {daysLeft !== null && <div style={{fontSize:"0.7rem",color:daysLeft<30?"#ffd600":"#2dce89"}}>Expires: {expiry} {daysLeft<30?`(${daysLeft}d left)`:""}</div>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Audit Reports */}
                <div className="col-md-4">
                    <div className="glass-panel">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">🔍 Audit Reports</h5>
                            <button className="btn btn-success btn-sm" onClick={()=>setShowAuditForm(!showAuditForm)}>+ Add</button>
                        </div>

                        {showAuditForm && (
                            <form onSubmit={handleAuditSubmit} className="mb-3 p-3 rounded" style={{background:"rgba(255,255,255,0.06)"}}>
                                <div className="mb-2">
                                    <select className="form-select form-select-sm" value={auditForm.audit_type} onChange={e=>setAuditForm({...auditForm,audit_type:e.target.value})}>
                                        <option value="internal">Internal Audit</option>
                                        <option value="state">State Inspection</option>
                                        <option value="metrc">Metrc Audit</option>
                                        <option value="financial">Financial Audit</option>
                                    </select>
                                </div>
                                <div className="mb-2"><input className="form-control form-control-sm" type="date" value={auditForm.audit_date} onChange={e=>setAuditForm({...auditForm,audit_date:e.target.value})} /></div>
                                <div className="mb-2"><textarea className="form-control form-control-sm" rows="2" placeholder="Findings..." value={auditForm.findings} onChange={e=>setAuditForm({...auditForm,findings:e.target.value})} /></div>
                                <div className="mb-2">
                                    <label className="form-label" style={{fontSize:"0.75rem"}}>Upload Audit Document</label>
                                    <input className="form-control form-control-sm" type="file" accept=".pdf" onChange={e=>handleDocUpload(e.target.files[0], "audit_report")} />
                                </div>
                                <button type="submit" className="btn btn-success btn-sm w-100">Save Audit</button>
                            </form>
                        )}

                        {audits.length === 0 ? <p style={{color:"rgba(255,255,255,0.5)",fontSize:"0.85rem"}}>No audits recorded yet</p>
                        : audits.map((a,i) => (
                            <div key={i} className="mb-2 p-2 rounded" style={{background:"rgba(255,255,255,0.06)"}}>
                                <div className="d-flex justify-content-between">
                                    <span style={{fontWeight:600,fontSize:"0.85rem",textTransform:"capitalize"}}>{a.type || a.audit_type} Audit</span>
                                    <span className={`badge bg-${a.status==="completed"?"success":a.status==="pending"?"warning text-dark":"secondary"}`}>{a.status}</span>
                                </div>
                                <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>{a.date || a.audit_date}</div>
                                {a.findings && <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.6)",marginTop:"4px"}}>{a.findings.slice(0,80)}{a.findings.length>80?"...":""}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
                <div className="glass-panel mt-4">
                    <h5 className="mb-3">🚨 Compliance Alerts</h5>
                    {alerts.map((a,i) => (
                        <div key={i} className="alert alert-warning py-2 mb-2">
                            <strong>{a.type || "Alert"}:</strong> {a.message}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
export default ComplianceMonitoringPage;
