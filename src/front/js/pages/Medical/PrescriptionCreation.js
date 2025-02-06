import React from 'react';
import PrescriptionCreationComponent from '../../component/MedicalComponent/PrescriptionCreationComponent';
import '../../../styles/medical/PrescriptionCreation.css';

const PrescriptionCreation = () => {
    return (
        <div className="prescription-creation-container">
            <h1 className="prescription-title">Create Prescription</h1>
            <PrescriptionCreationComponent />
        </div>
    );
};

export default PrescriptionCreation;
