import React from "react";

const DashboardMetrics = ({ title, value, icon }) => {
  return (
    <div className="bg-white shadow rounded-lg p-4 flex items-center">
      <div className="text-3xl text-gray-800 font-bold mr-4">{value}</div>
      <div>
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="ml-auto">{icon && React.createElement(icon, { size: 24, className: "text-green-500" })}</div>
    </div>
  );
};

export default DashboardMetrics;
