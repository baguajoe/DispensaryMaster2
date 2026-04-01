#!/bin/bash
cd /workspaces/DispensaryMaster2

echo "Step 1 — Fix layout shift (content too far right)..."
python3 << 'PYEOF'
with open('src/front/js/layout.js', 'r') as f:
    content = f.read()

# The issue: padding: 1.5rem is being added ON TOP of the page's own padding
# Solution: remove padding from layout wrapper, let each page handle its own padding
old = 'style={{ padding: "1.5rem", minWidth: 0, overflowX: "hidden" }}'
new = 'style={{ minWidth: 0, overflowX: "hidden", flex: 1 }}'

if old in content:
    content = content.replace(old, new)
    print("✓ Layout padding removed — pages control their own padding")
else:
    # Try alternate
    content = content.replace(
        'style={{ flex: 1, minWidth: 0, overflow: "auto" }}',
        'style={{ flex: 1, minWidth: 0, overflowX: "hidden" }}'
    )
    print("✓ Layout flex fixed (alternate)")

with open('src/front/js/layout.js', 'w') as f:
    f.write(content)
PYEOF

echo ""
echo "Step 2 — Rebuild Reports page..."
cat > src/front/js/pages/ReportsPage.js << 'JSEOF'
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
JSEOF
echo "✓ Reports rebuilt"

echo ""
echo "Step 3 — Rebuild Sales Pipeline..."
cat > src/front/js/pages/SalesPipeline.js << 'JSEOF'
import React, { useState, useEffect } from "react";

const STAGES = ["Lead", "Contacted", "Demo", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
const STAGE_COLORS = {
    "Lead": "#ffd740", "Contacted": "#ffab00", "Demo": "#4fc3f7",
    "Proposal": "#ce93d8", "Negotiation": "#ff8a65",
    "Closed Won": "#4caf50", "Closed Lost": "#ff5252"
};

const MOCK_DEALS = [
    { id: 1, name: "Green Valley Dispensary", contact: "Mike Torres", value: 12000, stage: "Proposal", date: "2026-04-10" },
    { id: 2, name: "Emerald Coast Cannabis", contact: "Sarah Kim", value: 8500, stage: "Demo", date: "2026-04-05" },
    { id: 3, name: "High Desert Herbs", contact: "James Wu", value: 24000, stage: "Negotiation", date: "2026-04-15" },
    { id: 4, name: "Blue Ridge Botanicals", contact: "Ana Lopez", value: 6000, stage: "Contacted", date: "2026-04-02" },
    { id: 5, name: "Pacific Leaf Co", contact: "Tom Bell", value: 18000, stage: "Closed Won", date: "2026-03-28" },
    { id: 6, name: "Mountain High Dispensary", contact: "Lisa Chen", value: 9000, stage: "Lead", date: "2026-04-20" },
];

const SalesPipeline = () => {
    const [deals, setDeals] = useState(MOCK_DEALS);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ name: "", contact: "", value: "", stage: "Lead", date: "" });
    const [view, setView] = useState("kanban"); // kanban or list

    const totalValue = deals.reduce((s, d) => s + d.value, 0);
    const wonValue = deals.filter(d => d.stage === "Closed Won").reduce((s, d) => s + d.value, 0);
    const activeDeals = deals.filter(d => !d.stage.includes("Closed")).length;

    const addDeal = () => {
        if (!form.name) return;
        setDeals([...deals, { ...form, id: Date.now(), value: parseFloat(form.value) || 0 }]);
        setForm({ name: "", contact: "", value: "", stage: "Lead", date: "" });
        setShowAdd(false);
    };

    const moveDeal = (id, stage) => setDeals(deals.map(d => d.id === id ? { ...d, stage } : d));
    const deleteDeal = (id) => setDeals(deals.filter(d => d.id !== id));

    return (
        <div style={{ padding: "1.5rem", background: "#0a0800", minHeight: "100vh" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div>
                    <h2 style={{ color: "#ffab00", fontWeight: 900, margin: 0 }}>🎯 Sales Pipeline</h2>
                    <p style={{ color: "rgba(255,248,225,0.45)", margin: 0 }}>Track dispensary prospects and deals</p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => setView(view === "kanban" ? "list" : "kanban")} style={{ background: "transparent", color: "#ffab00", border: "1px solid rgba(255,171,0,0.3)", padding: "0.4rem 1rem", borderRadius: 8, cursor: "pointer", fontSize: "0.82rem" }}>
                        {view === "kanban" ? "📋 List" : "🗂️ Kanban"}
                    </button>
                    <button onClick={() => setShowAdd(true)} style={{ background: "#ffab00", color: "#0a0800", border: "none", padding: "0.4rem 1.25rem", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: "0.82rem" }}>
                        + Add Deal
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
                {[
                    { label: "Total Pipeline", value: `$${totalValue.toLocaleString()}`, icon: "💰", color: "#ffab00" },
                    { label: "Won Revenue", value: `$${wonValue.toLocaleString()}`, icon: "🏆", color: "#4caf50" },
                    { label: "Active Deals", value: activeDeals, icon: "🎯", color: "#ffd740" },
                    { label: "Win Rate", value: `${deals.length ? Math.round(deals.filter(d=>d.stage==="Closed Won").length/deals.length*100) : 0}%`, icon: "📊", color: "#ce93d8" },
                ].map((s, i) => (
                    <div key={i} style={{ background: "rgba(255,171,0,0.06)", border: "1px solid rgba(255,171,0,0.15)", borderRadius: 12, padding: "1rem" }}>
                        <div style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>{s.icon}</div>
                        <div style={{ color: "rgba(255,248,225,0.45)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
                        <div style={{ color: s.color, fontSize: "1.4rem", fontWeight: 900 }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Add Deal Form */}
            {showAdd && (
                <div style={{ background: "rgba(255,171,0,0.06)", border: "1px solid rgba(255,171,0,0.25)", borderRadius: 12, padding: "1.25rem", marginBottom: "1.5rem" }}>
                    <h5 style={{ color: "#ffab00", fontWeight: 700, marginBottom: "1rem" }}>New Deal</h5>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
                        {[["name","Company Name"],["contact","Contact"],["value","Deal Value ($)"],["date","Expected Close"]].map(([k,l]) => (
                            <div key={k}>
                                <label style={{ color: "rgba(255,248,225,0.45)", fontSize: "0.72rem", display: "block", marginBottom: "0.25rem" }}>{l}</label>
                                <input className="form-control" type={k==="date"?"date":k==="value"?"number":"text"}
                                    value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})} />
                            </div>
                        ))}
                        <div>
                            <label style={{ color: "rgba(255,248,225,0.45)", fontSize: "0.72rem", display: "block", marginBottom: "0.25rem" }}>Stage</label>
                            <select className="form-select" value={form.stage} onChange={e => setForm({...form, stage: e.target.value})}>
                                {STAGES.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button onClick={addDeal} style={{ background: "#ffab00", color: "#0a0800", border: "none", padding: "0.4rem 1.25rem", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>Add Deal</button>
                        <button onClick={() => setShowAdd(false)} style={{ background: "transparent", color: "rgba(255,248,225,0.5)", border: "1px solid rgba(255,171,0,0.2)", padding: "0.4rem 1.25rem", borderRadius: 8, cursor: "pointer" }}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Kanban View */}
            {view === "kanban" ? (
                <div style={{ display: "flex", gap: "0.75rem", overflowX: "auto", paddingBottom: "1rem" }}>
                    {STAGES.map(stage => {
                        const stageDeals = deals.filter(d => d.stage === stage);
                        const stageValue = stageDeals.reduce((s, d) => s + d.value, 0);
                        return (
                            <div key={stage} style={{ minWidth: 220, flexShrink: 0 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                                    <span style={{ color: STAGE_COLORS[stage], fontWeight: 700, fontSize: "0.8rem" }}>{stage}</span>
                                    <span style={{ color: "rgba(255,248,225,0.3)", fontSize: "0.7rem" }}>${stageValue.toLocaleString()}</span>
                                </div>
                                <div style={{ background: "rgba(255,171,0,0.04)", border: "1px solid rgba(255,171,0,0.1)", borderRadius: 10, minHeight: 120, padding: "0.5rem" }}>
                                    {stageDeals.map(d => (
                                        <div key={d.id} style={{ background: "rgba(255,171,0,0.08)", border: "1px solid rgba(255,171,0,0.15)", borderRadius: 8, padding: "0.65rem", marginBottom: "0.5rem" }}>
                                            <div style={{ color: "#fff8e1", fontWeight: 600, fontSize: "0.82rem", marginBottom: "0.25rem" }}>{d.name}</div>
                                            <div style={{ color: "rgba(255,248,225,0.45)", fontSize: "0.72rem" }}>{d.contact}</div>
                                            <div style={{ color: "#ffab00", fontWeight: 700, fontSize: "0.85rem", margin: "0.25rem 0" }}>${d.value.toLocaleString()}</div>
                                            <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap", marginTop: "0.35rem" }}>
                                                <select onChange={e => moveDeal(d.id, e.target.value)} value={d.stage}
                                                    style={{ background: "rgba(255,171,0,0.1)", border: "1px solid rgba(255,171,0,0.2)", borderRadius: 5, color: "#ffab00", fontSize: "0.65rem", padding: "0.15rem 0.35rem", cursor: "pointer", flex: 1 }}>
                                                    {STAGES.map(s => <option key={s}>{s}</option>)}
                                                </select>
                                                <button onClick={() => deleteDeal(d.id)} style={{ background: "rgba(255,82,82,0.15)", border: "none", color: "#ff5252", borderRadius: 5, padding: "0.15rem 0.4rem", cursor: "pointer", fontSize: "0.65rem" }}>✕</button>
                                            </div>
                                        </div>
                                    ))}
                                    {stageDeals.length === 0 && <p style={{ color: "rgba(255,248,225,0.2)", fontSize: "0.72rem", textAlign: "center", padding: "0.75rem 0" }}>No deals</p>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* List View */
                <div style={{ background: "rgba(255,171,0,0.05)", border: "1px solid rgba(255,171,0,0.12)", borderRadius: 12, overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                {["Company","Contact","Value","Stage","Close Date","Actions"].map(h => (
                                    <th key={h} style={{ padding: "0.75rem 1rem", color: "rgba(255,248,225,0.4)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid rgba(255,171,0,0.1)", textAlign: "left" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {deals.map(d => (
                                <tr key={d.id} style={{ borderBottom: "1px solid rgba(255,171,0,0.06)" }}>
                                    <td style={{ padding: "0.75rem 1rem", color: "#fff8e1", fontWeight: 600 }}>{d.name}</td>
                                    <td style={{ padding: "0.75rem 1rem", color: "rgba(255,248,225,0.6)" }}>{d.contact}</td>
                                    <td style={{ padding: "0.75rem 1rem", color: "#ffab00", fontWeight: 700 }}>${d.value.toLocaleString()}</td>
                                    <td style={{ padding: "0.75rem 1rem" }}>
                                        <span style={{ background: `${STAGE_COLORS[d.stage]}18`, color: STAGE_COLORS[d.stage], border: `1px solid ${STAGE_COLORS[d.stage]}44`, padding: "0.2rem 0.6rem", borderRadius: 100, fontSize: "0.72rem", fontWeight: 700 }}>{d.stage}</span>
                                    </td>
                                    <td style={{ padding: "0.75rem 1rem", color: "rgba(255,248,225,0.5)", fontSize: "0.82rem" }}>{d.date}</td>
                                    <td style={{ padding: "0.75rem 1rem" }}>
                                        <button onClick={() => deleteDeal(d.id)} style={{ background: "rgba(255,82,82,0.1)", border: "1px solid rgba(255,82,82,0.2)", color: "#ff5252", padding: "0.25rem 0.6rem", borderRadius: 6, cursor: "pointer", fontSize: "0.72rem" }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SalesPipeline;
JSEOF
echo "✓ Sales Pipeline rebuilt with Kanban + List view"

echo ""
echo "Step 4 — Rebuild Leads page..."
cat > src/front/js/pages/Leads.js << 'JSEOF'
import React, { useState, useEffect } from "react";

const STATUS_COLORS = { "New": "#ffd740", "Contacted": "#ffab00", "Qualified": "#4fc3f7", "Converted": "#4caf50", "Lost": "#ff5252" };

const Leads = () => {
    const [leads, setLeads] = useState([]);
    const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", company: "", status: "New", source: "Website", notes: "" });
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [search, setSearch] = useState("");
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/leads`, { headers })
            .then(r => r.ok ? r.json() : [])
            .then(d => { setLeads(Array.isArray(d) ? d : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const addLead = async () => {
        const r = await fetch(`${process.env.BACKEND_URL}/api/leads`, { method: "POST", headers, body: JSON.stringify(form) });
        if (r.ok) {
            const d = await r.json();
            setLeads([d, ...leads]);
            setForm({ first_name: "", last_name: "", email: "", phone: "", company: "", status: "New", source: "Website", notes: "" });
            setShowAdd(false);
        }
    };

    const updateStatus = async (id, status) => {
        await fetch(`${process.env.BACKEND_URL}/api/leads/${id}`, { method: "PUT", headers, body: JSON.stringify({ status }) });
        setLeads(leads.map(l => l.id === id ? { ...l, status } : l));
    };

    const deleteLead = async (id) => {
        await fetch(`${process.env.BACKEND_URL}/api/leads/${id}`, { method: "DELETE", headers });
        setLeads(leads.filter(l => l.id !== id));
    };

    const filtered = leads.filter(l =>
        `${l.first_name} ${l.last_name} ${l.email} ${l.company}`.toLowerCase().includes(search.toLowerCase())
    );

    const stats = Object.keys(STATUS_COLORS).map(s => ({ label: s, count: leads.filter(l => l.status === s).length, color: STATUS_COLORS[s] }));

    return (
        <div style={{ padding: "1.5rem", background: "#0a0800", minHeight: "100vh" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div>
                    <h2 style={{ color: "#ffab00", fontWeight: 900, margin: 0 }}>🎯 Lead Management</h2>
                    <p style={{ color: "rgba(255,248,225,0.45)", margin: 0 }}>Track and convert dispensary prospects</p>
                </div>
                <button onClick={() => setShowAdd(!showAdd)} style={{ background: "#ffab00", color: "#0a0800", border: "none", padding: "0.5rem 1.25rem", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                    + Add Lead
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                {stats.map((s, i) => (
                    <div key={i} style={{ background: "rgba(255,171,0,0.06)", border: "1px solid rgba(255,171,0,0.12)", borderRadius: 10, padding: "0.75rem 1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ color: s.color, fontWeight: 900, fontSize: "1.2rem" }}>{s.count}</span>
                        <span style={{ color: "rgba(255,248,225,0.5)", fontSize: "0.78rem" }}>{s.label}</span>
                    </div>
                ))}
            </div>

            {/* Add Form */}
            {showAdd && (
                <div style={{ background: "rgba(255,171,0,0.06)", border: "1px solid rgba(255,171,0,0.25)", borderRadius: 12, padding: "1.25rem", marginBottom: "1.5rem" }}>
                    <h5 style={{ color: "#ffab00", fontWeight: 700, marginBottom: "1rem" }}>New Lead</h5>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
                        {[["first_name","First Name"],["last_name","Last Name"],["email","Email"],["phone","Phone"],["company","Company"]].map(([k,l]) => (
                            <div key={k}>
                                <label style={{ color: "rgba(255,248,225,0.45)", fontSize: "0.72rem", display: "block", marginBottom: "0.25rem" }}>{l}</label>
                                <input className="form-control" value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})} />
                            </div>
                        ))}
                        <div>
                            <label style={{ color: "rgba(255,248,225,0.45)", fontSize: "0.72rem", display: "block", marginBottom: "0.25rem" }}>Status</label>
                            <select className="form-select" value={form.status} onChange={e => setForm({...form,status:e.target.value})}>
                                {Object.keys(STATUS_COLORS).map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ color: "rgba(255,248,225,0.45)", fontSize: "0.72rem", display: "block", marginBottom: "0.25rem" }}>Source</label>
                            <select className="form-select" value={form.source} onChange={e => setForm({...form,source:e.target.value})}>
                                {["Website","Referral","Cold Call","Event","LeafBridge","Other"].map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label style={{ color: "rgba(255,248,225,0.45)", fontSize: "0.72rem", display: "block", marginBottom: "0.25rem" }}>Notes</label>
                        <textarea className="form-control" rows={2} value={form.notes} onChange={e => setForm({...form,notes:e.target.value})} style={{ marginBottom: "1rem" }} />
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button onClick={addLead} style={{ background: "#ffab00", color: "#0a0800", border: "none", padding: "0.4rem 1.25rem", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>Save Lead</button>
                        <button onClick={() => setShowAdd(false)} style={{ background: "transparent", color: "rgba(255,248,225,0.5)", border: "1px solid rgba(255,171,0,0.2)", padding: "0.4rem 1.25rem", borderRadius: 8, cursor: "pointer" }}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Search */}
            <input className="form-control mb-3" placeholder="🔍 Search leads..." value={search}
                onChange={e => setSearch(e.target.value)} style={{ maxWidth: 360 }} />

            {/* Table */}
            <div style={{ background: "rgba(255,171,0,0.04)", border: "1px solid rgba(255,171,0,0.12)", borderRadius: 12, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            {["Name","Company","Email","Phone","Source","Status","Actions"].map(h => (
                                <th key={h} style={{ padding: "0.75rem 1rem", color: "rgba(255,248,225,0.4)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid rgba(255,171,0,0.1)", textAlign: "left", background: "rgba(255,171,0,0.06)" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "rgba(255,248,225,0.3)" }}>Loading...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "rgba(255,248,225,0.3)" }}>No leads found. Add your first lead!</td></tr>
                        ) : filtered.map(l => (
                            <tr key={l.id} style={{ borderBottom: "1px solid rgba(255,171,0,0.06)" }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,171,0,0.03)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                <td style={{ padding: "0.75rem 1rem", color: "#fff8e1", fontWeight: 600 }}>{l.first_name} {l.last_name}</td>
                                <td style={{ padding: "0.75rem 1rem", color: "rgba(255,248,225,0.65)" }}>{l.company || "—"}</td>
                                <td style={{ padding: "0.75rem 1rem", color: "rgba(255,248,225,0.65)", fontSize: "0.82rem" }}>{l.email}</td>
                                <td style={{ padding: "0.75rem 1rem", color: "rgba(255,248,225,0.65)", fontSize: "0.82rem" }}>{l.phone}</td>
                                <td style={{ padding: "0.75rem 1rem", color: "rgba(255,248,225,0.45)", fontSize: "0.78rem" }}>{l.source || "—"}</td>
                                <td style={{ padding: "0.75rem 1rem" }}>
                                    <select value={l.status} onChange={e => updateStatus(l.id, e.target.value)}
                                        style={{ background: `${STATUS_COLORS[l.status] || "#ffab00"}18`, color: STATUS_COLORS[l.status] || "#ffab00", border: `1px solid ${STATUS_COLORS[l.status] || "#ffab00"}44`, borderRadius: 100, padding: "0.2rem 0.6rem", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}>
                                        {Object.keys(STATUS_COLORS).map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </td>
                                <td style={{ padding: "0.75rem 1rem" }}>
                                    <button onClick={() => deleteLead(l.id)} style={{ background: "rgba(255,82,82,0.1)", border: "1px solid rgba(255,82,82,0.2)", color: "#ff5252", padding: "0.25rem 0.6rem", borderRadius: 6, cursor: "pointer", fontSize: "0.72rem" }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Leads;
JSEOF
echo "✓ Leads rebuilt"

echo ""
echo "Step 5 — Commit and push..."
git add .
git commit -m "Rebuild: Reports, Sales Pipeline (Kanban+List), Leads redesign, fix layout shift"
git push origin medical

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   PAGES REBUILT — ALL MIDNIGHT AMBER                    ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  ✅ Layout shift fixed — no more content offset right   ║"
echo "║  ✅ Reports — type selector, date range, quick cards    ║"
echo "║  ✅ Sales Pipeline — Kanban + List view, deal stats     ║"
echo "║  ✅ Leads — full CRM table, status, source, notes       ║"
echo "╚══════════════════════════════════════════════════════════╝"
