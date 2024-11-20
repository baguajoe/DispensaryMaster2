import React, { useEffect, useState } from 'react';
import { fetchProducts, createProduct } from './products';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', unit_price: 0 });

  useEffect(() => {
    const loadProducts = async () => {
      const data = await fetchProducts();
      setProducts(data);
    };
    loadProducts();
  }, []);

  const handleAddProduct = async () => {
    const createdProduct = await createProduct(newProduct);
    setProducts([...products, createdProduct]);
    setNewProduct({ name: '', category: '', unit_price: 0 });
  };

  return (
    <div>
      <h1>Products</h1>
      <ul>
        {products.map((product) => (
          <li key={product.id}>{product.name} - ${product.unit_price}</li>
        ))}
      </ul>
      <h2>Add New Product</h2>
      <input
        type="text"
        placeholder="Name"
        value={newProduct.name}
        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
      />
      <input
        type="text"
        placeholder="Category"
        value={newProduct.category}
        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
      />
      <input
        type="number"
        placeholder="Price"
        value={newProduct.unit_price}
        onChange={(e) => setNewProduct({ ...newProduct, unit_price: parseFloat(e.target.value) })}
      />
      <button onClick={handleAddProduct}>Add Product</button>
    </div>
  );
};

export default Products;
