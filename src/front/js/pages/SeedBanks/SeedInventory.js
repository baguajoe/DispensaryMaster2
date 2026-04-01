import React, { useState, useEffect } from "react";

const SeedInventory = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization:`Bearer ${token}` };
    const today = new Date();

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/seed_batches`, { headers })
            .then(r => r.ok ? r.json() : [])
            .then(data => { setBatches(Array.isArray(data)?data:[]); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const totalSeeds = batches.reduce((s,b) => s+(b.quantity||0), 0);
    const byStrain = batches.reduce((acc, b) => {
        acc[b.strain] = (acc[b.strain]||0) + (b.quantity||0);
        return acc;
    }, {});
    const byLocation = batches.reduce((acc, b) => {
        const loc = b.storage_location || "Unassigned";
        acc[loc] = (acc[loc]||0) + (b.quantity||0);
        return acc;
    }, {});

    const exportCSV = () => {
        const rows = [["Strain","Batch #","Qty","Location","Germ Rate %","Expires","Status"],
            ...batches.map(b => {
                const expired = b.expiration_date && new Date(b.expiration_date) < today;
                return [b.strain,b.batch_number,b.quantity,b.storage_location||"",b.germination_rate||"",b.expiration_date||"",expired?"Expired":"Active"];
            })];
        const csv = rows.map(r => r.join(",")).join("\n");
        const blob = new Blob([csv], {type:"text/csv"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href=url; a.download="seed_inventory.csv"; a.click();
    };

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light" /></div>;

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2 style={{ color: "#ffab00", fontWeight: 800 }}>📋 Seed Inventory</h2><p>{totalSeeds.toLocaleString()} total seeds across {batches.length} batches</p></div>
                <button className="btn btn-outline-success btn-sm" onClick={exportCSV}>⬇ Export CSV</button>
            </div>

            <div className="row g-3 mb-4">
                <div className="col-md-6">
                    <div className="glass-panel">
                        <h5 className="mb-3">Seeds by Strain</h5>
                        {Object.entries(byStrain).sort((a,b) => b[1]-a[1]).map(([strain, qty]) => (
                            <div key={strain} className="d-flex justify-content-between mb-2">
                                <span style={{fontSize:"0.9rem"}}>{strain}</span>
                                <span className="badge bg-success">{qty} seeds</span>
                            </div>
                        ))}
                        {Object.keys(byStrain).length === 0 && <p style={{color:"rgba(255,255,255,0.5)"}}>No data</p>}
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="glass-panel">
                        <h5 className="mb-3">Seeds by Storage Location</h5>
                        {Object.entries(byLocation).sort((a,b) => b[1]-a[1]).map(([loc, qty]) => (
                            <div key={loc} className="d-flex justify-content-between mb-2">
                                <span style={{fontSize:"0.9rem"}}>{loc}</span>
                                <span className="badge bg-info">{qty} seeds</span>
                            </div>
                        ))}
                        {Object.keys(byLocation).length === 0 && <p style={{color:"rgba(255,255,255,0.5)"}}>No data</p>}
                    </div>
                </div>
            </div>

            <div className="glass-panel">
                <h5 className="mb-3">Full Inventory</h5>
                <table className="table mb-0">
                    <thead><tr><th>Strain</th><th>Batch #</th><th>Qty</th><th>Germ %</th><th>Location</th><th>Expires</th><th>Status</th></tr></thead>
                    <tbody>
                        {batches.map(b => {
                            const expired = b.expiration_date && new Date(b.expiration_date) < today;
                            const expiringSoon = !expired && b.expiration_date && (new Date(b.expiration_date)-today)/(1000*60*60*24) <= 30;
                            return (
                                <tr key={b.id}>
                                    <td><strong>{b.strain}</strong></td>
                                    <td style={{fontSize:"0.8rem"}}>{b.batch_number}</td>
                                    <td><span className={`badge ${b.quantity<10?"bg-warning text-dark":"bg-success"}`}>{b.quantity}</span></td>
                                    <td>{b.germination_rate ? `${b.germination_rate}%` : "—"}</td>
                                    <td style={{fontSize:"0.85rem"}}>{b.storage_location||"—"}</td>
                                    <td style={{fontSize:"0.8rem"}}>{b.expiration_date ? new Date(b.expiration_date).toLocaleDateString() : "—"}</td>
                                    <td><span className={`badge ${expired?"bg-danger":expiringSoon?"bg-warning text-dark":"bg-success"}`}>{expired?"Expired":expiringSoon?"Exp. Soon":"Active"}</span></td>
                                </tr>
                            );
                        })}
                        {batches.length === 0 && <tr><td colSpan="7" className="text-center py-4" style={{color:"rgba(255,255,255,0.5)"}}>No inventory data</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default SeedInventory;
