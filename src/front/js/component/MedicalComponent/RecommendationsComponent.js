import React from "react";
import PropTypes from "prop-types";

const RecommendationsComponent = ({ recommendations }) => {
  return (
    <div>
      <h3>Product Recommendations</h3>
      <ul>
        {recommendations.map((recommendation) => (
          <li key={recommendation.id}>{recommendation.productName}</li>
        ))}
      </ul>
    </div>
  );
};

RecommendationsComponent.propTypes = {
  recommendations: PropTypes.array.isRequired,
};

export default RecommendationsComponent;
