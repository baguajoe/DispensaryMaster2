import React, { useState } from "react";

const Reconciliation = () => {
    const [actualCash, setActualCash] = useState("");
    const [notes, setNotes] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

    const handleReconcile = async () => {
        if (!actualCash) return alert("Enter actual cash amount");
        setLoading(true);
        try {
            const r = await fetch(`${process.env.BACKEND_URL}/api/pos/reconciliation`, {
                method: "POST",
                headers,
                body: JSON.stringify({ actual_cash: parseFloat(actualCash), notes })
            });
            if (r.ok) setResult(await r.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    return (
        <div className="main-content p-4">
            <h1 className="h3 mb-4">Cash Reconciliation</h1>

            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card mb-4">
                        <div className="card-header"><h5 className="mb-0">End of Day Count</h5></div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="form-label">Actual Cash in Drawer ($)</label>
                                <input type="number" className="form-control form-control-lg"
                                    placeholder="0.00" value={actualCash}
                                    onChange={e => setActualCash(e.target.value)} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Notes</label>
                                <textarea className="form-control" rows="3" value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="Any discrepancy notes..." />
                            </div>
                            <button className="btn btn-primary w-100" onClick={handleReconcile} disabled={loading}>
                                {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                                Reconcile
                            </button>
                        </div>
                    </div>

                    {result && (
                        <div className={`card border-${result.status === "balanced" ? "success" : result.status === "over" ? "info" : "danger"}`}>
                            <div className="card-body">
                                <h5 className="text-center mb-3">Reconciliation Result</h5>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Expected Cash</span><strong>${result.expected_cash?.toFixed(2)}</strong>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Actual Cash</span><strong>${result.actual_cash?.toFixed(2)}</strong>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between">
                                    <span>Difference</span>
                                    <strong className={`text-${result.status === "balanced" ? "success" : result.status === "over" ? "info" : "danger"}`}>
                                        {result.difference > 0 ? "+" : ""}${result.difference?.toFixed(2)}
                                    </strong>
                                </div>
                                <div className="text-center mt-3">
                                    <span className={`badge bg-${result.status === "balanced" ? "success" : result.status === "over" ? "info" : "danger"} fs-6`}>
                                        {result.status === "balanced" ? "✓ Balanced" : result.status === "over" ? "↑ Over" : "↓ Short"}
                                    </span>
                                </div>
                                {result.notes && <p className="text-muted small mt-2">{result.notes}</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reconciliation;
