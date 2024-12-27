import React from 'react';
import SeedBatchList from './SeedBatchList';
import SeedReports from './SeedReports';

const SeedBankDashboard = () => {
    return (
        <div>
            <h2>Seed Bank Dashboard</h2>
            <SeedBatchList />
            <SeedReports />
        </div>
    );
};

export default SeedBankDashboard;
