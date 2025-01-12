// File: src/front/js/pages/Analytics.js

// API Endpoints
const API_ENDPOINTS = {
    sales: "/api/analytics/sales",
    inventory: "/api/analytics/inventory",
    revenueByProduct: "/api/analytics/revenue/product-types",
    revenueByStrain: "/api/analytics/revenue/strains",
    revenueByLocation: "/api/analytics/revenue/locations",
  };
  
  // Default options for fetch requests
  const DEFAULT_OPTIONS = {
    timeout: 5000,
  };
  
  // Fetch with Authentication and Timeout
  const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem("token"); // Retrieve the authentication token
    if (!token) throw new Error("No authentication token found. Please log in again.");
  
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_OPTIONS.timeout);
  
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      });
  
      clearTimeout(timeoutId);
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `API Error: ${response.status} ${response.statusText}` +
          (errorData ? ` - ${JSON.stringify(errorData)}` : "")
        );
      }
  
      return await response.json();
    } catch (error) {
      console.error(`Error fetching from ${url}:`, error);
      throw error;
    }
  };
  
  // Error Handling
  export const handleAnalyticsError = (error) => {
    if (error instanceof Error) {
      if (error.message.includes("authentication")) {
        window.location.href = "/login"; // Redirect to login if authentication fails
        return "Authentication failed. Please log in again.";
      }
      return error.message;
    }
    return "An unexpected error occurred while fetching analytics data.";
  };
  
  // Data Transformation Utilities
  export const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
  
  export const formatPercentage = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  
  // Exported API Functions
  export const fetchSalesAnalytics = async () => fetchWithAuth(API_ENDPOINTS.sales);
  
  export const fetchInventoryAnalytics = async () => fetchWithAuth(API_ENDPOINTS.inventory);
  
  export const fetchRevenueByProductType = async () =>
    fetchWithAuth(API_ENDPOINTS.revenueByProduct);
  
  export const fetchRevenueByStrain = async () =>
    fetchWithAuth(API_ENDPOINTS.revenueByStrain);
  
  export const fetchRevenueByLocation = async () =>
    fetchWithAuth(API_ENDPOINTS.revenueByLocation);
  