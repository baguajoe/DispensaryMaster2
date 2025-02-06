import React from 'react';

const PatientDetails = ({ patientId }) => {
    const patient = {
        id: patientId,
        name: 'John Doe',
        dob: '1990-05-14',
        condition: 'Chronic Pain',
        medicalCard: '1234-5678-9101',
        cardExpiration: '2025-12-31',
        contact: 'johndoe@gmail.com, (555) 555-5555'
    };

    return (
        <div className="patient-details-section">
            <h2>Patient Details</h2>
            <p><strong>Name:</strong> {patient.name}</p>
            <p><strong>Date of Birth:</strong> {patient.dob}</p>
            <p><strong>Condition:</strong> {patient.condition}</p>
            <p><strong>Medical Card:</strong> {patient.medicalCard} (Expires: {patient.cardExpiration})</p>
            <p><strong>Contact:</strong> {patient.contact}</p>
        </div>
    );
};

export default PatientDetails;
