import axios from 'axios';

const BASE_URL = process.env.BACKEND_URL || "http://localhost:5000/api";

const ReportsService = {
  /**
   * Fetch all reports
   */
  getAllReports: async (type, token, filters = {}) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/reports`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { type, ...filters }, // Include additional filters (e.g., start_date, end_date)
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching reports:", error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Generate a new report
   */
  generateReport: async (type, filters, token) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/reports/generate`,
        { type, filters },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error("Error generating report:", error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Export a report
   */
  exportReport: async (reportId, format, token) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/reports/export/${reportId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { format },
          responseType: "blob", // Ensure the response is a file blob
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error exporting report:", error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Fetch time-based reports
   */
  getTimeBasedReports: async (type, startDate, endDate, token) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/analytics/sales`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { type, start_date: startDate, end_date: endDate },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching time-based reports:", error);
      throw error.response?.data || error.message;
    }
  },
};

export default ReportsService;
