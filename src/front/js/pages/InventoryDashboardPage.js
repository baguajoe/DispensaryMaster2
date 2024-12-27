import React, { useState, useEffect } from "react";
import TableCard from "../component/TableCard";

const InventoryDashboardPage = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/inventory`);
        setInventoryData(await response.json());
      } catch (error) {
        console.error("Error fetching inventory data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  return (
    <div className="p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Inventory Dashboard</h1>
      {loading ? (
        <p>Loading inventory...</p>
      ) : (
        <TableCard
          data={inventoryData}
          columns={["Product", "Stock", "Reorder Level", "Status"]}
          keyMapping={{
            Product: "product",
            Stock: "stock",
            "Reorder Level": "reorder_level",
            Status: "status",
          }}
        />
      )}
    </div>
  );
};

export default InventoryDashboardPage;
