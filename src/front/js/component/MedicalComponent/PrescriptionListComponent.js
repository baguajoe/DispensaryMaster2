import React from "react";
import PropTypes from "prop-types";

const PrescriptionListComponent = ({ prescriptions }) => {
  return (
    <div>
      <h3>Prescription List</h3>
      <table>
        <thead>
          <tr>
            <th>Patient Name</th>
            <th>Medication</th>
            <th>Dosage</th>
            <th>Frequency</th>
          </tr>
        </thead>
        <tbody>
          {prescriptions.map((prescription) => (
            <tr key={prescription.id}>
              <td>{prescription.patientName}</td>
              <td>{prescription.medication}</td>
              <td>{prescription.dosage}</td>
              <td>{prescription.frequency}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

PrescriptionListComponent.propTypes = {
  prescriptions: PropTypes.array.isRequired,
};

export default PrescriptionListComponent;
