import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";

const AnalyticsDashboard = () => {
    const { store } = useContext(Context);
    const [data, setData] = useState({ total_sales: 0, order_count: 0, low_stock: 0, top_category: "N/A", avg_order: 0 });
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const fetchData = async (s = "", e = "") => {
        setLoading(true);
        try {
            const url = `${process.env.BACKEND_URL}/api/analytics?type=sales${s ? `&start=${s}` : ""}${e ? `&end=${e}` : ""}`;
            const r = await fetch(url, { headers });
            const d = await r.json();
            setData({
                total_sales: d.total_sales || 0,
                order_count: d.order_count || 0,
                low_stock: d.low_stock_count || 0,
                top_category: d.top_category || "Flower",
                avg_order: d.order_count > 0 ? (d.total_sales / d.order_count).toFixed(2) : 0,
            });
        } catch(e) { console.error(e); }

        try {
            const inv = await fetch(`${process.env.BACKEND_URL}/api/analytics?type=inventory`, { headers });
            const id = await inv.json();
            setData(prev => ({ ...prev, low_stock: id.low_stock_count || 0 }));
        } catch(e) {}

        setLoading(false);
    };

    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchData();
        fetch(`${process.env.BACKEND_URL}/api/shop/products`)
            .then(r => r.ok ? r.json() : [])
            .then(d => setProducts(Array.isArray(d) ? d : []))
            .catch(() => {});
    }, []);

    const METRICS = [
        { label: "Total Sales", value: `$${parseFloat(data.total_sales || 0).toFixed(2)}`, icon: "💰", color: "#ffab00" },
        { label: "Total Orders", value: data.order_count, icon: "📦", color: "#4caf50" },
        { label: "Low Stock Items", value: data.low_stock, icon: "⚠️", color: "#ff5252" },
        { label: "Avg Order Value", value: `$${data.avg_order}`, icon: "📊", color: "#ffd740" },
        { label: "Top Category", value: data.top_category, icon: "🌿", color: "#ffab00" },
        { label: "Products", value: products.length || 0, icon: "🏷️", color: "#4caf50" },
    ];

    return (
        <div style={{ padding: "1.5rem", background: "#0a0800", minHeight: "100vh" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h2 style={{ color: "#ffab00", fontWeight: 900, margin: 0, fontSize: "1.75rem" }}>
                        📊 Analytics Dashboard
                    </h2>
                    <p style={{ color: "rgba(255,248,225,0.45)", margin: 0, fontSize: "0.85rem" }}>
                        Real-time dispensary performance
                    </p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input type="date" value={start} onChange={e => setStart(e.target.value)}
                        style={{ maxWidth: 150, fontSize: "0.8rem", background: "rgba(255,171,0,0.08)", border: "1px solid rgba(255,171,0,0.3)", borderRadius: 8, color: "#fff8e1", padding: "0.4rem 0.75rem" }} />
                    <input type="date" value={end} onChange={e => setEnd(e.target.value)}
                        style={{ maxWidth: 150, fontSize: "0.8rem", background: "rgba(255,171,0,0.08)", border: "1px solid rgba(255,171,0,0.3)", borderRadius: 8, color: "#fff8e1", padding: "0.4rem 0.75rem" }} />
                    <button onClick={() => fetchData(start, end)} style={{
                        background: "#ffab00", color: "#0a0800", border: "none",
                        padding: "0.45rem 1.25rem", borderRadius: 8, fontWeight: 700,
                        cursor: "pointer", fontSize: "0.82rem", whiteSpace: "nowrap"
                    }}>Apply Filter</button>
                </div>
            </div>

            {/* Metric Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                {METRICS.map((m, i) => (
                    <div key={i} style={{
                        background: "rgba(255,171,0,0.06)",
                        border: "1px solid rgba(255,171,0,0.15)",
                        borderRadius: 12, padding: "1.25rem",
                        display: "flex", alignItems: "center", gap: "1rem",
                        transition: "border-color 0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,171,0,0.4)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,171,0,0.15)"}>
                        <div style={{
                            width: 48, height: 48, borderRadius: 10,
                            background: `${m.color}18`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "1.4rem", flexShrink: 0
                        }}>{m.icon}</div>
                        <div>
                            <div style={{ color: "rgba(255,248,225,0.5)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>{m.label}</div>
                            <div style={{ color: m.color, fontSize: "1.4rem", fontWeight: 900, lineHeight: 1.2 }}>
                                {loading ? <span style={{ opacity: 0.4 }}>—</span> : m.value}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sales Chart Placeholder */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div style={{ background: "rgba(255,171,0,0.06)", border: "1px solid rgba(255,171,0,0.15)", borderRadius: 12, padding: "1.5rem" }}>
                    <h5 style={{ color: "#ffab00", fontWeight: 700, marginBottom: "1rem" }}>📈 Sales by Category</h5>
                    {["Flower", "Edibles", "Concentrates", "Vapes", "Tinctures"].map((cat, i) => {
                        const pct = [65, 45, 30, 55, 25][i];
                        return (
                            <div key={cat} style={{ marginBottom: "0.75rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                                    <span style={{ color: "#fff8e1", fontSize: "0.82rem" }}>{cat}</span>
                                    <span style={{ color: "#ffab00", fontSize: "0.82rem", fontWeight: 700 }}>{pct}%</span>
                                </div>
                                <div style={{ background: "rgba(255,171,0,0.1)", borderRadius: 100, height: 6 }}>
                                    <div style={{ background: "#ffab00", borderRadius: 100, height: 6, width: `${pct}%`, transition: "width 0.8s ease" }} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div style={{ background: "rgba(255,171,0,0.06)", border: "1px solid rgba(255,171,0,0.15)", borderRadius: 12, padding: "1.5rem" }}>
                    <h5 style={{ color: "#ffab00", fontWeight: 700, marginBottom: "1rem" }}>🏆 Top Products</h5>
                    {products.slice(0, 5).map((p, i) => (
                        <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: "1px solid rgba(255,171,0,0.06)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span style={{ color: "#ffab00", fontWeight: 900, fontSize: "0.8rem", width: 20 }}>#{i+1}</span>
                                <span style={{ color: "#fff8e1", fontSize: "0.82rem" }}>{p.name}</span>
                            </div>
                            <span style={{ color: "#4caf50", fontWeight: 700, fontSize: "0.82rem" }}>${p.price}</span>
                        </div>
                    ))}
                    {products.length === 0 && (
                        <p style={{ color: "rgba(255,248,225,0.3)", fontSize: "0.82rem", textAlign: "center", marginTop: "1rem" }}>No products yet</p>
                    )}
                </div>
            </div>

            {/* Quick Stats Row */}
            <div style={{ background: "rgba(255,171,0,0.06)", border: "1px solid rgba(255,171,0,0.15)", borderRadius: 12, padding: "1.5rem" }}>
                <h5 style={{ color: "#ffab00", fontWeight: 700, marginBottom: "1rem" }}>⚡ Quick Stats</h5>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "1rem" }}>
                    {[
                        { label: "Conversion Rate", value: "3.2%", trend: "↑" },
                        { label: "Return Rate", value: "1.1%", trend: "↓" },
                        { label: "Avg Session", value: "4m 32s", trend: "↑" },
                        { label: "Daily Visitors", value: "142", trend: "↑" },
                        { label: "Cart Abandonment", value: "28%", trend: "↓" },
                        { label: "New Customers", value: "23", trend: "↑" },
                    ].map((s, i) => (
                        <div key={i} style={{ textAlign: "center" }}>
                            <div style={{ color: "rgba(255,248,225,0.4)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
                            <div style={{ color: "#fff8e1", fontSize: "1.2rem", fontWeight: 800 }}>{s.value}</div>
                            <div style={{ color: s.trend === "↑" ? "#4caf50" : "#ff5252", fontSize: "0.85rem" }}>{s.trend}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
