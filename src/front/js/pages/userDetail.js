import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const UserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`/api/users/${id}`);
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    fetchUser();
  }, [id]);

  if (!user) return <p>Loading user details...</p>;

  return (
    <div>
      <h1>User Details</h1>
      <p><strong>ID:</strong> {user.id}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>
      <p><strong>Active:</strong> {user.is_active ? "Yes" : "No"}</p>
    </div>
  );
};

export default UserDetail;
