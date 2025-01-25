import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
// import GridLayoutComponent from "../component/GridLayoutComponent";
import MetricCard from "../component/MetricCard";
import ChartCard from "../component/ChartCard";
import TableCard from "../component/TableCard";
import PersonalizedRecommendations from "../component/PersonalizedRecommendations";
import SentimentAnalysis from "../component/SentimentAnalysis";
import Inventory from "../component/Inventory";
// import HeatmapChart from "../component/HeatMapChart";
import NotificationPanel from "../component/NotificationPanel";

import "../../styles/dashboard.css";


const Dashboard = () => {
    const [metrics, setMetrics] = useState([]);
    const [topCategories, setTopCategories] = useState([]);
    const [salesPerformance, setSalesPerformance] = useState({
        labels: [],
        datasets: [],
    });
    const [notifications, setNotifications] = useState([]);
    const [layout, setLayout] = useState([
        { i: "metrics", x: 0, y: 0, w: 12, h: 2 },
        { i: "sales", x: 0, y: 2, w: 6, h: 4 },
        { i: "categories", x: 6, y: 2, w: 6, h: 4 },
        { i: "recommendations", x: 0, y: 6, w: 6, h: 4 },
        { i: "reviews", x: 6, y: 6, w: 6, h: 4 },
        { i: "inventory", x: 0, y: 10, w: 12, h: 6 },
        { i: "inventoryWidget", x: 6, y: 10, w: 6, h: 6 },
        { i: "compliance", x: 6, y: 10, w: 6, h: 6 },
        { i: "salesWidget", x: 0, y: 16, w: 12, h: 4 },
        { i: "heatmap", x: 0, y: 20, w: 12, h: 6 },
        { i: "notifications", x: 0, y: 26, w: 12, h: 4 },
        { i: "predictive", x: 0, y: 30, w: 12, h: 6 },
        { i: "priceComparison", x: 0, y: 36, w: 12, h: 6 },
    ]);

    useEffect(() => {
        const socket = io(process.env.REACT_APP_BACKEND_URL);

        // Real-time notifications listener
        socket.on("customer_notifications", (notification) => {
            setNotifications((prev) => [...prev, notification]);
        });

        socket.on("real_time_price_update", (data) => {
            console.log("Real-time price update:", data);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        // Simulated metric data
        const staticMetrics = [
            { title: "Total Sales", value: "$12,500", icon: "💰", trend: 8, bgColor: "bg-green-100", textColor: "text-green-900" },
            { title: "New Products", value: "12", icon: "📦", trend: 5, bgColor: "bg-blue-100", textColor: "text-blue-900" },
            { title: "Average Purchase Order", value: "$180", icon: "🛒", trend: 2, bgColor: "bg-yellow-100", textColor: "text-yellow-900" },
            { title: "Users", value: "1,345", icon: "👤", trend: 15, bgColor: "bg-purple-100", textColor: "text-purple-900" },
            { title: "Refunds", value: "$320", icon: "💸", trend: -3, bgColor: "bg-red-100", textColor: "text-red-900" },
            { title: "Product Availability", value: "93%", icon: "📊", trend: 1, bgColor: "bg-teal-100", textColor: "text-teal-900" },
            { title: "Supply Below Safety Stock", value: "8", icon: "📉", trend: -2, bgColor: "bg-gray-100", textColor: "text-gray-900" },
            { title: "Invoices", value: "295", icon: "🧾", trend: 7, bgColor: "bg-indigo-100", textColor: "text-indigo-900" },
            { title: "Today's Invoice", value: "28", icon: "📆", trend: 3, bgColor: "bg-orange-100", textColor: "text-orange-900" },
            { title: "Current Monthly", value: "$22,560", icon: "📅", trend: 10, bgColor: "bg-green-100", textColor: "text-green-900" },
            { title: "Inventory", value: "965", icon: "📦", trend: 4, bgColor: "bg-blue-100", textColor: "text-blue-900" },
            { title: "Stores", value: "4", icon: "🏬", trend: 0, bgColor: "bg-yellow-100", textColor: "text-yellow-900" },
            { title: "Top Categories", value: "Electronics, Clothing", icon: "📂", trend: 6, bgColor: "bg-purple-100", textColor: "text-purple-900" },
            { title: "Sales Performance", value: "Trending Up", icon: "📈", trend: 12, bgColor: "bg-teal-100", textColor: "text-teal-900" },
        ];
        setMetrics(staticMetrics);

        // Fetch top categories
        fetch(`${process.env.BACKEND_URL}/api/dashboard/top-categories`)
            .then((response) => response.json())
            .then((data) => setTopCategories(data))

        fetch(`${process.env.BACKEND_URL}/api/dashboard/metrics`,{headers:{"Authorization":`Bearer ${localStorage.getItem("token")}`}})
            .then((response) => response.json())
            .then((data) => setMetrics(data))
            .catch((error) => console.error("Error fetching top categories:", error));

        // Fetch sales performance data
        fetch(`${process.env.BACKEND_URL}/api/dashboard/sales-performance`)
            .then((response) => response.json())
            .then((data) => {
                setSalesPerformance(data);
            })
            .catch((error) => {
                console.error("Error fetching sales performance:", error);
            });
    }, []);

    const handleLayoutChange = (newLayout) => {
        setLayout(newLayout);
        localStorage.setItem("dashboardLayout", JSON.stringify(newLayout));
    };

    return (
        <div className="main-content p-6 bg-gray-100">
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
            {/* <GridLayoutComponent
                className="layout"
                layout={layout}
                cols={12}
                rowHeight={30}
                width={1200}
                onLayoutChange={handleLayoutChange}
            > */}
                {/* Metrics Section */}
                <div key="metrics" className="widget">
                    <div className="d-flex text-dark flex-wrap gap-4 ms-5">
                        {metrics.map((metric, index) => (
                            <MetricCard
                                key={index}
                                title={metric.title}
                                value={metric.value}
                                icon={metric.icon}
                                trend={metric.trend}
                            />
                        ))}
                    </div>
                </div>

                {/* Sales Performance Chart */}
                <div key="sales" className="sales-performance">
                    <h2 className="text-xl font-semibold mb-4">Sales Performance</h2>
                    <ChartCard type="line" data={salesPerformance} title="Sales Over Time" />
                </div>

                {/* Top Categories Table */}
                <div key="categories" className="widget">
                    <h2 className="text-xl font-semibold mb-4">Top Categories</h2>
                    <TableCard
                        data={topCategories}
                        columns={["Category", "Sales", "Revenue"]}
                        keyMapping={{
                            Category: "category",
                            Sales: "sales",
                            Revenue: "revenue",
                        }}
                    />
                </div>

                {/* Personalized Recommendations
                <div key="recommendations" className="widget">
                    <h2 className="text-xl font-semibold mb-4">Personalized Recommendations</h2>
                    <PersonalizedRecommendations customerId={1} />
                </div> */}

                {/* Customer Reviews */}
                {/* <div key="reviews" className="widget">
                    <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
                    <SentimentAnalysis />
                </div> */}

                {/* Inventory Section */}
                {/* <div key="inventory" className="widget">
                    <h2 className="text-xl font-semibold mb-4">Inventory</h2>
                    <Inventory />
                </div> */}

                {/* Notifications */}
                {/* <div key="notifications" className="widget">
                    <h2 className="text-xl font-semibold mb-4">Notifications</h2>
                    <NotificationPanel notifications={notifications} />
                </div> */}

                {/* Predictive Analytics */}
                {/* <div key="predictive" className="widget">
                    <h2 className="text-xl font-semibold mb-4">Predictive Analytics</h2>
                    <PredictiveAnalyticsWidget /> 
                </div>*/}

                {/* Price Comparison */}
                {/* <div key="priceComparison" className="widget">
                    <h2 className="text-xl font-semibold mb-4">Price Comparison</h2>
                    <PriceComparisonWidget />
                </div> */}
            {/* </GridLayoutComponent> */}
        </div>
    );
};

export default Dashboard;
