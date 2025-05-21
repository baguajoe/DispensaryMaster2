import React, { useState, useEffect } from "react";

const HarvestLog = () => {
  const [logs, setLogs] = useState([]);
  const [newLog, setNewLog] = useState({
    batchId: "",
    harvestDate: "",
    wetWeight: "",
    dryWeight: "",
    notes: "",
  });

  // Fetch all harvest logs on mount
  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/harvest-logs`)
      .then(res => res.json())
      .then(data => setLogs(data))
      .catch(err => console.error("Fetch error:", err));
  }, []);

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();

    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/harvest-logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newLog),
    })
      .then(res => res.json())
      .then((data) => {
        setLogs([...logs, data]);
        setNewLog({
          batchId: "",
          harvestDate: "",
          wetWeight: "",
          dryWeight: "",
          notes: "",
        });
      })
      .catch(err => console.error("POST error:", err));
  };

  return (
    <div>
      <h2>Harvest Log</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Batch ID"
          value={newLog.batchId}
          onChange={(e) => setNewLog({ ...newLog, batchId: e.target.value })}
        />
        <input
          type="date"
          value={newLog.harvestDate}
          onChange={(e) => setNewLog({ ...newLog, harvestDate: e.target.value })}
        />
        <input
          type="number"
          placeholder="Wet Weight (g)"
          value={newLog.wetWeight}
          onChange={(e) => setNewLog({ ...newLog, wetWeight: e.target.value })}
        />
        <input
          type="number"
          placeholder="Dry Weight (g)"
          value={newLog.dryWeight}
          onChange={(e) => setNewLog({ ...newLog, dryWeight: e.target.value })}
        />
        <textarea
          placeholder="Notes"
          value={newLog.notes}
          onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
        />
        <button type="submit">Add Harvest Log</button>
      </form>

      <ul>
        {logs.map((log, index) => (
          <li key={index}>
            {log.batchId} - {log.harvestDate} - Dry: {log.dryWeight}g
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HarvestLog;
