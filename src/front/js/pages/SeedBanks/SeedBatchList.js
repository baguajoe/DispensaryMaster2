import React from 'react';

const SeedBatchList = () => {
    const seedBatches = [
        { id: 1, strain: 'Strain A', quantity: 50 },
        { id: 2, strain: 'Strain B', quantity: 30 },
    ];

    return (
        <div>
            <h2>Seed Batch List</h2>
            <ul>
                {seedBatches.map((batch) => (
                    <li key={batch.id}>
                        {batch.strain} - {batch.quantity} seeds
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SeedBatchList;
