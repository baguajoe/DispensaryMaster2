import React from "react";

const EnvironmentDetails = ({ data }) => {
  return (
    <div className="environment-details">
      <h3>Environment Details</h3>
      <ul>
        <li>Temperature: {data.temperature}°C</li>
        <li>Humidity: {data.humidity}%</li>
        <li>Light Intensity: {data.light_intensity} lx</li>
        <li>Timestamp: {new Date(data.timestamp).toLocaleString()}</li>
      </ul>
    </div>
  );
};

export default EnvironmentDetails;
