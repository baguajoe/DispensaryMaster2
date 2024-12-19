import React from "react";
import { Line, Bar } from "react-chartjs-2";
import PropTypes from "prop-types";

// const MetricCard = ({ title, value, icon, trend, bgColor = "bg-white", textColor = "text-gray-900" }) => (
//   <div style={{borderRadius :"20px"}} className={`${bgColor} shadow-lg p-4 flex items-center space-x-4 col-3`}>
//     {icon && <div className="text-blue-500 text-3xl">{icon}</div>}
//     <div>
//       <h3 className={`text-lg font-semibold ${textColor}`}>{title}</h3>
//       <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
//       {trend && (
//         <p className={`text-sm ${trend > 0 ? "text-green-500" : "text-red-500"}`}>
//           {trend > 0 ? `+${trend}%` : `${trend}%`} this week
//         </p>
//       )}
//     </div>
//   </div>
// );

// MetricCard.propTypes = {
//   title: PropTypes.string.isRequired,
//   value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
//   icon: PropTypes.element,
//   trend: PropTypes.number,
//   bgColor: PropTypes.string,
//   textColor: PropTypes.string,
// };

// export default MetricCard;



const MetricCard = ({ title, value, icon, trend }) => {
  // Determine color and icon for trend
  const trendColor = trend === "up" ? "text-green-500" : "text-red-500";
  const trendIcon =
    trend === "up" ? "↑" : trend === "down" ? "↓" : null;

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 flex items-center space-x-4">
      {icon && <div className="text-blue-500 text-3xl">{icon}</div>}
      <div className="flex-grow">
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          {value}
          {trendIcon && (
            <span className={`${trendColor} text-lg ml-2`}>
              {trendIcon}
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

MetricCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.element,
  trend: PropTypes.oneOf(["up", "down", null]), // Trend can be "up", "down", or null
};

export default MetricCard;
