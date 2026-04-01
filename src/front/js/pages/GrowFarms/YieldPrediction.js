import React, { useState, useEffect } from "react";

const YieldPrediction = () => {
    const [predictions, setPredictions] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ batch_id:"", predicted_yield:"", prediction_date:"", notes:"" });
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        Promise.all([
            fetch(`${process.env.BACKEND_URL}/api/yield_predictions`, { headers }).then(r => r.ok ? r.json() : []),
            fetch(`${process.env.BACKEND_URL}/api/plant_batches`, { headers }).then(r => r.ok ? r.json() : []),
        ]).then(([p, b]) => { setPredictions(Array.isArray(p) ? p : []); setBatches(Array.isArray(b) ? b : []); setLoading(false); });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        const r = await fetch(`${process.env.BACKEND_URL}/api/yield_predictions`, { method:"POST", headers, body: JSON.stringify(form) });
        if (r.ok) {
            const data = await r.json();
            setPredictions(p => [data, ...p]);
            setShowModal(false);
        }
        setSaving(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete?")) return;
        await fetch(`${process.env.BACKEND_URL}/api/yield_predictions/${id}`, { method:"DELETE", headers });
        setPredictions(p => p.filter(x => x.id !== id));
    };

    const totalPredicted = predictions.reduce((s, p) => s + parseFloat(p.predicted_yield||0), 0);
    const avgYield = predictions.length > 0 ? (totalPredicted / predictions.length).toFixed(2) : 0;

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2 style={{ color: "#ffab00", fontWeight: 800 }}>📊 Yield Predictions</h2><p>Forecast harvest yields per batch</p></div>
                <button className="btn btn-success" onClick={() => setShowModal(true)}>+ Add Prediction</button>
            </div>

            <div className="row g-3 mb-4">
                {[
                    { label:"Total Predictions", value:predictions.length, color:"#11cdef" },
                    { label:"Total Predicted (lbs)", value:totalPredicted.toFixed(2), color:"#2dce89" },
                    { label:"Avg Per Batch (lbs)", value:avgYield, color:"#fb6340" },
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
                : predictions.length === 0 ? (
                    <div className="text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}>
                        <div style={{fontSize:"3rem"}}>📊</div><h5>No predictions yet</h5>
                        <button className="btn btn-success mt-2" onClick={() => setShowModal(true)}>Add First Prediction</button>
                    </div>
                ) : (
                    <table className="table mb-0">
                        <thead><tr><th>Batch</th><th>Predicted Yield (lbs)</th><th>Prediction Date</th><th>Notes</th><th>Actions</th></tr></thead>
                        <tbody>
                            {predictions.map(p => (
                                <tr key={p.id}>
                                    <td>{batches.find(b => b.id === p.batch_id)?.strain || `Batch #${p.batch_id}`}</td>
                                    <td className="text-success fw-bold">{p.predicted_yield} lbs</td>
                                    <td>{p.prediction_date ? new Date(p.prediction_date).toLocaleDateString() : "—"}</td>
                                    <td style={{fontSize:"0.85rem",color:"rgba(255,255,255,0.6)"}}>{p.notes||"—"}</td>
                                    <td><button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.id)}>Del</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header"><h5 className="modal-title">Add Yield Prediction</h5><button className="btn-close" onClick={() => setShowModal(false)} /></div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Plant Batch *</label>
                                        <select className="form-select" value={form.batch_id} onChange={e => setForm({...form,batch_id:e.target.value})}>
                                            <option value="">-- Select Batch --</option>
                                            {batches.map(b => <option key={b.id} value={b.id}>{b.strain} — {b.status}</option>)}
                                        </select>
                                    </div>
                                    <div className="mb-3"><label className="form-label">Predicted Yield (lbs) *</label><input className="form-control" type="number" step="0.1" value={form.predicted_yield} onChange={e => setForm({...form,predicted_yield:e.target.value})} /></div>
                                    <div className="mb-3"><label className="form-label">Prediction Date</label><input className="form-control" type="date" value={form.prediction_date} onChange={e => setForm({...form,prediction_date:e.target.value})} /></div>
                                    <div className="mb-3"><label className="form-label">Notes</label><textarea className="form-control" rows="2" value={form.notes} onChange={e => setForm({...form,notes:e.target.value})} /></div>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button className="btn btn-success" onClick={handleSave} disabled={saving}>{saving ? <span className="spinner-border spinner-border-sm" /> : "Save"}</button>
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
export default YieldPrediction;
