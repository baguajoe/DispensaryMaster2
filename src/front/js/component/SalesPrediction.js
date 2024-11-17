import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";

const SalesPrediction = () => {
  const [predictionData, setPredictionData] = useState(null);

  useEffect(() => {
    axios
      .get("/api/analytics/sales/predictions")
      .then((response) => setPredictionData(response.data))
      .catch((error) => console.error("Error fetching sales predictions:", error));
  }, []);

  if (!predictionData) return <p>Loading predictions...</p>;

  const data = {
    labels: predictionData.future_dates,
    datasets: [
      {
        label: "Predicted Sales ($)",
        data: predictionData.predictions,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
    ],
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Sales Predictions</h2>
      <Line data={data} />
    </div>
  );
};

export default SalesPrediction;
