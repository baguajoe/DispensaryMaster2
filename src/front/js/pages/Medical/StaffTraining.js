import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StaffTraining = () => {
    const [resources, setResources] = useState([]);

    useEffect(() => {
        axios.get('/api/training-resources')
            .then(response => setResources(response.data))
            .catch(error => console.error(error));
    }, []);

    return (
        <div>
            <h1>Staff Training</h1>
            <ul>
                {resources.map(resource => (
                    <li key={resource.id}>
                        <a href={resource.link} target="_blank" rel="noopener noreferrer">{resource.title}</a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default StaffTraining;
