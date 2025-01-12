import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const CampaignMetrics = () => {
  const { campaignId } = useParams(); // Get campaign ID from route params
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch metrics for a specific campaign
    const fetchMetrics = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/campaigns/${campaignId}/metrics`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch metrics");
        }
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [campaignId]);

  if (loading) return <p>Loading campaign metrics...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-6 bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Campaign Metrics</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={metrics}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="impressions" fill="#8884d8" />
          <Bar dataKey="clicks" fill="#82ca9d" />
          <Bar dataKey="conversions" fill="#ffc658" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CampaignMetrics;
