#!/bin/bash
# ============================================================
# BudphoriaPro — Full Rename + Homepage + Pricing Page
# Run from: /workspaces/DispensaryMaster2
# ============================================================
cd /workspaces/DispensaryMaster2

echo "Step 1 — Renaming DispenseMaster → BudphoriaPro everywhere..."
python3 << 'PYEOF'
import os, glob

# Files to rename brand in
targets = [
    'src/front/js/component/Sidebar.js',
    'src/front/js/component/Navbar.js',
    'src/front/js/layout.js',
    'src/front/js/pages/Home.js',
    'src/app.py',
    'src/api/admin.py',
    'src/api/routes.py',
    'package.json',
]

replacements = [
    ('DispenseMaster2', 'BudphoriaPro'),
    ('DispenseMaster', 'BudphoriaPro'),
    ('Dispense Master', 'BudphoriaPro'),
    ('dispenseMaster', 'budphoriaPro'),
    ('dispensemaster', 'budphoriapro'),
    ('4Geeks Admin', 'BudphoriaPro Admin'),
]

fixed = []
for filepath in targets:
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r') as f:
        content = f.read()
    original = content
    for old, new in replacements:
        content = content.replace(old, new)
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        fixed.append(filepath)

print(f"✓ Renamed in {len(fixed)} files:")
for f in fixed:
    print(f"  {f}")
PYEOF

echo ""
echo "Step 2 — Building BudphoriaPro Homepage..."
cat > src/front/js/pages/Home.js << 'JSEOF'
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
        { icon: "🏪", title: "Point of Sale", desc: "Full POS with receipts, returns, offline mode, and reconciliation. No hardware required." },
        { icon: "📦", title: "Inventory", desc: "Real-time stock tracking, batch numbers, reorder alerts, and Metrc sync built in." },
        { icon: "⚖️", title: "Compliance", desc: "State-specific templates for MA, CA, CO, IL, NY. Automatic Metrc reporting." },
        { icon: "🌿", title: "Grow Farms", desc: "Full cultivation management — plant batches, harvest logs, environment monitoring." },
        { icon: "💊", title: "Medical Module", desc: "Patient records, prescriptions, appointments, insurance billing. HIPAA-aware." },
        { icon: "🌐", title: "LeafBridge Connect", desc: "Cannabis professional network. Hire, train, onboard, and review your team." },
    ];

    const COMPETITORS = [
        { name: "Dutchie", price: "$500–1,000/mo", what: "POS only" },
        { name: "Flowhub", price: "$499+/mo", what: "POS only" },
        { name: "Wurk", price: "$300–400/mo", what: "HR only" },
        { name: "BambooHR", price: "$250–500/mo", what: "HR only" },
        { name: "Trainual", price: "$149+/mo", what: "Training only" },
        { name: "BudphoriaPro", price: "$249–799/mo", what: "ALL OF THE ABOVE", highlight: true },
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
        <div style={{ background: "#080c10", color: "#e4ede6", fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", overflowX: "hidden" }}>

            {/* Google Fonts */}
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=Syne:wght@700;800;900&display=swap" rel="stylesheet" />

            {/* NAV */}
            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
                background: scrollY > 50 ? "rgba(8,12,16,0.95)" : "transparent",
                backdropFilter: scrollY > 50 ? "blur(20px)" : "none",
                borderBottom: scrollY > 50 ? "1px solid rgba(105,240,174,0.1)" : "none",
                padding: "1rem 2rem", display: "flex", justifyContent: "space-between",
                alignItems: "center", transition: "all 0.3s",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <span style={{ fontSize: "1.4rem" }}>🌿</span>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: "1.2rem", color: "#69f0ae" }}>BudphoriaPro</span>
                </div>
                <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
                    {["Features", "Modules", "Pricing", "LeafBridge"].map((item, i) => (
                        <a key={i} href={`#${item.toLowerCase()}`} style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500, transition: "color 0.2s" }}
                            onMouseEnter={e => e.target.style.color = "#69f0ae"}
                            onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.6)"}>{item}</a>
                    ))}
                    <button onClick={() => navigate("/login")} style={{ background: "transparent", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.15)", padding: "0.4rem 1rem", borderRadius: 8, cursor: "pointer", fontSize: "0.875rem" }}>Log In</button>
                    <button onClick={() => navigate("/register")} style={{ background: "#69f0ae", color: "#080c10", border: "none", padding: "0.4rem 1.25rem", borderRadius: 8, cursor: "pointer", fontSize: "0.875rem", fontWeight: 700 }}>Start Free</button>
                </div>
            </nav>

            {/* HERO */}
            <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "6rem 2rem 4rem", position: "relative", overflow: "hidden" }}>
                {/* Background glow */}
                <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: "radial-gradient(circle, rgba(105,240,174,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

                <div style={{ maxWidth: 900, position: "relative" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(105,240,174,0.08)", border: "1px solid rgba(105,240,174,0.2)", borderRadius: 100, padding: "0.35rem 1rem", marginBottom: "2rem", fontSize: "0.78rem", color: "#69f0ae", fontWeight: 600 }}>
                        🌿 The Cannabis Industry Operating System
                    </div>
                    <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: "clamp(2.5rem, 7vw, 5.5rem)", lineHeight: 1.05, marginBottom: "1.5rem", letterSpacing: "-0.02em" }}>
                        One Platform.<br />
                        <span style={{ color: "#69f0ae" }}>Every Tool</span> Your<br />
                        Dispensary Needs.
                    </h1>
                    <p style={{ fontSize: "1.15rem", color: "rgba(255,255,255,0.55)", maxWidth: 600, margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
                        POS, Inventory, Compliance, HR, Payroll, Medical Records, Grow Farms, and a Cannabis Professional Network — all in one platform starting at $249/mo.
                    </p>
                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                        <button onClick={() => navigate("/register")} style={{ background: "#69f0ae", color: "#080c10", border: "none", padding: "0.85rem 2.5rem", borderRadius: 10, fontWeight: 800, fontSize: "1rem", cursor: "pointer", boxShadow: "0 0 40px rgba(105,240,174,0.25)", transition: "all 0.2s" }}
                            onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 0 60px rgba(105,240,174,0.4)"; }}
                            onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "0 0 40px rgba(105,240,174,0.25)"; }}>
                            Start Free Trial
                        </button>
                        <button onClick={() => navigate("/dashboard")} style={{ background: "transparent", color: "#e4ede6", border: "1px solid rgba(255,255,255,0.15)", padding: "0.85rem 2rem", borderRadius: 10, fontWeight: 600, fontSize: "1rem", cursor: "pointer", transition: "all 0.2s" }}
                            onMouseEnter={e => e.target.style.borderColor = "#69f0ae"}
                            onMouseLeave={e => e.target.style.borderColor = "rgba(255,255,255,0.15)"}>
                            View Dashboard →
                        </button>
                    </div>

                    {/* Stats */}
                    <div style={{ display: "flex", gap: "3rem", justifyContent: "center", marginTop: "4rem", flexWrap: "wrap" }}>
                        {STATS.map((s, i) => (
                            <div key={i} style={{ textAlign: "center" }}>
                                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: "2rem", color: "#69f0ae" }}>{s.value}</div>
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
                            Stop Paying for <span style={{ color: "#69f0ae" }}>5 Different Tools</span>
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
                                        border: c.highlight ? "1px solid rgba(105,240,174,0.2)" : undefined,
                                    }}>
                                        <td style={{ padding: "1rem 1.25rem", fontWeight: c.highlight ? 800 : 600, color: c.highlight ? "#69f0ae" : "#e4ede6", fontSize: c.highlight ? "1rem" : "0.9rem" }}>
                                            {c.highlight && "🌿 "}{c.name}
                                        </td>
                                        <td style={{ padding: "1rem 1.25rem", color: c.highlight ? "#e4ede6" : "rgba(255,255,255,0.5)", fontSize: "0.875rem", fontWeight: c.highlight ? 700 : 400 }}>{c.what}</td>
                                        <td style={{ padding: "1rem 1.25rem", fontWeight: 800, color: c.highlight ? "#69f0ae" : "rgba(255,100,100,0.8)", fontSize: "0.9rem" }}>{c.price}</td>
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
                            Everything Built In. <span style={{ color: "#69f0ae" }}>Nothing Missing.</span>
                        </h2>
                        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "1rem" }}>Every feature your dispensary needs, from day one</p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
                        {FEATURES.map((f, i) => (
                            <div key={i} onClick={() => setActiveFeature(i)} style={{
                                background: activeFeature === i ? "rgba(105,240,174,0.08)" : "rgba(255,255,255,0.03)",
                                border: `1px solid ${activeFeature === i ? "rgba(105,240,174,0.3)" : "rgba(255,255,255,0.07)"}`,
                                borderRadius: 16, padding: "1.5rem", cursor: "pointer", transition: "all 0.25s",
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(105,240,174,0.3)"; e.currentTarget.style.background = "rgba(105,240,174,0.06)"; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = activeFeature === i ? "rgba(105,240,174,0.3)" : "rgba(255,255,255,0.07)"; e.currentTarget.style.background = activeFeature === i ? "rgba(105,240,174,0.08)" : "rgba(255,255,255,0.03)"; }}>
                                <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{f.icon}</div>
                                <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.5rem", color: activeFeature === i ? "#69f0ae" : "#e4ede6" }}>{f.title}</h3>
                                <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ALL MODULES */}
            <section id="modules" style={{ padding: "6rem 2rem", background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
                        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", marginBottom: "0.75rem" }}>
                            9 Complete <span style={{ color: "#69f0ae" }}>Modules</span>
                        </h2>
                        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "1rem" }}>Built for dispensaries, grow operations, seed banks, and medical facilities</p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
                        {MODULES.map((m, i) => (
                            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "1.25rem", transition: "all 0.2s" }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(105,240,174,0.25)"; e.currentTarget.style.background = "rgba(105,240,174,0.04)"; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}>
                                <div style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>{m.icon}</div>
                                <h4 style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.65rem", color: "#69f0ae" }}>{m.name}</h4>
                                {m.items.map((item, j) => (
                                    <div key={j} style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", padding: "0.2rem 0", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                        <span style={{ color: "#69f0ae", fontSize: "0.6rem" }}>✓</span> {item}
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
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(105,240,174,0.08)", border: "1px solid rgba(105,240,174,0.2)", borderRadius: 100, padding: "0.35rem 1rem", marginBottom: "1.5rem", fontSize: "0.75rem", color: "#69f0ae", fontWeight: 600 }}>
                            🌿 Included Free
                        </div>
                        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", marginBottom: "1rem" }}>
                            LeafBridge Connect — <span style={{ color: "#69f0ae" }}>Cannabis LinkedIn</span>
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
                                <span style={{ color: "#69f0ae", fontWeight: 700, flexShrink: 0 }}>✓</span> {item}
                            </div>
                        ))}
                    </div>
                    <div style={{ background: "rgba(105,240,174,0.05)", border: "1px solid rgba(105,240,174,0.15)", borderRadius: 20, padding: "2rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                            {["📰 Feed", "🤝 Network", "💬 Messages", "💼 Jobs", "🏢 Companies", "👥 Groups", "📅 Events", "💰 Salary", "🎓 Training", "📋 Onboarding", "⭐ Reviews", "📊 Labor Market", "🔔 Alerts", "👤 My Profile"].map((tab, i) => (
                                <div key={i} style={{ background: "rgba(105,240,174,0.08)", border: "1px solid rgba(105,240,174,0.15)", borderRadius: 8, padding: "0.5rem 0.75rem", fontSize: "0.75rem", color: "#69f0ae", fontWeight: 600 }}>{tab}</div>
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
                            Simple, <span style={{ color: "#69f0ae" }}>Transparent</span> Pricing
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
                                border: `1px solid ${plan.highlight ? "rgba(105,240,174,0.4)" : "rgba(255,255,255,0.08)"}`,
                                borderRadius: 20, padding: "2rem", position: "relative",
                                transform: plan.highlight ? "scale(1.03)" : "none",
                                boxShadow: plan.highlight ? "0 0 60px rgba(105,240,174,0.1)" : "none",
                            }}>
                                {plan.highlight && (
                                    <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#69f0ae", color: "#080c10", fontSize: "0.7rem", fontWeight: 800, padding: "3px 14px", borderRadius: 100, whiteSpace: "nowrap" }}>MOST POPULAR</div>
                                )}
                                <h3 style={{ fontWeight: 800, fontSize: "1rem", marginBottom: "0.25rem", color: plan.highlight ? "#69f0ae" : "#e4ede6" }}>{plan.name}</h3>
                                <div style={{ display: "flex", alignItems: "baseline", gap: "0.2rem", marginBottom: "0.5rem" }}>
                                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: "2.5rem", color: "#e4ede6" }}>{plan.price}</span>
                                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>{plan.period}</span>
                                </div>
                                <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", marginBottom: "1.5rem" }}>{plan.desc}</p>
                                {plan.features.map((f, j) => (
                                    <div key={j} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.65)" }}>
                                        <span style={{ color: "#69f0ae", fontWeight: 700, fontSize: "0.7rem" }}>✓</span> {f}
                                    </div>
                                ))}
                                <button onClick={() => navigate("/register")} style={{
                                    width: "100%", marginTop: "1.5rem",
                                    background: plan.highlight ? "#69f0ae" : "transparent",
                                    color: plan.highlight ? "#080c10" : "#69f0ae",
                                    border: plan.highlight ? "none" : "1px solid rgba(105,240,174,0.4)",
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
                        Ready to Replace <span style={{ color: "#69f0ae" }}>Five Tools</span><br />With One?
                    </h2>
                    <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "1rem", marginBottom: "2.5rem" }}>Join dispensaries across 24 legal states running on BudphoriaPro.</p>
                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                        <button onClick={() => navigate("/register")} style={{ background: "#69f0ae", color: "#080c10", border: "none", padding: "1rem 3rem", borderRadius: 12, fontWeight: 800, fontSize: "1rem", cursor: "pointer", boxShadow: "0 0 50px rgba(105,240,174,0.3)" }}>
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
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, color: "#69f0ae" }}>BudphoriaPro</span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.75rem" }}>© 2025 BudphoriaPro · Cannabis Industry Operating System · budphoriapro.com</p>
            </footer>
        </div>
    );
};

export default Home;
JSEOF
echo "✓ Home.js built"

echo ""
echo "Step 3 — Building standalone Pricing page..."
cat > src/front/js/pages/Pricing.js << 'JSEOF'
import React from "react";
import { useNavigate } from "react-router-dom";

const Pricing = () => {
    const navigate = useNavigate();

    const PLANS = [
        {
            name: "Starter", price: 249, period: "mo",
            desc: "Single-location dispensary",
            color: "#4fc3f7",
            features: [
                "Full POS System", "Inventory Management", "Order Management",
                "Customer Database", "Basic Compliance", "Basic Analytics",
                "LeafBridge Connect", "Invoice & Billing", "Barcode Scanner",
                "Up to 5 staff accounts", "Email Support",
            ],
        },
        {
            name: "Professional", price: 449, period: "mo",
            desc: "Growing dispensary operations",
            color: "#69f0ae", highlight: true,
            features: [
                "Everything in Starter",
                "Medical Patient Records", "Prescription Management",
                "Appointments & Billing", "HR & Employee Management",
                "Payroll Calculations", "Shift Tracking & Clock In/Out",
                "Training LMS (video upload)", "Advanced Compliance",
                "Metrc Integration", "Delivery Tracking & Waitlist",
                "Discount Management", "Up to 20 staff accounts",
                "Priority Support", "SMS Notifications (Twilio)",
            ],
        },
        {
            name: "Enterprise", price: 799, period: "mo",
            desc: "Multi-location cannabis operations",
            color: "#ce93d8",
            features: [
                "Everything in Professional",
                "Grow Farm Management (20 pages)", "Seed Bank Management (12 pages)",
                "Multi-Location Inventory", "Per-Store Analytics",
                "Stock Transfer Between Locations", "Advanced Revenue Reports",
                "API Access", "Custom Integrations",
                "Unlimited Staff Accounts", "Dedicated Account Manager",
                "White Glove Onboarding", "SLA 99.9% Uptime",
            ],
        },
    ];

    const ADDONS = [
        { name: "LeafBridge Employer Pro", price: "$49/mo", desc: "Post unlimited jobs, search resumes, see who viewed your postings" },
        { name: "LeafBridge Growth", price: "$149/mo", desc: "Company page, featured job listings, direct message candidates" },
        { name: "SMS Pack", price: "$29/mo", desc: "10,000 SMS messages/mo via Twilio for customer notifications" },
        { name: "Extra Staff Accounts", price: "$9/mo each", desc: "Add staff accounts beyond your plan limit" },
    ];

    const FAQ = [
        { q: "Is there a free trial?", a: "Yes — 14 days free, no credit card required. Full access to all features in your chosen plan." },
        { q: "Can I switch plans?", a: "Yes, upgrade or downgrade anytime. Billing adjusts at the next cycle." },
        { q: "Is LeafBridge Connect included?", a: "Yes — all plans include LeafBridge Connect for employees. Employer job posting tools are a separate add-on." },
        { q: "Do you support Metrc?", a: "Yes — Metrc integration is included in Professional and Enterprise plans. Inventory and sales sync automatically." },
        { q: "What states do you support?", a: "All 24 recreational states plus medical-only states. Compliance templates built for MA, CA, CO, IL, NY, NV, OR, WA, MI, AZ, NJ, CT, RI, ME, MN and more." },
        { q: "Is there a setup fee?", a: "No setup fees on Starter or Professional. Enterprise includes white glove onboarding at no extra cost." },
    ];

    return (
        <div style={{ background: "#080c10", color: "#e4ede6", fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=Syne:wght@700;800;900&display=swap" rel="stylesheet" />

            {/* Nav */}
            <nav style={{ padding: "1.25rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <span style={{ fontSize: "1.2rem" }}>🌿</span>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, color: "#69f0ae" }}>BudphoriaPro</span>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <button onClick={() => navigate("/")} style={{ background: "transparent", color: "rgba(255,255,255,0.5)", border: "none", cursor: "pointer", fontSize: "0.875rem" }}>← Back</button>
                    <button onClick={() => navigate("/register")} style={{ background: "#69f0ae", color: "#080c10", border: "none", padding: "0.4rem 1.25rem", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: "0.875rem" }}>Start Free Trial</button>
                </div>
            </nav>

            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "4rem 2rem" }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "4rem" }}>
                    <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: "clamp(2rem, 5vw, 3.5rem)", marginBottom: "1rem" }}>
                        Simple, <span style={{ color: "#69f0ae" }}>Honest</span> Pricing
                    </h1>
                    <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "1rem", marginBottom: "0.5rem" }}>No hidden fees. No per-transaction cuts. No surprises.</p>
                    <p style={{ color: "#69f0ae", fontSize: "0.875rem", fontWeight: 600 }}>14-day free trial · No credit card required · Cancel anytime</p>
                </div>

                {/* Plans */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem", marginBottom: "4rem" }}>
                    {PLANS.map((plan, i) => (
                        <div key={i} style={{
                            background: plan.highlight ? `${plan.color}08` : "rgba(255,255,255,0.03)",
                            border: `1px solid ${plan.highlight ? `${plan.color}40` : "rgba(255,255,255,0.08)"}`,
                            borderRadius: 20, padding: "2rem", position: "relative",
                            transform: plan.highlight ? "scale(1.03)" : "none",
                            boxShadow: plan.highlight ? `0 0 60px ${plan.color}15` : "none",
                        }}>
                            {plan.highlight && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: plan.color, color: "#080c10", fontSize: "0.7rem", fontWeight: 800, padding: "3px 14px", borderRadius: 100 }}>MOST POPULAR</div>}
                            <h3 style={{ fontWeight: 800, color: plan.color, marginBottom: "0.25rem" }}>{plan.name}</h3>
                            <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem", marginBottom: "0.25rem" }}>
                                <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: "2.8rem" }}>${plan.price}</span>
                                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.85rem" }}>/{plan.period}</span>
                            </div>
                            <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.35)", marginBottom: "1.5rem" }}>{plan.desc}</p>
                            <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "1.25rem", marginBottom: "1.5rem" }}>
                                {plan.features.map((f, j) => (
                                    <div key={j} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.4rem", fontSize: "0.8rem", color: f.startsWith("Everything") ? plan.color : "rgba(255,255,255,0.6)", fontWeight: f.startsWith("Everything") ? 700 : 400 }}>
                                        <span style={{ color: plan.color, fontWeight: 700, flexShrink: 0 }}>✓</span> {f}
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => navigate("/register")} style={{
                                width: "100%", background: plan.highlight ? plan.color : "transparent",
                                color: plan.highlight ? "#080c10" : plan.color,
                                border: `1px solid ${plan.color}60`,
                                padding: "0.75rem", borderRadius: 10, fontWeight: 700,
                                fontSize: "0.875rem", cursor: "pointer",
                            }}>
                                {plan.name === "Enterprise" ? "Contact Sales" : "Start Free Trial"}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Add-ons */}
                <div style={{ marginBottom: "4rem" }}>
                    <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: "1.5rem", marginBottom: "1.5rem", textAlign: "center" }}>
                        Add-Ons & <span style={{ color: "#69f0ae" }}>Extras</span>
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
                        {ADDONS.map((a, i) => (
                            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "1.25rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                                    <h4 style={{ fontWeight: 700, fontSize: "0.875rem" }}>{a.name}</h4>
                                    <span style={{ color: "#69f0ae", fontWeight: 800, fontSize: "0.875rem", whiteSpace: "nowrap", marginLeft: "0.5rem" }}>{a.price}</span>
                                </div>
                                <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{a.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQ */}
                <div style={{ marginBottom: "4rem" }}>
                    <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: "1.5rem", marginBottom: "1.5rem", textAlign: "center" }}>
                        Frequently Asked <span style={{ color: "#69f0ae" }}>Questions</span>
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        {FAQ.map((f, i) => (
                            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "1.25rem" }}>
                                <h4 style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: "0.5rem", color: "#69f0ae" }}>{f.q}</h4>
                                <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{f.a}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div style={{ textAlign: "center", background: "rgba(105,240,174,0.05)", border: "1px solid rgba(105,240,174,0.15)", borderRadius: 20, padding: "3rem" }}>
                    <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: "2rem", marginBottom: "0.75rem" }}>Ready to get started?</h2>
                    <p style={{ color: "rgba(255,255,255,0.45)", marginBottom: "2rem" }}>14-day free trial. No credit card required. Setup in minutes.</p>
                    <button onClick={() => navigate("/register")} style={{ background: "#69f0ae", color: "#080c10", border: "none", padding: "0.9rem 3rem", borderRadius: 12, fontWeight: 800, fontSize: "1rem", cursor: "pointer" }}>
                        Start Free Trial
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Pricing;
JSEOF
echo "✓ Pricing.js built"

echo ""
echo "Step 4 — Wiring Pricing into layout + Navbar..."
python3 << 'PYEOF'
# Add Pricing to layout
with open('src/front/js/layout.js', 'r') as f:
    content = f.read()

if 'Pricing' not in content:
    content = content.replace(
        'import Home from "./pages/Home";',
        'import Home from "./pages/Home";\nimport Pricing from "./pages/Pricing";'
    )
    content = content.replace(
        '<Route path="/about-us"',
        '<Route path="/pricing" element={<Pricing />} />\n                        <Route path="/about-us"'
    )
    with open('src/front/js/layout.js', 'w') as f:
        f.write(content)
    print("✓ Pricing route added to layout")
else:
    print("  Pricing already in layout")

# Update Navbar with Pricing link
with open('src/front/js/component/Navbar.js', 'r') as f:
    nav = f.read()

if '/pricing' not in nav:
    nav = nav.replace(
        '<a class="nav-link" href="#">Features</a>',
        '<a class="nav-link" href="/">Home</a>\n        <a class="nav-link" href="/pricing">Pricing</a>'
    )
    with open('src/front/js/component/Navbar.js', 'w') as f:
        f.write(nav)
    print("✓ Pricing added to Navbar")
else:
    print("  Pricing already in Navbar")
PYEOF

echo ""
echo "Step 5 — Commit and push..."
git add .
git commit -m "BudphoriaPro: full rename + marketing homepage + pricing page"
git push origin medical

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         BUDPHORIAPRO — REBRANDED + LAUNCHED                 ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║                                                              ║"
echo "║  RENAMED:                                                    ║"
echo "║    ✅ DispenseMaster → BudphoriaPro everywhere              ║"
echo "║    ✅ Sidebar brand name updated                             ║"
echo "║    ✅ Admin panel name updated                               ║"
echo "║    ✅ App title updated                                      ║"
echo "║                                                              ║"
echo "║  NEW PAGES:                                                  ║"
echo "║    ✅ / → Full marketing homepage                            ║"
echo "║    ✅ /pricing → Pricing page with plans + FAQ              ║"
echo "║                                                              ║"
echo "║  HOMEPAGE SECTIONS:                                          ║"
echo "║    Hero → CTA + stats                                        ║"
echo "║    Competitor comparison table                               ║"
echo "║    6 feature cards                                           ║"
echo "║    9 module grid with feature lists                          ║"
echo "║    LeafBridge Connect section                                ║"
echo "║    Pricing preview (3 plans)                                 ║"
echo "║    Final CTA                                                 ║"
echo "║                                                              ║"
echo "║  PRICING PAGE:                                               ║"
echo "║    Starter $249 · Pro $449 · Enterprise $799                ║"
echo "║    Add-ons section                                           ║"
echo "║    6-question FAQ                                            ║"
echo "║    CTA section                                               ║"
echo "╚══════════════════════════════════════════════════════════════╝"
