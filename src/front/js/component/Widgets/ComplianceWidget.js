import React from "react";

const ComplianceWidget = () => {
  const complianceAlerts = [
    { id: 1, message: "New regulation update: Form 27 due next week.", status: "Urgent" },
    { id: 2, message: "Quarterly tax report submission pending.", status: "Pending" },
    { id: 3, message: "All licenses verified and up-to-date.", status: "Good" },
  ];

  return (
    <div className="compliance-widget">
      <h2 className="text-lg font-semibold mb-2">Compliance Alerts</h2>
      <ul className="list-disc pl-5">
        {complianceAlerts.map((alert) => (
          <li
            key={alert.id}
            className={`mb-2 ${
              alert.status === "Urgent"
                ? "text-red-600"
                : alert.status === "Pending"
                ? "text-yellow-600"
                : "text-green-600"
            }`}
          >
            {alert.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ComplianceWidget;
