import React, { useState, useEffect } from "react";

const POSReports = () => {
    const [report, setReport] = useState(null);
    const [reportType, setReportType] = useState("daily");
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => { fetchReport(); }, [reportType]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/pos/reports?type=${reportType}`, { headers });
            if (r.ok) setReport(await r.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3 mb-0">POS Reports</h1>
                <div className="btn-group">
                    {["daily", "weekly", "monthly"].map(t => (
                        <button key={t} className={`btn ${reportType === t ? "btn-success" : "btn-outline-success"}`}
                            onClick={() => setReportType(t)}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-success" /></div>
            ) : report ? (
                <>
                    <div className="row g-3 mb-4">
                        {[
                            { label: "Total Sales", value: `$${report.total_sales?.toFixed(2)}`, color: "success" },
                            { label: "Total Orders", value: report.total_orders, color: "primary" },
                            { label: "Average Order", value: `$${report.average_order?.toFixed(2)}`, color: "info" },
                        ].map((s, i) => (
                            <div key={i} className="col-md-4">
                                <div className={`card border-${s.color} border-start border-3`}>
                                    <div className="card-body">
                                        <p className="text-muted small mb-1">{s.label}</p>
                                        <h3 className={`text-${s.color} mb-0`}>{s.value}</h3>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="row g-3">
                        <div className="col-md-5">
                            <div className="card">
                                <div className="card-header"><h5 className="mb-0">Payment Breakdown</h5></div>
                                <div className="card-body">
                                    {Object.entries(report.payment_breakdown || {}).map(([method, amount]) => (
                                        <div key={method} className="d-flex justify-content-between mb-2">
                                            <span className="text-capitalize">{method}</span>
                                            <span className="fw-bold">${amount.toFixed(2)}</span>
                                        </div>
                                    ))}
                                    {Object.keys(report.payment_breakdown || {}).length === 0 && (
                                        <p className="text-muted text-center">No transactions yet</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="col-md-7">
                            <div className="card">
                                <div className="card-header"><h5 className="mb-0">Recent Orders</h5></div>
                                <div className="table-responsive">
                                    <table className="table table-sm mb-0">
                                        <thead className="table-light">
                                            <tr><th>Order #</th><th>Amount</th><th>Date</th></tr>
                                        </thead>
                                        <tbody>
                                            {(report.orders || []).map(o => (
                                                <tr key={o.id}>
                                                    <td>#{o.id}</td>
                                                    <td className="text-success">${o.total?.toFixed(2)}</td>
                                                    <td className="small text-muted">{o.date ? new Date(o.date).toLocaleString() : "-"}</td>
                                                </tr>
                                            ))}
                                            {(report.orders || []).length === 0 && (
                                                <tr><td colSpan="3" className="text-center text-muted py-3">No orders in this period</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : <p className="text-muted">No report data available</p>}
        </div>
    );
};

export default POSReports;
