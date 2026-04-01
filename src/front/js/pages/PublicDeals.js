import React, { useEffect, useState } from "react";

const PublicDeals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${process.env.BACKEND_URL}/api/deals/public`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch public deals.");
        return res.json();
      })
      .then((data) => {
        setDeals(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading deals...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="public-deals">
      <h1 style={{ color: "#ffab00", fontWeight: 900 }}>Current Promotions</h1>
      <div className="deal-list">
        {deals.length === 0 && <p>No active deals right now.</p>}
        {deals.map((deal) => (
          <div key={deal.id} className="deal-card">
            <h3 style={{ color: "#ffab00", fontWeight: 700 }}>{deal.name}</h3>
            <p><strong>Amount:</strong> ${deal.amount}</p>
            <p><strong>Details:</strong> {deal.description || "No description"}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublicDeals;
