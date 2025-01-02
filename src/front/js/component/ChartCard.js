import React from "react";
import { Line, Bar, Pie, Doughnut, Radar } from "react-chartjs-2";
import PropTypes from "prop-types";




const UnifiedChartCard = ({ type, data, title, options, showAnalytics }) => {
  // Define supported chart types
  const chartTypes = {
      line: Line,
      bar: Bar,
      pie: Pie,
      doughnut: Doughnut,
      radar: Radar,
  };

  const ChartComponent = chartTypes[type] || null;

  // Default analytics data (example for churn probability)
  const defaultAnalyticsData = {
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
      <div className="bg-white shadow-lg rounded-lg p-6">
          {/* Title Section */}
          {title && <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>}

          {/* Chart Section */}
          {ChartComponent ? (
              <ChartComponent
                  data={showAnalytics ? defaultAnalyticsData : data}
                  options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                          legend: {
                              display: true,
                              position: "top",
                              labels: {
                                  color: "#4A5568", // Tailwind text-gray-700
                                  font: { size: 14 },
                              },
                          },
                          tooltip: {
                              enabled: true,
                              backgroundColor: "#2D3748", // Tailwind bg-gray-800
                              titleColor: "#FFFFFF",
                              bodyColor: "#FFFFFF",
                          },
                      },
                      scales: {
                          x: {
                              grid: { color: "#E2E8F0" }, // Tailwind border-gray-300
                              ticks: { color: "#4A5568", font: { size: 12 } },
                          },
                          y: {
                              grid: { color: "#E2E8F0" },
                              ticks: { color: "#4A5568", font: { size: 12 } },
                          },
                      },
                      animation: {
                          duration: 1500,
                          easing: "easeOutQuad",
                      },
                      interaction: {
                          mode: "index",
                          intersect: false,
                      },
                      ...options, // Custom options
                  }}
              />
          ) : (
              <p className="text-red-500">Unsupported chart type</p>
          )}
      </div>
  );
};

// Prop Types for Validation
UnifiedChartCard.propTypes = {
  type: PropTypes.oneOf(["line", "bar", "pie", "doughnut", "radar"]).isRequired, // Chart type
  data: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired, // Data for the chart
  title: PropTypes.string, // Optional title
  options: PropTypes.object, // Optional Chart.js-specific options
  showAnalytics: PropTypes.bool, // Toggle between analytics data or custom data
};

// Default Props
UnifiedChartCard.defaultProps = {
  title: null,
  options: {},
  showAnalytics: false,
};

export default UnifiedChartCard;


