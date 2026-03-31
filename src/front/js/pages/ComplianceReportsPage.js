import React, { useState, useEffect } from "react";

const ComplianceReportsPage = () => {
    const [reports, setReports] = useState([]);
    const [batchTracking, setBatchTracking] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState("reports");
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

    useEffect(() => {
        Promise.all([
            fetch(`${process.env.BACKEND_URL}/api/reports/compliance`, { headers }).then(r => r.ok ? r.json() : {}),
            fetch(`${process.env.BACKEND_URL}/api/compliance/batch-tracking`, { headers }).then(r => r.ok ? r.json() : []),
        ]).then(([rep, batch]) => {
            setReports(rep.reports || []);
            setBatchTracking(Array.isArray(batch) ? batch : []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const handleGenerate = async (type) => {
        setGenerating(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/reports/generate`, {
                method:"POST", headers, body:JSON.stringify({ type, format:"pdf" })
            });
            if (r.ok) {
                const data = await r.json();
                alert(`${type} report generated successfully`);
            }
        } catch(e) { console.error(e); }
        finally { setGenerating(false); }
    };

    const REPORT_TYPES = [
        {type:"inventory", label:"Inventory Report", icon:"📦", desc:"Current stock levels, batch numbers, test results"},
        {type:"sales", label:"Sales Report", icon:"💰", desc:"Transaction history for state reporting"},
        {type:"compliance", label:"Compliance Summary", icon:"⚖️", desc:"License status, audit history, alerts"},
        {type:"metrc", label:"Metrc Report", icon:"🌿", desc:"Seed-to-sale tracking data for state submission"},
        {type:"patient", label:"Patient Report", icon:"🏥", desc:"Medical patient statistics (anonymized)"},
        {type:"employee", label:"Employee Report", icon:"👔", desc:"Staff licenses, training completion, certifications"},
    ];

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light"/></div>;

    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2>📄 Compliance Reports</h2><p>Generate and manage regulatory reports</p></div>

            <div className="d-flex gap-2 mb-4">
                {["reports","batch"].map(tab => (
                    <button key={tab} className={`btn btn-sm ${activeTab===tab?"btn-success":"btn-outline-light"}`} onClick={()=>setActiveTab(tab)}>
                        {tab==="reports"?"Generate Reports":"Batch Tracking"}
                    </button>
                ))}
            </div>

            {activeTab === "reports" && (
                <div className="row g-3">
                    {REPORT_TYPES.map((rt, i) => (
                        <div key={i} className="col-md-6 col-lg-4">
                            <div className="glass-panel h-100">
                                <div style={{fontSize:"2rem",marginBottom:"0.5rem"}}>{rt.icon}</div>
                                <h5 className="mb-1">{rt.label}</h5>
                                <p style={{fontSize:"0.85rem",color:"rgba(255,255,255,0.6)",marginBottom:"1rem"}}>{rt.desc}</p>
                                <button className="btn btn-success btn-sm w-100" disabled={generating} onClick={()=>handleGenerate(rt.type)}>
                                    {generating?<span className="spinner-border spinner-border-sm me-1"/>:"📥 "} Generate PDF
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === "batch" && (
                <div className="glass-panel">
                    <h5 className="mb-3">Batch/Package Tracking</h5>
                    <p style={{fontSize:"0.85rem",color:"rgba(255,255,255,0.6)",marginBottom:"1rem"}}>Track all products from seed to sale by batch number</p>
                    <div className="table-responsive">
                        <table className="table table-dark table-hover mb-0">
                            <thead><tr style={{color:"rgba(255,255,255,0.5)",fontSize:"0.8rem",textTransform:"uppercase"}}>
                                <th>Batch Number</th><th>Product</th><th>Category</th><th>Current Stock</th><th>Test Results</th>
                            </tr></thead>
                            <tbody>
                                {batchTracking.map((b, i) => (
                                    <tr key={i}>
                                        <td style={{fontFamily:"monospace",color:"#2dce89"}}>{b.batch_number}</td>
                                        <td style={{fontWeight:600}}>{b.product_name}</td>
                                        <td><span className="badge bg-secondary">{b.category}</span></td>
                                        <td>{b.current_stock} units</td>
                                        <td style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.6)"}}>{b.test_results || "Pending"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {batchTracking.length === 0 && <div className="text-center py-4" style={{color:"rgba(255,255,255,0.5)"}}>No batch data available</div>}
                    </div>
                </div>
            )}
        </div>
    );
};
export default ComplianceReportsPage;
