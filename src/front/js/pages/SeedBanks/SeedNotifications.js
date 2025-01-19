import React, { useState, useEffect } from "react";
import axios from "axios";

const SeedNotifications = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        axios.get("/api/notifications")
            .then(response => setNotifications(response.data))
            .catch(error => console.error("Error fetching notifications:", error));
    }, []);

    return (
        <div>
            <h1>SeedBank Notifications</h1>
            <div>
                <h2>Storage Condition Alerts</h2>
                <ul>
                    {notifications.alerts?.map((alert, index) => (
                        <li key={index}>
                            <strong>Location:</strong> {alert.location} - 
                            <strong>Message:</strong> {alert.message}
                        </li>
                    ))}
                </ul>
                <h2>Expiring Seed Batches</h2>
                <ul>
                    {notifications.expiring_batches?.map((batch, index) => (
                        <li key={index}>
                            <strong>Strain:</strong> {batch.strain} - 
                            <strong>Expires On:</strong> {batch.expiration_date}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default SeedNotifications;
