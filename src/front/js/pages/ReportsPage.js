import React, { useState, useEffect } from "react";
import ReportsService from "../component/Reports";

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("sales");
  const [filters, setFilters] = useState({ start_date: "", end_date: "" });

  useEffect(() => {
    fetchReports();
  }, [selectedType, filters]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await ReportsService.getAllReports(
        selectedType,
        localStorage.getItem("token"),
        filters
      );
      setReports(data);
    } catch (error) {
      alert("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const data = await ReportsService.generateReport(
        selectedType,
        filters,
        localStorage.getItem("token")
      );
      alert("Report generated successfully!");
      setReports((prev) => [data, ...prev]);
    } catch (error) {
      alert("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (reportId, format) => {
    try {
      const file = await ReportsService.exportReport(
        reportId,
        format,
        localStorage.getItem("token")
      );
      const blob = new Blob([file], {
        type: format === "pdf" ? "application/pdf" : "text/csv",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report_${reportId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      alert("Report exported successfully!");
    } catch (error) {
      alert("Failed to export report");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Reports</h1>

      {/* Filter Section */}
      <div className="mb-6">
        <label className="block font-semibold mb-2">Select Report Type:</label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="sales">Sales</option>
          <option value="inventory">Inventory</option>
        </select>
      </div>

      {/* Date Filters */}
      <div className="mb-6">
        <label className="block font-semibold mb-2">Filter by Date Range:</label>
        <input
          type="date"
          value={filters.start_date}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, start_date: e.target.value }))
          }
          className="p-2 border rounded mr-4"
        />
        <input
          type="date"
          value={filters.end_date}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, end_date: e.target.value }))
          }
          className="p-2 border rounded"
        />
      </div>

      {/* Generate Report Button */}
      <div className="mb-6">
        <button
          onClick={handleGenerateReport}
          className={`p-2 bg-blue-500 text-white rounded ${
            loading ? "opacity-50" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Report"}
        </button>
      </div>

      {/* Reports Table */}
      <div>
        <h2 className="text-xl font-bold mb-4">Report Results</h2>
        {loading ? (
          <p>Loading reports...</p>
        ) : reports.length > 0 ? (
          <table className="w-full border-collapse border">
            <thead>
              <tr>
                <th className="border p-2">ID</th>
                <th className="border p-2">Type</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="border p-2">{report.id}</td>
                  <td className="border p-2">{report.type}</td>
                  <td className="border p-2">{report.date}</td>
                  <td className="border p-2">
                    <button
                      onClick={() => handleExportReport(report.id, "pdf")}
                      className="p-1 bg-green-500 text-white rounded mr-2"
                    >
                      Export PDF
                    </button>
                    <button
                      onClick={() => handleExportReport(report.id, "csv")}
                      className="p-1 bg-yellow-500 text-black rounded"
                    >
                      Export CSV
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No reports available.</p>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
