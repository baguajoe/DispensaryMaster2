import React, { useState } from "react";
import "../../styles/suppliers.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { getDocument } from "pdfjs-dist";


const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    registrationDate: "",
    email: "",
    phone: "",
    address: "",
  });
  const [editingSupplier, setEditingSupplier] = useState(null);

  // Handle opening/closing the modal
  const handleAddSupplier = (e) => {
    e.preventDefault();
    // Add the new supplier to your state or send it to the backend
    setSuppliers((prevSuppliers) => [
      ...prevSuppliers,
      { ...formData, id: Date.now() },
    ]);
    setShowModal(false);
    setFormData({
      name: "",
      company: "",
      registrationDate: "",
      email: "",
      phone: "",
      address: "",
    });
  };

  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier); // Set the supplier to edit
    setFormData({ ...supplier });
    setShowModal(true);
  };

  const handleDeleteSupplier = (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      setSuppliers((prevSuppliers) => prevSuppliers.filter((s) => s.id !== id));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (editingSupplier) {
      // Update the existing supplier
      setSuppliers((prevSuppliers) =>
        prevSuppliers.map((supplier) =>
          supplier.id === editingSupplier.id ? { ...formData, id: supplier.id } : supplier
        )
      );
    } else {
      // Add a new supplier
      setSuppliers((prevSuppliers) => [
        ...prevSuppliers,
        { ...formData, id: Date.now() }, // Assign a unique ID
      ]);
    }

    // Reset modal state
    setShowModal(false);
    setEditingSupplier(null);
    setFormData({
      name: "",
      company: "",
      registrationDate: "",
      email: "",
      phone: "",
      address: "",
    });
  };



  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Suppliers List", 14, 10);
    const tableColumn = ["Name", "Company", "Registration Date", "Email", "Phone", "Address"];
    const tableRows = suppliers.map((supplier) => [
      supplier.name,
      supplier.company,
      supplier.registrationDate,
      supplier.email,
      supplier.phone,
      supplier.address,
    ]);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    doc.save("SuppliersList.pdf");
  };



  // Export to CSV
  const handleExportCSV = () => {
    const headers = ["Name,Company,Registration Date,Email,Phone,Address"];
    const rows = suppliers.map(
      (supplier) =>
        `"${supplier.name}","${supplier.company}","${supplier.registrationDate}","${supplier.email}","${supplier.phone}","${supplier.address}"`
    );
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "SuppliersList.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePDFUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const pdfData = new Uint8Array(event.target.result);
      const pdf = await getDocument({ data: pdfData }).promise;

      let textContent = "";
      for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const text = await page.getTextContent();
        text.items.forEach((item) => (textContent += item.str + " "));
      }

      console.log("Extracted PDF Content:", textContent);
      // Further process `textContent` if needed
    };

    reader.readAsArrayBuffer(file);
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvContent = event.target.result;
      const rows = csvContent.split("\n").map((row) => row.split(","));
      const headers = rows[0]; // Assuming the first row is headers
      const newSuppliers = rows.slice(1).map((row) => {
        const supplier = {};
        headers.forEach((header, index) => {
          supplier[header.trim()] = row[index]?.trim();
        });
        return supplier;
      });

      // Add new suppliers to the state
      setSuppliers((prevSuppliers) => [...prevSuppliers, ...newSuppliers]);
      console.log("CSV uploaded successfully:", newSuppliers);
    };

    reader.readAsText(file);
  };


  return (
    <div className="p-6 main-content suppliers">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Suppliers Information</h1>
        <div className="flex gap-2">
          <div className="flex gap-2">
            {/* Add Supplier */}
            <button
              className="bg-black text-white px-4 py-2 rounded"
              onClick={() => {
                setFormData({
                  name: "",
                  company: "",
                  registrationDate: "",
                  email: "",
                  phone: "",
                  address: ""
                });
                setEditingSupplier(null); // Changed from `false` to `null`
                setShowModal(true);
              }}
            >
              Add Supplier
            </button>


            {/* Import PDF */}
            <button
              className="bg-black text-white px-4 py-2 rounded"
              onClick={() => document.getElementById("pdfUpload").click()}
            >
              Import PDF
            </button>

            {/* Import CSV */}
            <button
              className="bg-black text-white px-4 py-2 rounded"
              onClick={() => document.getElementById("csvUpload").click()}
            >
              Import CSV
            </button>

            {/* Export PDF */}
            <button
              className="bg-black text-white px-4 py-2 rounded"
              onClick={handleExportPDF}
            >
              Export PDF
            </button>

            {/* Export CSV */}
            <button
              className="bg-black text-white px-4 py-2 rounded"
              onClick={handleExportCSV}
            >
              Export CSV
            </button>
          </div>

          {/* Hidden Inputs for File Upload */}
          <input
            type="file"
            id="pdfUpload"
            accept=".pdf"
            style={{ display: "none" }}
            onChange={handlePDFUpload}
          />
          <input
            type="file"
            id="csvUpload"
            accept=".csv"
            style={{ display: "none" }}
            onChange={handleCSVUpload}
          />

        </div>
      </div>
      <table className="table-auto w-full rounded shadow-md">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Company</th>
            <th className="px-4 py-2 text-left">Registration Date</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Phone</th>
            <th className="px-4 py-2 text-left">Address</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => (
            <tr key={supplier.id}>
              <td className="px-4 py-2">{supplier.name}</td>
              <td className="px-4 py-2">{supplier.company}</td>
              <td className="px-4 py-2">{supplier.registrationDate}</td>
              <td className="px-4 py-2">{supplier.email}</td>
              <td className="px-4 py-2">{supplier.phone}</td>
              <td className="px-4 py-2">{supplier.address}</td>
              <td className="px-4 py-2">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                  onClick={() => handleEditSupplier(supplier)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => handleDeleteSupplier(supplier.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2 className="text-xl font-bold mb-4">
              {editingSupplier ? "Edit Supplier" : "Add Supplier"}
            </h2>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-3">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label>Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label>Registration Date</label>
                <input
                  type="date"
                  value={formData.registrationDate}
                  onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label>Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label>Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                ></textarea>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-black text-white px-4 py-2 rounded">
                  Save
                </button>
                <button
                  type="button"
                  className="bg-gray-300 px-4 py-2 rounded"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
