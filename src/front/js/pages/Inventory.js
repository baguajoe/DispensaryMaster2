import React from 'react';
import InventoryComponent from '../component/InventoryComponent';

const Inventory = () => {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Inventory Management</h1>
            <InventoryComponent />
        </div>
    );
};

export default Inventory;
