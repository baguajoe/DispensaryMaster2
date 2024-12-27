import React from "react";
import PropTypes from "prop-types";

const SeedBatchTable = ({ batches }) => {
  return (
    <div>
      <h3>Seed Batch Table</h3>
      <table>
        <thead>
          <tr>
            <th>Batch Number</th>
            <th>Strain</th>
            <th>Quantity</th>
            <th>Expiration Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {batches.map((batch) => (
            <tr key={batch.id}>
              <td>{batch.batchNumber}</td>
              <td>{batch.strain}</td>
              <td>{batch.quantity}</td>
              <td>{batch.expirationDate}</td>
              <td>{batch.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

SeedBatchTable.propTypes = {
  batches: PropTypes.array.isRequired,
};

export default SeedBatchTable;
