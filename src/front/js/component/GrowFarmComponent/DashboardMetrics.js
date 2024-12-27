import React from "react";

const DashboardMetrics = ({ metrics }) => {
  return (
    <div className="dashboard-metrics">
      {metrics.map((metric, index) => (
        <div key={index} className="metric-card">
          <h3>{metric.title}</h3>
          <p>{metric.value}</p>
        </div>
      ))}
    </div>
  );
};

export default DashboardMetrics;
