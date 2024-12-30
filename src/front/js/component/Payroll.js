import React, { useEffect, useState } from "react";

const Payroll = ({ employeeId }) => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        const response = await fetch(`/api/payroll?employee_id=${employeeId}`);
        if (response.ok) {
          const data = await response.json();
          setPayrolls(data);
        } else {
          console.error("Error fetching payroll data");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayroll();
  }, [employeeId]);

  if (loading) {
    return <p>Loading payroll history...</p>;
  }

  return (
    <div>
      <h3>Payroll History</h3>
      <table>
        <thead>
          <tr>
            <th>Pay Period</th>
            <th>Total Hours</th>
            <th>Hourly Rate</th>
            <th>Total Pay</th>
          </tr>
        </thead>
        <tbody>
          {payrolls.map((pay) => (
            <tr key={pay.id}>
              <td>{`${pay.pay_period_start} - ${pay.pay_period_end}`}</td>
              <td>{pay.total_hours}</td>
              <td>${pay.hourly_rate.toFixed(2)}</td>
              <td>${pay.total_pay.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Payroll;
