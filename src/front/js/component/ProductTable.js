import React from "react";

const ProductTable = ({ results }) => {
    return (
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
    );
};

export default ProductTable;
