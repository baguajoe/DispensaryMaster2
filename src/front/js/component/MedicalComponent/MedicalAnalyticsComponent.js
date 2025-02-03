import React from 'react';
import "../../../styles/medical/MedicalAnalytics.css"
  // Custom styles

const MedicalAnalyticsComponent = ({ analytics }) => {
    return (
        <div className="analytics-table-container">
            <table className="analytics-table">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Metric</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    {analytics.map((metric, index) => (
                        <tr key={index}>
                            <td>{metric.category}</td>
                            <td>{metric.name}</td>
                            <td>{metric.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MedicalAnalyticsComponent;
