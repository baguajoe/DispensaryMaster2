import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";

const SalesPrediction = () => {
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesPredictions = async () => {
      try {
        const response = await axios.get("/api/analytics/sales/predictions");
        setPredictionData(response.data);
      } catch (error) {
        console.error("Error fetching sales predictions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesPredictions();
  }, []);

  if (loading) return <p>Loading predictions...</p>;
  if (!predictionData) return <p>No sales prediction data available.</p>;

  const data = {
    labels: predictionData.future_dates, // Example: ["2024-01-01", "2024-01-02"]
    datasets: [
      {
        label: "Predicted Sales ($)",
        data: predictionData.predictions, // Example: [500, 550, 600]
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
