import React, { useState, useEffect } from "react";
import axios from "axios";

const SalesAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get("/api/analytics/sales");
        setAnalytics(response.data);
      } catch (error) {
        console.error("Error fetching sales analytics:", error);
      }
    };
    fetchAnalytics();
  }, []);

  if (!analytics) return <p>Loading sales analytics...</p>;

  return (
    <div>
      <h1>Sales Analytics</h1>
      <p><strong>Total Sales:</strong> ${analytics.total_sales.toFixed(2)}</p>
      <p><strong>Order Count:</strong> {analytics.order_count}</p>
      <p><strong>Average Order Value:</strong> ${analytics.average_order_value.toFixed(2)}</p>
      <h3>Sales by Date:</h3>
      <ul>
        {Object.entries(analytics.sales_by_date).map(([date, total]) => (
          <li key={date}>{date}: ${total.toFixed(2)}</li>
        ))}
      </ul>
    </div>
  );
};

export default SalesAnalytics;
