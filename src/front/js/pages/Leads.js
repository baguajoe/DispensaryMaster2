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
