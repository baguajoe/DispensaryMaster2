import React, { useState } from "react";

const PaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, cardNumber: "**** **** **** 1234", expiry: "12/25", isDefault: true },
    { id: 2, cardNumber: "**** **** **** 5678", expiry: "06/24", isDefault: false },
  ]);

  const setDefault = (id) => {
    const updatedMethods = paymentMethods.map((method) =>
      method.id === id ? { ...method, isDefault: true } : { ...method, isDefault: false }
    );
    setPaymentMethods(updatedMethods);
  };

  const addNewMethod = () => {
    alert("Add new payment method logic here!");
  };

  return (
    <div>
      <h1>Payment Methods</h1>
      <ul>
        {paymentMethods.map((method) => (
          <li key={method.id}>
            {method.cardNumber} - Expiry: {method.expiry}
            {method.isDefault && <strong> (Default)</strong>}
            {!method.isDefault && (
              <button onClick={() => setDefault(method.id)}>Set as Default</button>
            )}
          </li>
        ))}
      </ul>
      <button onClick={addNewMethod}>Add New Payment Method</button>
    </div>
  );
};

export default PaymentMethods;
