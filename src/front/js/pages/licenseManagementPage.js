import React, { useState, useEffect } from "react";
import axios from "axios";

const LicenseManagement = ({ userId }) => {
  const [licenses, setLicenses] = useState([]);

  useEffect(() => {
    axios
      .get(`/api/licenses/${userId}`)
      .then((response) => setLicenses(response.data))
      .catch((error) => console.error("Error fetching licenses:", error));
  }, [userId]);

  return (
    <div>
      <h1>License Management</h1>
      <ul>
        {licenses.map((license) => (
          <li key={license.id}>
            {license.license_type}: {license.license_count} (Plan: {license.plan})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LicenseManagement;
