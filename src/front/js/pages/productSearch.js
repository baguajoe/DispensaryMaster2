import React, { useState, useEffect } from "react";
import axios from "axios";

const ProductSearch = () => {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`/api/products?search=${query}`);
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    if (query) {
      fetchProducts();
    }
  }, [query]);

  return (
    <div>
      <h1>Search Products</h1>
      <input
        type="text"
        placeholder="Search by name or category"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            {product.name} - {product.category}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductSearch;
