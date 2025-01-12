import React from "react";

// CampaignList Component
export const CampaignList = ({ campaigns, onEdit, onDelete, onFetchMetrics }) => (
  <table className="w-full border mt-4">
    <thead>
      <tr className="bg-gray-200">
        <th className="px-4 py-2">Name</th>
        <th className="px-4 py-2">Description</th>
        <th className="px-4 py-2">Start Date</th>
        <th className="px-4 py-2">End Date</th>
        <th className="px-4 py-2">Budget</th>
        <th className="px-4 py-2">Actions</th>
      </tr>
    </thead>
    <tbody>
      {campaigns.map((campaign) => (
        <tr key={campaign.id}>
          <td className="px-4 py-2">{campaign.name}</td>
          <td className="px-4 py-2">{campaign.description}</td>
          <td className="px-4 py-2">{campaign.start_date}</td>
          <td className="px-4 py-2">{campaign.end_date}</td>
          <td className="px-4 py-2">${campaign.budget}</td>
          <td className="px-4 py-2 flex space-x-2">
            <button
              onClick={() => onFetchMetrics(campaign.id)}
              className="bg-gray-500 text-white px-2 py-1 rounded"
            >
              Metrics
            </button>
            <button
              onClick={() => onEdit(campaign)}
              className="bg-yellow-500 text-white px-2 py-1 rounded"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(campaign.id)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              Delete
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

// CampaignForm Component
export const CampaignForm = ({
  campaign,
  onChange,
  onSubmit,
  isEdit,
}) => (
  <div className="flex flex-wrap gap-4">
    <input
      type="text"
      placeholder="Name"
      value={campaign.name}
      onChange={(e) => onChange({ ...campaign, name: e.target.value })}
      className="p-2 border rounded"
    />
    <input
      type="text"
      placeholder="Description"
      value={campaign.description}
      onChange={(e) => onChange({ ...campaign, description: e.target.value })}
      className="p-2 border rounded"
    />
    <input
      type="date"
      value={campaign.start_date}
      onChange={(e) => onChange({ ...campaign, start_date: e.target.value })}
      className="p-2 border rounded"
    />
    <input
      type="date"
      value={campaign.end_date}
      onChange={(e) => onChange({ ...campaign, end_date: e.target.value })}
      className="p-2 border rounded"
    />
    <input
      type="number"
      placeholder="Budget"
      value={campaign.budget}
      onChange={(e) => onChange({ ...campaign, budget: e.target.value })}
      className="p-2 border rounded"
    />
    <button
      onClick={onSubmit}
      className={`px-4 py-2 rounded text-white ${
        isEdit ? "bg-green-500" : "bg-blue-500"
      }`}
    >
      {isEdit ? "Update Campaign" : "Add Campaign"}
    </button>
  </div>
);

// CampaignMetrics Component
export const CampaignMetrics = ({ metrics }) => (
  <div className="mt-6">
    <h2 className="text-2xl font-bold mb-4">Campaign Metrics</h2>
    {Object.entries(metrics).map(([campaignId, metric]) => (
      <div key={campaignId} className="mb-4">
        <h3 className="font-bold">Campaign ID: {campaignId}</h3>
        <p>Impressions: {metric.impressions}</p>
        <p>Clicks: {metric.clicks}</p>
        <p>Conversions: {metric.conversions}</p>
        <p>Revenue Generated: {metric.revenue_generated}</p>
      </div>
    ))}
  </div>
);
