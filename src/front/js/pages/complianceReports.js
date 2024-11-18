import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ComplianceReports = () => {
  const [reports, setReports] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get("/api/compliance");
        setReports(response.data);
      } catch (error) {
        console.error("Error fetching compliance reports:", error);
      }
    };
    fetchReports();
  }, []);

  const handleView = (id) => navigate(`/compliance/${id}`);

  return (
    <div>
      <h1>Compliance Reports</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Business ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id}>
              <td>{report.id}</td>
              <td>{report.business_id}</td>
              <td>
                <button onClick={() => handleView(report.id)}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComplianceReports;
