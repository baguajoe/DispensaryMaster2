import React, { useState, useEffect } from "react";

const TEMP_OPTIMAL = { min:35, max:45 };
const HUMIDITY_OPTIMAL = { min:20, max:30 };

const StorageConditions = () => {
    const [batches, setBatches] = useState([]);
    const [conditions, setConditions] = useState({});
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/seed_batches/storage`, { headers })
            .then(r => r.ok ? r.json() : [])
            .then(data => { setBatches(Array.isArray(data)?data:[]); setLoading(false); })
            .catch(() => setLoading(false));
        // Initialize mock conditions per location
        const locs = {};
        ["Vault A","Vault B","Cold Storage","Room 1","Room 2","Refrigerated Unit"].forEach(loc => {
            locs[loc] = { temp: 38 + Math.random()*10, humidity: 22 + Math.random()*15 };
        });
        setConditions(locs);
    }, []);

    const locations = [...new Set(batches.map(b => b.storage_location).filter(Boolean))];

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light" /></div>;

    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2 style={{ color: "#ffab00", fontWeight: 800 }}>🌡️ Storage Conditions</h2><p>Monitor temperature and humidity for each storage location</p></div>

            <div className="glass-panel mb-4" style={{background:"rgba(17,205,239,0.08)",borderColor:"rgba(17,205,239,0.3)"}}>
                <h6 className="mb-2 text-info">Optimal Seed Storage Conditions</h6>
                <div className="d-flex gap-4">
                    <span>🌡️ Temperature: {TEMP_OPTIMAL.min}–{TEMP_OPTIMAL.max}°F</span>
                    <span>💧 Relative Humidity: {HUMIDITY_OPTIMAL.min}–{HUMIDITY_OPTIMAL.max}%</span>
                    <span>💡 Darkness: Required</span>
                    <span>📦 Airtight: Recommended</span>
                </div>
            </div>

            {locations.length === 0 ? (
                <div className="text-center py-5 glass-panel" style={{color:"rgba(255,255,255,0.5)"}}>
                    <div style={{fontSize:"3rem"}}>🌡️</div>
                    <h5>No storage locations assigned yet</h5>
                    <p>Add seed batches with storage locations to monitor conditions</p>
                </div>
            ) : (
                <div className="row g-3 mb-4">
                    {locations.map(loc => {
                        const cond = conditions[loc] || { temp:40, humidity:25 };
                        const tempOK = cond.temp >= TEMP_OPTIMAL.min && cond.temp <= TEMP_OPTIMAL.max;
                        const humOK = cond.humidity >= HUMIDITY_OPTIMAL.min && cond.humidity <= HUMIDITY_OPTIMAL.max;
                        const batchCount = batches.filter(b => b.storage_location === loc).length;
                        return (
                            <div key={loc} className="col-md-4">
                                <div className="glass-panel" style={{borderColor: tempOK && humOK ? "rgba(45,206,137,0.4)" : "rgba(245,54,92,0.4)"}}>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6 className="mb-0">{loc}</h6>
                                        <span className={`badge ${tempOK && humOK ? "bg-success" : "bg-danger"}`}>{tempOK && humOK ? "✓ Optimal" : "⚠ Alert"}</span>
                                    </div>
                                    <div className="row g-2 mb-3">
                                        <div className="col-6 text-center">
                                            <div style={{fontSize:"1.8rem",fontWeight:700,color:tempOK?"#2dce89":"#f5365c"}}>{cond.temp.toFixed(1)}°F</div>
                                            <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)"}}>Temperature</div>
                                        </div>
                                        <div className="col-6 text-center">
                                            <div style={{fontSize:"1.8rem",fontWeight:700,color:humOK?"#2dce89":"#f5365c"}}>{cond.humidity.toFixed(1)}%</div>
                                            <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)"}}>Humidity</div>
                                        </div>
                                    </div>
                                    <div style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.5)"}}>{batchCount} batch{batchCount !== 1 ? "es" : ""} stored here</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Batches table */}
            <div className="glass-panel">
                <h5 className="mb-3">Seeds by Storage Location</h5>
                <table className="table mb-0">
                    <thead><tr><th>Strain</th><th>Batch #</th><th>Qty</th><th>Location</th><th>Germ Rate</th><th>Expires</th></tr></thead>
                    <tbody>
                        {batches.map(b => (
                            <tr key={b.id}>
                                <td><strong>{b.strain}</strong></td>
                                <td style={{fontSize:"0.85rem"}}>{b.batch_number}</td>
                                <td><span className={`badge ${b.quantity<10?"bg-warning text-dark":"bg-success"}`}>{b.quantity}</span></td>
                                <td>{b.storage_location||"—"}</td>
                                <td>{b.germination_rate ? `${b.germination_rate}%` : "—"}</td>
                                <td style={{fontSize:"0.8rem"}}>{b.expiration_date ? new Date(b.expiration_date).toLocaleDateString() : "—"}</td>
                            </tr>
                        ))}
                        {batches.length === 0 && <tr><td colSpan="6" className="text-center py-4" style={{color:"rgba(255,255,255,0.5)"}}>No data</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default StorageConditions;
