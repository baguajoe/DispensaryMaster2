import React, { useState } from "react";

const SearchBar = ({ onSearch }) => {
    const [productName, setProductName] = useState("");
    const [location, setLocation] = useState("");

    const handleSearch = () => {
        onSearch({ productName, location });
    };

    return (
        <div className="search-bar">
            <input
                type="text"
                placeholder="Enter product name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="input"
            />
            <input
                type="text"
                placeholder="Enter location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input"
            />
            <button onClick={handleSearch} className="btn btn-primary">
                Search
            </button>
        </div>
    );
};

export default SearchBar;
