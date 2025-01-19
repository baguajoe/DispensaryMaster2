import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PatientManagement = () => {
    const [patients, setPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        axios.get('/api/patients')
            .then(response => setPatients(response.data))
            .catch(error => console.error(error));
    }, []);

    const filteredPatients = patients.filter(patient =>
        `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <h1>Patient Management</h1>
            <input
                type="text"
                placeholder="Search Patients"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
            <ul>
                {filteredPatients.map(patient => (
                    <li key={patient.id}>{patient.first_name} {patient.last_name}</li>
                ))}
            </ul>
        </div>
    );
};

export default PatientManagement;
