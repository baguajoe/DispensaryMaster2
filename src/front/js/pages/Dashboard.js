import React, { useState, useEffect } from "react";
import MetricCard from "../component/MetricCard";
import ChartCard from "../component/ChartCard";
import TableCard from "../component/TableCard";

const Dashboard = () => {
  const [metrics, setMetrics] = useState([
    { title: "Revenue", value: "$12,500", icon: "💰", trend: 8, bgColor: "bg-green-100", textColor: "text-green-900" },
    { title: "Users", value: "1,250", icon: "👥", trend: 12, bgColor: "bg-blue-100", textColor: "text-blue-900" },
    { title: "Orders", value: "980", icon: "📦", trend: -3, bgColor: "bg-red-100", textColor: "text-red-900" },
    { title: "New Signups", value: "345", icon: "✍️", trend: 15, bgColor: "bg-yellow-100", textColor: "text-yellow-900" },
    { title: "Page Views", value: "18,900", icon: "📄", trend: 5, bgColor: "bg-purple-100", textColor: "text-purple-900" },
    { title: "Conversions", value: "3.2%", icon: "🔄", trend: 1.2, bgColor: "bg-indigo-100", textColor: "text-indigo-900" },
    { title: "Bounce Rate", value: "45%", icon: "📉", trend: -2.5, bgColor: "bg-gray-100", textColor: "text-gray-900" },
    { title: "Avg. Session Time", value: "5m 23s", icon: "⏱️", trend: 0.8, bgColor: "bg-orange-100", textColor: "text-orange-900" },
    { title: "Profit Margin", value: "28%", icon: "📊", trend: 3.5, bgColor: "bg-teal-100", textColor: "text-teal-900" },
    { title: "Refunds", value: "15", icon: "🔙", trend: -1, bgColor: "bg-pink-100", textColor: "text-pink-900" },
    { title: "Subscribers", value: "4,500", icon: "🔔", trend: 10, bgColor: "bg-lime-100", textColor: "text-lime-900" },
    { title: "Active Projects", value: "42", icon: "🚀", trend: 6, bgColor: "bg-cyan-100", textColor: "text-cyan-900" },
  ]);
  const [topCategories, setTopCategories] = useState([]);
  const [salesPerformance, setSalesPerformance] = useState({
    labels: [],
    datasets: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch metrics from the backend
    fetch(process.env.BACKEND_URL + "/api/dashboard/metrics")
      .then((response) => response.json())
      .then((data) => {
        setMetrics(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching metrics:", error);
        setLoading(false);
      });

    // Fetch top categories
    fetch(process.env.BACKEND_URL + "/api/dashboard/top-categories")
      .then((response) => response.json())
      .then((data) => setTopCategories(data))
      .catch((error) => console.error("Error fetching top categories:", error));

    // Fetch sales performance data
    fetch(process.env.BACKEND_URL + "/api/dashboard/sales-performance")
      .then((response) => response.json())
      .then((data) => setSalesPerformance(data))
      .catch((error) => console.error("Error fetching sales performance:", error));
  }, []);

  return (
    <div className="flex">

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, Matthew</h1>
            <p className="text-gray-600">Here are today's stats from your online store!</p>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search"
              className="border p-2 rounded-lg"
            />
            <button className="relative">
              <i className="fas fa-bell text-gray-500"></i>
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">4</span>
            </button>
            <div className="flex items-center gap-2">
              <img
                src="https://via.placeholder.com/40"
                alt="profile"
                className="rounded-full w-10 h-10"
              />
              <span>Matthew Parker</span>
            </div>
          </div>
        </div>

        {/* Metrics Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
          {metrics.map((metric, index) => (
            <MetricCard
              key={index}
              title={metric.title} // Fixed to use the correct property name
              value={metric.value}
              icon={metric.icon} // Added the icon property
              trend={metric.trend}
              bgColor={metric.bgColor} // Use bgColor from the array
              textColor={metric.textColor} // Use textColor from the array
            />
          ))}
        </div>

        {/* Sales Performance Chart */}
        <div className="d-flex gap-4">
          <div className="mb-6 col-6">
            <h2 className="text-xl font-semibold mb-4">Sales Performance</h2>
            {loading ? (
              <p>Loading chart...</p>
            ) : (
              <ChartCard data={salesPerformance} type="line" />
            )}
          </div>

          {/* Top Categories Table */}
          <div>
            <h2 className="text-xl font-semibold mb-4" >Top Categories</h2>
            <TableCard data={topCategories} columns={["Category", "Sales", "Revenue"]} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;   