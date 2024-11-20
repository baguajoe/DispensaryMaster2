// For API calls related to products

// React (or another framework) for component-based rendering
import React, { useEffect, useState } from 'react';

// Optional: UI libraries like Material-UI or Bootstrap
// import Button from '@mui/material/Button'; // Example with Material-UI


const fetchProducts = async () => {
    const response = await fetch('/api/products', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });
    return await response.json();
  };
  
const Product = async (productData) => {
  return <div>product</div>
  };

export default Product