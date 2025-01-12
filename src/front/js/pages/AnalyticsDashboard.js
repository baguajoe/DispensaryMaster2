import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Table from "../component/Table";
import analyticsService from "../Services/analyticsService";

const AnalyticsDashboard = () => {
  const [salesData, setSalesData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSalesAnalytics = async () => {
    try {
      const sales = await analyticsService.getDashboardAnalytics();
      return sales; // Example response structure: [{ date: '2025-01-01', sales: 200 }]
    } catch (error) {
      throw new Error("Failed to fetch sales analytics.");
    }
  };

  const fetchInventoryAnalytics = async () => {
    try {
      const inventory = await analyticsService.getInventoryForecast();
      return inventory; // Example response structure: [{ category: 'Electronics', quantity: 50 }]
    } catch (error) {
      throw new Error("Failed to fetch inventory analytics.");
    }
  };

  const fetchCustomerAnalytics = async () => {
    try {
      const customerSegmentation = await analyticsService.getCustomerAnalytics();
      return customerSegmentation; // Example response structure: [{ product_type: 'Shirts', revenue: 500, quantity_sold: 20, avg_price: 25 }]
    } catch (error) {
      throw new Error("Failed to fetch customer analytics.");
    }
  };

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const [sales, inventory, customerSegmentation] = await Promise.all([
          fetchSalesAnalytics(),
          fetchInventoryAnalytics(),
          fetchCustomerAnalytics(),
        ]);

        setSalesData(sales);
        setInventoryData(inventory);
        setCustomerData(customerSegmentation);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const tableColumns = [
    "Product Type",
    "Revenue",
    "Quantity Sold",
    "Average Price",
  ];

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  if (loading) return <p>Loading analytics...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

      {/* Sales Bar Chart */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Sales Analytics</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesData}>
            <XAxis dataKey="date" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="sales" fill="#8884d8" name="Sales" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Inventory Bar Chart */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Inventory Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={inventoryData}>
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="quantity" fill="#82ca9d" name="Inventory" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Customer Analytics Table */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Customer Analytics</h2>
        <Table
          data={customerData.map((item) => [
            item.product_type,
            formatCurrency(item.revenue),
            item.quantity_sold,
            formatCurrency(item.avg_price),
          ])}
          columns={tableColumns}
        />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
