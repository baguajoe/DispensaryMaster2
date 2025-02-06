import React from 'react';
import PatientListComponent from '../../component/MedicalComponent/PatientListComponent';
import '../../../styles/medical/PatientList.css';

const PatientList = () => {
    return (
        <div className="patient-list-page">
            <h1>Patient Management Dashboard</h1>
            <PatientListComponent />
        </div>
    );
};

export default PatientList;

