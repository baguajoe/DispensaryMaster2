
import React, { useEffect, useState } from 'react';

import BatchTable from '../../component/GrowFarmComponent/BatchTable';

const GrowFarmDashboard = () => {
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    // Fetch recent batches
    fetch('/api/recent_batches')
      .then((res) => res.json())
      .then((data) => setBatches(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="grow-farm-dashboard">
      <h2>Grow Farm Dashboard</h2>
      <BatchTable batches={batches} />
    </div>
  );
};

export default GrowFarmDashboard;
