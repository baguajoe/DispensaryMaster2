import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import DatePicker from "react-datepicker"; // Date range picker
import "react-datepicker/dist/react-datepicker.css"; // Date picker styles
import { CSVLink } from "react-csv"; // Export to CSV
import analyticsService from "../Services/analyticsService"; // Fetch analytics data

const AnalyticsDashboard = () => {
  const [salesData, setSalesData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(null); // Start date for filtering
  const [endDate, setEndDate] = useState(null); // End date for filtering

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  // Fetch sales analytics
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [sales, inventory] = await Promise.all([
        analyticsService.getSalesAnalytics({ startDate, endDate }),
        analyticsService.getInventoryAnalytics(),
      ]);
      setSalesData(sales);
      setInventoryData(inventory);
    } catch (err) {
      setError("Failed to fetch analytics data.");
      console.log(err)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [startDate, endDate]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-6 bg-gray-100">
      {/* Dashboard Title */}
      <h1 className="text-2xl font-bold mb-6">Enhanced Analytics Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 shadow rounded-lg">
          <h3 className="text-lg font-semibold">Total Sales</h3>
          <p className="text-2xl font-bold">
            {formatCurrency(
              salesData.reduce((acc, item) => acc + item.sales, 0)
            )}
          </p>
        </div>
        <div className="bg-white p-4 shadow rounded-lg">
          <h3 className="text-lg font-semibold">Total Orders</h3>
          <p className="text-2xl font-bold">{salesData.length}</p>
        </div>
        <div className="bg-white p-4 shadow rounded-lg">
          <h3 className="text-lg font-semibold">Top Inventory Category</h3>
          <p className="text-2xl font-bold">
            {inventoryData[0]?.category || "N/A"}
          </p>
        </div>
        <div className="bg-white p-4 shadow rounded-lg">
          <h3 className="text-lg font-semibold">Average Order Value</h3>
          <p className="text-2xl font-bold">
            {formatCurrency(
              salesData.reduce((acc, item) => acc + item.sales, 0) /
                salesData.length || 0
            )}
          </p>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center gap-4 mb-6">
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          placeholderText="Start Date"
        />
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          placeholderText="End Date"
        />
        <button
          onClick={fetchAnalytics}
          className="bg-blue-500 text-white px-4 py-2 rounded shadow"
        >
          Apply Filter
        </button>
      </div>

      {/* Sales Chart */}
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

      {/* Inventory Chart */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Inventory Insights</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={inventoryData}>
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line dataKey="quantity" stroke="#82ca9d" name="Inventory" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Export to CSV */}
      <div className="mb-4">
        <CSVLink
          data={salesData}
          headers={[
            { label: "Date", key: "date" },
            { label: "Sales", key: "sales" },
          ]}
          filename="sales_analytics.csv"
          className="bg-green-500 text-white px-4 py-2 rounded shadow"
        >
          Export Sales Data
        </CSVLink>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
