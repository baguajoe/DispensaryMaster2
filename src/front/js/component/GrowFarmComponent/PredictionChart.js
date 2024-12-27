import React from "react";
import { Line } from "react-chartjs-2";

const PredictionChart = ({ data }) => {
  const chartData = {
    labels: data.map((entry) => entry.timestamp),
    datasets: [
      {
        label: "Predicted Yield",
        data: data.map((entry) => entry.predicted),
        borderColor: "rgba(75, 192, 192, 1)",
        fill: false,
      },
      {
        label: "Actual Yield",
        data: data.map((entry) => entry.actual),
        borderColor: "rgba(255, 99, 132, 1)",
        fill: false,
      },
    ],
  };

  return (
    <div className="prediction-chart">
      <Line data={chartData} />
    </div>
  );
};

export default PredictionChart;
