import React, { useState, useEffect } from "react";

const DashboardOverview = () => {
    const [recentOrders, setRecentOrders] = useState([]);
    const [accountStats, setAccountStats] = useState({
        totalSpent: 0,
        loyaltyPoints: 0,
        ordersCount: 0,
    });

    useEffect(() => {
        // Fetch data for recent orders
        const fetchRecentOrders = async () => {
            // Replace with your API call
            const orders = [
                { id: 1, date: "2025-01-01", amount: "$120", status: "Delivered" },
                { id: 2, date: "2024-12-15", amount: "$75", status: "Processing" },
            ];
            setRecentOrders(orders);
        };

        // Fetch account statistics
        const fetchAccountStats = async () => {
            // Replace with your API call
            const stats = {
                totalSpent: 450,
                loyaltyPoints: 120,
                ordersCount: 15,
            };
            setAccountStats(stats);
        };

        fetchRecentOrders();
        fetchAccountStats();
    }, []);

    return (
        <div>
            <h1>Dashboard Overview</h1>
            <p>Welcome back! Here's a summary of your account activity and stats.</p>

            {/* Account Statistics */}
            <div>
                <h3>Account Statistics</h3>
                <div>
                    <p><strong>Total Spent:</strong> ${accountStats.totalSpent}</p>
                    <p><strong>Loyalty Points:</strong> {accountStats.loyaltyPoints}</p>
                    <p><strong>Total Orders:</strong> {accountStats.ordersCount}</p>
                </div>
            </div>

            <hr />

            {/* Recent Orders */}
            <div>
                <h3>Recent Orders</h3>
                {recentOrders.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((order) => (
                                <tr key={order.id}>
                                    <td>{order.id}</td>
                                    <td>{order.date}</td>
                                    <td>{order.amount}</td>
                                    <td>{order.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No recent orders found.</p>
                )}
            </div>

            <hr />

            {/* Quick Actions */}
            <div>
                <h3>Quick Actions</h3>
                <div>
                    <button onClick={() => alert("Navigating to Profile")}>Update Profile</button>
                    <button onClick={() => alert("Navigating to Orders")}>View Orders</button>
                    <button onClick={() => alert("Navigating to Wishlist")}>View Wishlist</button>
                </div>
            </div>

            <hr />

            {/* Notifications */}
            <div>
                <h3>Notifications</h3>
                <p>You have no new notifications.</p>
            </div>
        </div>
    );
};

export default DashboardOverview;
