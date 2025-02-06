import React from 'react';
import PatientRegistrationComponent from '../../component/MedicalComponent/PatientRegistrationComponent';
import '../../../styles/medical/PatientRegistrationComponent.css';

const PatientRegistration = () => {
    return (
        <div className="registration-container">
            <h1 className="registration-title">Patient Registration</h1>
            <PatientRegistrationComponent />
        </div>
    );
};

export default PatientRegistration;
