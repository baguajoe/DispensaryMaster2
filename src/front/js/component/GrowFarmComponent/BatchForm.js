import React from 'react';
import PropTypes from 'prop-types';

const BatchForm = ({ formData, onChange, onSubmit, isEditMode = false }) => {
  return (
    <form onSubmit={onSubmit}>
      <h2>{isEditMode ? 'Edit Batch' : 'Add New Batch'}</h2>
      <div>
        <label htmlFor="strain">Strain</label>
        <input
          type="text"
          id="strain"
          name="strain"
          value={formData.strain}
          onChange={onChange}
          required
        />
      </div>
      <div>
        <label htmlFor="quantity">Quantity</label>
        <input
          type="number"
          id="quantity"
          name="quantity"
          value={formData.quantity}
          onChange={onChange}
          required
        />
      </div>
      <div>
        <label htmlFor="startDate">Start Date</label>
        <input
          type="date"
          id="startDate"
          name="startDate"
          value={formData.startDate}
          onChange={onChange}
          required
        />
      </div>
      <div>
        <label htmlFor="endDate">End Date</label>
        <input
          type="date"
          id="endDate"
          name="endDate"
          value={formData.endDate}
          onChange={onChange}
        />
      </div>
      <div>
        <label htmlFor="status">Status</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={onChange}
        >
          <option value="Growing">Growing</option>
          <option value="Harvested">Harvested</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
      <button type="submit">{isEditMode ? 'Save Changes' : 'Add Batch'}</button>
    </form>
  );
};

BatchForm.propTypes = {
  formData: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isEditMode: PropTypes.bool,
};

export default BatchForm;
