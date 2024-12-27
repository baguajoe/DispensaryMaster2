import React from "react";
import PropTypes from "prop-types";

const ReportGenerator = ({ generateReport }) => {
  return (
    <div>
      <h3>Generate Reports</h3>
      <button onClick={generateReport}>Generate Report</button>
    </div>
  );
};

ReportGenerator.propTypes = {
  generateReport: PropTypes.func.isRequired,
};

export default ReportGenerator;
