import React, { useState } from "react";
import Payroll from "../components/Payroll";

const PayrollPage = () => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  const handleEmployeeSelect = (event) => {
    setSelectedEmployeeId(event.target.value);
  };

  return (
    <div>
      <h1>Payroll Management</h1>
      
      {/* Dropdown to select employee */}
      <div>
        <label htmlFor="employeeSelect">Select Employee:</label>
        <select
          id="employeeSelect"
          onChange={handleEmployeeSelect}
          value={selectedEmployeeId || ""}
        >
          <option value="" disabled>
            -- Select Employee --
          </option>
          <option value="1">Employee 1</option>
          <option value="2">Employee 2</option>
          <option value="3">Employee 3</option>
        </select>
      </div>

      {/* Render Payroll component for selected employee */}
      {selectedEmployeeId ? (
        <Payroll employeeId={selectedEmployeeId} />
      ) : (
        <p>Please select an employee to view payroll history.</p>
      )}
    </div>
  );
};

export default PayrollPage;
