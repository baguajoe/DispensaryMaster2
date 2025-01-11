import React, { useState, useEffect } from "react";
import Chart from "chart.js/auto"; // Import Chart.js for visualizations

const PredictiveAnalyticsWidget = ({ endpoint, title }) => {
  const [data, setData] = useState(null); // Holds the prediction data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // Fetch prediction data from the API
  useEffect(() => {
    const fetchPredictions = async () => {
      setLoading(true);
      try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error("Failed to fetch predictive analytics data");
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [endpoint]);

  // Render chart if data is available
  useEffect(() => {
    if (data && data.forecast) {
      const ctx = document.getElementById("predictive-chart").getContext("2d");
      new Chart(ctx, {
        type: "line",
        data: {
          labels: data.forecast.map((point) => point.date), // Dates for the x-axis
          datasets: [
            {
              label: "Forecasted Values",
              data: data.forecast.map((point) => point.value),
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
          },
        },
      });
    }
  }, [data]);

  return (
    <div className="predictive-analytics-widget p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {loading ? (
        <p>Loading predictive analytics...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div>
          <canvas id="predictive-chart" width="400" height="200"></canvas>
          <p className="mt-4">
            Based on historical data, the model predicts the following trends for the next
            period.
          </p>
        </div>
      )}
    </div>
  );
};

export default PredictiveAnalyticsWidget;
