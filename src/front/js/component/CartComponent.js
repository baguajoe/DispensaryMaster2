import React from "react";

const Cart = ({ cart, removeFromCart }) => {
  const total = cart.reduce((sum, item) => sum + item.unit_price, 0);

  return (
    <div className="cart">
      <h2>Cart</h2>
      <ul>
        {cart.map((item) => (
          <li key={item.id}>
            {item.name} - ${item.unit_price}
            <button onClick={() => removeFromCart(item.id)}>Remove</button>
          </li>
        ))}
      </ul>
      <h3>Total: ${total.toFixed(2)}</h3>
    </div>
  );
};

export default Cart;
