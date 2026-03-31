import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import "../../styles/navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("token");

  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const navLinks = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Shop", path: "/shop" },
    { label: "Orders", path: "/orders" },
    { label: "Inventory", path: "/inventory" },
    { label: "Customers", path: "/customers" },
    { label: "Analytics", path: "/analytics-dashboard" },
    { label: "LeafBridge", path: "/leafbridge" },
    { label: "Pricing", path: "/pricing" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      background: "rgba(10,8,0,0.96)",
      borderBottom: "1px solid rgba(255,171,0,0.15)",
      backdropFilter: "blur(20px)",
      padding: "0 1.5rem",
      display: "flex",
      alignItems: "center",
      height: "52px",
      position: "sticky",
      top: 0,
      zIndex: 100,
      gap: "1rem",
    }}>
      {/* Brand */}
      <div onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", flexShrink: 0 }}>
        <span style={{ fontSize: "1.1rem" }}>&#127807;</span>
        <span style={{ fontWeight: 900, fontSize: "0.95rem", color: "#ffab00" }}>BudphoriaPro</span>
      </div>

      {/* Center nav links */}
      <div style={{ display: "flex", gap: "0.1rem", flex: 1, justifyContent: "center", overflowX: "auto" }}>
        {isLoggedIn && navLinks.map((link, i) => (
          <button key={i} onClick={() => navigate(link.path)} style={{
            background: isActive(link.path) ? "rgba(255,171,0,0.12)" : "transparent",
            border: "none",
            color: isActive(link.path) ? "#ffab00" : "rgba(255,248,225,0.5)",
            padding: "0.35rem 0.7rem",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: "0.78rem",
            fontWeight: isActive(link.path) ? 700 : 400,
            whiteSpace: "nowrap",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.target.style.color = "#ffab00"; e.target.style.background = "rgba(255,171,0,0.08)"; }}
          onMouseLeave={e => { e.target.style.color = isActive(link.path) ? "#ffab00" : "rgba(255,248,225,0.5)"; e.target.style.background = isActive(link.path) ? "rgba(255,171,0,0.12)" : "transparent"; }}>
            {link.label}
          </button>
        ))}
      </div>

      {/* Right side auth */}
      <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0, alignItems: "center" }}>
        {isLoggedIn ? (
          <button onClick={handleSignOut} style={{ background: "transparent", color: "rgba(255,82,82,0.8)", border: "1px solid rgba(255,82,82,0.3)", padding: "0.3rem 0.85rem", borderRadius: 7, cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}>Sign Out</button>
        ) : (
          <>
            <button onClick={() => navigate("/login")} style={{ background: "transparent", color: "rgba(255,248,225,0.55)", border: "1px solid rgba(255,171,0,0.2)", padding: "0.3rem 0.85rem", borderRadius: 7, cursor: "pointer", fontSize: "0.78rem" }}>Log In</button>
            <button onClick={() => navigate("/register")} style={{ background: "#ffab00", color: "#0a0800", border: "none", padding: "0.3rem 0.85rem", borderRadius: 7, cursor: "pointer", fontSize: "0.78rem", fontWeight: 700 }}>Start Free</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
