import React, { useState, useEffect } from "react";

const Invoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => { fetchInvoices(); }, []);

    const fetchInvoices = async () => {
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/invoices`, { headers });
            if (r.ok) {
                const data = await r.json();
                setInvoices(Array.isArray(data) ? data : data.invoices || []);
            }
        } catch(e) { console.error(e); }
        finally { setLoading(false); }
    };

    const filtered = invoices.filter(i => filter === "all" || i.status === filter);
    const total = invoices.reduce((s, i) => s + parseFloat(i.total_amount||0), 0);
    const unpaid = invoices.filter(i => i.status === "unpaid").reduce((s, i) => s + parseFloat(i.total_amount||0), 0);

    const STATUS_COLORS = { paid:"success", unpaid:"warning", overdue:"danger" };

    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2>Invoices</h2><p>Manage customer invoices</p></div>
            <div className="row g-3 mb-4">
                {[
                    { label:"Total Invoiced", value:`$${total.toFixed(2)}`, color:"#11cdef" },
                    { label:"Outstanding", value:`$${unpaid.toFixed(2)}`, color:"#ffd600" },
                    { label:"Total Invoices", value:invoices.length, color:"#2dce89" },
                ].map((s,i) => (
                    <div key={i} className="col-md-4">
                        <div className="glass-panel text-center">
                            <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.55)",textTransform:"uppercase"}}>{s.label}</div>
                            <div style={{fontSize:"1.8rem",fontWeight:700,color:s.color}}>{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="d-flex gap-2 mb-3">
                {["all","paid","unpaid","overdue"].map(f => (
                    <button key={f} className={`btn btn-sm ${filter===f?"btn-success":"btn-outline-light"} text-capitalize`} onClick={() => setFilter(f)}>{f}</button>
                ))}
            </div>
            <div className="glass-panel">
                {loading ? <div className="text-center py-4"><div className="spinner-border text-light" /></div>
                : filtered.length === 0 ? <div className="text-center py-4" style={{color:"rgba(255,255,255,0.5)"}}>No invoices found</div>
                : (
                    <table className="table mb-0">
                        <thead><tr><th>Invoice #</th><th>Customer</th><th>Order</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                        <tbody>
                            {filtered.map(inv => (
                                <tr key={inv.id}>
                                    <td><strong>INV-{inv.id}</strong></td>
                                    <td>Customer {inv.customer_id}</td>
                                    <td>#{inv.order_id}</td>
                                    <td className="text-success">${parseFloat(inv.total_amount||0).toFixed(2)}</td>
                                    <td><span className={`badge bg-${STATUS_COLORS[inv.status]||"secondary"} ${inv.status==="unpaid"?"text-dark":""}`}>{inv.status}</span></td>
                                    <td style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.55)"}}>{inv.issue_date ? new Date(inv.issue_date).toLocaleDateString() : "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
export default Invoices;
