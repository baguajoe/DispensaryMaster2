import React from "react";

const CartComponent = ({ cart, removeFromCart, saveForLater, applyDiscount, total }) => {
  return (
    <div className="cart">
      <h2>Your Cart</h2>
      <ul>
        {cart.map((item) => (
          <li key={item.id}>
            {item.name} - ${item.unit_price} x {item.quantity}
            <button onClick={() => removeFromCart(item.id)}>Remove</button>
            <button onClick={() => saveForLater(item.id)}>Save for Later</button>
          </li>
        ))}
      </ul>
      <div>
        <h3>Total: ${total.toFixed(2)}</h3>
        <button onClick={() => (window.location.href = "/checkout")}>Go to Checkout</button>
      </div>
    </div>
  );
};

export default CartComponent;
