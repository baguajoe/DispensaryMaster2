import React, { useState } from "react";

const REPORT_TYPES = ["Sales", "Inventory", "Customers", "Products", "Compliance", "Financial"];

const ReportsPage = () => {
    const [type, setType] = useState("Sales");
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem("token");

    const generate = async () => {
        setLoading(true);
        try {
            const r = await fetch(
                `${process.env.BACKEND_URL}/api/reports?type=${type.toLowerCase()}&start=${start}&end=${end}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const d = await r.json();
            setResults(d);
        } catch(e) {
            setResults({ error: "No data available for this period" });
        }
        setLoading(false);
    };

    const S = { padding: "1.5rem", background: "#0a0800", minHeight: "100vh" };

    return (
        <div style={S}>
            <div style={{ marginBottom: "2rem" }}>
                <h2 style={{ color: "#ffab00", fontWeight: 900, margin: 0 }}>📋 Reports</h2>
                <p style={{ color: "rgba(255,248,225,0.45)", margin: 0 }}>Generate and export dispensary reports</p>
            </div>

            {/* Report Builder */}
            <div style={{ background: "rgba(255,171,0,0.06)", border: "1px solid rgba(255,171,0,0.15)", borderRadius: 14, padding: "1.5rem", marginBottom: "1.5rem" }}>
                <h5 style={{ color: "#ffab00", fontWeight: 700, marginBottom: "1.25rem" }}>⚙️ Report Builder</h5>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                        <label style={{ color: "rgba(255,248,225,0.5)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "0.35rem" }}>Report Type</label>
                        <select value={type} onChange={e => setType(e.target.value)} className="form-select">
                            {REPORT_TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ color: "rgba(255,248,225,0.5)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "0.35rem" }}>Start Date</label>
                        <input type="date" value={start} onChange={e => setStart(e.target.value)} className="form-control" />
                    </div>
                    <div>
                        <label style={{ color: "rgba(255,248,225,0.5)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "0.35rem" }}>End Date</label>
                        <input type="date" value={end} onChange={e => setEnd(e.target.value)} className="form-control" />
                    </div>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button onClick={generate} disabled={loading} style={{ background: "#ffab00", color: "#0a0800", border: "none", padding: "0.5rem 1.5rem", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                        {loading ? "Generating..." : "📊 Generate Report"}
                    </button>
                    <button style={{ background: "transparent", color: "#ffab00", border: "1px solid rgba(255,171,0,0.3)", padding: "0.5rem 1.25rem", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
                        ⬇️ Export CSV
                    </button>
                    <button style={{ background: "transparent", color: "#ffab00", border: "1px solid rgba(255,171,0,0.3)", padding: "0.5rem 1.25rem", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
                        📄 Export PDF
                    </button>
                </div>
            </div>

            {/* Quick Report Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
                {[
                    { name: "Daily Sales", icon: "💰", desc: "Today's revenue & transactions" },
                    { name: "Weekly Inventory", icon: "📦", desc: "Stock levels & movements" },
                    { name: "Top Products", icon: "🌿", desc: "Best selling products" },
                    { name: "Customer Report", icon: "👥", desc: "New & returning customers" },
                    { name: "Compliance Log", icon: "⚖️", desc: "Regulatory compliance data" },
                    { name: "Tax Report", icon: "🧾", desc: "Sales tax summary" },
                ].map((r, i) => (
                    <div key={i} onClick={() => { setType(r.name.split(" ")[1] || r.name.split(" ")[0]); generate(); }}
                        style={{ background: "rgba(255,171,0,0.05)", border: "1px solid rgba(255,171,0,0.12)", borderRadius: 12, padding: "1rem", cursor: "pointer", transition: "all 0.2s" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,171,0,0.4)"; e.currentTarget.style.background = "rgba(255,171,0,0.09)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,171,0,0.12)"; e.currentTarget.style.background = "rgba(255,171,0,0.05)"; }}>
                        <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{r.icon}</div>
                        <div style={{ color: "#ffab00", fontWeight: 700, fontSize: "0.85rem" }}>{r.name}</div>
                        <div style={{ color: "rgba(255,248,225,0.4)", fontSize: "0.75rem" }}>{r.desc}</div>
                    </div>
                ))}
            </div>

            {/* Results */}
            {results && (
                <div style={{ background: "rgba(255,171,0,0.06)", border: "1px solid rgba(255,171,0,0.15)", borderRadius: 14, padding: "1.5rem" }}>
                    <h5 style={{ color: "#ffab00", fontWeight: 700, marginBottom: "1rem" }}>📈 {type} Report Results</h5>
                    {results.error ? (
                        <p style={{ color: "rgba(255,248,225,0.4)" }}>{results.error}</p>
                    ) : (
                        <pre style={{ color: "#fff8e1", fontSize: "0.8rem", overflow: "auto" }}>{JSON.stringify(results, null, 2)}</pre>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReportsPage;
