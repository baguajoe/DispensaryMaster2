import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import "../styles/Shop.css"; // Optional if you have external CSS

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [cartVisible, setCartVisible] = useState(false);
  const [cartItems, setCartItems] = useState(() =>
    JSON.parse(localStorage.getItem("cart")) || []
  );

  const navigate = useNavigate();

  // Fetch products
  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data);
      })
      .catch((err) => console.error("Error loading products:", err));
  }, []);

  // Filter products by category and search
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = products.filter((product) => {
      const matchesCategory =
        categoryFilter === "All" || product.category === categoryFilter;
      const matchesSearch = product.name.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
    setFilteredProducts(filtered);
  }, [searchTerm, categoryFilter, products]);

  // Add to cart
  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    setCartItems(cart);
    alert(`${product.name} added to cart`);
  };

  return (
    <div className="shop-container">
      <h1>Browse Products</h1>

      {/* Controls */}
      <div className="shop-controls">
        <input
          type="text"
          placeholder="Search for a product..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Sativa">Sativa</option>
          <option value="Indica">Indica</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Edibles">Edibles</option>
          <option value="Topicals">Topicals</option>
        </select>

        <button onClick={() => setCartVisible(true)}>🛒 View Cart</button>
      </div>

      {/* Product Grid */}
      <div className="product-grid">
        {filteredProducts.length === 0 && <p>No products found.</p>}
        {filteredProducts.map((product) => (
          <div className="product-card" key={product.id}>
            <img
              src={product.image_url || "/placeholder.png"}
              alt={product.name}
              className="product-image"
            />
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>${product.price.toFixed(2)}</p>
            <button onClick={() => handleAddToCart(product)}>Add to Cart</button>
          </div>
        ))}
      </div>

      {/* Cart Drawer */}
      {cartVisible && (
        <div className="cart-drawer">
          <h2>Your Cart</h2>
          <button onClick={() => setCartVisible(false)}>Close</button>
          <ul>
            {cartItems.length === 0 && <li>Your cart is empty.</li>}
            {cartItems.map((item, idx) => (
              <li key={idx}>
                {item.name} x {item.quantity} — ${item.price.toFixed(2)}
              </li>
            ))}
          </ul>
          <button onClick={() => navigate("/checkout")}>Go to Checkout</button>
        </div>
      )}
    </div>
  );
};

export default Shop;
