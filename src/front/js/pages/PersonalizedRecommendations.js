import React, { useState, useEffect } from "react";

const PersonalizedRecommendations = ({ customerId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch("/api/recommendations/personalized", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customer_id: customerId }),
        });
        const data = await response.json();
        setRecommendations(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [customerId]);

  if (loading) {
    return <p>Loading recommendations...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Personalized Recommendations</h1>
      <ul>
        {recommendations.map((product) => (
          <li key={product.id} className="border-b py-2">
            <p className="font-semibold">{product.name}</p>
            <p>Category: {product.category}</p>
            <p>THC: {product.thc_content}% | CBD: {product.cbd_content}%</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PersonalizedRecommendations;
