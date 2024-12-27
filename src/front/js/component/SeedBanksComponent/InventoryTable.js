import React from "react";
import PropTypes from "prop-types";

const InventoryTable = ({ inventory }) => {
  return (
    <div>
      <h3>Inventory Table</h3>
      <table>
        <thead>
          <tr>
            <th>Batch Number</th>
            <th>Strain</th>
            <th>Quantity</th>
            <th>Location</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.id}>
              <td>{item.batchNumber}</td>
              <td>{item.strain}</td>
              <td>{item.quantity}</td>
              <td>{item.location}</td>
              <td>{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

InventoryTable.propTypes = {
  inventory: PropTypes.array.isRequired,
};

export default InventoryTable;
