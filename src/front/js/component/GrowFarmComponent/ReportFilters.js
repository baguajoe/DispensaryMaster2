import React from "react";

const ReportFilters = ({ filters, onApply }) => {
  const [filterValues, setFilterValues] = React.useState(filters);

  const handleChange = (key, value) => {
    setFilterValues({ ...filterValues, [key]: value });
  };

  return (
    <div className="report-filters">
      <h3>Report Filters</h3>
      <input
        type="text"
        placeholder="Filter by..."
        onChange={(e) => handleChange("filterText", e.target.value)}
      />
      <button onClick={() => onApply(filterValues)}>Apply Filters</button>
    </div>
  );
};

export default ReportFilters;
