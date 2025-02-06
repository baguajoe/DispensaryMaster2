import React from 'react';
import { Line } from 'react-chartjs-2';

const PrescriptionOverview = () => {
    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [
            {
                label: 'THC Prescriptions',
                data: [30, 45, 60, 50, 80],
                borderColor: '#ff7f50',
                fill: false,
                tension: 0.1
            },
            {
                label: 'CBD Prescriptions',
                data: [20, 30, 40, 35, 50],
                borderColor: '#4caf50',
                fill: false,
                tension: 0.1
            }
        ]
    };

    return (
        <div className="prescription-overview-section">
            <h2>Prescription Overview</h2>
            <Line data={data} />
        </div>
    );
};

export default PrescriptionOverview;
