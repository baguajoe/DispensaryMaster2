import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="pagination">
            {pages.map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`page-btn ${page === currentPage ? "active" : ""}`}
                >
                    {page}
                </button>
            ))}
        </div>
    );
};

export default Pagination;
