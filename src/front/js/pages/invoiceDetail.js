import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const InvoiceDetail = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await axios.get(`/api/invoices/${id}`);
        setInvoice(response.data);
      } catch (error) {
        console.error("Error fetching invoice details:", error);
      }
    };
    fetchInvoice();
  }, [id]);

  if (!invoice) return <p>Loading invoice details...</p>;

  return (
    <div>
      <h1>Invoice Details</h1>
      <p><strong>ID:</strong> {invoice.id}</p>
      <p><strong>Customer ID:</strong> {invoice.customer_id}</p>
      <p><strong>Total Amount:</strong> ${invoice.total_amount.toFixed(2)}</p>
      <p><strong>Status:</strong> {invoice.status}</p>
      <p><strong>Issue Date:</strong> {new Date(invoice.issue_date).toLocaleDateString()}</p>
      <p><strong>Due Date:</strong> {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "N/A"}</p>
    </div>
  );
};

export default InvoiceDetail;
