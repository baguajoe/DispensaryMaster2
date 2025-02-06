import React, { useState, useEffect } from "react";
import SymptomTrackerComponent from "../../component/MedicalComponent/SystemTrackerComponent";
import "../../../styles/medical/SymptomTracker.css";

const SymptomTracker = () => {
  const [symptoms, setSymptoms] = useState(() => {
    // Load symptoms from localStorage on page load
    const savedSymptoms = localStorage.getItem("symptoms");
    return savedSymptoms ? JSON.parse(savedSymptoms) : [];
  });

  const addSymptom = (newSymptom) => {
    if (!newSymptom.symptomName.trim()) {
      alert("Please enter a valid symptom.");
      return;
    }

    const updatedSymptoms = [...symptoms, newSymptom];
    setSymptoms(updatedSymptoms);
    localStorage.setItem("symptoms", JSON.stringify(updatedSymptoms)); // Save to localStorage
  };

  const clearSymptoms = () => {
    setSymptoms([]);
    localStorage.removeItem("symptoms");
  };

  return (
    <div className="symptom-tracker-container">
      <h1>Symptom Tracker</h1>
      <p>Track your symptoms and monitor your progress over time.</p>
      <SymptomTrackerComponent symptoms={symptoms} addSymptom={addSymptom} />
      {symptoms.length > 0 && (
        <button className="clear-button" onClick={clearSymptoms}>
          Clear All Symptoms
        </button>
      )}
    </div>
  );
};

export default SymptomTracker;
