import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../styles/medical/ComplianceDashboard.css';

const ComplianceDashboardComponent = () => {
    const [complianceStatus, setComplianceStatus] = useState('Loading...');
    const [productCompliance, setProductCompliance] = useState([]);
    const [inventoryCompliance, setInventoryCompliance] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [auditHistory, setAuditHistory] = useState([]);
    const [licenseStatus, setLicenseStatus] = useState('Loading...');
    const [employeeTraining, setEmployeeTraining] = useState([]);

    useEffect(() => {
        // Fetch dashboard data
        axios.get('/api/compliance/dashboard')
            .then(response => {
                const data = response.data;
                setComplianceStatus(data.overallComplianceStatus);
                setProductCompliance(data.productCompliance);
                setInventoryCompliance(data.inventoryCompliance);
                setAlerts(data.alerts);
                setAuditHistory(data.auditHistory);
                setLicenseStatus(data.licenseStatus);
                setEmployeeTraining(data.employeeTraining);
            })
            .catch(error => console.error('Error fetching compliance dashboard data:', error));
    }, []);

    return (
        <div className="compliance-dashboard-container">
            <h2>Compliance Dashboard</h2>

            {/* Overall Compliance Status */}
            <div className="compliance-status">
                <h3>Overall Compliance Status</h3>
                <p>{complianceStatus}</p>
            </div>

            {/* Product Compliance */}
            <div className="product-compliance">
                <h3>Product Compliance</h3>
                <ul>
                    {productCompliance.map(product => (
                        <li key={product.id}>
                            {product.name}: {product.status}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Inventory Compliance */}
            <div className="inventory-compliance">
                <h3>Inventory Compliance</h3>
                <ul>
                    {inventoryCompliance.map(item => (
                        <li key={item.id}>
                            {item.product}: {item.status} (Expiry: {new Date(item.expiryDate).toLocaleDateString()})
                        </li>
                    ))}
                </ul>
            </div>

            {/* Compliance Alerts */}
            <div className="compliance-alerts">
                <h3>Compliance Alerts</h3>
                <ul>
                    {alerts.length > 0 ? (
                        alerts.map(alert => (
                            <li key={alert.id} className={`alert-${alert.severity.toLowerCase()}`}>
                                {alert.message}
                            </li>
                        ))
                    ) : (
                        <p>No active alerts</p>
                    )}
                </ul>
            </div>

            {/* License Status */}
            <div className="license-status">
                <h3>License Status</h3>
                <p>{licenseStatus}</p>
            </div>

            {/* Audit History */}
            <div className="audit-history">
                <h3>Audit History</h3>
                <ul>
                    {auditHistory.map(audit => (
                        <li key={audit.id}>
                            {audit.date}: {audit.notes} ({audit.status})
                        </li>
                    ))}
                </ul>
            </div>

            {/* Employee Training */}
            <div className="employee-training">
                <h3>Employee Training</h3>
                <ul>
                    {employeeTraining.map(training => (
                        <li key={training.id}>
                            {training.employee}: {training.status} (Completed: {training.completedDate})
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ComplianceDashboardComponent;
