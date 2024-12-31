import React, { useState, useEffect } from "react";
import GridLayoutComponent from "../component/GridLayoutComponent";
import MetricCard from "../component/MetricCard";
import ChartCard from "../component/ChartCard";
import TableCard from "../component/TableCard";
import PersonalizedRecommendations from "../component/PersonalizedRecommendations"; // Import this component
import SentimentAnalysis from "../component/SentimentAnalysis";
import ComplianceWidget from "../component/Widgets/ComplianceWidget";
import SalesWidget from "../component/Widgets/SalesWidget";
import InventoryWidget from "../component/Widgets/InventoryWidget";
import Inventory from "../component/Inventory"; // Adjust path


const Dashboard = () => {
  const [metrics, setMetrics] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [salesPerformance, setSalesPerformance] = useState({
    labels: [],
    datasets: [],
  });
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState([
    { i: "metrics", x: 0, y: 0, w: 12, h: 2 },
    { i: "sales", x: 0, y: 2, w: 6, h: 4 },
    { i: "categories", x: 6, y: 2, w: 6, h: 4 },
    { i: "recommendations", x: 0, y: 6, w: 6, h: 4 },
    { i: "reviews", x: 6, y: 6, w: 6, h: 4 },
    { i: "inventory", x: 0, y: 10, w: 12, h: 6 }, // Add this for Inventory
    { i: "inventoryWidget", x: 6, y: 10, w: 6, h: 6 }, // For InventoryWidget
    { i: "compliance", x: 6, y: 10, w: 6, h: 6 }, // Compliance Widget
    { i: "salesWidget", x: 0, y: 16, w: 12, h: 4 }, // Sales Widget
  ]);

  // Add a new widget
  const addWidget = () => {
    const newWidget = {
      i: `widget-${layout.length + 1}`,
      x: 0,
      y: Infinity, // Place at the bottom
      w: 6,
      h: 4,
    };
    setLayout([...layout, newWidget]);
  };

  // Remove a widget by ID
  const removeWidget = (id) => {
    setLayout(layout.filter((widget) => widget.i !== id));
  };
  const loggedInCustomerId = 1; // Replace with the actual logged-in customer ID

  const customerReviews = [
    "The product was amazing!",
    "I didn't like the quality.",
    "Great service and fast delivery."
  ]; // Replace with real data

  useEffect(() => {
    // Simulated metric data
    const staticMetrics = [
      { title: "Total Sales", value: "$12,500", icon: "\uD83D\uDCB0", trend: 8, bgColor: "bg-green-100", textColor: "text-green-900" },
      { title: "New Products", value: "12", icon: "\uD83D\uDC8E", trend: 5, bgColor: "bg-blue-100", textColor: "text-blue-900" },
      { title: "Average Purchase Order", value: "$180", icon: "\uD83D\uDED2", trend: 2, bgColor: "bg-yellow-100", textColor: "text-yellow-900" },
      { title: "Users", value: "1,345", icon: "\uD83D\uDC64", trend: 15, bgColor: "bg-purple-100", textColor: "text-purple-900" },
      { title: "Refunds", value: "$320", icon: "\uD83D\uDCB8", trend: -3, bgColor: "bg-red-100", textColor: "text-red-900" },
      { title: "Product Availability", value: "93%", icon: "\uD83D\uDCCA", trend: 1, bgColor: "bg-teal-100", textColor: "text-teal-900" },
      { title: "Supply Below Safety Stock", value: "8", icon: "\uD83D\uDCC9", trend: -2, bgColor: "bg-gray-100", textColor: "text-gray-900" },
      { title: "Invoices", value: "295", icon: "\uD83D\uDCD2", trend: 7, bgColor: "bg-indigo-100", textColor: "text-indigo-900" },
      { title: "Today's Invoice", value: "28", icon: "\uD83D\uDCC6", trend: 3, bgColor: "bg-orange-100", textColor: "text-orange-900" },
      { title: "Current Monthly", value: "$22,560", icon: "\uD83D\uDCC5", trend: 10, bgColor: "bg-green-100", textColor: "text-green-900" },
      { title: "Inventory", value: "965", icon: "\uD83D\uDC8E", trend: 4, bgColor: "bg-blue-100", textColor: "text-blue-900" },
      { title: "Stores", value: "4", icon: "\uD83C\uDFE3", trend: 0, bgColor: "bg-yellow-100", textColor: "text-yellow-900" },
      { title: "Top Categories", value: "Electronics, Clothing", icon: "\uD83D\uDCC2", trend: 6, bgColor: "bg-purple-100", textColor: "text-purple-900" },
      { title: "Sales Performance", value: "Trending Up", icon: "\uD83D\uDCC8", trend: 12, bgColor: "bg-teal-100", textColor: "text-teal-900" },
    ];
    setMetrics(staticMetrics);

    // Fetch top categories
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/dashboard/top-categories`)
      .then((response) => response.json())
      .then((data) => setTopCategories(data))
      .catch((error) => console.error("Error fetching top categories:", error));

    // Fetch sales performance data
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/dashboard/sales-performance`)
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

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
    // Save layout to backend or local storage for persistence
    localStorage.setItem("dashboardLayout", JSON.stringify(newLayout));
  };

  return (
    <div className="p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      {/* Widget Controls */}
      <div className="mb-4">
        <button onClick={addWidget} className="px-4 py-2 bg-blue-500 text-white rounded mr-2">
          Add Widget
        </button>
        {layout.map((widget) => (
          <button
            key={widget.i}
            onClick={() => removeWidget(widget.i)}
            className="px-4 py-2 bg-red-500 text-white rounded mr-2"
          >
            Remove {widget.i}
          </button>
        ))}
      </div>

      <GridLayoutComponent
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={30}
        width={1200}
        onLayoutChange={handleLayoutChange}
      >
        {/* Metrics Section */}
        <div key="metrics" className="widget">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            {metrics.map((metric, index) => (
              <MetricCard
                key={index}
                title={metric.title}
                value={metric.value}
                icon={metric.icon}
                trend={metric.trend}
                bgColor={metric.bgColor}
                textColor={metric.textColor}
              />
            ))}
          </div>
        </div>

        {/* Sales Performance Chart */}
        <div key="sales" className="widget">
          <h2 className="text-xl font-semibold mb-4">Sales Performance</h2>
          {loading ? (
            <p>Loading chart...</p>
          ) : (
            <ChartCard type="line" data={salesPerformance} title="Sales Over Time" />
          )}
        </div>

        {/* Top Categories Table */}
        <div key="categories" className="widget">
          <h2 className="text-xl font-semibold mb-4">Top Categories</h2>
          <TableCard
            data={topCategories}
            columns={["Category", "Sales", "Revenue"]}
            keyMapping={{
              Category: "category",
              Sales: "sales",
              Revenue: "revenue",
            }}
          />
        </div>

        {/* Personalized Recommendations */}
        <div key="recommendations" className="widget">
          <h2 className="text-xl font-semibold mb-4">Personalized Recommendations</h2>
          <PersonalizedRecommendations customerId={loggedInCustomerId} />
        </div>

        {/* Customer Reviews */}
        <div key="reviews" className="widget">
          <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
          <SentimentAnalysis customerReviews={customerReviews} />
        </div>

        {/* Inventory Section */}
        <div key="inventory" className="widget">
          <h2 className="text-xl font-semibold mb-4">Inventory</h2>
          <Inventory />
        </div>
        <div key="inventoryWidget" className="widget">
          <h2 className="text-xl font-semibold mb-4">Inventory Widget</h2>
          <InventoryWidget />
        </div>
        {/* Compliance Widget */}
        <div key="compliance" className="widget">
          <h2 className="text-xl font-semibold mb-4">Compliance</h2>
          <ComplianceWidget />
        </div>

        {/* Sales Widget */}
        <div key="salesWidget" className="widget">
          <h2 className="text-xl font-semibold mb-4">Sales Overview</h2>
          <SalesWidget />
        </div>

      </GridLayoutComponent>
    </div>
  );
};


export default Dashboard;
