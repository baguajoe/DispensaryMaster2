import React from "react";

const SearchBar = ({ onSearch }) => {
  return (
    <input
      type="text"
      placeholder="Search..."
      onChange={(e) => onSearch(e.target.value)}
      className="search-bar"
    />
  );
};

export default SearchBar;
