import React, { useEffect, useState } from "react";
import axios from "axios";

function ManagerShifts() {
  const [shifts, setShifts] = useState([]);
  const [newShift, setNewShift] = useState({ employee_id: "", start_time: "", end_time: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch all shifts when component loads
    axios.get("/api/shifts")
      .then(response => setShifts(response.data))
      .catch(error => console.error("Error fetching shifts", error));
  }, []);

  const handleInputChange = (e) => {
    setNewShift({ ...newShift, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate new shift using backend route
    axios.post("/api/shifts/validate", newShift)
      .then(response => {
        // Proceed with adding shift if no conflicts
        axios.post("/api/shifts", newShift)
          .then(() => {
            alert("Shift assigned successfully");
            setShifts([...shifts, newShift]);
            setNewShift({ employee_id: "", start_time: "", end_time: "" });
          });
      })
      .catch(error => setError("Shift conflict detected: " + error.response.data.error));
  };

  return (
    <div>
      <h1>Shift Management</h1>

      {/* New Shift Form */}
      <form onSubmit={handleSubmit}>
        <input type="text" name="employee_id" placeholder="Employee ID" value={newShift.employee_id} onChange={handleInputChange} required />
        <input type="datetime-local" name="start_time" value={newShift.start_time} onChange={handleInputChange} required />
        <input type="datetime-local" name="end_time" value={newShift.end_time} onChange={handleInputChange} required />
        <button type="submit">Assign Shift</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* List of Existing Shifts */}
      <h2>Current Shifts</h2>
      <ul>
        {shifts.map(shift => (
          <li key={shift.id}>
            Employee {shift.employee_id} - {new Date(shift.start_time).toLocaleString()} to {new Date(shift.end_time).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ManagerShifts;
