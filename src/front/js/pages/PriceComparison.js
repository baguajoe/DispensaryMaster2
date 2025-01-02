import React, { useState, useEffect } from "react";
import SearchBar from "../component/SearchBar";
import Pagination from "../component/Pagination";
import Notification from "../component/Notification"; // For showing real-time notifications
import { io } from "socket.io-client";
import "../../styles/PriceComparison.css"; // Importing the CSS file

const PriceComparison = () => {
    const [results, setResults] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [notifications, setNotifications] = useState([]); // To store real-time notifications

    const socket = io("http://localhost:5000"); // Connect to the WebSocket server

    const fetchProducts = async (filters = {}, page = 1) => {
        const query = new URLSearchParams({
            product_name: filters.productName || "",
            location: filters.location || "",
            page,
        }).toString();

        const response = await fetch(`http://localhost:5000/api/products?${query}`);
        const data = await response.json();
        setResults(data.products);
        setCurrentPage(data.current_page);
        setTotalPages(data.pages);
    };

    useEffect(() => {
        fetchProducts(); // Initial fetch

        // Listen for real-time price updates
        socket.on("real_time_price_update", (data) => {
            setNotifications((prev) => [
                ...prev,
                `New lowest price for ${data.lowest_price.product_name}: $${data.lowest_price.price}`,
            ]);
        });

        // Listen for personalized price updates
        socket.on("personalized_price_update", (data) => {
            setNotifications((prev) => [
                ...prev,
                `Personalized deal on ${data.product_name}: ${data.discount}% off! Adjusted price: $${data.adjusted_price}`,
            ]);
        });

        return () => {
            socket.disconnect(); // Clean up the WebSocket connection
        };
    }, []);

    const handleSearch = (filters) => {
        fetchProducts(filters, 1);
    };

    const handlePageChange = (page) => {
        fetchProducts({}, page);
    };

    const dismissNotification = (index) => {
        setNotifications((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="price-comparison-page">
            <h1>Price Comparison</h1>

            {/* Real-time notifications */}
            {notifications.map((notification, index) => (
                <Notification
                    key={index}
                    message={notification}
                    onDismiss={() => dismissNotification(index)}
                />
            ))}

            <SearchBar onSearch={handleSearch} />
            <table className="table">
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Strain</th>
                        <th>THC Content</th>
                        <th>CBD Content</th>
                        <th>Price</th>
                        <th>Availability</th>
                        <th>Dispensary</th>
                        <th>Location</th>
                    </tr>
                </thead>
                <tbody>
                    {results.map((result, index) => (
                        <tr key={index}>
                            <td>{result.product_name}</td>
                            <td>{result.strain}</td>
                            <td>{result.thc_content ? `${result.thc_content}%` : "N/A"}</td>
                            <td>{result.cbd_content ? `${result.cbd_content}%` : "N/A"}</td>
                            <td>${result.price.toFixed(2)}</td>
                            <td>{result.availability ? "Available" : "Out of Stock"}</td>
                            <td>{result.dispensary_name}</td>
                            <td>{result.location}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default PriceComparison;
