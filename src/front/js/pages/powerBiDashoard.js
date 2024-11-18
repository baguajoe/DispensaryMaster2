import React from "react";
import PowerBIDashboard from "../components/PowerBIDashboard";

const PowerBIDashboardPage = () => {
  const embedUrl = "https://app.powerbi.com/reportEmbed?reportId=your-dashboard-id";
  const embedToken = "your-embed-token"; // Fetch this securely from your backend

  return (
    <div>
      <h1>Power BI Dashboard</h1>
      <PowerBIDashboard embedUrl={embedUrl} embedToken={embedToken} />
    </div>
  );
};

export default PowerBIDashboardPage;
