import React, { useState } from "react";

const InvoiceForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    customer: "",
    invoiceNumber: "",
    invoiceDate: "",
    dueDate: "",
    items: [{ name: "", quantity: 1, price: 0 }],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: "", quantity: 1, price: 0 }],
    });
  };

  const removeItemRow = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    onClose(); // Close form after submission
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">New Invoice</h2>
        <button onClick={onClose} className="text-red-500 text-xl">&times;</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2">Customer</label>
          <input
            type="text"
            name="customer"
            value={formData.customer}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2">Invoice Number</label>
            <input
              type="text"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Invoice Date</label>
            <input
              type="date"
              name="invoiceDate"
              value={formData.invoiceDate}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <h3 className="font-bold mb-2">Items</h3>
        {formData.items.map((item, index) => (
          <div className="grid grid-cols-3 gap-4 mb-2" key={index}>
            <input
              type="text"
              placeholder="Item Name"
              value={item.name}
              onChange={(e) => {
                const items = [...formData.items];
                items[index].name = e.target.value;
                setFormData({ ...formData, items });
              }}
              className="p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={item.quantity}
              onChange={(e) => {
                const items = [...formData.items];
                items[index].quantity = e.target.value;
                setFormData({ ...formData, items });
              }}
              className="p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Price"
              value={item.price}
              onChange={(e) => {
                const items = [...formData.items];
                items[index].price = e.target.value;
                setFormData({ ...formData, items });
              }}
              className="p-2 border rounded"
            />
            <button
              type="button"
              onClick={() => removeItemRow(index)}
              className="text-red-500"
            >
              &times;
            </button>
          </div>
        ))}
        <button type="button" onClick={addItemRow} className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Item
        </button>

        <div className="mt-4">
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
            Save Invoice
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;
