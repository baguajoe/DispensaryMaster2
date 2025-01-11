import React, { useEffect, useState, useRef } from "react";
// import ReactToPrint from "react-to-print";
// import ReceiptTemplate from "./ReceiptTemplate";

const POS = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [order, setOrder] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [unsyncedTransactions, setUnsyncedTransactions] = useState(
    JSON.parse(localStorage.getItem("unsyncedTransactions")) || []
  );
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const receiptRef = useRef();
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const customerId = 1;

  // Cash Management States
  const [drawerId, setDrawerId] = useState(null);
  const [cashBalance, setCashBalance] = useState(0);
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactions, setTransactions] = useState([]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        syncOfflineTransactions();
      }
    };

    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);

    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, []);

  // Fetch products from the backend
  useEffect(() => {
    if (isOnline) {
      const loadProducts = async () => {
        try {
          const response = await fetch(process.env.BACKEND_URL + "/api/products");
          const data = await response.json();
          setProducts(data);
        } catch (error) {
          console.error("Error fetching products:", error);
        }
      };
      loadProducts();
    }
  }, [isOnline]);

  // Fetch loyalty points
  useEffect(() => {
    const fetchLoyaltyPoints = async () => {
      try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/loyalty/points/${customerId}`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
        });
        const data = await response.json();
        setLoyaltyPoints(data.loyalty_points);
      } catch (error) {
        console.error("Error fetching loyalty points:", error);
      }
    };
    fetchLoyaltyPoints();
  }, [customerId]);

  // Fetch cash drawer details
  useEffect(() => {
    const fetchCashDrawer = async () => {
      try {
        const response = await fetch(`${process.env.BACKEND_URL}/cash/drawer`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({ start_balance: 1000 }), // Example start balance
        });
        const id = await response.json();
        setDrawerId(id);
        setCashBalance(1000);
      } catch (error) {
        console.error("Error creating cash drawer:", error);
      }
    };
    fetchCashDrawer();
  }, []);

  // Add product to cart
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.id === product.id);
      if (existingProduct) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // Calculate total amount
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.unit_price * item.quantity, 0).toFixed(2);
  };

  // Handle payment submission
  const handlePayment = async () => {
    const totalAmount = parseFloat(calculateTotal());
    const paidAmount = paymentDetails.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

    // Apply loyalty points redemption
    const discount = pointsToRedeem / 10;
    const payableAmount = totalAmount - discount;

    if (paidAmount < payableAmount) {
      alert("Insufficient payment. Please add more.");
      return;
    }

    const newOrder = {
      id: Math.floor(Math.random() * 1000000).toString(),
      items: cart,
      totalAmount: payableAmount,
      paymentDetails,
      timestamp: new Date().toISOString(),
    };

    if (isOnline) {
      syncTransaction(newOrder);
      await redeemLoyaltyPoints(pointsToRedeem);
    } else {
      saveOfflineTransaction(newOrder);
    }

    setOrder(newOrder);
    setCart([]);
    setPaymentDetails([]);
    setPointsToRedeem(0);
  };

  // Redeem loyalty points
  const redeemLoyaltyPoints = async (points) => {
    try {
      const response = await fetch(`${process.env.BACKEND_URL}/api/loyalty/points/redeem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({ customer_id: customerId, points }),
      });
      const data = await response.json();
      setLoyaltyPoints(data.loyalty_points);
      alert(data.message);
    } catch (error) {
      console.error("Error redeeming loyalty points:", error);
    }
  };

  // Save transaction to localStorage when offline
  const saveOfflineTransaction = (transaction) => {
    const updatedTransactions = [...unsyncedTransactions, transaction];
    setUnsyncedTransactions(updatedTransactions);
    localStorage.setItem("unsyncedTransactions", JSON.stringify(updatedTransactions));
    alert("Transaction saved offline. It will sync when you're back online.");
  };

  // Sync transactions with the backend
  const syncTransaction = async (transaction) => {
    try {
      const response = await fetch(process.env.BACKEND_URL + "/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction),
      });
      if (response.ok) {
        console.log("Transaction synced:", transaction);
      } else {
        throw new Error("Failed to sync transaction");
      }
    } catch (error) {
      console.error("Error syncing transaction:", error);
      saveOfflineTransaction(transaction);
    }
  };

  // Handle cash transactions
  const handleTransaction = async (type) => {
    try {
      const response = await fetch(`${process.env.BACKEND_URL}/cash/transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({ drawer_id: drawerId, type, amount: parseFloat(transactionAmount) }),
      });
      const newTransaction = await response.json();
      setTransactions((prev) => [...prev, newTransaction]);
      setCashBalance((prev) =>
        type === "deposit" ? prev + parseFloat(transactionAmount) : prev - parseFloat(transactionAmount)
      );
      setTransactionAmount("");
    } catch (error) {
      console.error("Error logging transaction:", error);
    }
  };

  return (
    <div className="pos-container">
      <h1 className="text-2xl font-bold mb-6">POS System</h1>
      {/* Add sections as described in the previous response */}
    </div>
  );
};

export default POS;
