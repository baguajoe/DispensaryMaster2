// For API calls related to analytics
import { fetchSalesAnalytics, fetchInventoryAnalytics } from './analytics';

// React for rendering and state management
import React, { useState, useEffect } from 'react';

// Optional: Charting library
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'; // Example with Recharts


export const fetchSalesAnalytics = async () => {
    const response = await fetch('/api/analytics/sales', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });
    return await response.json();
  };
  
  export const fetchInventoryAnalytics = async () => {
    const response = await fetch('/api/analytics/inventory', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });
    return await response.json();
  };
  