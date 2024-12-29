import React, { useState, useEffect } from "react";
import MetricCard from "../component/MetricCard";
import ChartCard from "../component/ChartCard";
import TableCard from "../component/TableCard";
import PersonalizedRecommendations from "../component/PersonalizedRecommendations"; // Import this component
import SentimentAnalysis from "../component/SentimentAnalysis";


const Dashboard = () => {
  const [metrics, setMetrics] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [salesPerformance, setSalesPerformance] = useState({
    labels: [],
    datasets: [],
  });
  const [loading, setLoading] = useState(true);

  const loggedInCustomerId = 1; // Replace with the actual logged-in customer ID

  const customerReviews = [
    "The product was amazing!",
    "I didn't like the quality.",
    "Great service and fast delivery."
  ]; // Replace with real data

  useEffect(() => {
    // Simulated metric data
    const staticMetrics = [
      { title: "Total Sales", value: "$12,500", icon: "💰", trend: 8, bgColor: "bg-green-100", textColor: "text-green-900" },
      { title: "New Products", value: "12", icon: "📦", trend: 5, bgColor: "bg-blue-100", textColor: "text-blue-900" },
      { title: "Average Purchase Order", value: "$180", icon: "🛒", trend: 2, bgColor: "bg-yellow-100", textColor: "text-yellow-900" },
      { title: "Users", value: "1,345", icon: "👤", trend: 15, bgColor: "bg-purple-100", textColor: "text-purple-900" },
      { title: "Refunds", value: "$320", icon: "💸", trend: -3, bgColor: "bg-red-100", textColor: "text-red-900" },
      { title: "Product Availability", value: "93%", icon: "📊", trend: 1, bgColor: "bg-teal-100", textColor: "text-teal-900" },
      { title: "Supply Below Safety Stock", value: "8", icon: "📉", trend: -2, bgColor: "bg-gray-100", textColor: "text-gray-900" },
      { title: "Invoices", value: "295", icon: "🧾", trend: 7, bgColor: "bg-indigo-100", textColor: "text-indigo-900" },
      { title: "Today's Invoice", value: "28", icon: "📆", trend: 3, bgColor: "bg-orange-100", textColor: "text-orange-900" },
      { title: "Current Monthly", value: "$22,560", icon: "📅", trend: 10, bgColor: "bg-green-100", textColor: "text-green-900" },
      { title: "Inventory", value: "965", icon: "📦", trend: 4, bgColor: "bg-blue-100", textColor: "text-blue-900" },
      { title: "Stores", value: "4", icon: "🏬", trend: 0, bgColor: "bg-yellow-100", textColor: "text-yellow-900" },
      { title: "Top Categories", value: "Electronics, Clothing", icon: "📂", trend: 6, bgColor: "bg-purple-100", textColor: "text-purple-900" },
      { title: "Sales Performance", value: "Trending Up", icon: "📈", trend: 12, bgColor: "bg-teal-100", textColor: "text-teal-900" },
    ];
    setMetrics(staticMetrics);

    // Fetch top categories
    fetch(process.env.BACKEND_URL + "/api/dashboard/top-categories")
      .then((response) => response.json())
      .then((data) => setTopCategories(data))
      .catch((error) => console.error("Error fetching top categories:", error));

    // Fetch sales performance data
    fetch(process.env.BACKEND_URL + "/api/dashboard/sales-performance")
      .then((response) => response.json())
      .then((data) => {
        setSalesPerformance(data);
        setLoading(false); // Data loading complete
      })
      .catch((error) => {
        console.error("Error fetching sales performance:", error);
        setLoading(false); // Ensure loading state is handled
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
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            trend={metric.trend} // Pass trend data
            bgColor={metric.bgColor} // Pass background color
            textColor={metric.textColor} // Pass text color
          />
        ))}
      </div>

      {/* Sales Performance Chart */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Sales Performance</h2>
        {loading ? (
          <p>Loading chart...</p>
        ) : (
          <ChartCard type="line" data={salesPerformance} title="Sales Over Time" />
        )}
      </div>

      {/* Top Categories Table */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Top Categories</h2>
        <TableCard
          data={topCategories}
          columns={["Category", "Sales", "Revenue"]}
          keyMapping={{
            Category: "category",
            Sales: "sales",
            Revenue: "revenue",
          }} // Map data keys to columns
        />
      </div>
      {/* Personalized Recommendations */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Personalized Recommendations</h2>
        <PersonalizedRecommendations customerId={loggedInCustomerId} />
      </div>
      <div className="mt-6">
      <h1 className="text-xl font-semibold mb-4">Customer Reviews</h1>
      <SentimentAnalysis customerReviews={customerReviews} />
    </div>
    </div>
  );
};

export default Dashboard;
