import React, { useEffect, useState } from 'react';

const ProductsComponent = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', unit_price: 0 });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(process.env.BACKEND_URL + '/api/products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleAddProduct = async () => {
    try {
      const response = await fetch(process.env.BACKEND_URL + '/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      const createdProduct = await response.json();
      setProducts((prevProducts) => [...prevProducts, createdProduct]);
      setNewProduct({ name: '', category: '', unit_price: 0 });
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  return (
    <div className="products-container">
      <h1>Product Management</h1>

      {/* Products List */}
      <div className="products-list">
        <h2>Available Products</h2>
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              {product.name} - ${product.unit_price.toFixed(2)} - {product.category}
            </li>
          ))}
        </ul>
      </div>

      {/* Add New Product */}
      <div className="add-product">
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
    </div>
  );
};

export default ProductsComponent;
