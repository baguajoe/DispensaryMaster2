import React, { useState, useEffect } from "react";
import axios from "axios";

const SeedResourceManagement = () => {
    const [resources, setResources] = useState([]);
    const [newResource, setNewResource] = useState({ name: "", quantity: 0 });

    useEffect(() => {
        axios.get("/api/resources")
            .then(response => setResources(response.data))
            .catch(error => console.error("Error fetching resources:", error));
    }, []);

    const handleAddResource = () => {
        axios.post("/api/resources", newResource)
            .then(response => {
                setResources([...resources, response.data]);
                setNewResource({ name: "", quantity: 0 });
            })
            .catch(error => console.error("Error adding resource:", error));
    };

    return (
        <div>
            <h1>Resource Management</h1>
            <div>
                <input 
                    type="text" 
                    placeholder="Resource Name" 
                    value={newResource.name} 
                    onChange={(e) => setNewResource({ ...newResource, name: e.target.value })} 
                />
                <input 
                    type="number" 
                    placeholder="Quantity" 
                    value={newResource.quantity} 
                    onChange={(e) => setNewResource({ ...newResource, quantity: parseInt(e.target.value) })} 
                />
                <button onClick={handleAddResource}>Add Resource</button>
            </div>
            <ul>
                {resources.map((resource, index) => (
                    <li key={index}>
                        <strong>{resource.name}</strong> - Quantity: {resource.quantity}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SeedResourceManagement;
