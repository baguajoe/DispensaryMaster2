import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const CustomerDetail = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await axios.get(`/api/customers/${id}`);
        setCustomer(response.data);
      } catch (error) {
        console.error("Error fetching customer details:", error);
      }
    };
    fetchCustomer();
  }, [id]);

  if (!customer) return <p>Loading customer details...</p>;

  return (
    <div>
      <h1>Customer Detail</h1>
      <p><strong>Name:</strong> {`${customer.first_name} ${customer.last_name}`}</p>
      <p><strong>Email:</strong> {customer.email}</p>
      <p><strong>Phone:</strong> {customer.phone}</p>
      <p><strong>Membership Level:</strong> {customer.membership_level}</p>
      <p><strong>Verification Status:</strong> {customer.verification_status}</p>
    </div>
  );
};

export default CustomerDetail;
