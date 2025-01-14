import React, { useState } from "react";
import BarcodeReader from "react-barcode-reader";
import "../../styles/barcodescanner.css";

const BarcodeScanner = ({ onScan }) => {
    const [scanResults, setScanResults] = useState([]); // For batch scanning
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [facingMode, setFacingMode] = useState("environment"); // Default to rear camera

    const handleScan = (data) => {
        if (data) {
            setScanResults((prevResults) => [...prevResults, data]); // Add to batch results
            setErrorMessage(""); // Clear any previous error messages
            setSuccessMessage("Scan successful!");
            
            if (onScan) {
                onScan(data); // Pass data to parent component
            }

            // Play success sound
            const successAudio = new Audio("/success.mp3"); // Replace with the path to your success audio file
            successAudio.play();
        }
    };

    const handleError = (err) => {
        console.error("Barcode scanning error:", err);
        setErrorMessage("Error scanning barcode. Please try again.");
        setSuccessMessage(""); // Clear success messages

        // Play error sound
        const errorAudio = new Audio("/error.mp3"); // Replace with the path to your error audio file
        errorAudio.play();
    };

    const toggleCamera = () => {
        setFacingMode((prevMode) =>
            prevMode === "environment" ? "user" : "environment"
        );
    };

    return (
        <div className="barcode-scanner main-content">
            <h2>Barcode Scanner</h2>

            {/* Camera Toggle */}
            <button onClick={toggleCamera} className="camera-toggle">
                {facingMode === "environment" ? "Switch to Front Camera" : "Switch to Rear Camera"}
            </button>

            {/* Barcode Reader */}
            <BarcodeReader
                onError={handleError}
                onScan={handleScan}
                facingMode={facingMode}
            />

            {/* Display Messages */}
            {successMessage && <p className="success-message">{successMessage}</p>}
            {errorMessage && <p className="error-message">{errorMessage}</p>}

            {/* Display Scanned Results */}
            <div className="scan-results">
                <h3>Scanned Results:</h3>
                <ul>
                    {scanResults.map((result, index) => (
                        <li key={index}>{result}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default BarcodeScanner;
