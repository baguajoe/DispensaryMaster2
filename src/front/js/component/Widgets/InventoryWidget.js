import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_BACKEND_URL);

const InventoryWidget = ({ staticData = [] }) => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch initial inventory data
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/inventory`)
            .then((response) => response.json())
            .then((data) => {
                setInventory(data.length ? data : staticData); // Fallback to static data if API returns empty
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching inventory data:", error);
                setInventory(staticData); // Use static data in case of an error
                setLoading(false);
            });

        // Listen for real-time updates
        socket.on("inventory_updated", (data) => {
            setInventory((prevInventory) =>
                prevInventory.map((item) =>
                    item.product_id === data.product_id
                        ? { ...item, current_stock: data.current_stock }
                        : item
                )
            );
        });

        return () => {
            socket.disconnect();
        };
    }, [staticData]);

    return (
        <div className="inventory-widget">
            <h2 className="text-lg font-semibold mb-2">Inventory Status</h2>
            {loading ? (
                <p>Loading inventory...</p>
            ) : (
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th className="border-b py-2">Item</th>
                            <th className="border-b py-2">Quantity</th>
                            <th className="border-b py-2">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventory.map((item, index) => (
                            <tr key={index}>
                                <td className="py-1">{item.name || item.item}</td>
                                <td className="py-1">{item.current_stock || item.quantity}</td>
                                <td
                                    className={`py-1 ${
                                        (item.status || (item.current_stock === 0 ? "Out of Stock" : "In Stock")) ===
                                        "Out of Stock"
                                            ? "text-red-600"
                                            : ""
                                    }`}
                                >
                                    {item.status || (item.current_stock === 0 ? "Out of Stock" : item.current_stock <= 50 ? "Low Stock" : "In Stock")}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default InventoryWidget;
