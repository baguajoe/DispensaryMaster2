import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get("/api/invoices");
        setInvoices(response.data);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      }
    };
    fetchInvoices();
  }, []);

  const handleView = (id) => navigate(`/invoices/${id}`);

  return (
    <div>
      <h1>Invoices</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer ID</th>
            <th>Total Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td>{invoice.id}</td>
              <td>{invoice.customer_id}</td>
              <td>${invoice.total_amount.toFixed(2)}</td>
              <td>{invoice.status}</td>
              <td>
                <button onClick={() => handleView(invoice.id)}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Invoices;
