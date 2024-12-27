import React from "react";
import { Line } from "react-chartjs-2";

const EnvironmentChart = ({ data }) => {
  const chartData = {
    labels: data.map((entry) => entry.timestamp),
    datasets: [
      {
        label: "Temperature (°C)",
        data: data.map((entry) => entry.temperature),
        borderColor: "rgba(255, 99, 132, 1)",
        fill: false,
      },
      {
        label: "Humidity (%)",
        data: data.map((entry) => entry.humidity),
        borderColor: "rgba(54, 162, 235, 1)",
        fill: false,
      },
    ],
  };

  return (
    <div className="environment-chart">
      <Line data={chartData} />
    </div>
  );
};

export default EnvironmentChart;
