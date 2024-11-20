import React, { useEffect, useState } from 'react';
import { fetchCustomers } from './customers';

const Customers = () => {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const loadCustomers = async () => {
      const data = await fetchCustomers();
      setCustomers(data);
    };
    loadCustomers();
  }, []);

  return (
    <div>
      <h1>Customers</h1>
      <ul>
        {customers.map((customer) => (
          <li key={customer.id}>
            {customer.first_name} {customer.last_name} - {customer.email}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Customers;
