import React from "react";
import PropTypes from "prop-types";

const SymptomTrackerComponent = ({ symptoms, addSymptom }) => {
  const [newSymptom, setNewSymptom] = React.useState("");

  const handleAddSymptom = () => {
    addSymptom(newSymptom);
    setNewSymptom("");
  };

  return (
    <div>
      <h3>Symptom Tracker</h3>
      <input
        type="text"
        placeholder="Enter a symptom"
        value={newSymptom}
        onChange={(e) => setNewSymptom(e.target.value)}
      />
      <button onClick={handleAddSymptom}>Add Symptom</button>
      <ul>
        {symptoms.map((symptom, index) => (
          <li key={index}>{symptom}</li>
        ))}
      </ul>
    </div>
  );
};

SymptomTrackerComponent.propTypes = {
  symptoms: PropTypes.array.isRequired,
  addSymptom: PropTypes.func.isRequired,
};

export default SymptomTrackerComponent;
