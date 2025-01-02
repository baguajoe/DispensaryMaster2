import React from "react";
import { Bar } from "react-chartjs-2";

const AnalyticsChart = ({ type = "bar", data, options = {} }) => {
  const chartTypes = { bar: Bar, line: Line, pie: Pie, doughnut: Doughnut };
  const ChartComponent = chartTypes[type] || Bar;

  const chartData = {
      labels: data.map((item) => `Customer ${item.customer_id}`),
      datasets: [
          {
              label: "Churn Probability (%)",
              data: data.map((item) => item.churn_probability * 100),
              backgroundColor: "rgba(255, 99, 132, 0.5)", // Add dynamic color mapping if needed
          },
      ],
  };

  return (
      <div className="chart-container bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Churn Probability Chart</h2>
          <ChartComponent data={chartData} options={{ responsive: true, ...options }} />
      </div>
  );
};

export default AnalyticsChart;
