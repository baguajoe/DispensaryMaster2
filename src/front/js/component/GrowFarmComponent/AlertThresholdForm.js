import React, { useState } from 'react';
import PropTypes from 'prop-types';

const AlertThresholdForm = ({ onSubmit, initialValues }) => {
  const [formData, setFormData] = useState({
    parameter: initialValues?.parameter || '',
    threshold: initialValues?.threshold || '',
    email: initialValues?.email || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Set Alert Threshold</h2>
      <div>
        <label htmlFor="parameter">Parameter</label>
        <input
          type="text"
          id="parameter"
          name="parameter"
          value={formData.parameter}
          onChange={handleChange}
          placeholder="e.g., Temperature, Stock Level"
          required
        />
      </div>
      <div>
        <label htmlFor="threshold">Threshold</label>
        <input
          type="number"
          id="threshold"
          name="threshold"
          value={formData.threshold}
          onChange={handleChange}
          placeholder="e.g., 20"
          required
        />
      </div>
      <div>
        <label htmlFor="email">Notification Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="e.g., admin@example.com"
          required
        />
      </div>
      <button type="submit">Save</button>
    </form>
  );
};

AlertThresholdForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.shape({
    parameter: PropTypes.string,
    threshold: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    email: PropTypes.string,
  }),
};

export default AlertThresholdForm;
