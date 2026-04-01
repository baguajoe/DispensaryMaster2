import React, { useState, useEffect } from "react";

const GrowReports = () => {
    const [batches, setBatches] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [harvests, setHarvests] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization:`Bearer ${token}` };

    useEffect(() => {
        Promise.all([
            fetch(`${process.env.BACKEND_URL}/api/plant_batches`, { headers }).then(r => r.ok ? r.json() : []),
            fetch(`${process.env.BACKEND_URL}/api/grow_tasks`, { headers }).then(r => r.ok ? r.json() : []),
            fetch(`${process.env.BACKEND_URL}/api/harvest_logs`, { headers }).then(r => r.ok ? r.json() : []),
        ]).then(([b, t, h]) => { setBatches(Array.isArray(b)?b:[]); setTasks(Array.isArray(t)?t:[]); setHarvests(Array.isArray(h)?h:[]); setLoading(false); });
    }, []);

    const exportCSV = () => {
        const rows = [
            ["Strain","Status","Start Date","Expected End","Yield (lbs)"],
            ...batches.map(b => [b.strain,b.status,b.start_date,b.end_date,b.yield_amount||""])
        ];
        const csv = rows.map(r => r.join(",")).join("\n");
        const blob = new Blob([csv], {type:"text/csv"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href=url; a.download="grow_report.csv"; a.click();
    };

    const totalYield = harvests.reduce((s,h) => s+parseFloat(h.dry_weight||0), 0);
    const completedTasks = tasks.filter(t => t.status === "Completed").length;

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light" /></div>;

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header"><h2 style={{ color: "#ffab00", fontWeight: 800 }}>📊 Grow Farm Reports</h2><p>Production summary and batch analytics</p></div>
                <button className="btn btn-outline-success btn-sm" onClick={exportCSV}>⬇ Export CSV</button>
            </div>

            <div className="row g-3 mb-4">
                {[
                    { label:"Total Batches", value:batches.length, color:"#11cdef" },
                    { label:"Active Batches", value:batches.filter(b=>b.status!=="Harvested").length, color:"#2dce89" },
                    { label:"Total Dry Yield (lbs)", value:totalYield.toFixed(2), color:"#ffd600" },
                    { label:"Tasks Completed", value:completedTasks, color:"#2dce89" },
                ].map((s,i) => (
                    <div key={i} className="col-6 col-md-3">
                        <div className="glass-panel text-center">
                            <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.55)",textTransform:"uppercase"}}>{s.label}</div>
                            <div style={{fontSize:"1.8rem",fontWeight:700,color:s.color}}>{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row g-3">
                <div className="col-md-7">
                    <div className="glass-panel">
                        <h5 className="mb-3">Batch Status Breakdown</h5>
                        {["Seedling","Vegetative","Flowering","Drying","Harvested"].map(status => {
                            const count = batches.filter(b => b.status === status).length;
                            const pct = batches.length > 0 ? (count/batches.length*100) : 0;
                            return (
                                <div key={status} className="mb-2">
                                    <div className="d-flex justify-content-between mb-1">
                                        <span style={{fontSize:"0.85rem"}}>{status}</span>
                                        <span style={{fontSize:"0.85rem",color:"rgba(255,255,255,0.6)"}}>{count} batches ({pct.toFixed(0)}%)</span>
                                    </div>
                                    <div className="progress" style={{height:"6px",background:"rgba(255,255,255,0.1)"}}>
                                        <div className="progress-bar bg-success" style={{width:`${pct}%`}} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="col-md-5">
                    <div className="glass-panel">
                        <h5 className="mb-3">Recent Harvests</h5>
                        {harvests.slice(0,5).map(h => (
                            <div key={h.id} className="d-flex justify-content-between mb-2">
                                <span style={{fontSize:"0.85rem"}}>Batch #{h.batch_id}</span>
                                <span className="text-success fw-bold">{h.dry_weight} lbs dry</span>
                            </div>
                        ))}
                        {harvests.length === 0 && <p style={{color:"rgba(255,255,255,0.5)"}}>No harvests yet</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default GrowReports;
