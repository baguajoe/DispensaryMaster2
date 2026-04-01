import React, { useState, useEffect } from "react";

const MetrcIntegration = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState(null);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/metrc/status`, { headers })
            .then(r => r.ok ? r.json() : null)
            .then(data => { setStatus(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleSync = async (type) => {
        setSyncing(true);
        setSyncResult(null);
        try {
            const endpoint = type === 'inventory' ? '/api/metrc/sync-inventory' : '/api/metrc/sync-sale';
            const r = await fetch(`${process.env.BACKEND_URL}${endpoint}`, { method:"POST", headers, body:JSON.stringify({}) });
            const data = await r.json();
            setSyncResult({ success: r.ok, data, type });
        } catch(e) { setSyncResult({ success:false, error:e.message }); }
        finally { setSyncing(false); }
    };

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;

    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2 style={{ color: "#ffab00", fontWeight: 800 }}>🌿 Metrc Integration</h2><p>State-required seed-to-sale tracking</p></div>

            {!status?.configured && (
                <div className="alert alert-warning mb-4">
                    <strong>Metrc not configured.</strong> Add your METRC_API_KEY to the .env file. Most states legally require Metrc integration. <a href="https://metrc.com" target="_blank" rel="noreferrer" className="alert-link">Get your API key at metrc.com →</a>
                </div>
            )}

            <div className="row g-3 mb-4">
                {[
                    {l:"Status",v:status?.configured?"Connected":"Not Configured",c:status?.configured?"#2dce89":"#f5365c"},
                    {l:"Total Synced",v:status?.total_synced||0,c:"#2dce89"},
                    {l:"Failed Syncs",v:status?.total_failed||0,c:"#f5365c"},
                    {l:"Last Sync",v:status?.recent_syncs?.[0]?.synced_at?new Date(status.recent_syncs[0].synced_at).toLocaleDateString():"Never",c:"#11cdef"},
                ].map((s,i)=>(
                    <div key={i} className="col-6 col-md-3"><div className="glass-panel text-center">
                        <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>{s.l}</div>
                        <div style={{fontSize:i===0?"1rem":"1.8rem",fontWeight:700,color:s.c,marginTop:"4px"}}>{s.v}</div>
                    </div></div>
                ))}
            </div>

            <div className="row g-3">
                <div className="col-md-6">
                    <div className="glass-panel">
                        <h5 className="mb-3">Sync Actions</h5>
                        <div className="d-grid gap-3">
                            <button className="btn btn-success py-3" onClick={()=>handleSync('inventory')} disabled={syncing||!status?.configured}>
                                {syncing?<span className="spinner-border spinner-border-sm me-2"/>:"📦 "}
                                Sync Inventory to Metrc
                            </button>
                            <button className="btn btn-outline-success py-3" onClick={()=>handleSync('sales')} disabled={syncing||!status?.configured}>
                                {syncing?<span className="spinner-border spinner-border-sm me-2"/>:"💰 "}
                                Sync Sales to Metrc
                            </button>
                        </div>
                        {syncResult && (
                            <div className={`alert ${syncResult.success?"alert-success":"alert-danger"} mt-3`}>
                                {syncResult.success ? `✓ Synced ${syncResult.data?.synced||0} records. ${syncResult.data?.errors?.length||0} errors.` : `Failed: ${syncResult.error || "Check Metrc API key"}`}
                            </div>
                        )}
                        <hr style={{borderColor:"rgba(255,255,255,0.1)"}}/>
                        <h6>What Gets Synced</h6>
                        <ul className="list-unstyled" style={{fontSize:"0.85rem",color:"rgba(255,255,255,0.7)"}}>
                            <li>✓ Product inventory levels</li>
                            <li>✓ Batch/package numbers</li>
                            <li>✓ Sales transactions</li>
                            <li>✓ Customer purchase records</li>
                        </ul>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="glass-panel">
                        <h5 className="mb-3">Recent Sync History</h5>
                        {(status?.recent_syncs||[]).length===0 ? <p style={{color:"rgba(255,255,255,0.5)"}}>No syncs yet</p>
                        : (status?.recent_syncs||[]).map((s,i)=>(
                            <div key={i} className="mb-2 p-2 rounded d-flex justify-content-between" style={{background:"rgba(255,255,255,0.06)"}}>
                                <div>
                                    <span className="badge bg-secondary me-2">{s.sync_type}</span>
                                    <span style={{fontSize:"0.85rem"}}>ID: {s.local_id}</span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <span className={`badge bg-${s.status==="synced"?"success":"danger"}`}>{s.status}</span>
                                    <span style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.4)"}}>{s.synced_at?new Date(s.synced_at).toLocaleDateString():""}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default MetrcIntegration;
