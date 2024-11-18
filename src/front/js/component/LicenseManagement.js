import React from "react";
import LicenseManagement from "../components/LicenseManagement";

const LicenseManagementPage = () => {
  return (
    <div>
      <h1>License Management</h1>
      <LicenseManagement userId="12345" />
    </div>
  );
};

export default LicenseManagementPage;
