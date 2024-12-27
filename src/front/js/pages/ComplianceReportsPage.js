import React, { useState, useEffect } from "react";

const ComplianceReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/reports/compliance`);
        setReports(await response.json());
      } catch (error) {
        console.error("Error fetching compliance reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Compliance Reports</h1>
      {loading ? (
        <p>Loading reports...</p>
      ) : (
        <ul className="list-disc list-inside">
          {reports.map((report) => (
            <li key={report.id}>
              <strong>{report.title}</strong> - {report.date}
              <p>{report.summary}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ComplianceReportsPage;
