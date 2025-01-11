import React, { useState } from "react";

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([
    { id: 1, name: "Product 1", price: "$25.00", rating: 4.5 },
    { id: 2, name: "Product 2", price: "$15.00", rating: 4.0 },
  ]);

  const filterRecommendations = (category) => {
    alert(`Filter recommendations by ${category}`);
  };

  return (
    <div>
      <h1>Recommendations</h1>
      <button onClick={() => filterRecommendations("Category 1")}>Category 1</button>
      <button onClick={() => filterRecommendations("Category 2")}>Category 2</button>
      <ul>
        {recommendations.map((rec) => (
          <li key={rec.id}>
            {rec.name} - {rec.price} - {rec.rating}★
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Recommendations;
