import React from 'react';
import ComplianceReportsComponent from '../../component/MedicalComponent/ComplianceReportsComponent';
import '../../../styles/medical/ComplianceReports.css';

const ComplianceReports = () => {
    return (
        <div className="compliance-reports-page">
            <h1>Compliance Reports Page</h1>
            <p>View, search, and export compliance reports.</p>
            <ComplianceReportsComponent />
        </div>
    );
};

export default ComplianceReports;
