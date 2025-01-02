import React from "react";

const InventoryTable = ({ inventory, selectedLocation, updateInventory }) => (
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
);

export default InventoryTable;
