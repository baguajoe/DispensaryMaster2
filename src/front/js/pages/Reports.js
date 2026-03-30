import React, { useState, useEffect } from "react";

const Reports = () => {
    const [reportType, setReportType] = useState("sales");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dateFrom, setDateFrom] = useState(new Date(Date.now() - 30*24*60*60*1000).toISOString().split("T")[0]);
    const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0]);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const fetchReport = async () => {
        setLoading(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/pos/reports?type=monthly`, { headers });
            if (r.ok) setData(await r.json());
        } catch(e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchReport(); }, [reportType]);

    const exportCSV = () => {
        if (!data) return;
        const rows = [["Report","Value"],["Total Sales",data.total_sales],["Orders",data.total_orders],["Avg Order",data.average_order]];
        const csv = rows.map(r => r.join(",")).join("\n");
        const blob = new Blob([csv], { type:"text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `report_${reportType}_${dateFrom}.csv`; a.click();
    };

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="page-header">
                    <h2>Reports</h2>
                    <p>Business performance reports</p>
                </div>
                <button className="btn btn-outline-success btn-sm" onClick={exportCSV} disabled={!data}>
                    ⬇ Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="glass-panel mb-4">
                <div className="row g-3 align-items-end">
                    <div className="col-md-3">
                        <label className="form-label small">Report Type</label>
                        <select className="form-select" value={reportType} onChange={e => setReportType(e.target.value)}>
                            <option value="sales">Sales Report</option>
                            <option value="inventory">Inventory Report</option>
                            <option value="customers">Customer Report</option>
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label className="form-label small">From</label>
                        <input type="date" className="form-control" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label small">To</label>
                        <input type="date" className="form-control" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                    </div>
                    <div className="col-md-3">
                        <button className="btn btn-success w-100" onClick={fetchReport} disabled={loading}>
                            {loading ? <span className="spinner-border spinner-border-sm" /> : "Generate Report"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Results */}
            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-light" /></div>
            ) : data ? (
                <>
                    <div className="row g-3 mb-4">
                        {[
                            { label:"Total Sales", value:`$${(data.total_sales || 0).toFixed(2)}`, color:"#2dce89" },
                            { label:"Total Orders", value: data.total_orders || 0, color:"#11cdef" },
                            { label:"Average Order", value:`$${(data.average_order || 0).toFixed(2)}`, color:"#fb6340" },
                        ].map((s, i) => (
                            <div key={i} className="col-md-4">
                                <div className="glass-panel text-center">
                                    <div style={{fontSize:"0.75rem", color:"rgba(255,255,255,0.55)", textTransform:"uppercase"}}>{s.label}</div>
                                    <div style={{fontSize:"1.8rem", fontWeight:700, color:s.color}}>{s.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Payment Breakdown */}
                    {data.payment_breakdown && Object.keys(data.payment_breakdown).length > 0 && (
                        <div className="glass-panel mb-4">
                            <h5 className="mb-3">Payment Method Breakdown</h5>
                            {Object.entries(data.payment_breakdown).map(([method, amount]) => (
                                <div key={method} className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="text-capitalize">{method}</span>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="progress flex-grow-1" style={{width:"200px", height:"8px", background:"rgba(255,255,255,0.1)"}}>
                                            <div className="progress-bar bg-success"
                                                style={{width:`${data.total_sales > 0 ? (amount/data.total_sales*100) : 0}%`}} />
                                        </div>
                                        <span className="text-success fw-bold">${amount.toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Recent Orders in Report */}
                    {(data.orders || []).length > 0 && (
                        <div className="glass-panel">
                            <h5 className="mb-3">Recent Transactions</h5>
                            <table className="table table-sm">
                                <thead>
                                    <tr><th>Order #</th><th>Amount</th><th>Date</th></tr>
                                </thead>
                                <tbody>
                                    {data.orders.map(o => (
                                        <tr key={o.id}>
                                            <td>#{o.id}</td>
                                            <td className="text-success">${o.total?.toFixed(2)}</td>
                                            <td style={{color:"rgba(255,255,255,0.55)", fontSize:"0.85rem"}}>
                                                {o.date ? new Date(o.date).toLocaleDateString() : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            ) : (
                <div className="glass-panel text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}>
                    <div style={{fontSize:"3rem"}}>📊</div>
                    <h5>Select a report type and generate</h5>
                </div>
            )}
        </div>
    );
};
export default Reports;
