import React, { useState } from "react";
import axios from "axios";

const ImportInventory = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("/api/inventory/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Inventory imported successfully!");
    } catch (error) {
      console.error("Error importing inventory:", error);
      alert("Error importing inventory.");
    }
  };

  return (
    <div>
      <h1>Import Inventory</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} accept=".xlsx, .xls, .pdf" required />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default ImportInventory;
