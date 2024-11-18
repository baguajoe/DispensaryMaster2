import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddOrder = () => {
  const [order, setOrder] = useState({
    customer_id: "",
    items: [],
  });
  const [item, setItem] = useState({ product_id: "", quantity: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setOrder({ ...order, [e.target.name]: e.target.value });
  };

  const handleItemChange = (e) => {
    setItem({ ...item, [e.target.name]: e.target.value });
  };

  const addItem = () => {
    setOrder({ ...order, items: [...order.items, item] });
    setItem({ product_id: "", quantity: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/orders", order);
      alert("Order added successfully!");
      navigate("/orders");
    } catch (error) {
      console.error("Error adding order:", error);
      alert("Error adding order.");
    }
  };

  return (
    <div>
      <h1>Add Order</h1>
      <form onSubmit={handleSubmit}>
        <input
          name="customer_id"
          placeholder="Customer ID"
          onChange={handleChange}
          required
        />
        <div>
          <h3>Add Item</h3>
          <input
            name="product_id"
            placeholder="Product ID"
            value={item.product_id}
            onChange={handleItemChange}
            required
          />
          <input
            name="quantity"
            placeholder="Quantity"
            value={item.quantity}
            onChange={handleItemChange}
            required
          />
          <button type="button" onClick={addItem}>Add Item</button>
        </div>
        <ul>
          {order.items.map((item, index) => (
            <li key={index}>
              Product ID: {item.product_id}, Quantity: {item.quantity}
            </li>
          ))}
        </ul>
        <button type="submit">Add Order</button>
      </form>
    </div>
  );
};

export default AddOrder;
