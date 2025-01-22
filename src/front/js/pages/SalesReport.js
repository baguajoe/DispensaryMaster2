import React, { useState, useEffect } from "react";
import { Line, Bar, Pie } from "react-chartjs-2";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const SalesReport = () => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [chartType, setChartType] = useState("line"); // Default to line chart
    const [chartData, setChartData] = useState({});

    useEffect(() => {
        fetchSalesData();
    }, [startDate, endDate]);

    const fetchSalesData = async () => {
        try {
            const response = await axios.get("/api/reports/sales", {
                params: {
                    start_date: startDate.toISOString().split("T")[0],
                    end_date: endDate.toISOString().split("T")[0],
                    breakdown: "daily",
                },
            });

            formatChartData(response.data.results);
        } catch (error) {
            console.error("Error fetching sales data:", error);
        }
    };

    const formatChartData = (results) => {
        const labels = results.map((item) => item.label);
        const values = results.map((item) => item.value);

        setChartData({
            labels,
            datasets: [
                {
                    label: "Sales Data",
                    data: values,
                    borderColor: "rgba(75,192,192,1)",
                    backgroundColor: "rgba(75,192,192,0.2)",
                    fill: true,
                },
            ],
        });
    };

    const chartTypes = {
        line: Line,
        bar: Bar,
        pie: Pie,
    };

    const ChartComponent = chartTypes[chartType];

    return (
        <div className="sales-report-page">
            <h1 className="text-2xl font-bold mb-4">Sales Report</h1>

            <div className="filter-container mb-6 flex items-center gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Start Date:</label>
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        dateFormat="yyyy-MM-dd"
                        className="border rounded px-3 py-2 w-full"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">End Date:</label>
                    <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        dateFormat="yyyy-MM-dd"
                        className="border rounded px-3 py-2 w-full"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Chart Type:</label>
                    <select
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                        className="border rounded px-3 py-2 w-full"
                    >
                        <option value="line">Line</option>
                        <option value="bar">Bar</option>
                        <option value="pie">Pie</option>
                    </select>
                </div>
                <button
                    onClick={fetchSalesData}
                    className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
                >
                    Refresh Data
                </button>
            </div>

            {chartData.labels ? (
                <div className="chart-container bg-white shadow rounded-lg p-6">
                    <ChartComponent data={chartData} options={{ responsive: true }} />
                </div>
            ) : (
                <p className="text-gray-500">No data available for the selected period.</p>
            )}
        </div>
    );
};

export default SalesReport;
