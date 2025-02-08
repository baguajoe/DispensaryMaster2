import React from 'react';
import PatientDashboardComponent from '../../component/MedicalComponent/PatientDashboardComponent';
import PatientSummaryList from '../../component/MedicalComponent/PatientSummaryList';
import RecentActivity from '../../component/MedicalComponent/RecentActivity';
import PrescriptionOverview from '../../component/MedicalComponent/PrescriptionOverview';
import LoyaltyStatus from '../../component/MedicalComponent/LoyaltyStatus';
import "../../../styles/medical/PatientDashboard.css"


const PatientDashboard = () => {
    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Patient Dashboard</h1>

            {/* Recent Activities Section */}
            <section className="dashboard-section">
                <h2>Recent Activity</h2>
                <RecentActivity />
            </section>

            {/* Patient Summary Section */}
            <section className="dashboard-section">
                <h2>Patient Summaries</h2>
                <PatientSummaryList />
            </section>

            {/* Prescription Overview Section */}
            <section className="dashboard-section">
                <h2>Prescription Overview</h2>
                {/* <PrescriptionOverview /> */}
            </section>

            {/* Loyalty Status Section (optional) */}
            <section className="dashboard-section">
                <h2>Loyalty Program Status</h2>
                <LoyaltyStatus />
            </section>
        </div>
    );
};

export default PatientDashboard;
