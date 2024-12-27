import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BatchPage = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await axios.get('/api/plant_batches');
      setBatches(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching batches:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Plant Batches</h1>
      <Link to="/add-plant-batch">
        <button>Add New Batch</button>
      </Link>
      <ul>
        {batches.map((batch) => (
          <li key={batch.id}>
            {batch.strain} - {batch.quantity} units - {batch.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BatchPage;
