import React, { useState, useEffect } from "react";
import ChartCard from "../component/ChartCard";
import MetricCard from "../component/MetricCard";

const AnalyticsDashboardPage = () => {
  const [metrics, setMetrics] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [metricsResponse, salesResponse] = await Promise.all([
          fetch(`${process.env.BACKEND_URL}/api/analytics/metrics`),
          fetch(`${process.env.BACKEND_URL}/api/analytics/sales`),
        ]);

        setMetrics(await metricsResponse.json());
        setSalesData(await salesResponse.json());
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
      {loading ? (
        <p>Loading analytics...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {metrics.map((metric, index) => (
              <MetricCard key={index} {...metric} />
            ))}
          </div>
          <ChartCard type="bar" data={salesData} title="Sales Trends" />
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboardPage;
