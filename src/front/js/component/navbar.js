// src/Layout.js
import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    // Clear user session (e.g., remove token from localStorage)
    localStorage.removeItem('token');
    navigate('/login'); // Redirect to login page
  };

  return (
    <div>
      {/* Navbar */}
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/products">Products</Link></li>
          <li><Link to="/inventory">Inventory</Link></li>
          <li><Link to="/invoices">Invoices</Link></li>
          <li><Link to="/customers">Customers</Link></li>
          <li><Link to="/analytics">Analytics</Link></li>
          <li><button onClick={handleSignOut} style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}>Sign Out</button></li>
        </ul>
      </nav>

      {/* Main content area */}
     
      {/* Footer */}
     
    </div>
  );
};

export default Navbar;
