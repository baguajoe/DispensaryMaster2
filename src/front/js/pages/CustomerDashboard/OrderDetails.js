import React from "react";

const OrderDetails = ({ orderId }) => {
  const order = {
    id: orderId,
    date: "2025-01-01",
    status: "Delivered",
    items: [
      { name: "Product 1", quantity: 1, price: "$25.00" },
      { name: "Product 2", quantity: 2, price: "$12.50" },
    ],
    total: "$50.00",
    trackingInfo: "123456789",
  };

  const downloadInvoice = () => {
    alert("Invoice Downloaded! (Mock Function)");
  };

  return (
    <div>
      <h1>Order Details</h1>
      <p>Order ID: {order.id}</p>
      <p>Status: {order.status}</p>
      <p>Date: {order.date}</p>
      <p>Total: {order.total}</p>
      <h3>Items:</h3>
      <ul>
        {order.items.map((item, index) => (
          <li key={index}>
            {item.name} - {item.quantity} x {item.price}
          </li>
        ))}
      </ul>
      <p>Tracking Info: {order.trackingInfo}</p>
      <button onClick={downloadInvoice}>Download Invoice</button>
    </div>
  );
};

export default OrderDetails;
