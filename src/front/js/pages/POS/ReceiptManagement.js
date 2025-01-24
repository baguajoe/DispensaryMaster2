import React, { useState } from "react";

const ReceiptManagement = () => {
  const [receiptTemplate, setReceiptTemplate] = useState({
    header: "Store Name\nAddress\nPhone Number",
    footer: "Thank you for shopping with us!",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReceiptTemplate((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveTemplate = async () => {
    try {
      const response = await fetch(`${process.env.BACKEND_URL}/api/pos/receipt-template`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(receiptTemplate),
      });

      if (response.ok) {
        alert("Receipt template saved successfully!");
      } else {
        throw new Error("Failed to save receipt template.");
      }
    } catch (error) {
      console.error("Error saving receipt template:", error);
    }
  };

  return (
    <div>
      <h2>Receipt Management</h2>
      <div>
        <label>Header</label>
        <textarea
          name="header"
          value={receiptTemplate.header}
          onChange={handleInputChange}
        ></textarea>
      </div>
      <div>
        <label>Footer</label>
        <textarea
          name="footer"
          value={receiptTemplate.footer}
          onChange={handleInputChange}
        ></textarea>
      </div>
      <button onClick={handleSaveTemplate}>Save Template</button>
    </div>
  );
};

export default ReceiptManagement;
