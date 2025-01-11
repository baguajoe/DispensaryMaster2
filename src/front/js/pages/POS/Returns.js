import React, { useState } from "react";

const Returns = () => {
  const [transactionId, setTransactionId] = useState("");
  const [returnDetails, setReturnDetails] = useState(null);

  const handleSearchTransaction = async () => {
    try {
      const response = await fetch(`${process.env.BACKEND_URL}/api/pos/transaction/${transactionId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setReturnDetails(data);
    } catch (error) {
      console.error("Error fetching transaction:", error);
    }
  };

  const handleProcessReturn = async () => {
    try {
      const response = await fetch(`${process.env.BACKEND_URL}/api/pos/returns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({ transactionId, returnItems: returnDetails.items }),
      });
      const data = await response.json();
      alert(data.message);
      setReturnDetails(null);
      setTransactionId("");
    } catch (error) {
      console.error("Error processing return:", error);
    }
  };

  return (
    <div>
      <h2>Returns</h2>
      <input
        type="text"
        placeholder="Enter Transaction ID"
        value={transactionId}
        onChange={(e) => setTransactionId(e.target.value)}
      />
      <button onClick={handleSearchTransaction}>Search Transaction</button>
      {returnDetails && (
        <div>
          <h3>Transaction Details</h3>
          <ul>
            {returnDetails.items.map((item) => (
              <li key={item.id}>
                {item.name} - {item.quantity} x ${item.price}
              </li>
            ))}
          </ul>
          <button onClick={handleProcessReturn}>Process Return</button>
        </div>
      )}
    </div>
  );
};

export default Returns;
