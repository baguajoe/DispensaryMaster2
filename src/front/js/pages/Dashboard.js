import React, { useState, useEffect } from "react";
import MetricCard from "../component/MetricCard";
import Table from "../component/Table";
import Chart from "../component/Chart";

const Dashboard = () => {
  const [metrics, setMetrics] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [salesPerformance, setSalesPerformance] = useState({
    labels: [],
    datasets: [],
  });
  const [loading, setLoading] = useState(true); // Tracks loading state

  useEffect(() => {
    // Fetch dashboard metrics
    fetch(process.env.BACKEND_URL + "/api/dashboard/metrics")
      .then((response) => response.json())
      .then((data) => setMetrics(data))
      .catch((error) => console.error("Error fetching metrics:", error));

    // Fetch top categories
    fetch("/api/dashboard/top-categories")
      .then((response) => response.json())
      .then((data) => setTopCategories(data))
      .catch((error) => console.error("Error fetching top categories:", error));

    // Fetch sales performance data
    fetch("/api/dashboard/sales-performance")
      .then((response) => response.json())
      .then((data) => {
        setSalesPerformance(data); // Update state with fetched data
        setLoading(false); // Data loading complete
      })
      .catch((error) => {
        console.error("Error fetching sales performance:", error);
        setLoading(false); // Ensure loading is stopped even on error
      });
  }, []);

  return (
    <div className="p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.label}
            value={metric.value}
            icon={React.createElement(require("react-icons/fa")[metric.icon])} // Dynamically render icons
          />
        ))}
      </div>

      {/* Sales Performance Chart */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Sales Performance</h2>
        {loading ? (
          <p>Loading chart...</p>
        ) : (
          <Chart data={salesPerformance} type="line" />
        )}
      </div>

      {/* Top Categories Table */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Top Categories</h2>
        <Table data={topCategories} columns={["Category", "Sales", "Revenue"]} />
      </div>
    </div>
  );
};

export default Dashboard;
