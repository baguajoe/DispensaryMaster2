import React from "react";

const MedicalMetricCard = ({ title, value, icon, bgColor, textColor }) => {
  return (
    <div className={`p-4 rounded shadow ${bgColor} ${textColor}`}>
      <div className="flex items-center">
        <span className="text-4xl mr-4">{icon}</span>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-2xl">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default MedicalMetricCard;
