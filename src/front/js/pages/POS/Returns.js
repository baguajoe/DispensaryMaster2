import React, { useState } from "react";

const Returns = () => {
    const [orderId, setOrderId] = useState("");
    const [transaction, setTransaction] = useState(null);
    const [selectedItems, setSelectedItems] = useState({});
    const [reason, setReason] = useState("Customer return");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

    const searchTransaction = async () => {
        if (!orderId) return;
        setLoading(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/pos/transactions/${orderId}`, { headers });
            if (r.ok) {
                const data = await r.json();
                setTransaction(data);
                const items = {};
                (data.items || []).forEach(i => { items[i.product_id] = { ...i, returnQty: i.quantity, selected: true }; });
                setSelectedItems(items);
            } else {
                alert("Transaction not found");
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const processReturn = async () => {
        const itemsToReturn = Object.values(selectedItems)
            .filter(i => i.selected && i.returnQty > 0)
            .map(i => ({ product_id: i.product_id, quantity: i.returnQty }));

        if (itemsToReturn.length === 0) return alert("Select items to return");

        setLoading(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/pos/returns`, {
                method: "POST",
                headers,
                body: JSON.stringify({ order_id: parseInt(orderId), items: itemsToReturn, reason })
            });
            const data = await r.json();
            if (r.ok) {
                setResult(data);
                setTransaction(null);
            } else {
                alert(data.error || "Return failed");
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    if (result) return (
        <div className="main-content p-4">
            <div className="card border-success text-center p-5">
                <div style={{ fontSize: "3rem" }}>✅</div>
                <h3 className="text-success">Return Processed</h3>
                <p className="fs-5">Refund Amount: <strong>${result.refund_amount?.toFixed(2)}</strong></p>
                <p className="text-muted">{result.message}</p>
                <button className="btn btn-success mt-3" onClick={() => { setResult(null); setOrderId(""); }}>
                    Process Another Return
                </button>
            </div>
        </div>
    );

    return (
        <div className="main-content p-4">
            <h1 className="h3 mb-4">Returns & Refunds</h1>

            <div className="card mb-4">
                <div className="card-body">
                    <h5>Find Transaction</h5>
                    <div className="input-group">
                        <input className="form-control" placeholder="Enter Order ID..."
                            value={orderId} onChange={e => setOrderId(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && searchTransaction()} />
                        <button className="btn btn-primary" onClick={searchTransaction} disabled={loading}>
                            {loading ? <span className="spinner-border spinner-border-sm" /> : "Search"}
                        </button>
                    </div>
                </div>
            </div>

            {transaction && (
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">Order #{transaction.order_id} - {transaction.customer}</h5>
                    </div>
                    <div className="card-body">
                        <div className="mb-3">
                            <label className="form-label">Return Reason</label>
                            <select className="form-select" value={reason} onChange={e => setReason(e.target.value)}>
                                <option>Customer return</option>
                                <option>Defective product</option>
                                <option>Wrong item</option>
                                <option>Quality issue</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <table className="table">
                            <thead><tr><th>Return?</th><th>Product</th><th>Purchased</th><th>Return Qty</th><th>Refund</th></tr></thead>
                            <tbody>
                                {Object.values(selectedItems).map(item => (
                                    <tr key={item.product_id}>
                                        <td>
                                            <input type="checkbox" checked={item.selected}
                                                onChange={e => setSelectedItems(prev => ({ ...prev, [item.product_id]: { ...prev[item.product_id], selected: e.target.checked } }))} />
                                        </td>
                                        <td>{item.name}</td>
                                        <td>{item.quantity}</td>
                                        <td>
                                            <input type="number" className="form-control form-control-sm" style={{ width: "80px" }}
                                                min="1" max={item.quantity} value={item.returnQty}
                                                onChange={e => setSelectedItems(prev => ({ ...prev, [item.product_id]: { ...prev[item.product_id], returnQty: Math.min(item.quantity, Math.max(1, parseInt(e.target.value) || 1)) } }))} />
                                        </td>
                                        <td>${(item.price * item.returnQty).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="d-flex justify-content-between align-items-center">
                            <strong>Total Refund: ${Object.values(selectedItems).filter(i => i.selected).reduce((s, i) => s + i.price * i.returnQty, 0).toFixed(2)}</strong>
                            <button className="btn btn-danger" onClick={processReturn} disabled={loading}>
                                {loading ? <span className="spinner-border spinner-border-sm" /> : "Process Return"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Returns;
