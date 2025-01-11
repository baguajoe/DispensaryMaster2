import React, { useState, useEffect } from "react";
import SearchBar from "../component/SearchBar";
import Pagination from "../component/Pagination";
import "../../styles/PriceComparison.css";

const PriceComparison = () => {
    const [results, setResults] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({ strain: "", location: "" });

    const fetchProducts = async (filters = {}, page = 1) => {
        const query = new URLSearchParams({
            strain: filters.strain || "",
            location: filters.location || "",
            page,
        }).toString();

        try {
            const response = await fetch(
                `http://localhost:5000/api/products/cheapest?${query}`
            );
            const data = await response.json();
            setResults(data.products);
            setCurrentPage(data.current_page);
            setTotalPages(data.pages);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        }
    };

    useEffect(() => {
        fetchProducts(filters); // Initial fetch with default filters
    }, [filters]);

    const handleSearch = (newFilters) => {
        setFilters(newFilters);
        fetchProducts(newFilters, 1); // Reset to the first page with new filters
    };

    const handlePageChange = (page) => {
        fetchProducts(filters, page);
    };

    return (
        <div className="price-comparison-page">
            <h1>Find the Cheapest Prices</h1>
            <SearchBar onSearch={handleSearch} />
            <table className="table">
                <thead>
                    <tr>
                        <th>Strain</th>
                        <th>Dispensary</th>
                        <th>Location</th>
                        <th>Price</th>
                        <th>Availability</th>
                    </tr>
                </thead>
                <tbody>
                    {results.map((result, index) => (
                        <tr key={index}>
                            <td>{result.strain}</td>
                            <td>{result.dispensary_name}</td>
                            <td>{result.location}</td>
                            <td>${result.price.toFixed(2)}</td>
                            <td>{result.availability ? "Available" : "Out of Stock"}</td>
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
