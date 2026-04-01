import React, { useState, useEffect } from "react";

const ISSUE_TYPES = ["Spider Mites","Aphids","Fungus Gnats","Powdery Mildew","Botrytis (Bud Rot)","Root Rot","Nutrient Deficiency","Nutrient Burn","Pythium","Thrips","Whiteflies","Other"];

const PestDiseaseTracker = () => {
    const [issues, setIssues] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ batch_id:"", issue_type:"", reported_date:new Date().toISOString().split("T")[0], treatment:"", status:"active" });
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        Promise.all([
            fetch(`${process.env.BACKEND_URL}/api/pest_disease`, { headers }).then(r => r.ok ? r.json() : []),
            fetch(`${process.env.BACKEND_URL}/api/plant_batches`, { headers }).then(r => r.ok ? r.json() : []),
        ]).then(([i, b]) => { setIssues(Array.isArray(i) ? i : []); setBatches(Array.isArray(b) ? b : []); setLoading(false); });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/pest_disease`, { method:"POST", headers, body: JSON.stringify(form) });
            if (r.ok) { const data = await r.json(); setIssues(i => [data, ...i]); setShowModal(false); }
        } catch(e) { console.error(e); }
        finally { setSaving(false); }
    };

    const activeIssues = issues.filter(i => i.status === "active").length;

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2 style={{ color: "#ffab00", fontWeight: 800 }}>🐛 Pest & Disease Tracker</h2><p>{activeIssues} active issues across all batches</p></div>
                <button className="btn btn-danger" onClick={() => setShowModal(true)}>+ Report Issue</button>
            </div>

            {activeIssues > 0 && (
                <div className="glass-panel mb-4" style={{borderColor:"rgba(245,54,92,0.4)",background:"rgba(245,54,92,0.08)"}}>
                    <div className="d-flex align-items-center gap-2">
                        <span style={{fontSize:"1.5rem"}}>🚨</span>
                        <span className="text-danger fw-bold">{activeIssues} active pest/disease issue{activeIssues > 1 ? "s" : ""} require attention</span>
                    </div>
                </div>
            )}

            <div className="glass-panel">
                {loading ? <div className="text-center py-4"><div className="spinner-border text-light" /></div>
                : issues.length === 0 ? (
                    <div className="text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}>
                        <div style={{fontSize:"3rem"}}>✅</div><h5>No pest or disease issues reported</h5>
                        <button className="btn btn-outline-danger mt-2" onClick={() => setShowModal(true)}>Report Issue</button>
                    </div>
                ) : (
                    <table className="table mb-0">
                        <thead><tr><th>Issue</th><th>Batch</th><th>Reported</th><th>Treatment</th><th>Status</th></tr></thead>
                        <tbody>
                            {issues.map(i => {
                                const batch = batches.find(b => b.id === i.batch_id);
                                return (
                                    <tr key={i.id}>
                                        <td><strong>{i.issue_type}</strong></td>
                                        <td>{batch?.strain || (i.batch_id ? `Batch #${i.batch_id}` : "All Batches")}</td>
                                        <td>{i.reported_date ? new Date(i.reported_date).toLocaleDateString() : "—"}</td>
                                        <td style={{fontSize:"0.85rem",color:"rgba(255,255,255,0.7)"}}>{i.treatment||"—"}</td>
                                        <td><span className={`badge ${i.status==="active"?"bg-danger":"bg-success"}`}>{i.status}</span></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header"><h5 className="modal-title">Report Pest/Disease Issue</h5><button className="btn-close" onClick={() => setShowModal(false)} /></div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Issue Type *</label>
                                        <select className="form-select" value={form.issue_type} onChange={e => setForm({...form,issue_type:e.target.value})}>
                                            <option value="">-- Select Issue --</option>
                                            {ISSUE_TYPES.map(t => <option key={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Affected Batch</label>
                                        <select className="form-select" value={form.batch_id} onChange={e => setForm({...form,batch_id:e.target.value})}>
                                            <option value="">-- All Batches / Facility --</option>
                                            {batches.map(b => <option key={b.id} value={b.id}>{b.strain}</option>)}
                                        </select>
                                    </div>
                                    <div className="mb-3"><label className="form-label">Reported Date</label><input className="form-control" type="date" value={form.reported_date} onChange={e => setForm({...form,reported_date:e.target.value})} /></div>
                                    <div className="mb-3"><label className="form-label">Treatment Applied</label><textarea className="form-control" rows="3" placeholder="Describe treatment..." value={form.treatment} onChange={e => setForm({...form,treatment:e.target.value})} /></div>
                                    <div className="mb-3">
                                        <label className="form-label">Status</label>
                                        <select className="form-select" value={form.status} onChange={e => setForm({...form,status:e.target.value})}>
                                            <option value="active">Active</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="monitoring">Monitoring</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button className="btn btn-danger" onClick={handleSave} disabled={saving}>{saving ? <span className="spinner-border spinner-border-sm" /> : "Report Issue"}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" onClick={() => setShowModal(false)} />
                </>
            )}
        </div>
    );
};
export default PestDiseaseTracker;
