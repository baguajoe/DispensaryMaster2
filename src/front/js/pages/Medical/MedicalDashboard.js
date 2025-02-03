import React, { useEffect, useState } from "react";
import axios from "axios";
import MedicalDashboardComponent from "../components/MedicalComponent/MedicalDashboardComponent";

const MedicalDashboard = () => {
  const [metrics, setMetrics] = useState([]);
  const [complianceData, setComplianceData] = useState([]);
  const [auditStatus, setAuditStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const metricsResponse = await axios.get("/api/medical/metrics");
        setMetrics(metricsResponse.data);
      } catch (err) {
        console.error("Error fetching metrics:", err);
        setError("Failed to load metrics.");
      }
    };

    const fetchComplianceData = async () => {
      try {
        const complianceResponse = await axios.get("/api/medical/compliance");
        setComplianceData(complianceResponse.data);
      } catch (err) {
        console.error("Error fetching compliance data:", err);
        setError("Failed to load compliance data.");
      }
    };

    const fetchAuditStatus = async () => {
      try {
        const auditResponse = await axios.get("/api/medical/compliance/audits");
        setAuditStatus(auditResponse.data);
      } catch (err) {
        console.error("Error fetching compliance audit status:", err);
        setError("Failed to load compliance audit status.");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    fetchComplianceData();
    fetchAuditStatus();
  }, []);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Medical Dashboard</h1>
      {error && <p className="error-message">{error}</p>}
      <MedicalDashboardComponent
        metrics={metrics}
        complianceData={complianceData}
        auditStatus={auditStatus}
        loading={loading}
      />
    </div>
  );
};

export default MedicalDashboard;
