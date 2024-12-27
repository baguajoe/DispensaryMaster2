import React, { useState, useEffect } from "react";
import SearchBar from "../component/SearchBar";
import Pagination from "../component/Pagination";

const PriceComparison = () => {
    const [results, setResults] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

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
        fetchProducts();
    }, []);

    const handleSearch = (filters) => {
        fetchProducts(filters, 1);
    };

    const handlePageChange = (page) => {
        fetchProducts({}, page);
    };

    return (
        <div className="price-comparison-page">
            <h1>Price Comparison</h1>
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
