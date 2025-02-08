import React, { useState, useEffect } from 'react';

const RecentPurchases = ({ patientId }) => {
    const [purchases, setPurchases] = useState([]);

    useEffect(() => {
        // Fetch recent purchases related to medical cannabis
        fetch(`/api/recent-purchases/${patientId}`)
            .then((response) => response.json())
            .then((data) => setPurchases(data))
            .catch((error) => console.error('Error fetching recent purchases:', error));
    }, [patientId]);

    if (!purchases.length) return <p>No recent purchases found.</p>;

    return (
        <div className="recent-purchases">
            <h2>Recent Purchases</h2>
            <ul>
                {purchases.map((purchase) => (
                    <li key={purchase.id}>
                        <p><strong>Product:</strong> {purchase.product_name}</p>
                        <p><strong>Quantity:</strong> {purchase.quantity}</p>
                        <p><strong>Purchase Date:</strong> {new Date(purchase.date).toLocaleDateString()}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RecentPurchases;