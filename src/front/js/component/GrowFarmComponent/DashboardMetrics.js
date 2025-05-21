import React from "react";
import "../../../styles/DashboardMetrics.css"; // Make sure this CSS file exists

const DashboardMetrics = ({ title, value, icon, description, onClick }) => {
  return (
    <div className="dashboard-metrics" onClick={onClick}>
      <div className="metric-value">
        {value !== undefined ? value : <div className="placeholder" />}
      </div>
      <div className="metric-content">
        <h3 className="metric-title">{title}</h3>
        {description && <p className="metric-description">{description}</p>}
      </div>
      {icon && <div className="metric-icon">{React.createElement(icon)}</div>}
    </div>
  );
};

export default DashboardMetrics;
