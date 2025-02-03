import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import '../../../styles/medical/HealthAnalytics.css';

const HealthAnalytics = () => {
    const [analytics, setAnalytics] = useState([]);
    const [filterCategory, setFilterCategory] = useState('All');
    const [sortOrder, setSortOrder] = useState('asc');
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get('/api/analytics')
            .then(response => setAnalytics(response.data))
            .catch(error => {
                console.error('Error fetching analytics:', error);
                setError('Failed to load health analytics.');
            });
    }, []);

    // Filter metrics by category
    const filteredAnalytics = filterCategory === 'All' 
        ? analytics 
        : analytics.filter(metric => metric.category === filterCategory);

    // Sort metrics by value
    const sortedAnalytics = [...filteredAnalytics].sort((a, b) => {
        if (typeof a.value === 'number' && typeof b.value === 'number') {
            return sortOrder === 'asc' ? a.value - b.value : b.value - a.value;
        }
        return 0;
    });

    return (
        <div className="health-analytics-container">
            <h1>Health Analytics for Dispensaries</h1>

            {error && <p className="error-message">{error}</p>}

            {/* Filter and Sort Controls */}
            <div className="controls">
                <label>
                    Filter by Category: 
                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                        <option value="All">All</option>
                        <option value="Patient Metrics">Patient Metrics</option>
                        <option value="Sales and Revenue">Sales and Revenue</option>
                        <option value="Inventory Analytics">Inventory Analytics</option>
                        <option value="Appointments">Appointments</option>
                    </select>
                </label>

                <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                    Sort by Value ({sortOrder === 'asc' ? 'Ascending' : 'Descending'})
                </button>
            </div>

            {/* Analytics Table */}
            <table className="analytics-table">
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Value</th>
                        <th>Category</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedAnalytics.map((metric, index) => (
                        <tr key={index}>
                            <td>{metric.name}</td>
                            <td>{metric.value}</td>
                            <td>{metric.category}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default HealthAnalytics;
