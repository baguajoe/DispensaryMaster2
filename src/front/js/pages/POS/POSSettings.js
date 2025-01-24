import React, { useState } from "react";

const POSSettings = () => {
  const [settings, setSettings] = useState({
    taxRate: 0,
    discountRate: 0,
    hardwareIntegration: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveSettings = async () => {
    try {
      const response = await fetch(`${process.env.BACKEND_URL}/api/pos/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert("POS settings saved successfully!");
      } else {
        throw new Error("Failed to save settings.");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  return (
    <div>
      <h2>POS Settings</h2>
      <div>
        <label>Tax Rate (%)</label>
        <input
          type="number"
          name="taxRate"
          value={settings.taxRate}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>Discount Rate (%)</label>
        <input
          type="number"
          name="discountRate"
          value={settings.discountRate}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>Enable Hardware Integration</label>
        <input
          type="checkbox"
          name="hardwareIntegration"
          checked={settings.hardwareIntegration}
          onChange={handleInputChange}
        />
      </div>
      <button onClick={handleSaveSettings}>Save Settings</button>
    </div>
  );
};

export default POSSettings;
