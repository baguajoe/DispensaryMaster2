import React, { useState, useEffect } from "react";

const SeedReports = () => {
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
    const expired = batches.filter(b => b.expiration_date && new Date(b.expiration_date) < today);
    const expiringSoon = batches.filter(b => {
        if (!b.expiration_date) return false;
        const days = (new Date(b.expiration_date)-today)/(1000*60*60*24);
        return days >= 0 && days <= 30;
    });
    const lowStock = batches.filter(b => (b.quantity||0) < 10);
    const avgGermRate = batches.filter(b => b.germination_rate).length > 0
        ? (batches.filter(b=>b.germination_rate).reduce((s,b)=>s+parseFloat(b.germination_rate),0)/batches.filter(b=>b.germination_rate).length).toFixed(1)
        : "N/A";

    const exportCSV = () => {
        const rows = [
            ["Summary","Value"],
            ["Total Batches", batches.length],
            ["Total Seeds", totalSeeds],
            ["Expired Batches", expired.length],
            ["Expiring Soon", expiringSoon.length],
            ["Low Stock Batches", lowStock.length],
            ["Avg Germination Rate", `${avgGermRate}%`],
        ];
        const csv = rows.map(r => r.join(",")).join("\n");
        const blob = new Blob([csv], {type:"text/csv"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href=url; a.download="seed_bank_report.csv"; a.click();
    };

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light" /></div>;

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2>📊 Seed Bank Reports</h2><p>Analytics and health overview of seed inventory</p></div>
                <button className="btn btn-outline-success btn-sm" onClick={exportCSV}>⬇ Export CSV</button>
            </div>

            <div className="row g-3 mb-4">
                {[
                    { label:"Total Batches", value:batches.length, color:"#11cdef" },
                    { label:"Total Seeds", value:totalSeeds.toLocaleString(), color:"#2dce89" },
                    { label:"Avg Germ Rate", value:`${avgGermRate}%`, color:"#fb6340" },
                    { label:"Alerts", value: expired.length + expiringSoon.length + lowStock.length, color: expired.length > 0 ? "#f5365c" : "#ffd600" },
                ].map((s,i) => (
                    <div key={i} className="col-6 col-md-3">
                        <div className="glass-panel text-center">
                            <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.55)",textTransform:"uppercase"}}>{s.label}</div>
                            <div style={{fontSize:"2rem",fontWeight:700,color:s.color}}>{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row g-3">
                {/* Expired */}
                <div className="col-md-4">
                    <div className="glass-panel">
                        <h5 className="mb-3 text-danger">❌ Expired Batches ({expired.length})</h5>
                        {expired.length === 0 ? <p style={{color:"rgba(255,255,255,0.5)"}}>✅ None expired</p>
                        : expired.map(b => (
                            <div key={b.id} className="mb-2">
                                <div style={{fontWeight:600}}>{b.strain}</div>
                                <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>{b.quantity} seeds · Expired {new Date(b.expiration_date).toLocaleDateString()}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Expiring */}
                <div className="col-md-4">
                    <div className="glass-panel">
                        <h5 className="mb-3 text-warning">⚠️ Expiring Soon ({expiringSoon.length})</h5>
                        {expiringSoon.length === 0 ? <p style={{color:"rgba(255,255,255,0.5)"}}>✅ None expiring soon</p>
                        : expiringSoon.map(b => (
                            <div key={b.id} className="mb-2">
                                <div style={{fontWeight:600}}>{b.strain}</div>
                                <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>{b.quantity} seeds · Expires {new Date(b.expiration_date).toLocaleDateString()}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Low Stock */}
                <div className="col-md-4">
                    <div className="glass-panel">
                        <h5 className="mb-3 text-warning">📉 Low Stock ({lowStock.length})</h5>
                        {lowStock.length === 0 ? <p style={{color:"rgba(255,255,255,0.5)"}}>✅ All well stocked</p>
                        : lowStock.map(b => (
                            <div key={b.id} className="mb-2">
                                <div style={{fontWeight:600}}>{b.strain}</div>
                                <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>{b.quantity} seeds remaining</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default SeedReports;
