import React from "react";
import PropTypes from "prop-types";

const StorageConditionsTable = ({ conditions }) => {
  return (
    <div>
      <h3>Storage Conditions</h3>
      <table>
        <thead>
          <tr>
            <th>Location</th>
            <th>Temperature</th>
            <th>Humidity</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {conditions&&conditions.map((condition) => (
            <tr key={condition.id}>
              <td>{condition.location}</td>
              <td>{condition.temperature}</td>
              <td>{condition.humidity}</td>
              <td>{condition.lastUpdated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

StorageConditionsTable.propTypes = {
  conditions: PropTypes.array.isRequired,
};

export default StorageConditionsTable;
