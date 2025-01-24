import React, { useState, useEffect } from "react";

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [selectedReportType, setSelectedReportType] = useState("daily");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/pos/reports?type=${selectedReportType}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setReports(data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };
    fetchReports();
  }, [selectedReportType]);

  return (
    <div>
      <h2>POS Reports</h2>
      <select
        value={selectedReportType}
        onChange={(e) => setSelectedReportType(e.target.value)}
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Total Sales</th>
            <th>Transactions</th>
            <th>Top Product</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.date}>
              <td>{report.date}</td>
              <td>${report.totalSales.toFixed(2)}</td>
              <td>{report.transactionCount}</td>
              <td>{report.topProduct}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Reports;
