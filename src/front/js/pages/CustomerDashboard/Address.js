import React, { useState } from "react";

const Address = () => {
  const [address, setAddress] = useState([
    { id: 1, nickname: "Home", address: "123 Main St, Boston, MA", isDefault: true },
    { id: 2, nickname: "Work", address: "456 Office Dr, Cambridge, MA", isDefault: false },
  ]);

  const setDefault = (id) => {
    setAddress(
      addresses.map((addr) =>
        addr.id === id ? { ...addr, isDefault: true } : { ...addr, isDefault: false }
      )
    );
  };

  const addAddress = () => {
    alert("Add new address with geolocation integration.");
  };

  return (
    <div>
      <h1>Manage Addresses</h1>
      <ul>
        {addresses.map((addr) => (
          <li key={addr.id}>
            <strong>{addr.nickname}</strong>: {addr.address}
            {addr.isDefault && <span> (Default)</span>}
            {!addr.isDefault && <button onClick={() => setDefault(addr.id)}>Set Default</button>}
          </li>
        ))}
      </ul>
      <button onClick={addAddress}>Add New Address</button>
    </div>
  );
};

export default Address;
