import React, { useState, useEffect } from "react";
import Table from "../component/Table";

const AdvancedAnalytics = () => {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch customer analytics data
    fetch(process.env.BACKEND_URL + "/api/analytics/customer-segmentation")
      .then((response) => response.json())
      .then((data) => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching analytics data:", error);
        setLoading(false);
      });
  }, []);

  const columns = ["Customer ID", "Total Spent", "Purchase Frequency", "Last Purchase Date", "Churn Probability"];

  return (
    <div className="p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Advanced Analytics</h1>
      {loading && !analytics ? (
        <p>Loading data...</p>
      ) : (
        <Table
          data={analytics.map((item) => [
            item.customer_id,
            `$${item.total_spent.toFixed(2)}`,
            `${item.purchase_frequency.toFixed(2)} purchases/day`,
            item.last_purchase_date ? new Date(item.last_purchase_date).toLocaleDateString() : "N/A",
            `${(item.churn_probability * 100).toFixed(2)}%`,
          ])}
          columns={columns}
        />
      )}
    </div>
  );
};

export default AdvancedAnalytics;
