import React, { useState } from 'react';
import PatientProfileComponent from '../../component/MedicalComponent/PatientProfileComponent';
import PatientDetails from '../../component/MedicalComponent/PatientDetails';
import PrescriptionHistory from '../../component/MedicalComponent/PrescriptionHistory';
import MedicalRecords from '../../component/MedicalComponent/MedicalRecords';
import RecentPurchases from '../../component/MedicalComponent/RecentPurchases';
import '../../../styles/medical/PatientProfileComponent.css';


const PatientProfile = ({ patientId }) => {
    return (
        <div className="profile-container">
            <h1 className="profile-title">Patient Profile</h1>

            {/* Full patient details (name, contact, medical history) */}
            <PatientDetails patientId={patientId} />

            {/* History of all prescriptions, including cannabis strains */}
            <PrescriptionHistory patientId={patientId} />

            {/* Medical conditions and records */}
            <MedicalRecords patientId={patientId} />

            {/* Purchases related to medical cannabis */}
            <RecentPurchases patientId={patientId} />
        </div>
    );
};

export default PatientProfile;