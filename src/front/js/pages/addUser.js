import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddUser = () => {
  const [user, setUser] = useState({
    email: "",
    password: "",
    role: "user",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/users", user);
      alert("User added successfully!");
      navigate("/users");
    } catch (error) {
      console.error("Error adding user:", error);
      alert("Error adding user.");
    }
  };

  return (
    <div>
      <h1>Add User</h1>
      <form onSubmit={handleSubmit}>
        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <select name="role" onChange={handleChange} defaultValue="user">
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Add User</button>
      </form>
    </div>
  );
};

export default AddUser;
