import React from 'react';

const MedicalRecords = ({ patientId }) => {
    // Sample data for demonstration
    const medicalHistory = [
        { date: '2025-01-10', diagnosis: 'Chronic Pain', treatment: 'THC Oil - 10mg per day' },
        { date: '2024-12-05', diagnosis: 'Anxiety', treatment: 'CBD Capsules - 5mg twice daily' },
        { date: '2024-11-15', diagnosis: 'PTSD', treatment: 'THC-CBD Blend - 8mg/3mg daily' }
    ];

    return (
        <div className="medical-records-section">
            <h2>Medical Records</h2>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Diagnosis</th>
                        <th>Treatment</th>
                    </tr>
                </thead>
                <tbody>
                    {medicalHistory.map((record, index) => (
                        <tr key={index}>
                            <td>{record.date}</td>
                            <td>{record.diagnosis}</td>
                            <td>{record.treatment}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MedicalRecords;
