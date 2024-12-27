import React, { useState } from "react";
import PropTypes from "prop-types";

const SeedBatchForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    strain: "",
    quantity: "",
    location: "",
    expirationDate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Seed Batch</h3>
      <input
        type="text"
        name="strain"
        placeholder="Strain"
        value={formData.strain}
        onChange={handleChange}
      />
      <input
        type="number"
        name="quantity"
        placeholder="Quantity"
        value={formData.quantity}
        onChange={handleChange}
      />
      <input
        type="text"
        name="location"
        placeholder="Location"
        value={formData.location}
        onChange={handleChange}
      />
      <input
        type="date"
        name="expirationDate"
        placeholder="Expiration Date"
        value={formData.expirationDate}
        onChange={handleChange}
      />
      <button type="submit">Submit</button>
    </form>
  );
};

SeedBatchForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default SeedBatchForm;
