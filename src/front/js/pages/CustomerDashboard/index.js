import React from "react";
import { Link } from "react-router-dom";

const CustomerDashboard = () => {
    const sections = [
        { name: "Overview", path: "/dashboard-overview", icon: "📊" },
        { name: "My Profile", path: "/customer/profile", icon: "👤" },
        { name: "Order History", path: "/customer/orders", icon: "📦" },
        { name: "Wishlist", path: "/customer/wishlist", icon: "❤️" },
        { name: "Loyalty Program", path: "/customer/loyalty-program", icon: "⭐" },
        { name: "Analytics", path: "/customer/analytics", icon: "📈" },
        { name: "Recommendations", path: "/recommendations", icon: "💡" },
        { name: "Payment Methods", path: "/customer/payment-methods", icon: "💳" },
        { name: "Notifications", path: "/customer/notifications", icon: "🔔" },
        { name: "Support", path: "/customer/support", icon: "🎧" },
        { name: "Settings", path: "/customer/settings", icon: "⚙️" },
    ];

    return (
        <div className="main-content p-4">
            <h3 style={{ color: "#ffab00", marginBottom: "0.5rem" }}>Customer Dashboard</h3>
            <p style={{ color: "rgba(255,248,225,0.5)", marginBottom: "2rem" }}>Manage your account and orders</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
                {sections.map((s, i) => (
                    <Link key={i} to={s.path} style={{ textDecoration: "none" }}>
                        <div className="glass-panel text-center py-3" style={{ cursor: "pointer", transition: "all 0.2s" }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "#ffab00"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.transform = "none"; }}>
                            <div style={{ fontSize: "1.75rem", marginBottom: "0.4rem" }}>{s.icon}</div>
                            <div style={{ fontWeight: 600, color: "#ffab00", fontSize: "0.85rem" }}>{s.name}</div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default CustomerDashboard;
