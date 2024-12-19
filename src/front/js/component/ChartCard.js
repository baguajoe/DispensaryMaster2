import React from "react";
import { Line, Bar } from "react-chartjs-2";
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
  };

  const ChartComponent = chartTypes[type] || null;

  return ChartComponent ? (
    <div className="bg-white shadow-lg rounded-lg p-4">
      {title && <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>}
      <ChartComponent
        data={data}
        options={{
          responsive: true,
          plugins: {
            legend: { display: true, position: "top" },
            tooltip: { enabled: true },
          },
          ...options, // Allow custom options
        }}
      />
    </div>
  ) : (
    <p className="text-red-500">Unsupported chart type</p>
  );
};

ChartCard.propTypes = {
  type: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  title: PropTypes.string,
  options: PropTypes.object, // Allow custom chart options
};

ChartCard.defaultProps = {
  title: null,
  options: {},
};

export default ChartCard;

