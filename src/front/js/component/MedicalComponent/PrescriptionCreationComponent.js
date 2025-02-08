
import React, { useState } from 'react';
import '../../../styles/medical/PrescriptionCreation.css';

const PrescriptionCreationComponent = () => {
    const [formData, setFormData] = useState({
        patientId: '',
        strainType: '',
        thcContent: '',
        cbdContent: '',
        dosage: '',
        frequency: '',
        duration: '',
        additionalNotes: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Prescription Data:', formData);
        // Add an API call to store the prescription in the backend.
    };

    return (
        <div className="prescription-form-container">
            <form onSubmit={handleSubmit} className="prescription-form">
                <label>
                    Patient ID:
                    <input
                        type="text"
                        name="patientId"
                        value={formData.patientId}
                        onChange={handleChange}
                        placeholder="Enter Patient ID"
                        required
                    />
                </label>

                <label>
                    Strain Type:
                    <input
                        type="text"
                        name="strainType"
                        value={formData.strainType}
                        onChange={handleChange}
                        placeholder="e.g., Sativa, Indica, Hybrid"
                        required
                    />
                </label>

                <label>
                    THC Content (%):
                    <input
                        type="number"
                        name="thcContent"
                        value={formData.thcContent}
                        onChange={handleChange}
                        placeholder="e.g., 15"
                        required
                    />
                </label>

                <label>
                    CBD Content (%):
                    <input
                        type="number"
                        name="cbdContent"
                        value={formData.cbdContent}
                        onChange={handleChange}
                        placeholder="e.g., 10"
                        required
                    />
                </label>

                <label>
                    Dosage (mg per day):
                    <input
                        type="number"
                        name="dosage"
                        value={formData.dosage}
                        onChange={handleChange}
                        placeholder="e.g., 10"
                        required
                    />
                </label>

                <label>
                    Frequency:
                    <input
                        type="text"
                        name="frequency"
                        value={formData.frequency}
                        onChange={handleChange}
                        placeholder="e.g., Once daily, Twice daily"
                        required
                    />
                </label>

                <label>
                    Duration (in days):
                    <input
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        placeholder="e.g., 30"
                        required
                    />
                </label>

                <label>
                    Additional Notes (Optional):
                    <textarea
                        name="additionalNotes"
                        value={formData.additionalNotes}
                        onChange={handleChange}
                        placeholder="Provide any additional instructions or notes"
                    />
                </label>

                <button type="submit" className="submit-button">Create Prescription</button>
            </form>
        </div>
    );
};

export default PrescriptionCreationComponent;
