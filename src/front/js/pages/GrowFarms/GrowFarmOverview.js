import React, { useState, useEffect } from "react";
import axios from "axios";

const GrowFarmOverview = () => {
    const [summary, setSummary] = useState({});

    useEffect(() => {
        axios.get("/api/grow-farms/overview")
            .then(response => setSummary(response.data))
            .catch(error => console.error(error));
    }, []);

    return (
        <div>
            <h1>Grow Farm Overview</h1>
            <div>
                <h2>Farms Summary</h2>
                <p>Total Farms: {summary.totalFarms}</p>
                <p>Active Batches: {summary.activeBatches}</p>
                <p>Tasks In Progress: {summary.tasksInProgress}</p>
                <p>Environmental Warnings: {summary.environmentWarnings}</p>
            </div>
        </div>
    );
};

export default GrowFarmOverview;
