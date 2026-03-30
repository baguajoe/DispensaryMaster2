import React, { useEffect, useState } from "react";

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [search, setSearch] = useState("");
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => { fetchTransactions(); }, [dateFilter]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/pos/transactions?date=${dateFilter}`, { headers });
            if (r.ok) setTransactions(await r.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchDetail = async (orderId) => {
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/pos/transactions/${orderId}`, { headers });
            if (r.ok) setSelected(await r.json());
        } catch (e) { console.error(e); }
    };

    const filtered = transactions.filter(t =>
        (t.customer || "").toLowerCase().includes(search.toLowerCase()) ||
        String(t.order_id).includes(search)
    );

    const totalSales = filtered.reduce((s, t) => s + (t.amount || 0), 0);

    return (
        <div className="main-content p-4">
            <h1 className="h3 mb-4">Transaction History</h1>

            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <input type="date" className="form-control" value={dateFilter}
                        onChange={e => setDateFilter(e.target.value)} />
                </div>
                <div className="col-md-4">
                    <input className="form-control" placeholder="Search by customer or order ID..."
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="col-md-4">
                    <div className="card bg-success text-white text-center py-2">
                        <div className="small">Total Sales</div>
                        <div className="fw-bold fs-5">${totalSales.toFixed(2)}</div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className={selected ? "col-md-7" : "col-12"}>
                    <div className="card">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-dark">
                                    <tr>
                                        <th>Order #</th>
                                        <th>Customer</th>
                                        <th>Payment</th>
                                        <th>Amount</th>
                                        <th>Time</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="6" className="text-center py-4"><div className="spinner-border spinner-border-sm text-success" /></td></tr>
                                    ) : filtered.length > 0 ? filtered.map(t => (
                                        <tr key={t.id} className={selected?.order_id === t.order_id ? "table-active" : ""}>
                                            <td>#{t.order_id}</td>
                                            <td>{t.customer}</td>
                                            <td><span className="badge bg-secondary text-capitalize">{t.payment_method}</span></td>
                                            <td className="text-success fw-bold">${t.amount?.toFixed(2)}</td>
                                            <td className="small text-muted">{t.date ? new Date(t.date).toLocaleTimeString() : "-"}</td>
                                            <td><button className="btn btn-sm btn-outline-primary" onClick={() => fetchDetail(t.order_id)}>View</button></td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="6" className="text-center py-4 text-muted">No transactions found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {selected && (
                    <div className="col-md-5">
                        <div className="card">
                            <div className="card-header d-flex justify-content-between">
                                <h5 className="mb-0">Order #{selected.order_id}</h5>
                                <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelected(null)}>✕</button>
                            </div>
                            <div className="card-body">
                                <p><strong>Customer:</strong> {selected.customer}</p>
                                <p><strong>Payment:</strong> <span className="text-capitalize">{selected.payment_method}</span></p>
                                <p><strong>Total:</strong> <span className="text-success">${selected.amount?.toFixed(2)}</span></p>
                                <hr />
                                <h6>Items</h6>
                                <table className="table table-sm">
                                    <thead><tr><th>Product</th><th>Qty</th><th>Price</th></tr></thead>
                                    <tbody>
                                        {(selected.items || []).map((item, i) => (
                                            <tr key={i}>
                                                <td>{item.name}</td>
                                                <td>{item.quantity}</td>
                                                <td>${item.price?.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionHistory;
