import React, { useState } from "react";
import TimeClock from "../component/TimeClock";
import Payroll from "../component/Payroll";

const EmployeeDashboard = ({ employeeId }) => {
  const [viewPayroll, setViewPayroll] = useState(false);

  const togglePayrollView = () => {
    setViewPayroll(!viewPayroll);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Employee Dashboard</h1>

      {/* Time Clock Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Time Clock</h2>
        <TimeClock employeeId={employeeId} />
      </div>

      {/* Payroll Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Payroll</h2>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          onClick={togglePayrollView}
        >
          {viewPayroll ? "Hide Payroll" : "View Payroll"}
        </button>
        {viewPayroll && <Payroll employeeId={employeeId} />}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
