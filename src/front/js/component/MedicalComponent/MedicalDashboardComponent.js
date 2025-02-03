import React from "react";
import MedicalMetricCard from "./MedicalMetricCard";
import MedicalChartCard from "./MedicalChartCard";
import MedicalTableCard from "./MedicalTableCard";

const MedicalDashboardComponent = ({ metrics, complianceData, auditStatus, loading }) => {
  return (
    <div>
      {/* Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        {metrics.map((metric, index) => (
          <MedicalMetricCard
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

      {/* Compliance Audit Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
        <MedicalMetricCard
          title="Pending Audits"
          value={auditStatus.pending}
          icon="📋"
          bgColor="bg-yellow-100"
          textColor="text-yellow-900"
        />
        <MedicalMetricCard
          title="Completed Audits"
          value={auditStatus.completed}
          icon="✅"
          bgColor="bg-green-100"
          textColor="text-green-900"
        />
        <MedicalMetricCard
          title="Passed Audits"
          value={auditStatus.passed}
          icon="🎉"
          bgColor="bg-blue-100"
          textColor="text-blue-900"
        />
      </div>

      {/* Compliance Details Table */}
      <div>
        <h2 className="section-title">Compliance Details</h2>
        <MedicalTableCard
          data={complianceData}
          columns={["Business ID", "Licenses", "Reports", "Audits"]}
          keyMapping={{
            "Business ID": "business_id",
            Licenses: "licenses",
            Reports: "reports",
            Audits: "audits",
          }}
        />
      </div>
    </div>
  );
};

export default MedicalDashboardComponent;
