import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';

const InventoryGraph = () => {
  const [inventoryData, setInventoryData] = useState(null);

  useEffect(() => {
    axios.get('/api/analytics/inventory')
      .then((response) => setInventoryData(response.data))
      .catch((error) => console.error('Error fetching inventory data:', error));
  }, []);

  if (!inventoryData) return <p>Loading...</p>;

  const data = {
    labels: ['Low Stock', 'Available Stock'],
    datasets: [
      {
        label: 'Inventory Distribution',
        data: [inventoryData.low_stock_count, inventoryData.total_inventory_value],
        backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
        borderWidth: 1,
      },
    ],
  };

  return <Pie data={data} />;
};

export default InventoryGraph;
