import React, { useState, useEffect } from "react";

const Reviews = ({ customerReviews }) => {
  const [sentimentResults, setSentimentResults] = useState([]);

  useEffect(() => {
    fetch('/api/reviews/sentiment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviews: customerReviews }),
    })
      .then(response => response.json())
      .then(data => setSentimentResults(data))
      .catch(error => console.error('Error analyzing sentiment:', error));
  }, [customerReviews]);

  return (
    <div>
      <h2>Customer Reviews and Sentiment</h2>
      <ul>
        {sentimentResults.map((result, index) => (
          <li key={index}>
            <strong>Review:</strong> {result.review} <br />
            <strong>Sentiment:</strong> {result.sentiment}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Reviews;
