import React, { useState } from 'react';
import '../../../styles/medical/PatientProfileComponent.css';

const mockPatientData = {
    id: 1,
    name: "John Doe",
    age: 45,
    email: "john.doe@example.com",
    phone: "555-123-4567",
    medicalCardNumber: "MED-12345",
    expirationDate: "2025-06-30",
    physicianName: "Dr. Sarah Smith",
    conditions: ["Chronic Pain", "Anxiety"],
    prescriptions: [
        { product: "High-THC Oil", dosage: "5 mg twice daily", duration: "6 months" },
        { product: "CBD Capsules", dosage: "10 mg once daily", duration: "3 months" }
    ],
    recommendations: ["Reduce anxiety symptoms", "Help with chronic pain relief"]
};

const PatientProfileComponent = () => {
    const [patient, setPatient] = useState(mockPatientData);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ ...mockPatientData });

    // Toggle between view and edit mode
    const toggleEditMode = () => {
        setIsEditing(!isEditing);
    };

    // Handle form inputs during edit mode
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Save updated patient data
    const handleSave = () => {
        setPatient(formData);
        setIsEditing(false);
    };

    return (
        <div className="patient-profile-container">
            <h2>Patient Profile: {patient.name}</h2>

            {isEditing ? (
                <div className="patient-edit-form">
                    <label>
                        Name:
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                        />
                    </label>
                    <label>
                        Age:
                        <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleInputChange}
                        />
                    </label>
                    <label>
                        Email:
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                    </label>
                    <label>
                        Phone:
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                        />
                    </label>
                    <label>
                        Medical Card Number:
                        <input
                            type="text"
                            name="medicalCardNumber"
                            value={formData.medicalCardNumber}
                            onChange={handleInputChange}
                        />
                    </label>
                    <label>
                        Expiration Date:
                        <input
                            type="date"
                            name="expirationDate"
                            value={formData.expirationDate}
                            onChange={handleInputChange}
                        />
                    </label>
                    <label>
                        Physician Name:
                        <input
                            type="text"
                            name="physicianName"
                            value={formData.physicianName}
                            onChange={handleInputChange}
                        />
                    </label>

                    <div className="button-group">
                        <button onClick={handleSave}>Save</button>
                        <button onClick={toggleEditMode}>Cancel</button>
                    </div>
                </div>
            ) : (
                <div className="patient-details">
                    <p><strong>Name:</strong> {patient.name}</p>
                    <p><strong>Age:</strong> {patient.age}</p>
                    <p><strong>Email:</strong> {patient.email}</p>
                    <p><strong>Phone:</strong> {patient.phone}</p>
                    <p><strong>Medical Card Number:</strong> {patient.medicalCardNumber}</p>
                    <p><strong>Expiration Date:</strong> {patient.expirationDate}</p>
                    <p><strong>Physician Name:</strong> {patient.physicianName}</p>
                    <p><strong>Conditions:</strong> {patient.conditions.join(", ")}</p>

                    <h3>Current Prescriptions</h3>
                    <ul>
                        {patient.prescriptions.map((prescription, index) => (
                            <li key={index}>
                                <strong>{prescription.product}:</strong> {prescription.dosage} for {prescription.duration}
                            </li>
                        ))}
                    </ul>

                    <h3>Recommendations</h3>
                    <ul>
                        {patient.recommendations.map((recommendation, index) => (
                            <li key={index}>{recommendation}</li>
                        ))}
                    </ul>

                    <button onClick={toggleEditMode} className="edit-button">Edit Profile</button>
                </div>
            )}
        </div>
    );
};

export default PatientProfileComponent;
