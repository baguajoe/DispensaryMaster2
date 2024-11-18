import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`/api/orders/${id}`);
        setOrder(response.data);
      } catch (error) {
        console.error("Error fetching order details:", error);
      }
    };
    fetchOrder();
  }, [id]);

  if (!order) return <p>Loading order details...</p>;

  return (
    <div>
      <h1>Order Details</h1>
      <p><strong>ID:</strong> {order.id}</p>
      <p><strong>Customer ID:</strong> {order.customer_id}</p>
      <p><strong>Total Amount:</strong> ${order.total_amount.toFixed(2)}</p>
      <p><strong>Status:</strong> {order.status}</p>
      <h3>Order Items:</h3>
      <ul>
        {order.order_items.map((item) => (
          <li key={item.id}>
            Product ID: {item.product_id}, Quantity: {item.quantity}, Price: ${item.unit_price.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderDetail;
