import React from "react";

const ReportTable = ({ reports }) => {
  return (
    <table className="report-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Report Name</th>
          <th>Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {reports.map((report) => (
          <tr key={report.id}>
            <td>{report.id}</td>
            <td>{report.name}</td>
            <td>{report.date}</td>
            <td>
              <button>View</button>
              <button>Download</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ReportTable;
