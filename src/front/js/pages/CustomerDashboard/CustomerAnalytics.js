import React, { useState } from "react";
import { Chart } from "react-google-charts";

const CustomerAnalytics = () => {
  const [spendingData] = useState([
    ["Month", "Amount Spent"],
    ["January", 200],
    ["February", 300],
    ["March", 150],
  ]);

  const milestones = [
    { title: "Spent $1,000", achieved: true },
    { title: "5 Orders Completed", achieved: false },
  ];

  const downloadReport = () => {
    alert("Downloading report as CSV...");
  };

  return (
    <div>
      <h1>Customer Analytics</h1>
      <h2>Spending Habits</h2>
      <Chart
        chartType="LineChart"
        data={spendingData}
        width="100%"
        height="300px"
        options={{ title: "Monthly Spending" }}
      />
      <h2>Milestones</h2>
      <ul>
        {milestones.map((milestone, index) => (
          <li key={index}>
            {milestone.title} - {milestone.achieved ? "Achieved" : "Not Achieved"}
          </li>
        ))}
      </ul>
      <button onClick={downloadReport}>Download Activity Report</button>
    </div>
  );
};

export default CustomerAnalytics;
