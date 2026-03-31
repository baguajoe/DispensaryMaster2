import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../../styles/navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav style={{ background: "rgba(8,12,16,0.95)", borderBottom: "1px solid rgba(105,240,174,0.1)", padding: "0.75rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 99 }}>
      <div onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
        <span style={{ fontSize: "1.2rem" }}>&#127807;</span>
        <span style={{ fontWeight: 900, fontSize: "1rem", color: "#69f0ae" }}>BudphoriaPro</span>
      </div>
      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
        <a href="/pricing" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "0.875rem" }}>Pricing</a>
        <a href="/leafbridge" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "0.875rem" }}>LeafBridge</a>
        {isLoggedIn ? (
          <>
            <a href="/dashboard" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "0.875rem" }}>Dashboard</a>
            <button onClick={handleSignOut} style={{ background: "transparent", color: "rgba(255,100,100,0.8)", border: "1px solid rgba(255,100,100,0.3)", padding: "0.35rem 0.9rem", borderRadius: 8, cursor: "pointer", fontSize: "0.82rem" }}>Sign Out</button>
          </>
        ) : (
          <>
            <button onClick={() => navigate("/login")} style={{ background: "transparent", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.15)", padding: "0.35rem 0.9rem", borderRadius: 8, cursor: "pointer", fontSize: "0.82rem" }}>Log In</button>
            <button onClick={() => navigate("/register")} style={{ background: "#69f0ae", color: "#080c10", border: "none", padding: "0.35rem 1rem", borderRadius: 8, cursor: "pointer", fontSize: "0.82rem", fontWeight: 700 }}>Start Free</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
