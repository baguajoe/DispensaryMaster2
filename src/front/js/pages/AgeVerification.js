import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AgeVerification = () => {
    const [ageVerified, setAgeVerified] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user has already verified age and if it's expired
        const storedVerification = localStorage.getItem("ageVerified");
        const expirationTime = localStorage.getItem("ageVerificationExpires");

        if (storedVerification === "true" && expirationTime) {
            const now = new Date().getTime();
            if (now > parseInt(expirationTime, 10)) {
                // Age verification expired, reset it
                localStorage.removeItem("ageVerified");
                localStorage.removeItem("ageVerificationExpires");
            } else {
                // Redirect if still valid
                navigate("/home");
            }
        }
    }, [navigate]);

    const handleAgeVerification = (isOver21) => {
        if (isOver21) {
            const expirationTime = new Date().getTime() + 24 * 60 * 60 * 1000; // 24 hours
            localStorage.setItem("ageVerified", "true");
            localStorage.setItem("ageVerificationExpires", expirationTime.toString());
            navigate("/home");
        } else {
            alert("You must be 21 or older to enter this site.");
        }
    };

    return (
        <div className="age-verification text-center">
            <h1>Are you 21 or older?</h1>
            <button className="btn btn-success" onClick={() => handleAgeVerification(true)}>Yes</button>
            <button className="btn btn-danger" onClick={() => handleAgeVerification(false)}>No</button>
        </div>
    );
};

export default AgeVerification;
