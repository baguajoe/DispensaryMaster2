import React, { useEffect, useState } from "react";
import MetricCard from "../../component/MetricCard";
import ChartCard from "../../component/ChartCard";
import TableCard from "../../component/TableCard";

const MedicalDashboard = () => {
  const [metrics, setMetrics] = useState([]);
  const [patientData, setPatientData] = useState([]);
  const [complianceChart, setComplianceChart] = useState({
    labels: [],
    datasets: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated metrics for medical dashboard
    const staticMetrics = [
      { title: "Active Patients", value: "1,230", icon: "👨‍⚕️", trend: 5, bgColor: "bg-green-100", textColor: "text-green-900" },
      { title: "Dispensed Products", value: "2,540", icon: "💊", trend: 8, bgColor: "bg-blue-100", textColor: "text-blue-900" },
      { title: "Pending Compliance Audits", value: "3", icon: "📋", trend: -1, bgColor: "bg-yellow-100", textColor: "text-yellow-900" },
      { title: "Revenue (Monthly)", value: "$45,000", icon: "💰", trend: 10, bgColor: "bg-teal-100", textColor: "text-teal-900" },
    ];
    setMetrics(staticMetrics);

    // Fetch patient data
    fetch("/api/medical/patients")
      .then((response) => response.json())
      .then((data) => setPatientData(data))
      .catch((error) => console.error("Error fetching patient data:", error));

    // Fetch compliance chart data
    fetch("/api/medical/compliance")
      .then((response) => response.json())
      .then((data) => {
        setComplianceChart(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching compliance data:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Medical Dashboard</h1>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            trend={metric.trend}
            bgColor={metric.bgColor}
            textColor={metric.textColor}
          />
        ))}
      </div>

      {/* Compliance Chart Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Compliance Trends</h2>
        {loading ? (
          <p>Loading chart...</p>
        ) : (
          <ChartCard type="bar" data={complianceChart} title="Compliance Over Time" />
        )}
      </div>

      {/* Patient Data Table */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Patient Records</h2>
        <TableCard
          data={patientData}
          columns={["Name", "Age", "Prescription", "Last Visit"]}
          keyMapping={{
            Name: "name",
            Age: "age",
            Prescription: "prescription",
            "Last Visit": "last_visit",
          }}
        />
      </div>
    </div>
  );
};

export default MedicalDashboard;
