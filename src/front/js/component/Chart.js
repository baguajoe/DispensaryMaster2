import React from "react";
import { Bar } from "react-chartjs-2";

const AnalyticsChart = ({ data }) => {
  const chartData = {
    labels: data.map((item) => `Customer ${item.customer_id}`),
    datasets: [
      {
        label: "Churn Probability (%)",
        data: data.map((item) => item.churn_probability * 100),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Churn Probability Chart</h2>
      <Bar data={chartData} />
    </div>
  );
};

export default AnalyticsChart;
