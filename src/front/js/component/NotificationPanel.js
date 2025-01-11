import React, { useState, useEffect } from "react";

const NotificationPanel = ({ endpoint }) => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  // Fetch notifications from the API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error("Failed to fetch notifications");
        const data = await response.json();
        setNotifications(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchNotifications();
  }, [endpoint]);

  return (
    <div className="notification-panel p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Notifications</h2>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : notifications.length === 0 ? (
        <p>No new notifications.</p>
      ) : (
        <ul>
          {notifications.map((notification, index) => (
            <li key={index} className="mb-2 p-2 bg-gray-100 rounded">
              {notification.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationPanel;
