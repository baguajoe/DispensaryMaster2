// src/Layout.js
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import "../../styles/navbar.css"

const Navbar = () => {
  // const navigate = useNavigate();

  const handleSignOut = () => {
    // Clear user session (e.g., remove token from localStorage)
    localStorage.removeItem('token');
    navigate('/login'); // Redirect to login page
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div>
      {/* Navbar */}
      <nav class="navbar navbar-expand-lg bg-body-tertiary">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">Navbar</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
      <div class="navbar-nav">
        <a class="nav-link active" aria-current="page" href="#">Home</a>
        <a class="nav-link" href="#">Features</a>
        <a class="nav-link" href="#">Pricing</a>
        <a class="nav-link disabled" aria-disabled="true">Disabled</a>
      </div>
    </div>
  </div>
</nav>


    </div>
  );
};

export default Navbar;
