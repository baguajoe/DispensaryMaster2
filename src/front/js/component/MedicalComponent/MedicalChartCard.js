import React from "react";
import { Line, Bar } from "react-chartjs-2";

const MedicalChartCard = ({ type, data, title }) => {
  return (
    <div className="p-4 rounded shadow bg-white">
      <h3 className="font-semibold mb-2">{title}</h3>
      {type === "bar" ? <Bar data={data} /> : <Line data={data} />}
    </div>
  );
};

export default MedicalChartCard;
