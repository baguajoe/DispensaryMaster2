import React from "react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <ul>
        <li><Link to="/users">Manage Users</Link></li>
        <li><Link to="/compliance">Compliance Reports</Link></li>
        <li><Link to="/analytics/sales">Sales Analytics</Link></li>
        <li><Link to="/analytics/inventory">Inventory Analytics</Link></li>
      </ul>
    </div>
  );
};

export default AdminDashboard;
