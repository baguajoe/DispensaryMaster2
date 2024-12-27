import React from "react";
import "../../styles/Products.css";

const Products = () => {
  return (
    <div className="main-content">
      <div className="products-page">
        {/* Header Section */}
        <header className="products-header">
          <h1>Products</h1>
          <div>
            <button>Add Product</button>
            <button>Add Category</button>
          </div>
        </header>

        {/* Table Section */}
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Price</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Dynamic Data */}
              <tr>
                <td className="px-4 py-2">Blue Dream</td>
                <td className="px-4 py-2">Available</td>
                <td className="px-4 py-2">Flower</td>
                <td className="px-4 py-2">$12.99</td>
                <td className="px-4 py-2">2024-01-01</td>
                <td className="px-4 py-2">FLR001</td>
                <td className="px-4 py-2">
                  <button className="edit-btn">Edit</button>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Granddaddy Purple</td>
                <td className="px-4 py-2">Out of Stock</td>
                <td className="px-4 py-2">Flower</td>
                <td className="px-4 py-2">$15.99</td>
                <td className="px-4 py-2">2024-01-10</td>
                <td className="px-4 py-2">FLR002</td>
                <td className="px-4 py-2">
                  <button className="edit-btn">Edit</button>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Gummy Bears</td>
                <td className="px-4 py-2">Available</td>
                <td className="px-4 py-2">Edible</td>
                <td className="px-4 py-2">$9.99</td>
                <td className="px-4 py-2">2024-02-01</td>
                <td className="px-4 py-2">EDB001</td>
                <td className="px-4 py-2">
                  <button className="edit-btn">Edit</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Products;
