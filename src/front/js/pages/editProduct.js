import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/products/${id}`, product);
      alert("Product updated successfully!");
      navigate("/products");
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Error updating product.");
    }
  };

  if (!product) return <p>Loading...</p>;

  return (
    <div>
      <h1>Edit Product</h1>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          value={product.name}
          placeholder="Name"
          onChange={handleChange}
          required
        />
        <input
          name="category"
          value={product.category}
          placeholder="Category"
          onChange={handleChange}
