import React from 'react';
import InventoryComponent from '../component/InventoryComponent';
import "../../styles/inventory.css";

const Inventory = () => {
    return (
        <div className="p-4 main-content">
            <h1 className="text-2xl font-bold mb-4">Inventory Management</h1>
            <InventoryComponent />
        </div>
    );
};

export default Inventory;
