import React, { useState } from "react";
import PropTypes from "prop-types";

const SymptomTrackerComponent = ({ symptoms, addSymptom }) => {
  const [newSymptom, setNewSymptom] = useState("");
  const [severity, setSeverity] = useState("Mild");
  const [startDate, setStartDate] = useState("");

  const handleAddSymptom = () => {
    if (!newSymptom || !startDate) {
      alert("Please enter both a symptom and a start date.");
      return;
    }

    addSymptom({
      symptomName: newSymptom,
      severity,
      startDate,
    });

    // Clear input fields
    setNewSymptom("");
    setSeverity("Mild");
    setStartDate("");
  };

  return (
    <div className="symptom-form">
      <h3>Track a New Symptom</h3>
      <div className="input-group">
        <input
          type="text"
          placeholder="Enter a symptom"
          value={newSymptom}
          onChange={(e) => setNewSymptom(e.target.value)}
        />
      </div>
      <div className="input-group">
        <label>Severity:</label>
        <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option value="Mild">Mild</option>
          <option value="Moderate">Moderate</option>
          <option value="Severe">Severe</option>
        </select>
      </div>
      <div className="input-group">
        <label>Start Date:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>
      <button onClick={handleAddSymptom}>Add Symptom</button>

      <h3>Tracked Symptoms</h3>
      <ul>
        {symptoms.map((symptom, index) => (
          <li key={index}>
            <strong>{symptom.symptomName}</strong> - {symptom.severity} - 
            <em> {symptom.startDate}</em>
          </li>
        ))}
      </ul>
    </div>
  );
};

SymptomTrackerComponent.propTypes = {
  symptoms: PropTypes.arrayOf(
    PropTypes.shape({
      symptomName: PropTypes.string.isRequired,
      severity: PropTypes.string.isRequired,
      startDate: PropTypes.string.isRequired,
    })
  ).isRequired,
  addSymptom: PropTypes.func.isRequired,
};

export default SymptomTrackerComponent;
