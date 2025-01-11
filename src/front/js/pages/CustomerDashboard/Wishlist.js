import React, { useState } from "react";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([
    { id: 1, name: "Product 1", price: "$25.00" },
    { id: 2, name: "Product 2", price: "$15.00" },
  ]);

  const moveToCart = (productId) => {
    alert(`Moved product ${productId} to cart! (Mock Function)`);
  };

  return (
    <div>
      <h1>Wishlist</h1>
      <ul>
        {wishlist.map((item) => (
          <li key={item.id}>
            {item.name} - {item.price}
            <button onClick={() => moveToCart(item.id)}>Add to Cart</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Wishlist;
