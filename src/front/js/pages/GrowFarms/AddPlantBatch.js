import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BatchForm from '../../component/GrowFarmComponent/BatchForm';
import "../../../styles/GrowFarm/AddPlantBatch.css";

const AddPlantBatch = () => {
  const [formData, setFormData] = useState({
    strain: '',
    yield_amount: '',
    start_date: '',
    end_date: '',
    status: 'Growing',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(process.env.BACKEND_URL + '/api/plant_batches', formData);
      alert('Plant batch added successfully!');
      navigate('/batches');
    } catch (error) {
      console.error('Error adding plant batch:', error);
      alert('Failed to add plant batch.');
    }
  };

  return (
    <div>
      <BatchForm
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isEditMode={false}
      />
    </div>
  );
};

export default AddPlantBatch;
