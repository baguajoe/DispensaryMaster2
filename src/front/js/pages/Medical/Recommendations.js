import React, { useState } from "react";

const Recommendations = () => {
  const [symptoms, setSymptoms] = useState("");
  const [recommendations, setRecommendations] = useState([]);

  const fetchRecommendations = async () => {
    const response = await fetch(`/api/recommendations?symptoms=${symptoms}`);
    const data = await response.json();
    setRecommendations(data);
  };

  return (
    <div>
      <h2>Product Recommendations</h2>
      <input
        type="text"
        placeholder="Enter symptoms"
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
      />
      <button onClick={fetchRecommendations}>Get Recommendations</button>
      <ul>
        {recommendations.map((rec) => (
          <li key={rec.id}>{rec.productName}</li>
        ))}
      </ul>
    </div>
  );
};

export default Recommendations;
