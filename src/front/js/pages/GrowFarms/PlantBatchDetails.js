// pages/PlantBatchDetails.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BatchStatusBadge from '../../component/GrowFarmComponent/BatchStatusBadge';
import BatchTimeline from '../../component/GrowFarmComponent/BatchTimeline';

const PlantBatchDetails = () => {
  const { id } = useParams();
  const [batch, setBatch] = useState(null);
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    // Fetch batch details
    fetch(`/api/plant_batches/${id}`)
      .then((res) => res.json())
      .then((data) => setBatch(data))
      .catch((err) => console.error(err));

    // Fetch batch timeline
    fetch(`/api/batch_timeline/${id}`)
      .then((res) => res.json())
      .then((data) => setTimeline(data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!batch) {
    return <div>Loading...</div>;
  }

  return (
    <div className="plant-batch-details">
      <h2>Plant Batch Details</h2>
      <p>
        <strong>Strain:</strong> {batch.strain}
      </p>
      <p>
        <strong>Status:</strong> <BatchStatusBadge status={batch.status} />
      </p>
      <p>
        <strong>Start Date:</strong> {batch.start_date}
      </p>
      <p>
        <strong>End Date:</strong> {batch.end_date || 'N/A'}
      </p>
      <BatchTimeline events={timeline} />
    </div>
  );
};

export default PlantBatchDetails;
