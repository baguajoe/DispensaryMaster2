import React, { useState, useEffect } from "react";

const ComplianceReports = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/medical/compliance/reports`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.ok ? r.json() : null)
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const exportCSV = () => {
        if (!data) return;
        const rows = [
            ["Patient Name","Card Number","Status","Date"],
            ...(data.expired_patients||[]).map(p => [p.name, p.card, "EXPIRED", p.expired]),
            ...(data.expiring_patients||[]).map(p => [p.name, p.card, "EXPIRING SOON", p.expires]),
        ];
        const csv = rows.map(r => r.join(",")).join("\n");
        const blob = new Blob([csv], { type:"text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `compliance_report_${new Date().toISOString().split("T")[0]}.csv`; a.click();
    };

    if (loading) return <div className="main-content d-flex justify-content-center align-items-center" style={{minHeight:"60vh"}}><div className="spinner-border text-light" /></div>;

    const s = data?.summary || {};

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header">
                    <h2 style={{ color: "#ffab00", fontWeight: 800 }}>📋 Compliance Reports</h2>
                    <p>Medical card status, prescription activity, and appointment records</p>
                </div>
                <button className="btn btn-outline-success btn-sm" onClick={exportCSV}>⬇ Export CSV</button>
            </div>

            {/* Summary */}
            <div className="row g-3 mb-4">
                {[
                    { label:"Total Patients", value:s.total_patients||0, color:"#11cdef" },
                    { label:"Expired Cards", value:s.expired_cards||0, color:"#f5365c" },
                    { label:"Expiring Soon", value:s.expiring_soon||0, color:"#ffd600" },
                    { label:"Prescriptions", value:s.prescriptions_count||0, color:"#2dce89" },
                    { label:"Scheduled Apts", value:s.appointments_scheduled||0, color:"#fb6340" },
                    { label:"Completed Apts", value:s.appointments_completed||0, color:"#2dce89" },
                ].map((stat,i) => (
                    <div key={i} className="col-6 col-md-2">
                        <div className="glass-panel text-center">
                            <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>{stat.label}</div>
                            <div style={{fontSize:"1.5rem",fontWeight:700,color:stat.color}}>{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row g-3">
                {/* Expired Cards */}
                <div className="col-md-6">
                    <div className="glass-panel">
                        <h5 className="mb-3 text-danger">❌ Expired Medical Cards ({(data?.expired_patients||[]).length})</h5>
                        {(data?.expired_patients||[]).length === 0 ? (
                            <p className="text-center" style={{color:"rgba(255,255,255,0.5)"}}>✅ No expired cards</p>
                        ) : (
                            <table className="table table-sm mb-0">
                                <thead><tr><th>Patient</th><th>Card #</th><th>Expired</th></tr></thead>
                                <tbody>
                                    {(data.expired_patients||[]).map((p,i) => (
                                        <tr key={i}>
                                            <td>{p.name}</td>
                                            <td style={{fontSize:"0.8rem"}}>{p.card}</td>
                                            <td><span className="badge bg-danger">{new Date(p.expired).toLocaleDateString()}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Expiring Soon */}
                <div className="col-md-6">
                    <div className="glass-panel">
                        <h5 className="mb-3 text-warning">⚠️ Expiring Within 30 Days ({(data?.expiring_patients||[]).length})</h5>
                        {(data?.expiring_patients||[]).length === 0 ? (
                            <p className="text-center" style={{color:"rgba(255,255,255,0.5)"}}>✅ No cards expiring soon</p>
                        ) : (
                            <table className="table table-sm mb-0">
                                <thead><tr><th>Patient</th><th>Card #</th><th>Expires</th></tr></thead>
                                <tbody>
                                    {(data.expiring_patients||[]).map((p,i) => (
                                        <tr key={i}>
                                            <td>{p.name}</td>
                                            <td style={{fontSize:"0.8rem"}}>{p.card}</td>
                                            <td><span className="badge bg-warning text-dark">{new Date(p.expires).toLocaleDateString()}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ComplianceReports;
