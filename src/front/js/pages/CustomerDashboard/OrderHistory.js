import React, { useState, useEffect } from "react";

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [expanded, setExpanded] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/customer/orders`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.ok ? r.json() : [])
            .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const filtered = orders.filter(o => {
        const matchStatus = statusFilter === "all" || o.status === statusFilter;
        const matchSearch = !search || String(o.id).includes(search);
        return matchStatus && matchSearch;
    });

    const totalSpent = orders.reduce((s, o) => s + parseFloat(o.total_amount||0), 0);

    return (
        <div className="main-content p-4">
            <div className="page-header mb-4"><h2>📦 Order History</h2><p>{orders.length} total orders · ${totalSpent.toFixed(2)} spent</p></div>

            <div className="row g-3 mb-4">
                {[
                    { label:"Total Orders", value:orders.length, color:"#11cdef" },
                    { label:"Total Spent", value:`$${totalSpent.toFixed(2)}`, color:"#2dce89" },
                    { label:"Completed", value:orders.filter(o=>o.status==="completed").length, color:"#2dce89" },
                    { label:"Pending", value:orders.filter(o=>o.status==="pending").length, color:"#ffd600" },
                ].map((s,i) => (
                    <div key={i} className="col-6 col-md-3">
                        <div className="glass-panel text-center">
                            <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>{s.label}</div>
                            <div style={{fontSize:"1.5rem",fontWeight:700,color:s.color}}>{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass-panel mb-3">
                <div className="row g-2 align-items-center">
                    <div className="col-md-6">
                        <input className="form-control" placeholder="Search by order #..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="col-md-6 d-flex gap-2">
                        {["all","pending","completed","cancelled"].map(s => (
                            <button key={s} className={`btn btn-sm ${statusFilter===s?"btn-success":"btn-outline-light"} text-capitalize`}
                                onClick={() => setStatusFilter(s)}>{s}</button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="glass-panel">
                {loading ? <div className="text-center py-4"><div className="spinner-border text-light" /></div>
                : filtered.length === 0 ? (
                    <div className="text-center py-5" style={{color:"rgba(255,255,255,0.5)"}}>
                        <div style={{fontSize:"3rem"}}>📦</div>
                        <h5>No orders found</h5>
                    </div>
                ) : filtered.map(o => (
                    <div key={o.id} className="mb-3 rounded overflow-hidden"
                        style={{border:"1px solid rgba(255,255,255,0.12)"}}>
                        <div className="d-flex justify-content-between align-items-center p-3"
                            style={{background:"rgba(255,255,255,0.06)",cursor:"pointer"}}
                            onClick={() => setExpanded(expanded===o.id ? null : o.id)}>
                            <div>
                                <div style={{fontWeight:600}}>Order #{o.id}</div>
                                <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)"}}>
                                    {o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}
                                    {o.items?.length > 0 ? ` · ${o.items.length} items` : ""}
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <span className="text-success fw-bold">${parseFloat(o.total_amount||0).toFixed(2)}</span>
                                <span className={`badge bg-${o.status==="completed"?"success":o.status==="pending"?"warning text-dark":"secondary"}`}>{o.status}</span>
                                <span style={{color:"rgba(255,255,255,0.4)"}}>{expanded===o.id ? "▲" : "▼"}</span>
                            </div>
                        </div>
                        {expanded === o.id && o.items?.length > 0 && (
                            <div className="p-3" style={{background:"rgba(0,0,0,0.2)"}}>
                                <table className="table table-sm mb-0">
                                    <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr></thead>
                                    <tbody>
                                        {o.items.map((item,i) => (
                                            <tr key={i}>
                                                <td>{item.product_name}</td>
                                                <td>{item.quantity}</td>
                                                <td>${item.unit_price?.toFixed(2)}</td>
                                                <td className="text-success">${item.subtotal?.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
export default OrderHistory;
