import React, { useEffect, useState } from "react";
import ComplianceAlertsTable from "../component/ComplianceAlertsTable";
import BatchTrackingTable from "../component/BatchTrackingTable";
import AuditReportsList from "../component/AuditReportsList";

const ComplianceMonitoringPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [batchTracking, setBatchTracking] = useState([]);
  const [auditReports, setAuditReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplianceData = async () => {
      setLoading(true);
      try {
        const [alertsResponse, batchResponse, auditResponse] = await Promise.all([
          fetch(`${process.env.BACKEND_URL}/api/compliance/alerts`),
          fetch(`${process.env.BACKEND_URL}/api/compliance/batch-tracking`),
          fetch(`${process.env.BACKEND_URL}/api/compliance/audit-reports`),
        ]);

        setAlerts(await alertsResponse.json());
        setBatchTracking(await batchResponse.json());
        setAuditReports(await auditResponse.json());
      } catch (error) {
        console.error("Error fetching compliance data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplianceData();
  }, []);

  return (
    <div className="p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Compliance Monitoring</h1>
      {loading ? (
        <p>Loading compliance data...</p>
      ) : (
        <>
          <ComplianceAlertsTable data={alerts} />
          <BatchTrackingTable data={batchTracking} />
          <AuditReportsList data={auditReports} />
        </>
      )}
    </div>
  );
};

export default ComplianceMonitoringPage;
