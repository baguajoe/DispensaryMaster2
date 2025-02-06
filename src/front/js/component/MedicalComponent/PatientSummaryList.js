import React, { useState } from 'react';

const PatientSummaryList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const patients = [
        { id: 1, name: 'John Doe', condition: 'Chronic Pain', recentVisit: '2025-01-25' },
        { id: 2, name: 'Jane Smith', condition: 'Anxiety', recentVisit: '2025-01-20' },
        { id: 3, name: 'Carlos Lopez', condition: 'PTSD', recentVisit: '2025-01-15' }
    ];

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="patient-summary-section">
            <h2>Patient List</h2>
            <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="search-input"
            />
            <ul>
                {filteredPatients.map(patient => (
                    <li key={patient.id}>
                        {patient.name} - {patient.condition} (Last visit: {patient.recentVisit})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PatientSummaryList;
