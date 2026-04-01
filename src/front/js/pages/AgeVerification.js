import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AgeVerification = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const verified = localStorage.getItem("ageVerified");
        if (verified === "true") {
            navigate("/home");
        }
    }, []);

    const handleYes = () => {
        localStorage.setItem("ageVerified", "true");
        navigate("/home");
    };

    const handleNo = () => {
        window.location.href = "https://www.google.com";
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: "#0a0800",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "2rem"
        }}>
            <div style={{ fontSize: "3rem" }}>🌿</div>
            <h1 style={{ color: "#ffab00", fontWeight: 900, fontSize: "2rem", textAlign: "center" }}>
                Are you 21 or older?
            </h1>
            <p style={{ color: "rgba(255,248,225,0.5)", textAlign: "center", maxWidth: 400 }}>
                You must be 21 or older to enter this site. By clicking Yes, you confirm you meet the age requirement.
            </p>
            <div style={{ display: "flex", gap: "1rem" }}>
                <button onClick={handleYes} style={{
                    background: "#ffab00", color: "#0a0800", border: "none",
                    padding: "0.75rem 2.5rem", borderRadius: 10,
                    fontWeight: 900, fontSize: "1.1rem", cursor: "pointer"
                }}>Yes, I am 21+</button>
                <button onClick={handleNo} style={{
                    background: "transparent", color: "rgba(255,248,225,0.5)",
                    border: "1px solid rgba(255,171,0,0.3)",
                    padding: "0.75rem 2.5rem", borderRadius: 10,
                    fontWeight: 700, fontSize: "1.1rem", cursor: "pointer"
                }}>No</button>
            </div>
        </div>
    );
};

export default AgeVerification;
