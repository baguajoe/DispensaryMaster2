import React, { useState, useEffect } from "react";
import axios from "axios";
// import DashboardMetrics from "../component/GrowFarmComponent/DashboardMetrics"; // Adjust path as needed
import { FaSeedling, FaLeaf, FaTasks, FaThermometerHalf } from "react-icons/fa";
import DashboardMetrics from "./GrowFarmDashboard";

const GrowFarmOverview = () => {
    const [summary, setSummary] = useState({});

    useEffect(() => {
        axios.get(process.env.BACKEND_URL + "/api/grow-farms/overview")
            .then(response => setSummary(response.data))
            .catch(error => console.error(error));
    }, []);

    return (
        <div>
            <h1 style={{ color: "#ffab00", fontWeight: 900 }}>Grow Farm Overview</h1>
            <div className="dashboard-grid">
                <DashboardMetrics
                    title="Total Farms"
                    value={summary.totalFarms}
                    icon={FaSeedling}
                    description="Number of registered grow sites"
                />
                <DashboardMetrics
                    title="Active Batches"
                    value={summary.activeBatches}
                    icon={FaLeaf}
                    description="Crops currently in growth cycle"
                />
                <DashboardMetrics
                    title="Tasks In Progress"
                    value={summary.tasksInProgress}
                    icon={FaTasks}
                    description="Uncompleted operational tasks"
                />
                <DashboardMetrics
                    title="Env. Warnings"
                    value={summary.environmentWarnings}
                    icon={FaThermometerHalf}
                    description="Issues with temperature/humidity"
                />
            </div>
        </div>
    );
};

export default GrowFarmOverview;
