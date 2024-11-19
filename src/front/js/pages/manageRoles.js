import React, { useState, useEffect } from "react";
import axios from "axios";

const ManageRoles = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/api/users");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const updateRole = async (id, role) => {
    try {
      await axios.put(`/api/users/${id}/role`, { role });
      setUsers(users.map((user) => (user.id === id ? { ...user, role } : user)));
      alert("Role updated successfully!");
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  return (
    <div>
      <h1>Manage Roles</h1>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <select
                  value={user.role}
                  onChange={(e) => updateRole(user.id, e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageRoles;
