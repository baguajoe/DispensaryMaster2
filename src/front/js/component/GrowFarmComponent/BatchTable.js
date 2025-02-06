import React from "react";
import PropTypes from "prop-types";
import BatchStatusBadge from "./BatchStatusBadge";

const BatchTable = ({ batches }) => {
  return (
    <table className="batch-table">
      <thead>
        <tr>
          <th>Strain</th>
          <th>Quantity</th>
          <th>Status</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {batches.map((batch) => (
          <tr key={batch.id}>
            <td>{batch.strain}</td>
            <td>{batch.quantity}</td>
            <td>
              <BatchStatusBadge status={batch.status} />
            </td>
            <td>{batch.startDate}</td>
            <td>{batch.endDate || "N/A"}</td>
            <td>
              <Link to={`/batches/${batch.id}/edit`}>Edit</Link> |{" "}
              <Link to={`/batches/${batch.id}/view`}>View</Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

BatchTable.propTypes = {
  batches: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      strain: PropTypes.string.isRequired,
      quantity: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired,
      startDate: PropTypes.string.isRequired,
      endDate: PropTypes.string,
    })
  ).isRequired,
};

export default BatchTable;
