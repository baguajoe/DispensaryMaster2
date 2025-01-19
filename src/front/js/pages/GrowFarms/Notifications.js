import React, { useState, useEffect } from "react";
import axios from "axios";

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        axios.get("/api/notifications")
            .then(response => setNotifications(response.data))
            .catch(error => console.error(error));
    }, []);

    return (
        <div>
            <h1>Notifications</h1>
            <ul>
                {notifications.map((notification, index) => (
                    <li key={index} style={{ color: notification.type === "warning" ? "red" : "black" }}>
                        {notification.message}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Notifications;
