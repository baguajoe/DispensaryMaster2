import React from "react";

const StrainDropdown = ({ strains, onSelect }) => {
  return (
    <select onChange={(e) => onSelect(e.target.value)} className="strain-dropdown">
      <option value="">Select a strain</option>
      {strains.map((strain, index) => (
        <option key={index} value={strain}>
          {strain}
        </option>
      ))}
    </select>
  );
};

export default StrainDropdown;
