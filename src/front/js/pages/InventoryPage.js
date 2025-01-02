import React, { useState, useEffect } from "react";

// Location Selector Component
const LocationSelector = ({ locations, onSelect }) => (
  <select onChange={(e) => onSelect(e.target.value)}>
    <option value="">Select a location</option>
    {locations.map((loc) => (
      <option key={loc.id} value={loc.id}>
        {loc.name}
      </option>
    ))}
  </select>
);

// Inventory Page Component
const InventoryPage = () => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [inventory, setInventory] = useState([]);

  // Fetch all locations on mount
  useEffect(() => {
    const fetchLocations = async () => {
      const response = await fetch("/locations");
      const data = await response.json();
      setLocations(data);
    };
    fetchLocations();
  }, []);

  // Fetch inventory for the selected location
  const fetchInventory = async (locationId) => {
    const response = await fetch(`/inventory/${locationId}`);
    const data = await response.json();
    setInventory(data);
  };

  // Update inventory for a specific product
  const updateInventory = async (locationId, productId, stock) => {
    await fetch(`/inventory/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location_id: locationId, product_id: productId, current_stock: stock }),
    });
    // Refresh inventory after updating
    fetchInventory(locationId);
  };

  return (
    <div>
      <h1>Inventory Management</h1>

      {/* Location Selector */}
      <LocationSelector
        locations={locations}
        onSelect={(locationId) => {
          setSelectedLocation(locationId);
          fetchInventory(locationId);
        }}
      />

      {/* Inventory List */}
      {selectedLocation && (
        <div>
          <h2>Inventory for Location ID: {selectedLocation}</h2>
          <table>
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.product_id}>
                  <td>{item.product_id}</td>
                  <td>{item.product_name}</td>
                  <td>
                    <input
                      type="number"
                      value={item.current_stock}
                      onChange={(e) =>
                        updateInventory(selectedLocation, item.product_id, parseInt(e.target.value, 10))
                      }
                    />
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        updateInventory(selectedLocation, item.product_id, item.current_stock + 1)
                      }
                    >
                      Add Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
