import React, { useState, useEffect } from "react";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
import axios from "axios";

const DynamicChart = ({ type = "line", apiEndpoint, params = {}, title = "Chart" }) => {
    const [data, setData] = useState([]);
    const [chartData, setChartData] = useState({});
    const chartTypes = { bar: Bar, line: Line, pie: Pie, doughnut: Doughnut };
    const ChartComponent = chartTypes[type] || Line;

    useEffect(() => {
        if (apiEndpoint) {
            axios
                .get(apiEndpoint, { params })
                .then((response) => {
                    setData(response.data.results || []);
                    formatChartData(response.data.results || []);
                })
                .catch((error) => console.error("Error fetching chart data:", error));
        }
    }, [apiEndpoint, params]);

    const formatChartData = (results) => {
        const labels = results.map((item) => item.label || `Label ${item.id || ""}`);
        const values = results.map((item) => item.value || 0);

        setChartData({
            labels,
            datasets: [
                {
                    label: "Data",
                    data: values,
                    borderColor: "rgba(75,192,192,1)",
                    backgroundColor: "rgba(75,192,192,0.2)",
                    fill: true,
                },
            ],
        });
    };

    return (
        <div className="chart-container bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{title}</h2>
            <ChartComponent data={chartData} options={{ responsive: true }} />
        </div>
    );
};

export default DynamicChart;
