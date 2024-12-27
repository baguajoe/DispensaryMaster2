import React, { useState } from 'react';

const AddSeedBatch = () => {
    const [formData, setFormData] = useState({
        strain: '',
        batchNumber: '',
        quantity: '',
        storageLocation: '',
        expirationDate: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle API request to add a seed batch
        console.log('Seed Batch Added:', formData);
    };

    return (
        <div>
            <h2>Add Seed Batch</h2>
            <form onSubmit={handleSubmit}>
                <label>Strain:</label>
                <input type="text" name="strain" value={formData.strain} onChange={handleChange} />
                <label>Batch Number:</label>
                <input type="text" name="batchNumber" value={formData.batchNumber} onChange={handleChange} />
                <label>Quantity:</label>
                <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} />
                <label>Storage Location:</label>
                <input type="text" name="storageLocation" value={formData.storageLocation} onChange={handleChange} />
                <label>Expiration Date:</label>
                <input type="date" name="expirationDate" value={formData.expirationDate} onChange={handleChange} />
                <button type="submit">Add Batch</button>
            </form>
        </div>
    );
};

export default AddSeedBatch;
