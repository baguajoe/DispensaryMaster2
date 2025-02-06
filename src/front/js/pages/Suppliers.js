import React, { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { getDocument } from "pdfjs-dist";
import "../../styles/suppliers.css";


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
    <div className="suppliers-page">
      <header className="suppliers-header flex-column align-items-start">
        <h1>Suppliers Information</h1>
        <div className="button-group d-flex gap-2 mt-3 w-100 justify-content-end">
          {/* Import Dropdown */}
          <div className="dropdown">
            <button className="btn btn-outline-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              Import Products
            </button>
            <ul className="dropdown-menu dropdown-menu-end mt-0">
              <li>
                <button className="dropdown-item" onClick={() => document.getElementById('csvUpload').click()}>
                  <i className="fa-solid fa-file-csv me-2"></i>Import CSV
                </button>
              </li>
            </ul>
          </div>

          {/* Export Dropdown */}
          <div className="dropdown">
            <button className="btn btn-outline-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              Export Products
            </button>
            <ul className="dropdown-menu dropdown-menu-end mt-0">
              <li>
                <button className="dropdown-item" onClick={handleExportPDF}>
                  <i className="fa-regular fa-file-pdf me-2"></i>Export PDF
                </button>
              </li>
              <li>
                <button className="dropdown-item" onClick={handleExportCSV}>
                  <i className="fa-solid fa-file-csv me-2"></i>Export CSV
                </button>
              </li>
            </ul>
          </div>
        </div>
      </header>

      <div className="suppliers-table-container">
        <div className="d-flex justify-content-end mb-3">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              setFormData({
                name: "",
                company: "",
                registrationDate: "",
                email: "",
                phone: "",
                address: ""
              });
              setEditingSupplier(null);
              setShowModal(true);
            }}
          >
            <i className="fa-solid fa-circle-plus"></i> Add Supplier
          </button>
        </div>

        <table className="suppliers-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Registration Date</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier.id}>
                <td>{supplier.name}</td>
                <td>{supplier.company}</td>
                <td>{supplier.registrationDate}</td>
                <td>{supplier.email}</td>
                <td>{supplier.phone}</td>
                <td>{supplier.address}</td>
                <td>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleEditSupplier(supplier)}
                    >
                      <i className="fa-regular fa-pen-to-square"></i>
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteSupplier(supplier.id)}
                    >
                      <i className="fa-regular fa-trash-can"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingSupplier ? "Edit Supplier" : "Add Supplier"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleFormSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Company</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Registration Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.registrationDate}
                        onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Phone</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Address</label>
                      <textarea
                        className="form-control"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                      ></textarea>
                    </div>
                    <div className="modal-footer px-0 pb-0">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowModal(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        {editingSupplier ? "Save Changes" : "Add Supplier"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {/* Hidden file inputs */}
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
  );
};

export default Suppliers;
