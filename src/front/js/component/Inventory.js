import React from "react";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";

const socket = io("http://localhost:5000");

const Inventory = () => {
    const [inventory, setInventory] = useState([]);

    useEffect(() => {
        socket.on("inventory_updated", (data) => {
            setInventory((prev) =>
                prev.map((item) =>
                    item.product_id === data.product_id
                        ? { ...item, current_stock: data.current_stock }
                        : item
                )
            );
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div>
            {inventory.map((item) => (
                <div key={item.product_id}>
                    {item.name}: {item.current_stock}
                </div>
            ))}
        </div>
    );
};

export default Inventory;
