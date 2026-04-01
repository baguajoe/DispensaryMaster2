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
