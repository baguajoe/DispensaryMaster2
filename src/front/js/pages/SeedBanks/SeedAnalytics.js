import React, { useState, useEffect } from "react";
import axios from "axios";

const SeedAnalytics = () => {
    const [analytics, setAnalytics] = useState({});

    useEffect(() => {
        axios.get("/api/seedbank/analytics")
            .then(response => setAnalytics(response.data))
            .catch(error => console.error("Error fetching analytics:", error));
    }, []);

    return (
        <div>
            <h1>SeedBank Analytics</h1>
            <div>
                <h2>Batch Success Rates</h2>
                <p>Success Rate: {analytics.successRate || 0}%</p>
                <h2>Inventory Trends</h2>
                <p>Total Inventory: {analytics.totalInventory || 0}</p>
                <h2>Compliance Reports</h2>
                <p>Reports Generated: {analytics.reportsGenerated || 0}</p>
            </div>
        </div>
    );
};

export default SeedAnalytics;
