import React, { useEffect, useState } from "react";
import axios from "axios";

function EmployeeShifts() {
  const [shifts, setShifts] = useState([]);
  const [currentShiftId, setCurrentShiftId] = useState(null);
  const [clockedIn, setClockedIn] = useState(false);

  useEffect(() => {
    // Fetch assigned shifts for the logged-in employee
    axios.get("/api/shifts/employee")
      .then(response => setShifts(response.data))
      .catch(error => console.error("Error fetching shifts", error));
  }, []);

  const handleClockIn = (shiftId) => {
    axios.post("/api/clock-in", { employee_id: shiftId })
      .then(() => {
        setCurrentShiftId(shiftId);
        setClockedIn(true);
        alert("Clocked in successfully");
      })
      .catch(error => alert("Error clocking in: " + error.response.data.error));
  };

  const handleClockOut = () => {
    axios.post("/api/clock-out", { employee_id: currentShiftId })
      .then(() => {
        setClockedIn(false);
        setCurrentShiftId(null);
        alert("Clocked out successfully");
      })
      .catch(error => alert("Error clocking out: " + error.response.data.error));
  };

  return (
    <div>
      <h1>Your Shifts</h1>
      <ul>
        {shifts.map(shift => (
          <li key={shift.id}>
            {new Date(shift.start_time).toLocaleString()} - {new Date(shift.end_time).toLocaleString()}
            {!clockedIn && <button onClick={() => handleClockIn(shift.employee_id)}>Clock In</button>}
          </li>
        ))}
      </ul>

      {clockedIn && (
        <div>
          <h2>Currently Clocked In</h2>
          <button onClick={handleClockOut}>Clock Out</button>
        </div>
      )}
    </div>
  );
}

export default EmployeeShifts;
