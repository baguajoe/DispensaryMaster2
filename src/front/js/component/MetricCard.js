import React from "react";
import PropTypes from "prop-types";
import { FaDollarSign } from "react-icons/fa";


const MetricCard = ({ title, value, icon }) => (
  <div className="bg-white shadow-lg rounded-lg p-4 flex items-center space-x-4">
    {icon && <div className="text-blue-500 text-3xl">{icon}</div>}
    <div>
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

MetricCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.element,
};

export default MetricCard;
