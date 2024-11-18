import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ComplianceDetail = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get(`/api/compliance/${id}`);
        setReport(response.data);
      } catch (error) {
        console.error("Error fetching compliance report:", error);
      }
    };
    fetchReport();
  }, [id]);

  if (!report) return <p>Loading compliance details...</p>;

  return (
    <div>
      <h1>Compliance Report Details</h1>
      <p><strong>ID:</strong> {report.id}</p>
      <p><strong>Business ID:</strong> {report.business_id}</p>
      <h3>Licenses:</h3>
      <pre>{JSON.stringify(report.licenses, null, 2)}</pre>
      <h3>Test Results:</h3>
      <pre>{JSON.stringify(report.test_results, null, 2)}</pre>
      <h3>Reports:</h3>
      <pre>{JSON.stringify(report.reports, null, 2)}</pre>
      <h3>Audits:</h3>
      <pre>{JSON.stringify(report.audits, null, 2)}</pre>
    </div>
  );
};

export default ComplianceDetail;
