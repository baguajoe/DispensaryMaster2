
import React, { useEffect, useState } from 'react';
import BatchTable from '../../component/GrowFarmComponent/BatchTable';

const PlantBatchList = () => {
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    // Fetch all batches
    fetch('/api/plant_batches')
      .then((res) => res.json())
      .then((data) => setBatches(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="plant-batch-list">
      <h2>Plant Batch List</h2>
      <BatchTable batches={batches} />
    </div>
  );
};

export default PlantBatchList;
