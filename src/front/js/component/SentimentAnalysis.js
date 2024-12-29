import React, { useState, useEffect } from "react";

const SentimentAnalysis = ({ customerReviews }) => {
  const [sentimentResults, setSentimentResults] = useState([]);

  useEffect(() => {
    fetch(process.env.BACKEND_URL + '/api/reviews/sentiment', {
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
      <h2>Sentiment Analysis</h2>
      <ul>
        {sentimentResults.map((result, index) => (
          <li key={index}>
            <strong>Review:</strong> {result.review} <br />
            <strong>Sentiment:</strong> {result.sentiment} <br />
            <strong>Polarity:</strong> {result.polarity}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SentimentAnalysis;
