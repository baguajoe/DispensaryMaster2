import React from "react";
import { Line, Bar, Pie, Doughnut, Radar } from "react-chartjs-2";
import PropTypes from "prop-types";

// const ChartCard = ({ type, data }) => {
//   const chartTypes = {
//     line: Line,
//     bar: Bar,
//   };

//   const ChartComponent = chartTypes[type] || null;

//   return ChartComponent ? (
//     <div className="bg-white shadow-lg rounded-lg p-4">
//       <ChartComponent
//         data={data}
//         options={{
//           responsive: true,
//           plugins: {
//             legend: { display: true, position: "top" },
//             tooltip: { enabled: true },
//           },
//         }}
//       />
//     </div>
//   ) : (
//     <p className="text-red-500">Unsupported chart type</p>
//   );
// };

// ChartCard.propTypes = {
//   type: PropTypes.string.isRequired,
//   data: PropTypes.object.isRequired,
// };

// export default ChartCard;



const ChartCard = ({ type, data, title, options }) => {
  const chartTypes = {
    line: Line,
    bar: Bar,
    pie: Pie,
    doughnut: Doughnut,
    radar: Radar,
  };

  const ChartComponent = chartTypes[type] || null;

  return ChartComponent ? (
    <div className="bg-white shadow-lg rounded-lg p-6">
      {/* Display Title if Provided */}
      {title && <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>}

      {/* Chart Component */}
      <ChartComponent
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: "top",
              labels: {
                color: "#4A5568", // Tailwind text-gray-700 equivalent
                font: { size: 14 },
              },
            },
            tooltip: {
              enabled: true,
              backgroundColor: "#2D3748", // Tailwind bg-gray-800 equivalent
              titleColor: "#FFFFFF",
              bodyColor: "#FFFFFF",
              footerColor: "#A0AEC0", // Tailwind text-gray-400 equivalent
            },
          },
          scales: {
            x: {
              grid: {
                color: "#E2E8F0", // Tailwind border-gray-300 equivalent
              },
              ticks: {
                color: "#4A5568",
                font: {
                  size: 12, // Customize font size for x-axis ticks
                },
              },
            },
            y: {
              grid: {
                color: "#E2E8F0",
              },
              ticks: {
                color: "#4A5568",
                font: {
                  size: 12, // Customize font size for y-axis ticks
                },
              },
            },
          },
          animation: {
            duration: 1500, // Enhanced animation for smooth rendering
            easing: "easeOutQuad", // Smoother easing effect
          },
          interaction: {
            mode: "index", // Display tooltips for all datasets on hover
            intersect: false,
          },
          ...options, // Merge additional options
        }}
      />
    </div>
  ) : (
    <p className="text-red-500">Unsupported chart type</p>
  );
};

ChartCard.propTypes = {
  type: PropTypes.string.isRequired, // Type of chart (line, bar, etc.)
  data: PropTypes.object.isRequired, // Chart.js-compatible data object
  title: PropTypes.string, // Optional title for the chart
  options: PropTypes.object, // Chart.js-specific options to override defaults
};

ChartCard.defaultProps = {
  title: null,
  options: {}, // Default to empty object for customization
};

export default ChartCard;

