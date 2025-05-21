import React from 'react';
import PropTypes from 'prop-types';
import "../../../styles/GrowFarm/AddPlantBatch.css";

const BatchForm = ({ formData, onChange, onSubmit, isEditMode = false }) => {
  return (
    <form className="batch-form" onSubmit={onSubmit}>
      <h2>{isEditMode ? 'Edit Batch' : 'Add New Batch'}</h2>
      <div className="form-group">
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
      <div className="form-group">
        <label htmlFor="yield_amount">Quantity</label>
        <input
          type="number"
          id="yield_amount"
          name="yield_amount"
          value={formData.yield_amount}
          onChange={onChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="start_date">Start Date</label>
        <input
          type="date"
          id="start_date"
          name="start_date"
          value={formData.start_date}
          onChange={onChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="end_date">End Date</label>
        <input
          type="date"
          id="end_date"
          name="end_date"
          value={formData.end_date}
          onChange={onChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="status">Status</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={onChange}
          className="form-select"
        >
          <option value="Growing">Growing</option>
          <option value="Harvested">Harvested</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
      <button type="submit" className="btn-primary">
        {isEditMode ? 'Save Changes' : 'Add Batch'}
      </button>
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
