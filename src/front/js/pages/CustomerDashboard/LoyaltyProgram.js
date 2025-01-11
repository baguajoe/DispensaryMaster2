import React, { useState } from "react";

const LoyaltyProgram = () => {
  const [points, setPoints] = useState(250);
  const [history] = useState([
    { date: "2025-01-01", action: "Earned", points: 50 },
    { date: "2025-01-03", action: "Redeemed", points: -20 },
  ]);

  const redeemPoints = () => {
    if (points < 100) {
      alert("You need at least 100 points to redeem.");
      return;
    }
    setPoints(points - 100);
    alert("Redeemed 100 points for a discount!");
  };

  return (
    <div>
      <h1>Loyalty Program</h1>
      <p>Points: {points}</p>
      <button onClick={redeemPoints}>Redeem Points</button>
      <h2>Point History</h2>
      <ul>
        {history.map((entry, index) => (
          <li key={index}>
            {entry.date}: {entry.action} {entry.points} points
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LoyaltyProgram;
