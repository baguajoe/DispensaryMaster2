import React from 'react';
import { useParams } from 'react-router-dom';

const SeedBatchDetails = () => {
    const { id } = useParams();

    return (
        <div>
            <h2>Seed Batch Details</h2>
            <p>Displaying details for batch ID: {id}</p>
            {/* Fetch and display detailed data for the selected batch */}
        </div>
    );
};

export default SeedBatchDetails;
