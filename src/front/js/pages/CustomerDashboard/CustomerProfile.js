import React, { useState, useEffect } from "react";

const CustomerProfile = () => {
    const [profile, setProfile] = useState({
        name: "John Doe",
        email: "johndoe@example.com",
        phone: "123-456-7890",
        dateOfBirth: "1990-01-01",
        loyaltyPoints: 120,
        totalSpent: 450,
    });

    const [addresses, setAddresses] = useState([
        {
            id: 1,
            type: "Shipping",
            address: "123 Main St, Springfield, IL",
            isDefault: true,
        },
        {
            id: 2,
            type: "Billing",
            address: "456 Elm St, Springfield, IL",
            isDefault: false,
        },
    ]);

    const [orders, setOrders] = useState([]);

    useEffect(() => {
        // Fetch data for orders
        const fetchOrders = async () => {
            // Replace with API call
            const orderData = [
                { id: 1, date: "2025-01-01", total: "$120", status: "Delivered" },
                { id: 2, date: "2024-12-15", total: "$75", status: "Processing" },
            ];
            setOrders(orderData);
        };
        fetchOrders();
    }, []);

    return (
        <div>
            <h1>Customer Profile</h1>

            {/* Basic Info */}
            <div>
                <h3>Basic Information</h3>
                <p><strong>Name:</strong> {profile.name}</p>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Phone:</strong> {profile.phone}</p>
                <p><strong>Date of Birth:</strong> {profile.dateOfBirth}</p>
                <button onClick={() => alert("Edit Profile")}>Edit Profile</button>
            </div>

            <hr />

            {/* Loyalty Points */}
            <div>
                <h3>Loyalty Points</h3>
                <p><strong>Total Points:</strong> {profile.loyaltyPoints}</p>
                <button onClick={() => alert("Redeem Points")}>Redeem Points</button>
            </div>

            <hr />

            {/* Address Book */}
            <div>
                <h3>Address Book</h3>
                {addresses.map((address) => (
                    <div key={address.id}>
                        <p>
                            <strong>{address.type}:</strong> {address.address}{" "}
                            {address.isDefault && <span>(Default)</span>}
                        </p>
                        <button onClick={() => alert("Edit Address")}>Edit</button>
                        <button onClick={() => alert("Delete Address")}>Delete</button>
                    </div>
                ))}
                <button onClick={() => alert("Add New Address")}>Add New Address</button>
            </div>

            <hr />

            {/* Recent Orders */}
            <div>
                <h3>Order History</h3>
                {orders.length > 0 ? (
                    <ul>
                        {orders.map((order) => (
                            <li key={order.id}>
                                Order #{order.id} - {order.date} - {order.total} - {order.status}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No orders found.</p>
                )}
            </div>

            <hr />

            {/* Payment Methods */}
            <div>
                <h3>Payment Methods</h3>
                <p>No saved payment methods.</p>
                <button onClick={() => alert("Add Payment Method")}>Add Payment Method</button>
            </div>

            <hr />

            {/* Notifications */}
            <div>
                <h3>Notification Preferences</h3>
                <button onClick={() => alert("Manage Preferences")}>Manage Notifications</button>
            </div>
        </div>
    );
};

export default CustomerProfile;
