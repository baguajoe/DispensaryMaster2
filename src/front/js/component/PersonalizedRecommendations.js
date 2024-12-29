import React, { useState, useEffect } from "react";

const PersonalizedRecommendations = ({ customerId }) => {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    fetch('/api/recommendations/personalized', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id: customerId }),
    })
      .then(response => response.json())
      .then(data => setRecommendations(data)) // Update state with recommendations
      .catch(error => console.error('Error fetching personalized recommendations:', error));
  }, [customerId]);

  return (
    <div>
      <h2>Personalized Recommendations</h2>
      {recommendations.length > 0 ? (
        <ul>
          {recommendations.map((product) => (
            <li key={product.id}>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p><strong>Category:</strong> {product.category}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No recommendations available at this time.</p>
      )}
    </div>
  );
};

export default PersonalizedRecommendations;
