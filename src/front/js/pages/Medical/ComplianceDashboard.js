import React from 'react';
import ComplianceDashboardComponent from '../../component/MedicalComponent/ComplianceDashboardComponent';

const ComplianceDashboard = () => {
    return (
        <div className="compliance-dashboard-page">
            <h1>Compliance Dashboard</h1>
            <p>Monitor your dispensary’s compliance, including inventory, licensing, and audits.</p>

            {/* Render the Compliance Details */}
            <ComplianceDashboardComponent />
        </div>
    );
};

export default ComplianceDashboard;
