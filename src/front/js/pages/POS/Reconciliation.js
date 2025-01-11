import React, { useState } from "react";

const Reconciliation = () => {
  const [actualCash, setActualCash] = useState("");
  const [expectedCash, setExpectedCash] = useState(1000); // Replace with actual data from backend
  const [notes, setNotes] = useState("");

  const handleReconciliation = async () => {
    try {
      const response = await fetch(`${process.env.BACKEND_URL}/api/pos/reconciliation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({ actualCash, expectedCash, notes }),
      });
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error("Error processing reconciliation:", error);
    }
  };

  return (
    <div>
      <h2>End-of-Day Reconciliation</h2>
      <div>
        <label>Expected Cash</label>
        <input type="text" value={`$${expectedCash}`} readOnly />
      </div>
      <div>
        <label>Actual Cash</label>
        <input
          type="number"
          value={actualCash}
          onChange={(e) => setActualCash(e.target.value)}
          placeholder="Enter actual cash"
        />
      </div>
      <div>
        <label>Notes (Optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes"
        ></textarea>
      </div>
      <button onClick={handleReconciliation}>Submit Reconciliation</button>
    </div>
  );
};

export default Reconciliation;
