import React, { useState, useEffect } from "react";

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    budget: "",
  });

  // Fetch campaigns on component mount
  useEffect(() => {
    fetch(process.env.BACKEND_URL + "/api/campaigns", {
      headers: { "Authorization": "Bearer " + sessionStorage.getItem("token") },
    })
      .then((response) => response.json())
      .then((data) => setCampaigns(data))
      .catch((error) => console.error("Error fetching campaigns:", error));
  }, []);

  const handleAddCampaign = async () => {
    const response = await fetch(process.env.BACKEND_URL + "/api/campaigns", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + sessionStorage.getItem("token"),
      },
      body: JSON.stringify(newCampaign),
    });

    if (response.ok) {
      const addedCampaign = await response.json();
      setCampaigns([...campaigns, addedCampaign]);
      setNewCampaign({ name: "", description: "", start_date: "", end_date: "", budget: "" });
    } else {
      alert("Failed to add campaign.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Campaign Management</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Campaign Name"
          value={newCampaign.name}
          onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
          className="p-2 border rounded mr-2"
        />
        <input
          type="text"
          placeholder="Description"
          value={newCampaign.description}
          onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
          className="p-2 border rounded mr-2"
        />
        <input
          type="date"
          placeholder="Start Date"
          value={newCampaign.start_date}
          onChange={(e) => setNewCampaign({ ...newCampaign, start_date: e.target.value })}
          className="p-2 border rounded mr-2"
        />
        <input
          type="date"
          placeholder="End Date"
          value={newCampaign.end_date}
          onChange={(e) => setNewCampaign({ ...newCampaign, end_date: e.target.value })}
          className="p-2 border rounded mr-2"
        />
        <input
          type="number"
          placeholder="Budget"
          value={newCampaign.budget}
          onChange={(e) => setNewCampaign({ ...newCampaign, budget: e.target.value })}
          className="p-2 border rounded mr-2"
        />
        <button onClick={handleAddCampaign} className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Campaign
        </button>
      </div>
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Description</th>
            <th className="px-4 py-2">Start Date</th>
            <th className="px-4 py-2">End Date</th>
            <th className="px-4 py-2">Budget</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr key={campaign.id} className="border-t">
              <td className="px-4 py-2">{campaign.name}</td>
              <td className="px-4 py-2">{campaign.description}</td>
              <td className="px-4 py-2">{campaign.start_date}</td>
              <td className="px-4 py-2">{campaign.end_date}</td>
              <td className="px-4 py-2">{campaign.budget}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Campaigns;
