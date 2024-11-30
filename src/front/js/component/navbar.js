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
      <nav class="navbar navbar-light navbar navbar-expand-lg" style={{backgroundColor: "#e3f2fd"}}>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
      <div className="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li className='nav-item'><Link className='nav-link' to="/">Home</Link></li>
          <li className='nav-item'><Link className='nav-link' to="/dashboard">Dashboard</Link></li>
          <li className="nav-item"><Link className='nav-link' to="/products">Products</Link></li>
          <li className='nav-item'><Link className='nav-link' to="/inventory">Inventory</Link></li>
          <li className='nav-item'><Link className='nav-link' to="/invoices">Invoices</Link></li>
          <li className='nav-item'><Link className='nav-link' to="/customers">Customers</Link></li>
          <li className='nav-item'><Link className='nav-link' to="/analytics">Analytics</Link></li>
          <li className='nav-item'><Link className='nav-link' to="/register">Register</Link></li>
          <li className='nav-item'><button className='nav-link' onClck={handleSignOut} style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}>Sign Out</button></li>
        </ul>
        </div>
      </nav>

      {/* Main content area */}
     
      {/* Footer */}
     
    </div>
  );
};

export default Navbar;
