import React from "react";

const PredictionSummary = ({ summary }) => {
  return (
    <div className="prediction-summary">
      <h3>Prediction Summary</h3>
      <p>Predicted Yield: {summary.predictedYield} grams</p>
      <p>Accuracy: {summary.accuracy}%</p>
      <p>Actual Yield: {summary.actualYield} grams</p>
    </div>
  );
};

export default PredictionSummary;
