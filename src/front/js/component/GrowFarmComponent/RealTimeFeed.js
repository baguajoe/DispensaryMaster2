import React from "react";

const RealTimeFeed = ({ feed }) => {
  return (
    <div className="real-time-feed">
      <h3>Real-Time Feed</h3>
      <ul>
        {feed.map((event, index) => (
          <li key={index}>
            {event.timestamp}: {event.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RealTimeFeed;
