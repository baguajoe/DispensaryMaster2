import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "../../styles/inventory.css";

// Function for handling inventory import
const importInventory = async (file) => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${process.env.BACKEND_URL}/api/inventory/import`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to import inventory");
        }

        return await response.json();
    } catch (error) {
        console.error("Error importing inventory:", error);
        throw error;
    }
};

const InventoryComponent = () => {
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null);
    const [stockLevels, setStockLevels] = useState([]);
    const [cashAmount, setCashAmount] = useState("");
    const [cashReason, setCashReason] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLocation, setSelectedLocation] = useState("Main Warehouse");
    const [loading, setLoading] = useState(false);
    const socket = io(process.env.BACKEND_URL);

    // Handle file selection
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setUploadStatus(null);
    };

    // Handle file upload
    const handleUpload = async () => {
        if (!file) {
            setUploadStatus({ success: false, message: "Please select a file" });
            return;
        }

        setIsLoading(true);
        try {
            const result = await importInventory(file);
            setUploadStatus({ success: true, message: result.message || "Import completed successfully" });
            fetchStockLevels();
        } catch (error) {
            setUploadStatus({ success: false, message: error.message || "Failed to import inventory" });
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch initial inventory levels
    const fetchStockLevels = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.BACKEND_URL}/api/inventory/stock`);
            const data = await response.json();
            setStockLevels(data);
        } catch (error) {
            console.error("Error fetching stock levels:", error);
        } finally {
            setLoading(false);
        }
    };

    // Recall Batch function
    const recallBatch = async (batchNumber) => {
        try {
            const response = await fetch(`${process.env.BACKEND_URL}/api/recall/${batchNumber}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Batch ${batchNumber} recalled successfully!`);
                fetchStockLevels();
            } else {
                alert(`Failed to recall batch: ${data.error}`);
            }
        } catch (error) {
            console.error("Error recalling batch:", error);
        }
    };

    // Handle cash drop logging
    const handleCashDrop = async () => {
        try {
            const response = await fetch(`${process.env.BACKEND_URL}/api/cash-management`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ amount: cashAmount, reason: cashReason }),
            });

            if (response.ok) {
                alert("Cash drop logged successfully!");
            } else {
                const error = await response.json();
                alert(`Error logging cash drop: ${error.message}`);
            }
        } catch (error) {
            console.error("Error logging cash drop:", error);
        }
    };

    // Update inventory stock
    const updateInventory = (location, id, newStock) => {
        setStockLevels((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, current_stock: newStock } : item
            )
        );
    };

    useEffect(() => {
        fetchStockLevels();

        socket.on("inventory_update", (data) => {
            setStockLevels((prev) =>
                prev.map((item) =>
                    item.id === data.product_id
                        ? { ...item, current_stock: data.new_stock, last_updated: data.timestamp }
                        : item
                )
            );
        });

        return () => {
            socket.disconnect();
        };
    }, [socket]);

    const filteredStockLevels = stockLevels.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6">
            {/* File Upload Section */}
            <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Import Inventory</h2>
                <input type="file" onChange={handleFileChange} className="mb-2" />
                <button
                    onClick={handleUpload}
                    className={`px-4 py-2 rounded text-white ${
                        isLoading ? "bg-gray-500" : "bg-blue-500"
                    } disabled:opacity-50`}
                    disabled={isLoading}
                >
                    {isLoading ? "Uploading..." : "Upload"}
                </button>
                {uploadStatus && (
                    <div
                        className={`mt-4 p-4 rounded ${
                            uploadStatus.success
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                        }`}
                    >
                        {uploadStatus.message}
                    </div>
                )}
            </div>

            {/* Cash Management Section */}
            <div className="cash-management mb-6">
                <h2 className="text-lg font-semibold mb-2">Cash Management</h2>
                <input
                    type="number"
                    placeholder="Enter cash amount"
                    onChange={(e) => setCashAmount(e.target.value)}
                    className="border p-2 rounded mb-2"
                />
                <textarea
                    placeholder="Enter reason (optional)"
                    onChange={(e) => setCashReason(e.target.value)}
                    className="border p-2 rounded mb-2"
                ></textarea>
                <button
                    onClick={handleCashDrop}
                    className="bg-green-500 text-white px-4 py-2 rounded mt-2 hover:bg-green-600"
                >
                    Log Cash Drop
                </button>
            </div>

            {/* Search Inventory */}
            <div className="search-inventory mb-6">
                <input
                    type="text"
                    placeholder="Search inventory..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border p-2 rounded"
                />
            </div>

            {/* Inventory Display Section */}
            <div>
                <h2 className="text-lg font-semibold mb-2">Inventory for Location: {selectedLocation}</h2>
                {loading ? (
                    <p>Loading inventory...</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredStockLevels.map((item) => (
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
                                <button
                                    onClick={() => recallBatch(item.batch_number)}
                                    className="bg-red-500 text-white px-4 py-2 rounded mt-2 hover:bg-red-600"
                                >
                                    Recall Batch
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InventoryComponent;
