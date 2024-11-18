import React, { useState } from "react";
import axios from "axios";

const AddProduct = () => {
  const [product, setProduct] = useState({
    name: "",
    category: "",
    strain: "",
    thc_content: "",
    cbd_content: "",
    current_stock: 0,
    reorder_point: 0,
    unit_price: "",
    supplier: "",
    batch_number: "",
    test_results: "",
  });

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/products", product);
      alert("Product added successfully!");
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Error adding product.");
    }
  };

  return (
    <div>
      <h1>Add Product</h1>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" onChange={handleChange} required />
        <input name="category" placeholder="Category" onChange={handleChange} required />
        <input name="strain" placeholder="Strain" onChange={handleChange} />
        <input name="thc_content" placeholder="THC Content" onChange={handleChange} />
        <input name="cbd_content" placeholder="CBD Content" onChange={handleChange} />
        <input
          type="number"
          name="current_stock"
          placeholder="
