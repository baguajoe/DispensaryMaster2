import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch product details from the backend
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/products/${id}`); // Adjust API endpoint as needed
        setProduct(response.data);
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) {
    return <p>Loading product details...</p>;
  }

  return (
    <div>
      <h1>Product Details</h1>
      <p><strong>Name:</strong> {product.name}</p>
      <p><strong>Category:</strong> {product.category}</p>
      <p><strong>Strain:</strong> {product.strain || "N/A"}</p>
      <p><strong>THC Content:</strong> {product.thc_content || "N/A"}</p>
      <p><strong>CBD Content:</strong> {product.cbd_content || "N/A"}</p>
      <p><strong>Current Stock:</strong> {product.current_stock}</p>
      <p><strong>Reorder Point:</strong> {product.reorder_point}</p>
      <p><strong>Unit Price:</strong> ${product.unit_price}</p>
      <p><strong>Supplier:</strong> {product.supplier}</p>
      <p><strong>Batch Number:</strong> {product.batch_number}</p>
      <p><strong>Test Results:</strong> {product.test_results || "N/A"}</p>
      <button onClick={() => navigate(`/products/${id}/edit`)}>Edit</button>
      <button onClick={() => navigate("/products")}>Back to Products</button>
    </div>
  );
};

export default ProductDetail;
