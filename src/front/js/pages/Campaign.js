import React, { useState, useEffect } from "react";
import { CampaignList, CampaignForm, CampaignMetrics } from "../component/CampaignComponent";

const CampaignPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    budget: "",
  });
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await fetch(process.env.BACKEND_URL + "/api/campaigns", {
        headers: { Authorization: "Bearer " + sessionStorage.getItem("token") },
      });
      if (response.ok) {
        setCampaigns(await response.json());
      } else {
        throw new Error("Failed to fetch campaigns.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdateCampaign = async () => {
    try {
      const url = selectedCampaign
        ? `${process.env.BACKEND_URL}/api/campaigns/${selectedCampaign.id}`
        : process.env.BACKEND_URL + "/api/campaigns";
      const method = selectedCampaign ? "PUT" : "POST";
      const campaign = selectedCampaign || newCampaign;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
        body: JSON.stringify(campaign),
      });

      if (response.ok) {
        fetchCampaigns();
        setSelectedCampaign(null);
        setNewCampaign({ name: "", description: "", start_date: "", end_date: "", budget: "" });
      } else {
        throw new Error("Failed to add/update campaign.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteCampaign = async (id) => {
    try {
      const response = await fetch(`${process.env.BACKEND_URL}/api/campaigns/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
      });
      if (response.ok) fetchCampaigns();
      else throw new Error("Failed to delete campaign.");
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchMetrics = async (campaignId) => {
    try {
      const response = await fetch(`${process.env.BACKEND_URL}/api/campaigns/${campaignId}/metrics`, {
        headers: { Authorization: "Bearer " + sessionStorage.getItem("token") },
      });
      if (response.ok) {
        const data = await response.json()
        setMetrics((prevMetrics) => ({ ...prevMetrics, [campaignId]: data }));
      } else {
        throw new Error(`Failed to fetch metrics for campaign ${campaignId}.`);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Campaign Management</h1>
      <CampaignForm
        campaign={selectedCampaign || newCampaign}
        onChange={(data) => (selectedCampaign ? setSelectedCampaign(data) : setNewCampaign(data))}
        onSubmit={handleAddOrUpdateCampaign}
        isEdit={!!selectedCampaign}
      />
      {loading ? (
        <p>Loading campaigns...</p>
      ) : (
        <CampaignList
          campaigns={campaigns}
          onEdit={setSelectedCampaign}
          onDelete={handleDeleteCampaign}
          onFetchMetrics={fetchMetrics}
        />
      )}
      <CampaignMetrics metrics={metrics} />
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default CampaignPage;
