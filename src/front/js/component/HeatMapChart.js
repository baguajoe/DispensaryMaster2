// HeatmapChart.js
import React from "react";
// import { Heatmap } from "chartjs-chart-geo";

const HeatMapChart = ({ data }) => {
    return (
        <div className="bg-white shadow-lg rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Sales Heatmap</h3>
            {/* <Heatmap
                data={data}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: "top",
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => `Sales: ${context.raw.value}`,
                            },
                        },
                    },
                    scales: {
                        x: {
                            display: true,
                            title: { display: true, text: "Regions" },
                        },
                        y: {
                            display: true,
                            title: { display: true, text: "Products" },
                        },
                    },
                }}
            /> */}
        </div>
    );
};

export default HeatMapChart;
