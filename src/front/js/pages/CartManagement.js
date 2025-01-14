import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/cart.css";

const CartManagement = () => {
  const [cart, setCart] = useState([]);
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch cart items on component mount
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/cart");
      setCart(response.data);
      calculateTotal(response.data);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total amount
  const calculateTotal = (cartItems) => {
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );
    setTotal(totalAmount);
  };

  // Remove an item from the cart
  const removeFromCart = async (itemId) => {
    try {
      await axios.delete(`/cart/${itemId}`);
      const updatedCart = cart.filter((item) => item.id !== itemId);
      setCart(updatedCart);
      calculateTotal(updatedCart);
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  // Clear the entire cart
  const clearCart = async () => {
    try {
      await axios.delete("/cart");
      setCart([]);
      setTotal(0);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  // Save an item for later
  const saveForLater = async (itemId) => {
    try {
      await axios.post("/cart/save_for_later", { item_id: itemId });
      const updatedCart = cart.filter((item) => item.id !== itemId);
      setCart(updatedCart);
      calculateTotal(updatedCart);
    } catch (error) {
      console.error("Error saving item for later:", error);
    }
  };

  // Apply a discount code
  const applyDiscount = async () => {
    try {
      const response = await axios.post("/cart/apply_discount", {
        code: discountCode,
      });
      if (response.data.success) {
        const discountRate = response.data.discount / 100;
        setTotal(total * (1 - discountRate));
        setDiscountApplied(true);
      } else {
        alert("Invalid discount code");
      }
    } catch (error) {
      console.error("Error applying discount:", error);
    }
  };

  return (
    <div className="cart-management p-6 bg-gray-100 min-h-screen main-content">
      <h1 className="text-3xl font-bold mb-4">Shopping Cart</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="flex justify-between mb-6">
            <button
              onClick={clearCart}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Clear Cart
            </button>
            <input
              type="text"
              placeholder="Discount Code"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              className="border rounded px-3 py-2"
            />
            <button
              onClick={applyDiscount}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Apply Discount
            </button>
          </div>

          <ul className="space-y-4">
            {cart.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center bg-white p-4 rounded shadow"
              >
                <div>
                  <h3 className="text-lg font-bold">{item.name}</h3>
                  <p>${item.unit_price} x {item.quantity}</p>
                </div>
                <div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 mr-4"
                  >
                    Remove
                  </button>
                  <button
                    onClick={() => saveForLater(item.id)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Save for Later
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <h2 className="text-2xl font-bold">Total: ${total.toFixed(2)}</h2>
            {discountApplied && (
              <p className="text-green-500 mt-2">Discount applied!</p>
            )}
            <button
              onClick={() => (window.location.href = "/checkout")}
              className="bg-black text-white px-6 py-3 rounded mt-4"
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartManagement;
