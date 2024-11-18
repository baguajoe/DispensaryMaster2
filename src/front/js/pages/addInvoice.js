import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddInvoice = () => {
  const [invoice, setInvoice] = useState({
    customer_id: "",
    order_id: "",
    due_date: "",
    total_amount: "",
    status: "unpaid",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setInvoice({ ...invoice, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/invoices", invoice);
      alert("Invoice added successfully!");
      navigate("/invoices");
    } catch (error) {
      console.error("Error adding invoice:", error);
      alert("Error adding invoice.");
    }
  };

  return (
    <div>
      <h1>Add Invoice</h1>
      <form onSubmit={handleSubmit}>
        <input
          name="customer_id"
          placeholder="Customer ID"
          onChange={handleChange}
          required
        />
        <input
          name="order_id"
          placeholder="Order ID"
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="due_date"
          placeholder="Due Date"
          onChange={handleChange}
        />
        <input
          name="total_amount"
          placeholder="Total Amount"
          onChange={handleChange}
          required
        />
        <select name="status" onChange={handleChange} defaultValue="unpaid">
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
        <button type="submit">Add Invoice</button>
      </form>
    </div>
  );
};

export default AddInvoice;
