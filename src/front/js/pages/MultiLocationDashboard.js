import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MultiLocationDashboard = () => {
    const navigate = useNavigate();
    const [summary, setSummary] = useState([]);
    const [syncReport, setSyncReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/locations/inventory-summary`, { headers })
            .then(r => r.ok ? r.json() : [])
            .then(data => { setSummary(Array.isArray(data)?data:[]); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleSync = async () => {
        setSyncing(true);
        const r = await fetch(`${process.env.BACKEND_URL}/api/locations/sync-inventory`, { method:"POST", headers });
        if (r.ok) { const data = await r.json(); setSyncReport(data); }
        setSyncing(false);
    };

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2>🏪 Multi-Location Dashboard</h2><p>{summary.length} locations</p></div>
                <button className="btn btn-success" onClick={handleSync} disabled={syncing}>{syncing?<span className="spinner-border spinner-border-sm me-2"/>:"🔄 "}Sync All Inventory</button>
            </div>

            {syncReport && (
                <div className="alert alert-info mb-4">
                    <strong>Sync Complete:</strong> {syncReport.stores} stores · {syncReport.products} products ·
                    {syncReport.low_stock_alerts?.length>0 && <span className="text-warning ms-2">⚠️ {syncReport.low_stock_alerts.length} low stock</span>}
                    {syncReport.out_of_stock?.length>0 && <span className="text-danger ms-2">❌ {syncReport.out_of_stock.length} out of stock</span>}
                </div>
            )}

            {summary.length === 0 ? (
                <div className="glass-panel text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}>
                    <div style={{fontSize:"3rem"}}>🏪</div>
                    <h5>No locations found</h5>
                    <button className="btn btn-success mt-2" onClick={()=>navigate("/stores")}>Add Store</button>
                </div>
            ) : (
                <div className="row g-3">
                    {summary.map((store,i)=>(
                        <div key={i} className="col-md-6 col-lg-4">
                            <div className="glass-panel">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div><h5 className="mb-0">{store.name||`Store #${store.id}`}</h5><small style={{color:"rgba(255,255,255,0.5)"}}>{store.city}, {store.state}</small></div>
                                    <span className="badge bg-success">Active</span>
                                </div>
                                <div className="row g-2">
                                    {[{l:"Products",v:store.total_products,c:"#11cdef"},{l:"Low Stock",v:store.low_stock,c:"#ffd600"},{l:"Out of Stock",v:store.out_of_stock,c:"#f5365c"}].map((s,j)=>(
                                        <div key={j} className="col-4 text-center">
                                            <div style={{fontSize:"1.5rem",fontWeight:700,color:s.c}}>{s.v}</div>
                                            <div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.5)"}}>{s.l}</div>
                                        </div>
                                    ))}
                                </div>
                                <button className="btn btn-outline-light btn-sm w-100 mt-3" onClick={()=>navigate("/inventory")}>View Inventory →</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
export default MultiLocationDashboard;
