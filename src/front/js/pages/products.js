import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Products = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch products from the backend
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/api/products"); // Adjust API endpoint as needed
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  const handleView = (id) => {
    navigate(`/products/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/products/${id}/edit`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`/api/products/${id}`);
        setProducts(products.filter((product) => product.id !== id));
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  return (
    <div>
      <h1>Products</h1>
      <button onClick={() => navigate("/products/add")}>Add Product</button>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.category}</td>
              <td>{product.current_stock}</td>
              <td>
                <button onClick={() => handleView(product.id)}>View</button>
                <button onClick={() => handleEdit(product.id)}>Edit</button>
                <button onClick={() => handleDelete(product.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Products;
