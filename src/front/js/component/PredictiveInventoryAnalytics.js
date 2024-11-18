import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";

const PredictiveInventoryAnalytics = () => {
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await axios.get("/api/analytics/predictive");
        setPredictionData(response.data);
      } catch (error) {
        console.error("Error fetching predictive inventory data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  if (loading) return <p>Loading predictions...</p>;
  if (!predictionData) return <p>No data available for predictions.</p>;

  const data = {
    labels: predictionData.future_dates, // e.g., ["2023-12-01", "2023-12-02", ...]
    datasets: [
      {
        label: "Predicted Inventory Needs",
        data: predictionData.predictions, // e.g., [500, 600, 550, ...]
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
    ],
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Predictive Inventory Analytics</h2>
      <Line data={data} />
    </div>
  );
};

export default PredictiveInventoryAnalytics;
