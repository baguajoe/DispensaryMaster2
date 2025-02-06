import React, { useState } from "react";
import RecommendationsComponent from "../../component/MedicalComponent/RecommendationsComponent";
import '../../../styles/medical/Recommendations.css';

const Recommendations = () => {
  const [symptoms, setSymptoms] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRecommendations = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/recommendations?symptoms=${symptoms}`);
      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }
      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recommendations-container">
      <h2>Personalized Product Recommendations</h2>
      <p>Enter your symptoms to discover products that match your needs.</p>

      <div className="input-section">
        <input
          type="text"
          placeholder="e.g., anxiety, chronic pain"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
        />
        <button onClick={fetchRecommendations} disabled={!symptoms}>
          Get Recommendations
        </button>
      </div>

      {loading && <p className="loading-message">Loading recommendations...</p>}
      {error && <p className="error-message">{error}</p>}

      <RecommendationsComponent recommendations={recommendations} />
    </div>
  );
};

export default Recommendations;
