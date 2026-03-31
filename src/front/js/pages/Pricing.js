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
