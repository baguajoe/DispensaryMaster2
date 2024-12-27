import React from "react";

const PatientTable = ({ patients }) => {
  return (
    <table className="table-auto w-full bg-white shadow-md rounded-lg">
      <thead>
        <tr>
          <th className="px-4 py-2">Name</th>
          <th className="px-4 py-2">Age</th>
          <th className="px-4 py-2">Prescription</th>
          <th className="px-4 py-2">Last Visit</th>
        </tr>
      </thead>
      <tbody>
        {patients.map((patient) => (
          <tr key={patient.id} className="border-t">
            <td className="px-4 py-2">{patient.name}</td>
            <td className="px-4 py-2">{patient.age}</td>
            <td className="px-4 py-2">{patient.prescription}</td>
            <td className="px-4 py-2">{new Date(patient.last_visit).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PatientTable;
