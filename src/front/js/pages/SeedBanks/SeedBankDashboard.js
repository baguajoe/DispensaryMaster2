import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const SeedBankDashboard = () => {
    const [overview, setOverview] = useState(null);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization:`Bearer ${token}` };

    useEffect(() => {
        Promise.all([
            fetch(`${process.env.BACKEND_URL}/api/seedbanks/overview`, { headers }).then(r => r.ok ? r.json() : null),
            fetch(`${process.env.BACKEND_URL}/api/seed_batches`, { headers }).then(r => r.ok ? r.json() : []),
        ]).then(([ov, b]) => { setOverview(ov); setBatches(Array.isArray(b)?b:[]); setLoading(false); })
        .catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light" /></div>;

    const today = new Date();

    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2>🌰 Seed Bank Dashboard</h2><p>Manage seed inventory, storage, and germination tracking</p></div>

            <div className="row g-3 mb-4">
                {[
                    { label:"Total Batches", value:overview?.total_batches||0, icon:"📦", color:"#11cdef" },
                    { label:"Total Seeds", value:overview?.total_seeds||0, icon:"🌱", color:"#2dce89" },
                    { label:"Low Stock", value:overview?.low_stock||0, icon:"⚠️", color:"#ffd600" },
                    { label:"Expired", value:overview?.expired_batches||0, icon:"❌", color: overview?.expired_batches > 0 ? "#f5365c" : "#2dce89" },
                ].map((s,i) => (
                    <div key={i} className="col-6 col-md-3">
                        <div className="glass-panel text-center">
                            <div style={{fontSize:"2rem"}}>{s.icon}</div>
                            <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.55)",textTransform:"uppercase",margin:"0.5rem 0 0.25rem"}}>{s.label}</div>
                            <div style={{fontSize:"1.8rem",fontWeight:700,color:s.color}}>{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row g-3">
                <div className="col-md-8">
                    <div className="glass-panel">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">Recent Seed Batches</h5>
                            <Link to="/seedbanks/batch-list" className="btn btn-sm btn-outline-success">View All</Link>
                        </div>
                        {batches.slice(0,5).map(b => {
                            const expired = b.expiration_date && new Date(b.expiration_date) < today;
                            return (
                                <div key={b.id} className="d-flex justify-content-between align-items-center mb-2 p-2 rounded"
                                    style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)"}}>
                                    <div>
                                        <div style={{fontWeight:600}}>{b.strain}</div>
                                        <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>{b.batch_number} · {b.storage_location}</div>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <span style={{color:"#2dce89"}}>{b.quantity} seeds</span>
                                        <span className={`badge ${expired?"bg-danger":b.quantity < 10?"bg-warning text-dark":"bg-success"}`}>
                                            {expired?"Expired":b.quantity < 10?"Low Stock":"OK"}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        {batches.length === 0 && <p className="text-center" style={{color:"rgba(255,255,255,0.5)"}}>No seed batches yet</p>}
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="glass-panel">
                        <h5 className="mb-3">Quick Actions</h5>
                        <div className="d-flex flex-column gap-2">
                            <Link to="/seedbanks/add-seed-batch" className="btn btn-success">+ Add Seed Batch</Link>
                            <Link to="/seedbanks/batch-list" className="btn btn-outline-light">View All Batches</Link>
                            <Link to="/seedbanks/inventory" className="btn btn-outline-light">Inventory Report</Link>
                            <Link to="/seedbanks/storage-conditions" className="btn btn-outline-info">Storage Conditions</Link>
                            <Link to="/seedbanks/reports" className="btn btn-outline-light">Analytics & Reports</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default SeedBankDashboard;
