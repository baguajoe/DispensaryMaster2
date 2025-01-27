import React, { useState, useEffect } from "react";
import axios from "axios";
import InvoiceForm from "../component/InvoiceForm"; // Import the InvoiceForm component

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false); // Manage visibility of the InvoiceForm

  // Fetch invoices on component mount
  useEffect(() => {
    axios
      .get(`${process.env.BACKEND_URL}/api/invoices`)
      .then((response) => {
        setInvoices(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching invoices:", error);
        setLoading(false);
      });
  }, []);

  // Download invoice
  const downloadInvoice = (id) => {
    axios
      .get(`${process.env.BACKEND_URL}/api/invoices/${id}/pdf`, { responseType: "blob" })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Invoice_${id}.pdf`);
        document.body.appendChild(link);
        link.click();
      })
      .catch((error) => console.error("Error downloading invoice:", error));
  };

  // Delete invoice
  const deleteInvoice = (id) => {
    axios
      .delete(`${process.env.BACKEND_URL}/api/invoices/${id}`)
      .then(() => {
        setInvoices((prev) => prev.filter((invoice) => invoice.id !== id));
        console.log(`Invoice ${id} deleted successfully`);
      })
      .catch((error) => {
        console.error(`Error deleting invoice ${id}:`, error);
      });
  };

  // Import invoices
  const importInvoices = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log(`File selected for import: ${file.name}`);
      // Add functionality to parse and import invoices from the file
    }
  };

  // Export invoices
  const exportInvoices = () => {
    axios
      .get(`${process.env.BACKEND_URL}/api/invoices/export`, { responseType: "blob" })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "Invoices_Export.csv");
        document.body.appendChild(link);
        link.click();
      })
      .catch((error) => {
        console.error("Error exporting invoices:", error);
      });
  };

  // Toggle form visibility
  const handleCreateInvoice = () => {
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  // Loading state
  if (loading) return <p className="text-white">Loading invoices...</p>;

  return (
    <div className="main-content">
      <div className="invoice-header flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Invoices</h2>
        <div className="invoice-actions flex gap-4">
          <button onClick={handleCreateInvoice} className="create-invoice bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700">
            Create Invoice
          </button>
          <button onClick={exportInvoices} className="export-invoice bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">
            Export
          </button>
          <label className="import-invoice bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 cursor-pointer">
            Import
            <input type="file" onChange={importInvoices} className="hidden" />
          </label>
        </div>
      </div>

      {showForm && <InvoiceForm onClose={handleCloseForm} />} {/* Render InvoiceForm */}

      <div className="table-container overflow-x-auto bg-white p-4 rounded shadow">
        <table className="w-full border-collapse text-black">
          <thead>
            <tr>
              <th className="border-b py-2 px-4 text-left">Number</th>
              <th className="border-b py-2 px-4 text-left">Customer</th>
              <th className="border-b py-2 px-4 text-left">Invoice Type</th>
              <th className="border-b py-2 px-4 text-left">Invoice Date</th>
              <th className="border-b py-2 px-4 text-left">Due Date</th>
              <th className="border-b py-2 px-4 text-left">Sent Status</th>
              <th className="border-b py-2 px-4 text-left">Payment Status</th>
              <th className="border-b py-2 px-4 text-left">Total</th>
              <th className="border-b py-2 px-4 text-left">Amount Due</th>
              <th className="border-b py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="py-2 px-4">{invoice.id}</td>
                <td className="py-2 px-4">{invoice.customer_name}</td>
                <td className="py-2 px-4">{invoice.invoice_type}</td>
                <td className="py-2 px-4">{invoice.invoice_date}</td>
                <td className="py-2 px-4">{invoice.due_date}</td>
                <td className="py-2 px-4">{invoice.sent_status ? "Sent" : "Not Sent"}</td>
                <td className="py-2 px-4">{invoice.payment_status}</td>
                <td className="py-2 px-4">${invoice.total.toFixed(2)}</td>
                <td className="py-2 px-4">${invoice.amount_due.toFixed(2)}</td>
                <td className="py-2 px-4 flex gap-2">
                  <button onClick={() => downloadInvoice(invoice.id)} className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-700">
                    Download
                  </button>
                  <button onClick={() => deleteInvoice(invoice.id)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Invoices;
