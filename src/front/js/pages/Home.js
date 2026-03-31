import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();
    const [scrollY, setScrollY] = useState(0);
    const [activeFeature, setActiveFeature] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        const interval = setInterval(() => setActiveFeature(f => (f + 1) % 6), 3000);
        return () => { window.removeEventListener('scroll', handleScroll); clearInterval(interval); };
    }, []);

    const FEATURES = [
        { icon: "🏪", title: "Point of Sale", desc: "Full POS with receipts, returns, offline mode, and reconciliation. No hardware required. Replaces Dutchie at half the price.", saving: "Save $500+/mo vs Dutchie" },
        { icon: "📦", title: "Inventory Management", desc: "Real-time stock tracking, batch numbers, Metrc sync, reorder alerts, warehouse management, and demand forecasting built in.", saving: "Save $200+/mo vs separate tools" },
        { icon: "👔", title: "HR & Payroll", desc: "Full employee management, payroll calculations, shift tracking, clock in/out, and time reports. Replaces Wurk and BambooHR completely.", saving: "Save $700+/mo vs Wurk + BambooHR" },
        { icon: "⚖️", title: "Compliance", desc: "State-specific templates for MA, CA, CO, IL, NY. Automatic Metrc reporting, document upload, license tracking, and gram limit checks.", saving: "Save $300+/mo vs compliance tools" },
        { icon: "💊", title: "Medical Module", desc: "Patient records, prescriptions, appointments, insurance billing, card expiry alerts. Full HIPAA-aware medical dispensary management.", saving: "Included — competitors charge extra" },
        { icon: "🌐", title: "LeafBridge Connect", desc: "Cannabis professional network built in. Post jobs free, assign training, manage onboarding, run performance reviews — LinkedIn for cannabis.", saving: "Save $150–600/job post vs LinkedIn" },
    ];

    const COMPETITORS = [
        { name: "Dutchie", price: "$500–1,000/mo", what: "POS only — no HR, no Payroll, no Inventory forecasting" },
        { name: "Flowhub", price: "$499+/mo", what: "POS only — no HR, no compliance, no medical" },
        { name: "Wurk", price: "$300–400/mo", what: "HR & Payroll only — no POS, no inventory" },
        { name: "BambooHR", price: "$250–500/mo", what: "HR only — no cannabis features" },
        { name: "Trainual", price: "$149+/mo", what: "Training only — no POS, no HR, no inventory" },
        { name: "BudphoriaPro", price: "$249–799/mo", what: "POS + Inventory + HR + Payroll + Compliance + Medical + Training + Grow + LeafBridge", highlight: true },
    ];

    const STATS = [
        { value: "469+", label: "API Endpoints" },
        { value: "66+", label: "App Pages" },
        { value: "9", label: "Modules" },
        { value: "50", label: "States Covered" },
    ];

    const MODULES = [
        { icon: "🏪", name: "POS System", items: ["Transactions", "Receipts", "Returns", "Offline Mode", "Reconciliation"] },
        { icon: "📦", name: "Inventory", items: ["Stock Tracking", "Batch Numbers", "Reorder Alerts", "Warehouse Mgmt", "Metrc Sync"] },
        { icon: "📋", name: "Orders & Cart", items: ["Order Management", "Cart System", "Discount Codes", "Customer Mgmt", "Invoicing"] },
        { icon: "⚖️", name: "Compliance", items: ["State Templates", "License Tracking", "Audit Reports", "Document Upload", "Gram Limits"] },
        { icon: "👔", name: "HR & Payroll", items: ["Employee Records", "Payroll Calc", "Shift Tracking", "Clock In/Out", "Time Reports"] },
        { icon: "💊", name: "Medical", items: ["Patient Records", "Prescriptions", "Appointments", "Insurance Billing", "Card Expiry Alerts"] },
        { icon: "🌿", name: "Grow Farms", items: ["Plant Batches", "Harvest Logs", "Pest Tracking", "Yield Prediction", "Environment Data"] },
        { icon: "🌱", name: "Seed Banks", items: ["Seed Inventory", "Strain Catalog", "Storage Conditions", "Batch Analytics", "Low Stock Alerts"] },
        { icon: "🌐", name: "LeafBridge", items: ["Job Board", "Hiring Network", "Training LMS", "Onboarding", "Performance Reviews"] },
    ];

    return (
        <div style={{ background: "#0a0800", color: "#e4ede6", fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", overflowX: "hidden" }}>

            {/* Google Fonts */}
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=Syne:wght@700;800;900&display=swap" rel="stylesheet" />

            {/* NAV */}
            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
                background: scrollY > 50 ? "rgba(10,8,0,0.95)" : "transparent",
                backdropFilter: scrollY > 50 ? "blur(20px)" : "none",
                borderBottom: scrollY > 50 ? "1px solid rgba(255,171,0,0.1)" : "none",
                padding: "1rem 2rem", display: "flex", justifyContent: "space-between",
                alignItems: "center", transition: "all 0.3s",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <span style={{ fontSize: "1.4rem" }}>🌿</span>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: "1.2rem", color: "#ffab00" }}>BudphoriaPro</span>
                </div>
                <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
                    {["Features", "Modules", "Pricing", "LeafBridge"].map((item, i) => (
                        <a key={i} href={`#${item.toLowerCase()}`} style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500, transition: "color 0.2s" }}
                            onMouseEnter={e => e.target.style.color = "#ffab00"}
                            onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.6)"}>{item}</a>
                    ))}
                    <button onClick={() => navigate("/login")} style={{ background: "transparent", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.15)", padding: "0.4rem 1rem", borderRadius: 8, cursor: "pointer", fontSize: "0.875rem" }}>Log In</button>
                    <button onClick={() => navigate("/register")} style={{ background: "#ffab00", color: "#0a0800", border: "none", padding: "0.4rem 1.25rem", borderRadius: 8, cursor: "pointer", fontSize: "0.875rem", fontWeight: 700 }}>Start Free</button>
                </div>
            </nav>

            {/* HERO */}
            <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "6rem 2rem 4rem", position: "relative", overflow: "hidden" }}>
                {/* Background glow */}
                <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: "radial-gradient(circle, rgba(255,171,0,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

                <div style={{ maxWidth: 900, position: "relative" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,171,0,0.08)", border: "1px solid rgba(255,171,0,0.2)", borderRadius: 100, padding: "0.35rem 1rem", marginBottom: "2rem", fontSize: "0.78rem", color: "#ffab00", fontWeight: 600 }}>
                        🌿 The Cannabis Industry Operating System
                    </div>
                    <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: "clamp(2.5rem, 7vw, 5.5rem)", lineHeight: 1.05, marginBottom: "1.5rem", letterSpacing: "-0.02em" }}>
                        One Platform.<br />
                        <span style={{ color: "#ffab00" }}>Every Tool</span> Your<br />
                        Dispensary Needs.
                    </h1>
                    <p style={{ fontSize: "1.15rem", color: "rgba(255,255,255,0.55)", maxWidth: 600, margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
                        POS, Inventory, Compliance, HR, Payroll, Medical Records, Grow Farms, and a Cannabis Professional Network — all in one platform starting at $249/mo.
                    </p>
                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                        <button onClick={() => navigate("/register")} style={{ background: "#ffab00", color: "#0a0800", border: "none", padding: "0.85rem 2.5rem", borderRadius: 10, fontWeight: 800, fontSize: "1rem", cursor: "pointer", boxShadow: "0 0 40px rgba(255,171,0,0.25)", transition: "all 0.2s" }}
                            onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 0 60px rgba(255,171,0,0.4)"; }}
                            onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "0 0 40px rgba(255,171,0,0.25)"; }}>
                            Start Free Trial
                        </button>
                        <button onClick={() => navigate("/dashboard")} style={{ background: "transparent", color: "#e4ede6", border: "1px solid rgba(255,255,255,0.15)", padding: "0.85rem 2rem", borderRadius: 10, fontWeight: 600, fontSize: "1rem", cursor: "pointer", transition: "all 0.2s" }}
                            onMouseEnter={e => e.target.style.borderColor = "#ffab00"}
                            onMouseLeave={e => e.target.style.borderColor = "rgba(255,255,255,0.15)"}>
                            View Dashboard →
                        </button>
                    </div>

                    {/* Stats */}
                    <div style={{ display: "flex", gap: "3rem", justifyContent: "center", marginTop: "4rem", flexWrap: "wrap" }}>
                        {STATS.map((s, i) => (
                            <div key={i} style={{ textAlign: "center" }}>
                                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: "2rem", color: "#ffab00" }}>{s.value}</div>
                                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* COMPETITOR COMPARISON */}
            <section style={{ padding: "5rem 2rem", background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ maxWidth: 900, margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", marginBottom: "0.75rem" }}>
                            Stop Paying for <span style={{ color: "#ffab00" }}>5 Different Tools</span>
                        </h2>
                        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "1rem" }}>BudphoriaPro replaces everything at a fraction of the cost</p>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                                    {["Platform", "What It Does", "Monthly Cost"].map(h => (
                                        <th key={h} style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {COMPETITORS.map((c, i) => (
                                    <tr key={i} style={{
                                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                                        background: c.highlight ? "rgba(105,240,174,0.05)" : "transparent",
                                        border: c.highlight ? "1px solid rgba(255,171,0,0.2)" : undefined,
                                    }}>
                                        <td style={{ padding: "1rem 1.25rem", fontWeight: c.highlight ? 800 : 600, color: c.highlight ? "#ffab00" : "#e4ede6", fontSize: c.highlight ? "1rem" : "0.9rem" }}>
                                            {c.highlight && "🌿 "}{c.name}
                                        </td>
                                        <td style={{ padding: "1rem 1.25rem", color: c.highlight ? "#e4ede6" : "rgba(255,255,255,0.5)", fontSize: "0.875rem", fontWeight: c.highlight ? 700 : 400 }}>{c.what}</td>
                                        <td style={{ padding: "1rem 1.25rem", fontWeight: 800, color: c.highlight ? "#ffab00" : "rgba(255,100,100,0.8)", fontSize: "0.9rem" }}>{c.price}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: "0.72rem", marginTop: "0.75rem" }}>Competitors combined cost: $1,300–2,400+/mo. BudphoriaPro: from $249/mo.</p>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section id="features" style={{ padding: "6rem 2rem" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
                        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", marginBottom: "0.75rem" }}>
                            Everything Built In. <span style={{ color: "#ffab00" }}>Nothing Missing.</span>
                        </h2>
                        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "1rem" }}>Every feature your dispensary needs, from day one</p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
                        {FEATURES.map((f, i) => (
                            <div key={i} onClick={() => setActiveFeature(i)} style={{
                                background: activeFeature === i ? "rgba(255,171,0,0.08)" : "rgba(255,255,255,0.03)",
                                border: `1px solid ${activeFeature === i ? "rgba(255,171,0,0.3)" : "rgba(255,255,255,0.07)"}`,
                                borderRadius: 16, padding: "1.5rem", cursor: "pointer", transition: "all 0.25s",
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,171,0,0.3)"; e.currentTarget.style.background = "rgba(255,171,0,0.06)"; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = activeFeature === i ? "rgba(255,171,0,0.3)" : "rgba(255,255,255,0.07)"; e.currentTarget.style.background = activeFeature === i ? "rgba(255,171,0,0.08)" : "rgba(255,255,255,0.03)"; }}>
                                <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{f.icon}</div>
                                <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.5rem", color: activeFeature === i ? "#ffab00" : "#e4ede6" }}>{f.title}</h3>
                                <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* HR + PAYROLL + INVENTORY CALLOUT */}
            <section style={{ padding: "5rem 2rem", background: "linear-gradient(135deg, rgba(255,171,0,0.04) 0%, rgba(79,195,247,0.04) 100%)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", marginBottom: "0.75rem" }}>
                            Built-In <span style={{ color: "#ffab00" }}>HR, Payroll & Inventory</span><br />No Extra Software Needed
                        </h2>
                        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "1rem" }}>Most dispensaries pay 3 separate vendors for these. BudphoriaPro includes all three.</p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
                        {/* HR & Payroll */}
                        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,171,0,0.2)", borderRadius: 20, padding: "2rem" }}>
                            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>👔</div>
                            <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: "1.2rem", color: "#ffab00", marginBottom: "0.5rem" }}>HR & Payroll</h3>
                            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.82rem", marginBottom: "1.25rem", lineHeight: 1.6 }}>
                                Replaces Wurk ($300–400/mo) and BambooHR ($250/mo). Full HR suite built for cannabis operations.
                            </p>
                            {["Employee records & profiles", "Payroll calculations", "Clock in / clock out", "Shift scheduling", "Overtime tracking", "Pay period reports", "Department management", "Role-based access control"].map((f, i) => (
                                <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.35rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>
                                    <span style={{ color: "#ffab00", fontWeight: 700, flexShrink: 0 }}>✓</span> {f}
                                </div>
                            ))}
                            <div style={{ marginTop: "1.25rem", background: "rgba(255,171,0,0.08)", border: "1px solid rgba(255,171,0,0.2)", borderRadius: 10, padding: "0.65rem 1rem", fontSize: "0.78rem", color: "#ffab00", fontWeight: 700 }}>
                                💰 Save $550–650/mo vs Wurk + BambooHR
                            </div>
                        </div>

                        {/* Inventory */}
                        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(79,195,247,0.2)", borderRadius: 20, padding: "2rem" }}>
                            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📦</div>
                            <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: "1.2rem", color: "#4fc3f7", marginBottom: "0.5rem" }}>Inventory Management</h3>
                            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.82rem", marginBottom: "1.25rem", lineHeight: 1.6 }}>
                                Real-time inventory across all locations. Auto-syncs with Metrc. No manual entry ever.
                            </p>
                            {["Real-time stock levels", "Batch number tracking", "Automatic reorder alerts", "Metrc sync built in", "Multi-location support", "Warehouse management", "Demand forecasting (AI)", "Stock transfer between stores", "Import from Excel/PDF", "THC/CBD content tracking"].map((f, i) => (
                                <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.35rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>
                                    <span style={{ color: "#4fc3f7", fontWeight: 700, flexShrink: 0 }}>✓</span> {f}
                                </div>
                            ))}
                            <div style={{ marginTop: "1.25rem", background: "rgba(79,195,247,0.08)", border: "1px solid rgba(79,195,247,0.2)", borderRadius: 10, padding: "0.65rem 1rem", fontSize: "0.78rem", color: "#4fc3f7", fontWeight: 700 }}>
                                💰 Included — competitors charge $200+/mo extra
                            </div>
                        </div>

                        {/* Training LMS */}
                        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,215,64,0.2)", borderRadius: 20, padding: "2rem" }}>
                            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🎓</div>
                            <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: "1.2rem", color: "#ffd740", marginBottom: "0.5rem" }}>Training LMS</h3>
                            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.82rem", marginBottom: "1.25rem", lineHeight: 1.6 }}>
                                Replaces Trainual ($149/mo). Upload videos, assign courses, track completions — all inside BudphoriaPro.
                            </p>
                            {["Video training upload (R2)", "Manager-assigned courses only", "Compliance training templates", "ID verification training", "Cash handling training", "State law training", "Quiz with 70% pass score", "Completion certificates", "Overdue alerts for managers", "Per-employee progress dashboard"].map((f, i) => (
                                <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.35rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>
                                    <span style={{ color: "#ffd740", fontWeight: 700, flexShrink: 0 }}>✓</span> {f}
                                </div>
                            ))}
                            <div style={{ marginTop: "1.25rem", background: "rgba(255,215,64,0.08)", border: "1px solid rgba(255,215,64,0.2)", borderRadius: 10, padding: "0.65rem 1rem", fontSize: "0.78rem", color: "#ffd740", fontWeight: 700 }}>
                                💰 Save $149/mo vs Trainual
                            </div>
                        </div>
                    </div>

                    {/* Total savings callout */}
                    <div style={{ marginTop: "2rem", background: "rgba(255,171,0,0.06)", border: "1px solid rgba(255,171,0,0.25)", borderRadius: 16, padding: "1.5rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                        <div>
                            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: "1.1rem", marginBottom: "0.25rem" }}>Total savings vs buying separately:</div>
                            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.82rem" }}>Dutchie + Wurk + BambooHR + Trainual + inventory tools = $1,200–2,100/mo</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: "2rem", color: "#ffab00" }}>Save $950–1,850/mo</div>
                            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)" }}>with BudphoriaPro Professional at $449/mo</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ALL MODULES */}
            <section id="modules" style={{ padding: "6rem 2rem", background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
                        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", marginBottom: "0.75rem" }}>
                            9 Complete <span style={{ color: "#ffab00" }}>Modules</span>
                        </h2>
                        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "1rem" }}>Built for dispensaries, grow operations, seed banks, and medical facilities</p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
                        {MODULES.map((m, i) => (
                            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "1.25rem", transition: "all 0.2s" }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,171,0,0.25)"; e.currentTarget.style.background = "rgba(255,171,0,0.04)"; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}>
                                <div style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>{m.icon}</div>
                                <h4 style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.65rem", color: "#ffab00" }}>{m.name}</h4>
                                {m.items.map((item, j) => (
                                    <div key={j} style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", padding: "0.2rem 0", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                        <span style={{ color: "#ffab00", fontSize: "0.6rem" }}>✓</span> {item}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* LEAFBRIDGE SECTION */}
            <section id="leafbridge" style={{ padding: "6rem 2rem" }}>
                <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
                    <div>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,171,0,0.08)", border: "1px solid rgba(255,171,0,0.2)", borderRadius: 100, padding: "0.35rem 1rem", marginBottom: "1.5rem", fontSize: "0.75rem", color: "#ffab00", fontWeight: 600 }}>
                            🌿 Included Free
                        </div>
                        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", marginBottom: "1rem" }}>
                            LeafBridge Connect — <span style={{ color: "#ffab00" }}>Cannabis LinkedIn</span>
                        </h2>
                        <p style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
                            The first professional network built exclusively for cannabis. Post jobs, find talent, assign training, manage onboarding, and run performance reviews — all inside BudphoriaPro.
                        </p>
                        {[
                            "Post jobs free — LinkedIn charges $150–600/post",
                            "Manager-assigned training with video upload",
                            "Professional profiles that travel between jobs",
                            "Cannabis salary data by role and state",
                            "Industry groups, events, and networking",
                        ].map((item, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", marginBottom: "0.5rem", fontSize: "0.875rem", color: "rgba(255,255,255,0.6)" }}>
                                <span style={{ color: "#ffab00", fontWeight: 700, flexShrink: 0 }}>✓</span> {item}
                            </div>
                        ))}
                    </div>
                    <div style={{ background: "rgba(105,240,174,0.05)", border: "1px solid rgba(255,171,0,0.15)", borderRadius: 20, padding: "2rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                            {["📰 Feed", "🤝 Network", "💬 Messages", "💼 Jobs", "🏢 Companies", "👥 Groups", "📅 Events", "💰 Salary", "🎓 Training", "📋 Onboarding", "⭐ Reviews", "📊 Labor Market", "🔔 Alerts", "👤 My Profile"].map((tab, i) => (
                                <div key={i} style={{ background: "rgba(255,171,0,0.08)", border: "1px solid rgba(255,171,0,0.15)", borderRadius: 8, padding: "0.5rem 0.75rem", fontSize: "0.75rem", color: "#ffab00", fontWeight: 600 }}>{tab}</div>
                            ))}
                        </div>
                        <p style={{ marginTop: "1rem", fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", textAlign: "center" }}>14 tabs · 95%+ LinkedIn feature parity · Cannabis-specific</p>
                    </div>
                </div>
            </section>

            {/* PRICING */}
            <section id="pricing" style={{ padding: "6rem 2rem", background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ maxWidth: 1000, margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
                        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", marginBottom: "0.75rem" }}>
                            Simple, <span style={{ color: "#ffab00" }}>Transparent</span> Pricing
                        </h2>
                        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "1rem" }}>No hidden fees. No per-transaction charges. Cancel anytime.</p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}>
                        {[
                            {
                                name: "Starter", price: "$249", period: "/mo",
                                desc: "Perfect for single-location dispensaries",
                                features: ["Full POS System", "Inventory Management", "Basic Compliance", "Customer Database", "Basic Analytics", "Email Support", "LeafBridge Connect", "Up to 5 staff"],
                                cta: "Start Free Trial", highlight: false,
                            },
                            {
                                name: "Professional", price: "$449", period: "/mo",
                                desc: "Most popular for growing dispensaries",
                                features: ["Everything in Starter", "Medical Module", "HR & Payroll", "Training LMS", "Advanced Compliance", "Metrc Integration", "Delivery Tracking", "Up to 20 staff", "Priority Support"],
                                cta: "Start Free Trial", highlight: true,
                            },
                            {
                                name: "Enterprise", price: "$799", period: "/mo",
                                desc: "For multi-location operations",
                                features: ["Everything in Pro", "Grow Farm Module", "Seed Bank Module", "Multi-Location", "API Access", "Custom Integrations", "Unlimited Staff", "Dedicated Support", "White Glove Onboarding"],
                                cta: "Contact Sales", highlight: false,
                            },
                        ].map((plan, i) => (
                            <div key={i} style={{
                                background: plan.highlight ? "rgba(105,240,174,0.07)" : "rgba(255,255,255,0.03)",
                                border: `1px solid ${plan.highlight ? "rgba(255,171,0,0.4)" : "rgba(255,255,255,0.08)"}`,
                                borderRadius: 20, padding: "2rem", position: "relative",
                                transform: plan.highlight ? "scale(1.03)" : "none",
                                boxShadow: plan.highlight ? "0 0 60px rgba(255,171,0,0.1)" : "none",
                            }}>
                                {plan.highlight && (
                                    <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#ffab00", color: "#0a0800", fontSize: "0.7rem", fontWeight: 800, padding: "3px 14px", borderRadius: 100, whiteSpace: "nowrap" }}>MOST POPULAR</div>
                                )}
                                <h3 style={{ fontWeight: 800, fontSize: "1rem", marginBottom: "0.25rem", color: plan.highlight ? "#ffab00" : "#e4ede6" }}>{plan.name}</h3>
                                <div style={{ display: "flex", alignItems: "baseline", gap: "0.2rem", marginBottom: "0.5rem" }}>
                                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: "2.5rem", color: "#e4ede6" }}>{plan.price}</span>
                                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>{plan.period}</span>
                                </div>
                                <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", marginBottom: "1.5rem" }}>{plan.desc}</p>
                                {plan.features.map((f, j) => (
                                    <div key={j} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.65)" }}>
                                        <span style={{ color: "#ffab00", fontWeight: 700, fontSize: "0.7rem" }}>✓</span> {f}
                                    </div>
                                ))}
                                <button onClick={() => navigate("/register")} style={{
                                    width: "100%", marginTop: "1.5rem",
                                    background: plan.highlight ? "#ffab00" : "transparent",
                                    color: plan.highlight ? "#0a0800" : "#ffab00",
                                    border: plan.highlight ? "none" : "1px solid rgba(255,171,0,0.4)",
                                    padding: "0.75rem", borderRadius: 10, fontWeight: 700,
                                    fontSize: "0.875rem", cursor: "pointer", transition: "all 0.2s",
                                }}
                                    onMouseEnter={e => { e.target.style.opacity = "0.85"; e.target.style.transform = "translateY(-1px)"; }}
                                    onMouseLeave={e => { e.target.style.opacity = "1"; e.target.style.transform = "none"; }}>
                                    {plan.cta}
                                </button>
                            </div>
                        ))}
                    </div>
                    <p style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: "0.78rem", marginTop: "2rem" }}>All plans include LeafBridge Connect, SSL, automatic backups, and 99.9% uptime SLA. 14-day free trial, no credit card required.</p>
                </div>
            </section>

            {/* CTA */}
            <section style={{ padding: "6rem 2rem", textAlign: "center" }}>
                <div style={{ maxWidth: 700, margin: "0 auto" }}>
                    <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: "clamp(2rem, 5vw, 3.5rem)", marginBottom: "1rem" }}>
                        Ready to Replace <span style={{ color: "#ffab00" }}>Five Tools</span><br />With One?
                    </h2>
                    <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "1rem", marginBottom: "2.5rem" }}>Join dispensaries across 24 legal states running on BudphoriaPro.</p>
                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                        <button onClick={() => navigate("/register")} style={{ background: "#ffab00", color: "#0a0800", border: "none", padding: "1rem 3rem", borderRadius: 12, fontWeight: 800, fontSize: "1rem", cursor: "pointer", boxShadow: "0 0 50px rgba(255,171,0,0.3)" }}>
                            Start Free 14-Day Trial
                        </button>
                        <button onClick={() => navigate("/dashboard")} style={{ background: "transparent", color: "#e4ede6", border: "1px solid rgba(255,255,255,0.15)", padding: "1rem 2rem", borderRadius: 12, fontWeight: 600, fontSize: "1rem", cursor: "pointer" }}>
                            Live Demo →
                        </button>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "2rem", textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <span style={{ fontSize: "1.1rem" }}>🌿</span>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, color: "#ffab00" }}>BudphoriaPro</span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.75rem" }}>© 2025 BudphoriaPro · Cannabis Industry Operating System · budphoriapro.com</p>
            </footer>
        </div>
    );
};

export default Home;
