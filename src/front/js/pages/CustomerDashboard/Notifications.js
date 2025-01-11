import React, { useState } from "react";

const Notifications = () => {
  const [notifications] = useState([
    { id: 1, type: "Order", message: "Your order #123 has been shipped." },
    { id: 2, type: "Promotion", message: "20% off your next purchase!" },
  ]);

  const updatePreferences = () => {
    alert("Update notification preferences.");
  };

  return (
    <div>
      <h1>Notifications</h1>
      <h2>Grouped Notifications</h2>
      <div>
        <h3>Orders</h3>
        {notifications
          .filter((n) => n.type === "Order")
          .map((n) => (
            <p key={n.id}>{n.message}</p>
          ))}
      </div>
      <div>
        <h3>Promotions</h3>
        {notifications
          .filter((n) => n.type === "Promotion")
          .map((n) => (
            <p key={n.id}>{n.message}</p>
          ))}
      </div>
      <button onClick={updatePreferences}>Update Preferences</button>
    </div>
  );
};

export default Notifications;
