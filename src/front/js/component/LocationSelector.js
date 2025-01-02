import React from "react";

const LocationSelector = ({ locations, onSelect }) => (
  <select onChange={(e) => onSelect(e.target.value)}>
    <option value="">Select a location</option>
    {locations.map((loc) => (
      <option key={loc.id} value={loc.id}>
        {loc.name}
      </option>
    ))}
  </select>
);

export default LocationSelector;
