import React, { useState, useEffect } from "react";
import axios from "axios";

const InventoryAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get("/api/analytics/inventory");
        setAnalytics(response.data);
      } catch (error) {
        console.error("Error fetching inventory analytics:", error);
      }
    };
    fetchAnalytics();
  }, []);

  if (!analytics) return <p>Loading inventory analytics...</p>;

  return (
    <div>
      <h1>Inventory Analytics</h1>
      <p><strong>Low Stock Count:</strong> {analytics.low_stock_count}</p>
      <h3>Low Stock Products:</h3>
      <ul>
        {analytics.low_stock_products.map((product) => (
          <li key={product.id}>
            {product.name}: {product.current_stock} units remaining
          </li>
        ))}
      </ul>
      <p><strong>Total Inventory Value:</strong> ${analytics.total_inventory_value.toFixed(2)}</p>
    </div>
  );
};

export default InventoryAnalytics;
