import React from "react";
import PropTypes from "prop-types";
import "../../../styles/medical/RecommendationsComponent.css";

const RecommendationsComponent = ({ recommendations }) => {
  return (
    <div className="recommendations-list">
      {recommendations.length === 0 ? (
        <p>No recommendations found. Try different symptoms.</p>
      ) : (
        <ul>
          {recommendations.map((recommendation) => (
            <li key={recommendation.id} className="recommendation-card">
              <div className="product-info">
                <h3>{recommendation.productName}</h3>
                <p><strong>Category:</strong> {recommendation.category}</p>
                <p><strong>THC:</strong> {recommendation.thcContent}% | <strong>CBD:</strong> {recommendation.cbdContent}%</p>
                <p><strong>Benefits:</strong> {recommendation.benefits}</p>
                <p><strong>Form:</strong> {recommendation.formType}</p>
                <p><strong>Price:</strong> ${recommendation.price.toFixed(2)}</p>
              </div>
              <button>Add to Cart</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

RecommendationsComponent.propTypes = {
  recommendations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      productName: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      thcContent: PropTypes.number.isRequired,
      cbdContent: PropTypes.number.isRequired,
      benefits: PropTypes.string.isRequired,
      formType: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default RecommendationsComponent;
