import React, { useState, useEffect } from "react";

const PestDiseaseTracker = () => {
  const [issues, setIssues] = useState([]);
  const [newIssue, setNewIssue] = useState({
    issueType: "",
    batchId: "",
    reportedDate: "",
    treatment: "",
    status: "active",
  });

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/pest-disease`)
      .then(res => res.json())
      .then(data => setIssues(data))
      .catch(err => console.error("Fetch error:", err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/pest-disease`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newIssue),
    })
      .then(res => res.json())
      .then((data) => {
        setIssues([...issues, data]);
        setNewIssue({
          issueType: "",
          batchId: "",
          reportedDate: "",
          treatment: "",
          status: "active",
        });
      })
      .catch(err => console.error("POST error:", err));
  };

  return (
    <div>
      <h2>Pest & Disease Tracker</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Issue Type"
          value={newIssue.issueType}
          onChange={(e) => setNewIssue({ ...newIssue, issueType: e.target.value })}
        />
        <input
          type="text"
          placeholder="Batch ID"
          value={newIssue.batchId}
          onChange={(e) => setNewIssue({ ...newIssue, batchId: e.target.value })}
        />
        <input
          type="date"
          value={newIssue.reportedDate}
          onChange={(e) => setNewIssue({ ...newIssue, reportedDate: e.target.value })}
        />
        <input
          type="text"
          placeholder="Treatment"
          value={newIssue.treatment}
          onChange={(e) => setNewIssue({ ...newIssue, treatment: e.target.value })}
        />
        <select
          value={newIssue.status}
          onChange={(e) => setNewIssue({ ...newIssue, status: e.target.value })}
        >
          <option value="active">Active</option>
          <option value="resolved">Resolved</option>
        </select>
        <button type="submit">Add Report</button>
      </form>

      <ul>
        {issues.map((issue, index) => (
          <li key={index}>
            {issue.issueType} – {issue.batchId} – Status: {issue.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PestDiseaseTracker;
