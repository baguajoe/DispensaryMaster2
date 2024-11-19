import React, { useState } from "react";

const InventoryRecognition = () => {
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const response = await fetch("/api/inventory/recognize", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setDetections(data.detections);
    } catch (error) {
      console.error("Error recognizing inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Inventory Recognition</h2>
      <input type="file" onChange={handleUpload} />
      {loading ? <p>Loading...</p> : <ul>{detections.map((item, i) => <li key={i}>{item.name}</li>)}</ul>}
    </div>
  );
};

export default InventoryRecognition;
