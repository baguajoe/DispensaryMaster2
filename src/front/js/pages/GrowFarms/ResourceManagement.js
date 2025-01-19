import React, { useState, useEffect } from "react";
import axios from "axios";

const ResourceManagement = () => {
    const [resources, setResources] = useState([]);

    useEffect(() => {
        axios.get("/api/resources")
            .then(response => setResources(response.data))
            .catch(error => console.error(error));
    }, []);

    const handleAddResource = () => {
        const name = prompt("Enter resource name:");
        const quantity = parseInt(prompt("Enter quantity:"), 10);

        axios.post("/api/resources", { name, quantity })
            .then(() => {
                alert("Resource added successfully!");
                setResources([...resources, { name, quantity }]);
            })
            .catch(error => console.error(error));
    };

    return (
        <div>
            <h1>Resource Management</h1>
            <button onClick={handleAddResource}>Add Resource</button>
            <ul>
                {resources.map((resource, index) => (
                    <li key={index}>
                        {resource.name} - {resource.quantity}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ResourceManagement;
