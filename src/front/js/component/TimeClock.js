import React, { useState } from "react";

const TimeClock = ({ employeeId }) => {
  const [status, setStatus] = useState("clocked_out");

  const handleClockIn = async () => {
    const response = await fetch("/clock-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employee_id: employeeId }),
    });

    if (response.ok) {
      setStatus("clocked_in");
    } else {
      alert("Error clocking in.");
    }
  };

  const handleClockOut = async () => {
    const response = await fetch("/clock-out", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employee_id: employeeId }),
    });

    if (response.ok) {
      const data = await response.json();
      alert(`Clock-out successful. Total hours: ${data.total_hours}`);
      setStatus("clocked_out");
    } else {
      alert("Error clocking out.");
    }
  };

  return (
    <div>
      <h3>Employee Time Clock</h3>
      {status === "clocked_out" ? (
        <button onClick={handleClockIn}>Clock In</button>
      ) : (
        <button onClick={handleClockOut}>Clock Out</button>
      )}
    </div>
  );
};

export default TimeClock;
