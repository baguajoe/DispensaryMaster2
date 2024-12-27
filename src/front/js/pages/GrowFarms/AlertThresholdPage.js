import React, { useState, useEffect } from 'react';
import AlertThresholdForm from '../../component/GrowFarmComponent/AlertThresholdForm';
import axios from 'axios';

const AlertThresholdPage = () => {
  const [thresholds, setThresholds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchThresholds();
  }, []);

  const fetchThresholds = async () => {
    try {
      const response = await axios.get('/api/alert-thresholds');
      setThresholds(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching thresholds:', error);
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      await axios.post('/api/alert-thresholds', formData);
      alert('Threshold saved successfully!');
      fetchThresholds();
    } catch (error) {
      console.error('Error saving threshold:', error);
      alert('Failed to save threshold.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Alert Threshold Management</h1>
      <AlertThresholdForm onSubmit={handleFormSubmit} />
      <h2>Existing Thresholds</h2>
      <ul>
        {thresholds.map((threshold) => (
          <li key={threshold.id}>
            {threshold.parameter}: {threshold.threshold} (Email: {threshold.email})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AlertThresholdPage;
