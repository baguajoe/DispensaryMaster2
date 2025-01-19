import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HealthAnalytics = () => {
    const [analytics, setAnalytics] = useState([]);

    useEffect(() => {
        axios.get('/api/analytics')
            .then(response => setAnalytics(response.data))
            .catch(error => console.error(error));
    }, []);

    return (
        <div>
            <h1>Health Analytics</h1>
            <table>
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    {analytics.map((metric, index) => (
                        <tr key={index}>
                            <td>{metric.name}</td>
                            <td>{metric.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default HealthAnalytics;
