import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MedicalAnalyticsComponent from '../../component/MedicalComponent/MedicalAnalyticsComponent';
import '../../../styles/medical/MedicalAnalytics.css';

  // Custom styles

const MedicalAnalytics = () => {
    const [analytics, setAnalytics] = useState([]);
    const [timePeriod, setTimePeriod] = useState('monthly');
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch analytics based on the selected time period
        axios.get(`/api/medical-analytics?period=${timePeriod}`)
            .then(response => setAnalytics(response.data))
            .catch(error => {
                console.error('Error fetching medical analytics:', error);
                setError('Failed to load analytics.');
            });
    }, [timePeriod]);

    return (
        <div className="analytics-container">
            <h2>Medical Analytics Dashboard</h2>

            {/* Time Period Filter */}
            <div className="time-period-filter">
                <label>Select Time Period: </label>
                <select value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                </select>
            </div>

            {error && <p className="error-message">{error}</p>}

            {/* Pass analytics data to child component */}
            <MedicalAnalyticsComponent analytics={analytics} />
        </div>
    );
};

export default MedicalAnalytics;
