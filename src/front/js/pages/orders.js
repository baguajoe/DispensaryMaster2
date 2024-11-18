import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("/api/orders");
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, []);

  const handleView = (id) => navigate(`/orders/${id}`);
  const handleAdd = () => navigate("/orders/add");

  return (
    <div>
      <h1>Orders</h1>
      <button onClick={handleAdd}>Add Order</button>
      <table
