import React, { useState, useEffect } from "react"; // Core React imports
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"; // Recharts for data visualization
import {
  fetchSalesAnalytics,
  fetchInventoryAnalytics,
  formatCurrency,
  handleAnalyticsError,
} from "./Analytics"; // Importing functions from Analytics.js

const AnalyticsComponent = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const sales = await fetchSalesAnalytics();
        setSalesData(sales);
      } catch (err) {
        setError(handleAnalyticsError(err));
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Sales Analytics</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={salesData}>
          <XAxis dataKey="date" />
          <YAxis tickFormatter={formatCurrency} />
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Legend />
          <Bar dataKey="sales" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalyticsComponent;
