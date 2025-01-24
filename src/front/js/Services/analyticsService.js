import axios from 'axios';

const API_BASE_URL = process.env.BACKEND_URL || 'https://shiny-broccoli-q79pvgr4wqp72qx9-3001.app.github.dev/api'; // Set your API base URL here

const analyticsService = {
    /**
     * Fetches customer analytics.
     * @returns {Promise} Resolves to customer analytics data.
     */
    getCustomerAnalytics: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/analytics/customer`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`, // Example: Adding JWT token for authentication
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching customer analytics:', error);
            throw error;
        }
    },

    /**
     * Fetches admin dashboard analytics.
     * @returns {Promise} Resolves to dashboard analytics data.
     */
    getDashboardAnalytics: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/dashboard/analytics`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard analytics:', error);
            throw error;
        }
    },

    /**
     * Fetches sales predictions.
     * @returns {Promise} Resolves to predicted sales data.
     */
    getSalesPredictions: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/analytics/predict-sales`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching sales predictions:', error);
            throw error;
        }
    },

    /**
     * Fetches customer lifetime value predictions.
     * @returns {Promise} Resolves to predicted CLV data.
     */
    getCLVPredictions: async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/analytics/clv-prediction`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching CLV predictions:', error);
            throw error;
        }
    },

    /**
     * Fetches real-time inventory forecast analytics.
     * @returns {Promise} Resolves to inventory forecast data.
     */
    getInventoryForecast: async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/analytics/inventory-forecast`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching inventory forecast:', error);
            throw error;
        }
    },

    /**
     * Fetches compliance trends.
     * @returns {Promise} Resolves to compliance trends data.
     */
    getComplianceTrends: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/medical/compliance`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching compliance trends:', error);
            throw error;
        }
    },
};

export default analyticsService;
