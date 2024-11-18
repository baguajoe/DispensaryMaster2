import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddCustomer = () => {
  const [customer, setCustomer] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    membership_level: "standard",
    verification_status: "pending",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/customers", customer);
      alert("Customer added successfully!");
      navigate("/customers");
    } catch (error) {
      console.error("Error adding customer:", error);
      alert("Error adding customer.");
    }
  };

  return (
    <div>
      <h1>Add Customer</h1>
      <form onSubmit={handleSubmit}>
        <input name="first_name" placeholder="First Name" onChange={handleChange} required />
        <input name="last_name" placeholder="Last Name" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input name="phone" placeholder="Phone" onChange={handleChange} required />
        <select name="membership_level" onChange={handleChange} defaultValue="standard">
          <option value="standard">Standard</option>
          <option value="premium">Premium</option>
          <option value="vip">VIP</option>
        </select>
        <select name="verification_status" onChange={handleChange} defaultValue="pending">
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
        <button type="submit">Add Customer</button>
      </form>
    </div>
  );
};

export default AddCustomer;
