import React from "react";

const DealCard = ({ deal, onViewDetails, onDelete }) => {
    return (
        <div
            className="p-3 bg-white shadow rounded border mb-2 cursor-pointer hover:shadow-lg"
            onClick={() => onViewDetails(deal.id)}
        >
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">{deal.name}</h3>
                <button
                    className="text-red-500 hover:text-red-700"
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering `onViewDetails`
                        onDelete(deal.id, deal.stage);
                    }}
                >
                    ✕
                </button>
            </div>
            <p className="text-sm text-gray-500">
                Amount: <span className="font-semibold">${deal.amount.toLocaleString()}</span>
            </p>
            <p className="text-sm text-gray-500">
                Owner: <span className="font-semibold">{deal.owner}</span>
            </p>
        </div>
    );
};

export default DealCard;
