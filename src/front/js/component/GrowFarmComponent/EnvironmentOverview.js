import React from "react";

const EnvironmentOverview = ({ overview }) => {
  return (
    <div className="environment-overview">
      <h3>Environment Overview</h3>
      <div className="overview-cards">
        <div className="overview-card">
          <h4>Average Temperature</h4>
          <p>{overview.avgTemperature}°C</p>
        </div>
        <div className="overview-card">
          <h4>Average Humidity</h4>
          <p>{overview.avgHumidity}%</p>
        </div>
        <div className="overview-card">
          <h4>Light Intensity</h4>
          <p>{overview.avgLightIntensity} lx</p>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentOverview;
