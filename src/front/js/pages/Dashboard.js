import React, { useState, useEffect } from 'react';
import SalesGraph from '../component/SalesGraph'; // Adjust the import path based on your structure
import axios from 'axios';
import InventoryGraph from "../../../api/InventoryGraph";



const Dashboard = () => {
  const [salesData, setSalesData] = useState(null);

  useEffect(() => {
    axios.get('/api/analytics/sales')
      .then((response) => setSalesData(response.data))
      .catch((error) => console.error('Error fetching sales data:', error));
  }, []);

  if (!salesData) return <p>Loading...</p>;

    return (
      <div className="p-6 bg-gray-100">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Sales Analytics</h2>
            <SalesGraph salesData={salesData} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Inventory Analytics</h2>
            <InventoryGraph />
          </div>
        </div>
      </div>
    );
  };




export default Dashboard;
