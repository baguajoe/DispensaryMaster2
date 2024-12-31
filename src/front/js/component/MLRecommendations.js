import React, { useEffect, useState } from "react";

const MLRecommendations = ({ customerId }) => {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      const response = await fetch("/api/recommendations/ml", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_id: customerId }),
      });
      const data = await response.json();
      setRecommendations(data);
    };

    fetchRecommendations();
  }, [customerId]);

  return (
    <div>
      <h3>ML-Based Recommendations</h3>
      <ul>
        {recommendations.map((product) => (
          <li key={product.id}>
            {product.name} - {product.category}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MLRecommendations;
