// For API calls to login or register users


// For form handling (e.g., React, plain JS, or any framework)
import React, { useState } from 'react';

// Optional: Add routing if needed
import { useNavigate } from 'react-router-dom'; // Example with React Router


export const login = async (email, password) => {
    const response = await fetch(process.env.BACKEND_URL+'/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('token', data.access_token);
    }
    return data;
  };
  
  export const register = async (email, password) => {
    const response = await fetch(process.env.BACKEND_URL+'/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return await response.json();
  };
  