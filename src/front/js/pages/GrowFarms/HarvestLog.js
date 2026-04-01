import React, { useState, useEffect } from "react";

const HarvestLog = () => {
    const [logs, setLogs] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ batch_id:"", harvest_date:new Date().toISOString().split("T")[0], wet_weight:"", dry_weight:"", notes:"" });
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        Promise.all([
            fetch(`${process.env.BACKEND_URL}/api/harvest_logs`, { headers }).then(r => r.ok ? r.json() : []),
            fetch(`${process.env.BACKEND_URL}/api/plant_batches`, { headers }).then(r => r.ok ? r.json() : []),
        ]).then(([l, b]) => { setLogs(Array.isArray(l) ? l : []); setBatches(Array.isArray(b) ? b : []); setLoading(false); });
    }, []);

    const handleSave = async () => {
        if (!form.batch_id || !form.wet_weight) return alert("Batch and wet weight required");
        setSaving(true);
        const r = await fetch(`${process.env.BACKEND_URL}/api/harvest_logs`, { method:"POST", headers, body: JSON.stringify(form) });
        if (r.ok) { const data = await r.json(); setLogs(l => [data, ...l]); setShowModal(false); }
        setSaving(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete harvest log?")) return;
        await fetch(`${process.env.BACKEND_URL}/api/harvest_logs/${id}`, { method:"DELETE", headers });
        setLogs(l => l.filter(x => x.id !== id));
    };

    const totalDryWeight = logs.reduce((s, l) => s + parseFloat(l.dry_weight||0), 0);

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2 style={{ color: "#ffab00", fontWeight: 800 }}>🌾 Harvest Log</h2><p>Track all harvested batches and weights</p></div>
                <button className="btn btn-success" onClick={() => setShowModal(true)}>+ Log Harvest</button>
            </div>

            <div className="row g-3 mb-4">
                {[
                    { label:"Total Harvests", value:logs.length, color:"#11cdef" },
                    { label:"Total Dry Weight (lbs)", value:totalDryWeight.toFixed(2), color:"#2dce89" },
                    { label:"Avg Dry Weight (lbs)", value:logs.length > 0 ? (totalDryWeight/logs.length).toFixed(2) : 0, color:"#fb6340" },
                ].map((s,i) => (
                    <div key={i} className="col-md-4">
                        <div className="glass-panel text-center">
                            <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.55)",textTransform:"uppercase"}}>{s.label}</div>
                            <div style={{fontSize:"2rem",fontWeight:700,color:s.color}}>{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass-panel">
                {loading ? <div className="text-center py-4"><div className="spinner-border text-light" /></div>
                : logs.length === 0 ? (
                    <div className="text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}>
                        <div style={{fontSize:"3rem"}}>🌾</div><h5>No harvests logged yet</h5>
                        <button className="btn btn-success mt-2" onClick={() => setShowModal(true)}>Log First Harvest</button>
                    </div>
                ) : (
                    <table className="table mb-0">
                        <thead><tr><th>Batch / Strain</th><th>Harvest Date</th><th>Wet Weight (lbs)</th><th>Dry Weight (lbs)</th><th>Loss %</th><th>Notes</th><th>Actions</th></tr></thead>
                        <tbody>
                            {logs.map(l => {
                                const loss = l.wet_weight > 0 ? ((l.wet_weight - l.dry_weight) / l.wet_weight * 100).toFixed(1) : 0;
                                const batch = batches.find(b => b.id === l.batch_id);
                                return (
                                    <tr key={l.id}>
                                        <td><strong>{batch?.strain || `Batch #${l.batch_id}`}</strong></td>
                                        <td>{l.harvest_date ? new Date(l.harvest_date).toLocaleDateString() : "—"}</td>
                                        <td>{l.wet_weight}</td>
                                        <td className="text-success">{l.dry_weight}</td>
                                        <td style={{color:"rgba(255,255,255,0.6)"}}>{loss}%</td>
                                        <td style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.5)"}}>{l.notes||"—"}</td>
                                        <td><button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(l.id)}>Del</button></td>
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
                                <div className="modal-header"><h5 className="modal-title">Log Harvest</h5><button className="btn-close" onClick={() => setShowModal(false)} /></div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Plant Batch *</label>
                                        <select className="form-select" value={form.batch_id} onChange={e => setForm({...form,batch_id:e.target.value})}>
                                            <option value="">-- Select Batch --</option>
                                            {batches.filter(b=>b.status!=="Harvested").map(b => <option key={b.id} value={b.id}>{b.strain} — {b.status}</option>)}
                                        </select>
                                    </div>
                                    <div className="mb-3"><label className="form-label">Harvest Date</label><input className="form-control" type="date" value={form.harvest_date} onChange={e => setForm({...form,harvest_date:e.target.value})} /></div>
                                    <div className="row g-2 mb-3">
                                        <div className="col-6"><label className="form-label">Wet Weight (lbs) *</label><input className="form-control" type="number" step="0.01" value={form.wet_weight} onChange={e => setForm({...form,wet_weight:e.target.value})} /></div>
                                        <div className="col-6"><label className="form-label">Dry Weight (lbs)</label><input className="form-control" type="number" step="0.01" value={form.dry_weight} onChange={e => setForm({...form,dry_weight:e.target.value})} /></div>
                                    </div>
                                    <div className="mb-3"><label className="form-label">Notes</label><textarea className="form-control" rows="2" value={form.notes} onChange={e => setForm({...form,notes:e.target.value})} /></div>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button className="btn btn-success" onClick={handleSave} disabled={saving}>{saving ? <span className="spinner-border spinner-border-sm" /> : "Log Harvest"}</button>
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
export default HarvestLog;
