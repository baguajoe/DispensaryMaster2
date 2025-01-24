import React, { useState, useEffect } from "react";

const OfflineTransactions = () => {
  const [offlineTransactions, setOfflineTransactions] = useState(
    JSON.parse(localStorage.getItem("unsyncedTransactions")) || []
  );

  const handleSyncTransaction = async (transaction) => {
    try {
      const response = await fetch(`${process.env.BACKEND_URL}/api/pos/transactions/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(transaction),
      });

      if (response.ok) {
        alert(`Transaction ${transaction.id} synced successfully`);
        setOfflineTransactions((prev) =>
          prev.filter((t) => t.id !== transaction.id)
        );
        localStorage.setItem(
          "unsyncedTransactions",
          JSON.stringify(offlineTransactions)
        );
      } else {
        throw new Error("Sync failed");
      }
    } catch (error) {
      console.error("Error syncing transaction:", error);
    }
  };

  return (
    <div>
      <h2>Offline Transactions</h2>
      {offlineTransactions.length === 0 ? (
        <p>No offline transactions</p>
      ) : (
        <ul>
          {offlineTransactions.map((transaction) => (
            <li key={transaction.id}>
              Transaction ID: {transaction.id}
              <button onClick={() => handleSyncTransaction(transaction)}>
                Sync
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OfflineTransactions;
