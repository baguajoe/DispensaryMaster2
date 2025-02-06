import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import BatchTable from "../../component/GrowFarmComponent/BatchTable";
import "../../../styles/GrowFarm/BatchPage.css";

const BatchPage = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [sortCriteria, setSortCriteria] = useState("startDate");

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await axios.get("/api/plant_batches");
      setBatches(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching batches:", error);
      setLoading(false);
    }
  };

  const filteredBatches = batches.filter(
    (batch) =>
      batch.strain.toLowerCase().includes(filter.toLowerCase()) ||
      batch.status.toLowerCase().includes(filter.toLowerCase())
  );

  const sortedBatches = filteredBatches.sort((a, b) => {
    if (sortCriteria === "quantity") {
      return b.quantity - a.quantity;
    }
    if (sortCriteria === "startDate") {
      return new Date(b.startDate) - new Date(a.startDate);
    }
    return 0;
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="batch-page-container">
      <h1>Plant Batches</h1>
      <div className="batch-controls">
        <input
          type="text"
          placeholder="Search by strain or status"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <select
          value={sortCriteria}
          onChange={(e) => setSortCriteria(e.target.value)}
        >
          <option value="startDate">Sort by Start Date</option>
          <option value="quantity">Sort by Quantity</option>
        </select>
        <Link to="/add-plant-batch">
          <button>Add New Batch</button>
        </Link>
      </div>

      <BatchTable batches={sortedBatches} />
    </div>
  );
};

export default BatchPage;
