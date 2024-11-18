import React from "react";
import PowerBIChart from "../components/PowerBIChart";

const PowerBIChartsPage = () => {
  const charts = [
    {
      embedUrl: "https://app.powerbi.com/chartEmbed?chartId=chart-1-id",
      embedToken: "your-embed-token-1",
    },
    {
      embedUrl: "https://app.powerbi.com/chartEmbed?chartId=chart-2-id",
      embedToken: "your-embed-token-2",
    },
  ];

  return (
    <div>
      <h1>Power BI Charts</h1>
      {charts.map((chart, index) => (
        <PowerBIChart key={index} embedUrl={chart.embedUrl} embedToken={chart.embedToken} />
      ))}
    </div>
  );
};

export default PowerBIChartsPage;
