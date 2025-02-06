import React, { useState, useEffect } from 'react';
import '../../../styles/medical/PatientList.css';

const mockPatientData = [
    { id: 1, name: "John Doe", age: 45, email: "john.doe@example.com", conditions: "Chronic Pain, Anxiety" },
    { id: 2, name: "Sarah Smith", age: 37, email: "sarah.smith@example.com", conditions: "Insomnia, Depression" },
    { id: 3, name: "Michael Brown", age: 50, email: "michael.brown@example.com", conditions: "PTSD, Chronic Fatigue" },
    { id: 4, name: "Emma Wilson", age: 29, email: "emma.wilson@example.com", conditions: "Migraines, Nausea" }
];

const PatientListComponent = () => {
    const [patients, setPatients] = useState(mockPatientData);
    const [searchTerm, setSearchTerm] = useState("");

    // Handle search input
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // Filter patients based on search term
    const filteredPatients = patients.filter((patient) =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.conditions.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="patient-list-container">
            <div className="header">
                <h2>Patient Records</h2>
                <input
                    type="text"
                    placeholder="Search patients by name, email, or condition..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="search-input"
                />
            </div>

            <table className="patient-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Age</th>
                        <th>Email</th>
                        <th>Medical Conditions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => (
                            <tr key={patient.id}>
                                <td>{patient.id}</td>
                                <td>{patient.name}</td>
                                <td>{patient.age}</td>
                                <td>{patient.email}</td>
                                <td>{patient.conditions}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="no-results">No patients found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default PatientListComponent;
