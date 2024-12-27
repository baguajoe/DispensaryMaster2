import React, { useState, useEffect } from "react";
import DealCard from "../component/DealCard";

const DealsPage = () => {
    const [deals, setDeals] = useState({});
    const [newDeal, setNewDeal] = useState({ name: "", amount: "", owner: "" });
    const [selectedDeal, setSelectedDeal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch deals from the API
    useEffect(() => {
        fetch("/api/deals", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${sessionStorage.getItem("token")}`,
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch deals.");
                return res.json();
            })
            .then((data) => {
                setDeals(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    // Create a new deal
    const handleCreateDeal = (e) => {
        e.preventDefault();
        fetch("/api/deals", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${sessionStorage.getItem("token")}`,
            },
            body: JSON.stringify(newDeal),
        })
            .then((res) => res.json())
            .then((data) => {
                const stage = data.stage || "prospecting";
                setDeals((prev) => ({
                    ...prev,
                    [stage]: [...(prev[stage] || []), data],
                }));
                setNewDeal({ name: "", amount: "", owner: "" });
            })
            .catch((err) => console.error("Error creating deal:", err));
    };

    // Delete a deal
    const handleDeleteDeal = (dealId, stage) => {
        fetch(`/api/deals/${dealId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${sessionStorage.getItem("token")}`,
            },
        })
            .then(() => {
                setDeals((prev) => ({
                    ...prev,
                    [stage]: prev[stage].filter((deal) => deal.id !== dealId),
                }));
            })
            .catch((err) => console.error("Error deleting deal:", err));
    };

    // View deal details
    const handleViewDetails = (dealId) => {
        const deal = Object.values(deals)
            .flat()
            .find((d) => d.id === dealId);
        setSelectedDeal(deal);
    };

    // Update deal details
    const handleUpdateDeal = (e) => {
        e.preventDefault();
        fetch(`/api/deals/${selectedDeal.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${sessionStorage.getItem("token")}`,
            },
            body: JSON.stringify(selectedDeal),
        })
            .then((res) => res.json())
            .then((updatedDeal) => {
                setDeals((prev) => {
                    const updatedDeals = { ...prev };
                    const stage = updatedDeal.stage;
                    updatedDeals[stage] = updatedDeals[stage].map((d) =>
                        d.id === updatedDeal.id ? updatedDeal : d
                    );
                    return updatedDeals;
                });
                setSelectedDeal(null);
            })
            .catch((err) => console.error("Error updating deal:", err));
    };

    if (loading) return <p>Loading deals...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="p-6 bg-gray-100">
            <h1 className="text-2xl font-bold mb-4">Deals</h1>

            {/* Create Deal Form */}
            <form onSubmit={handleCreateDeal} className="mb-6 p-4 bg-white shadow rounded">
                <h2 className="text-lg font-semibold mb-4">Create a New Deal</h2>
                <div className="mb-3">
                    <label className="block text-sm font-medium">Deal Name</label>
                    <input
                        type="text"
                        value={newDeal.name}
                        onChange={(e) => setNewDeal({ ...newDeal, name: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="block text-sm font-medium">Amount</label>
                    <input
                        type="number"
                        value={newDeal.amount}
                        onChange={(e) => setNewDeal({ ...newDeal, amount: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="block text-sm font-medium">Owner</label>
                    <input
                        type="text"
                        value={newDeal.owner}
                        onChange={(e) => setNewDeal({ ...newDeal, owner: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
                    Create Deal
                </button>
            </form>

            {/* Deals by Stage */}
            <div className="grid grid-cols-4 gap-4">
                {Object.keys(deals).map((stage) => (
                    <div key={stage} className="p-4 bg-white shadow rounded">
                        <h2 className="text-lg font-semibold mb-3">{stage}</h2>
                        {deals[stage].map((deal) => (
                            <DealCard
                                key={deal.id}
                                deal={deal}
                                onViewDetails={handleViewDetails}
                                onDelete={handleDeleteDeal}
                            />
                        ))}
                    </div>
                ))}
            </div>

            {/* Deal Details Modal */}
            {selectedDeal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded shadow-lg">
                        <h2 className="text-lg font-bold mb-4">Edit Deal</h2>
                        <form onSubmit={handleUpdateDeal}>
                            <div className="mb-3">
                                <label className="block text-sm font-medium">Deal Name</label>
                                <input
                                    type="text"
                                    value={selectedDeal.name}
                                    onChange={(e) =>
                                        setSelectedDeal({ ...selectedDeal, name: e.target.value })
                                    }
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="block text-sm font-medium">Amount</label>
                                <input
                                    type="number"
                                    value={selectedDeal.amount}
                                    onChange={(e) =>
                                        setSelectedDeal({ ...selectedDeal, amount: e.target.value })
                                    }
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="block text-sm font-medium">Owner</label>
                                <input
                                    type="text"
                                    value={selectedDeal.owner}
                                    onChange={(e) =>
                                        setSelectedDeal({ ...selectedDeal, owner: e.target.value })
                                    }
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedDeal(null)}
                                    className="px-4 py-2 bg-gray-300 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DealsPage;
