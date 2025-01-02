import React from "react";

const InventoryComponentPage = ({ inventory, loading, selectedLocation, updateInventory }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Inventory for Location: {selectedLocation}</h2>
      {loading ? (
        <p>Loading inventory...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventory.map((item) => (
            <div key={item.id} className="border p-4 rounded shadow">
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <p>Current Stock: {item.current_stock}</p>
              <p>Batch Number: {item.batch_number}</p>
              <input
                type="number"
                value={item.current_stock}
                onChange={(e) =>
                  updateInventory(selectedLocation, item.id, parseInt(e.target.value, 10))
                }
                className="border p-2 rounded w-full mb-2"
              />
              <button
                onClick={() =>
                  updateInventory(selectedLocation, item.id, item.current_stock + 1)
                }
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add Stock
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InventoryComponentPage;
