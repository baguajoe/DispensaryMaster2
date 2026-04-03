const getState = ({ getStore, getActions, setStore }) => {
    return {
        store: {
            message: null,
            token: localStorage.getItem("token") || null,
            user: null,
            products: [],
            orders: [],
            customers: [],
            stores: [],
            suppliers: [],
            inventory: [],
            invoices: [],
            cartItems: [],
            deals: [],
            campaigns: [],
            users: [],
            posTransactions: [],
            growFarms: [],
            plantBatches: [],
            growTasks: [],
            yieldPredictions: [],
            seedBanks: [],
            seedBatches: [],
            seedReports: [],
            storageConditions: [],
            customerProfile: null,
            orderHistory: [],
            wishlist: [],
            loyaltyPoints: 0,
            patients: [],
            prescriptions: [],
            appointments: [],
            complianceReports: [],
            jobs: [],
            companies: [],
            dashboardMetrics: [],
            salesAnalytics: null,
        },

        actions: {

            // ─── AUTH ───────────────────────────────────────────────
            getMessage: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/hello");
                    const data = await resp.json();
                    setStore({ message: data.message });
                    return data;
                } catch (error) {
                    console.log("Error loading message from backend", error);
                }
            },

            login: async (email, password) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/auth/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, password }),
                    });
                    const data = await resp.json();
                    if (resp.ok) {
                        localStorage.setItem("token", data.access_token);
                        setStore({ token: data.access_token, user: data.user });
                        return { success: true };
                    }
                    return { success: false, error: data.error };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            logout: () => {
                localStorage.removeItem("token");
                setStore({ token: null, user: null });
            },

            getAuthHeaders: () => {
                const token = localStorage.getItem("token");
                return {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                };
            },

            // ─── DASHBOARD ──────────────────────────────────────────
            fetchDashboardMetrics: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/dashboard/metrics", {
                        headers: getActions().getAuthHeaders(),
                    });
                    const data = await resp.json();
                    setStore({ dashboardMetrics: data });
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            // ─── PRODUCTS ───────────────────────────────────────────
            fetchProducts: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/products", {
                        headers: getActions().getAuthHeaders(),
                    });
                    const data = await resp.json();
                    setStore({ products: Array.isArray(data) ? data : (data.products || []) });
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            addProduct: async (productData) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/products", {
                        method: "POST",
                        headers: getActions().getAuthHeaders(),
                        body: JSON.stringify(productData),
                    });
                    const data = await resp.json();
                    if (resp.ok) {
                        const store = getStore();
                        setStore({ products: [...store.products, data] });
                        return { success: true, data };
                    }
                    return { success: false, error: data.error };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            editProduct: async (id, productData) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + `/api/products/${id}`, {
                        method: "PUT",
                        headers: getActions().getAuthHeaders(),
                        body: JSON.stringify(productData),
                    });
                    const data = await resp.json();
                    if (resp.ok) {
                        const store = getStore();
                        setStore({ products: store.products.map(p => p.id === id ? data : p) });
                        return { success: true, data };
                    }
                    return { success: false, error: data.error };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            deleteProduct: async (id) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + `/api/products/${id}`, {
                        method: "DELETE",
                        headers: getActions().getAuthHeaders(),
                    });
                    if (resp.ok) {
                        const store = getStore();
                        setStore({ products: store.products.filter(p => p.id !== id) });
                        return { success: true };
                    }
                    return { success: false, error: "Failed to delete" };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            bulkAddProducts: async (products) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/products/bulk", {
                        method: "POST",
                        headers: getActions().getAuthHeaders(),
                        body: JSON.stringify({ products }),
                    });
                    const data = await resp.json();
                    if (resp.ok) {
                        await getActions().fetchProducts();
                        return { success: true, data };
                    }
                    return { success: false, error: data.error };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            // ─── ORDERS ─────────────────────────────────────────────
            fetchOrders: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/orders", {
                        headers: getActions().getAuthHeaders(),
                    });
                    const data = await resp.json();
                    setStore({ orders: data });
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            addOrder: async (orderData) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/orders", {
                        method: "POST",
                        headers: getActions().getAuthHeaders(),
                        body: JSON.stringify(orderData),
                    });
                    const data = await resp.json();
                    if (resp.ok) {
                        await getActions().fetchOrders();
                        return { success: true, data };
                    }
                    return { success: false, error: data.error };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            updateOrderStatus: async (id, status) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + `/api/orders/${id}`, {
                        method: "PUT",
                        headers: getActions().getAuthHeaders(),
                        body: JSON.stringify({ status }),
                    });
                    const data = await resp.json();
                    if (resp.ok) {
                        const store = getStore();
                        setStore({ orders: store.orders.map(o => o.id === id ? data : o) });
                        return { success: true, data };
                    }
                    return { success: false, error: data.error };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            deleteOrder: async (id) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + `/api/orders/${id}`, {
                        method: "DELETE",
                        headers: getActions().getAuthHeaders(),
                    });
                    if (resp.ok) {
                        const store = getStore();
                        setStore({ orders: store.orders.filter(o => o.id !== id) });
                        return { success: true };
                    }
                    return { success: false, error: "Failed to delete order" };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            // ─── CUSTOMERS ──────────────────────────────────────────
            fetchCustomers: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/customers", {
                        headers: getActions().getAuthHeaders(),
                    });
                    const data = await resp.json();
                    setStore({ customers: data });
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            addCustomer: async (customerData) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/customers", {
                        method: "POST",
                        headers: getActions().getAuthHeaders(),
                        body: JSON.stringify(customerData),
                    });
                    const data = await resp.json();
                    if (resp.ok) {
                        const store = getStore();
                        setStore({ customers: [...store.customers, data] });
                        return { success: true, data };
                    }
                    return { success: false, error: data.error };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            // ─── STORES ─────────────────────────────────────────────
            fetchStores: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/stores", {
                        headers: getActions().getAuthHeaders(),
                    });
                    const data = await resp.json();
                    setStore({ stores: data });
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            addStore: async (storeData) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/stores", {
                        method: "POST",
                        headers: getActions().getAuthHeaders(),
                        body: JSON.stringify(storeData),
                    });
                    const data = await resp.json();
                    if (resp.ok) {
                        await getActions().fetchStores();
                        return { success: true, data };
                    }
                    return { success: false, error: data.error };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            editStore: async (id, storeData) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + `/api/stores/${id}`, {
                        method: "PUT",
                        headers: getActions().getAuthHeaders(),
                        body: JSON.stringify(storeData),
                    });
                    const data = await resp.json();
                    if (resp.ok) {
                        await getActions().fetchStores();
                        return { success: true, data };
                    }
                    return { success: false, error: data.error };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            deleteStore: async (id) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + `/api/stores/${id}`, {
                        method: "DELETE",
                        headers: getActions().getAuthHeaders(),
                    });
                    if (resp.ok) {
                        const store = getStore();
                        setStore({ stores: store.stores.filter(s => s.id !== id) });
                        return { success: true };
                    }
                    return { success: false, error: "Failed to delete store" };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            // ─── SUPPLIERS ──────────────────────────────────────────
            fetchSuppliers: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/suppliers", {
                        headers: getActions().getAuthHeaders(),
                    });
                    const data = await resp.json();
                    setStore({ suppliers: data });
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            addSupplier: async (supplierData) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/suppliers", {
                        method: "POST",
                        headers: getActions().getAuthHeaders(),
                        body: JSON.stringify(supplierData),
                    });
                    const data = await resp.json();
                    if (resp.ok) {
                        await getActions().fetchSuppliers();
                        return { success: true, data };
                    }
                    return { success: false, error: data.error };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            editSupplier: async (id, supplierData) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + `/api/suppliers/${id}`, {
                        method: "PUT",
                        headers: getActions().getAuthHeaders(),
                        body: JSON.stringify(supplierData),
                    });
                    const data = await resp.json();
                    if (resp.ok) {
                        await getActions().fetchSuppliers();
                        return { success: true, data };
                    }
                    return { success: false, error: data.error };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            deleteSupplier: async (id) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + `/api/suppliers/${id}`, {
                        method: "DELETE",
                        headers: getActions().getAuthHeaders(),
                    });
                    if (resp.ok) {
                        const store = getStore();
                        setStore({ suppliers: store.suppliers.filter(s => s.id !== id) });
                        return { success: true };
                    }
                    return { success: false, error: "Failed to delete supplier" };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            // ─── USERS ──────────────────────────────────────────────
            fetchUsers: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/users", {
                        headers: getActions().getAuthHeaders(),
                    });
                    const data = await resp.json();
                    setStore({ users: data });
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            addUser: async (userData) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/signup", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(userData),
                    });
                    const data = await resp.json();
                    if (resp.ok) {
                        await getActions().fetchUsers();
                        return { success: true, data };
                    }
                    return { success: false, error: data.error };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            deleteUser: async (id) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + `/api/users/${id}`, {
                        method: "DELETE",
                        headers: getActions().getAuthHeaders(),
                    });
                    if (resp.ok) {
                        const store = getStore();
                        setStore({ users: store.users.filter(u => u.id !== id) });
                        return { success: true };
                    }
                    return { success: false, error: "Failed to delete user" };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            // ─── CART ───────────────────────────────────────────────
            fetchCart: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/cart", {
                        headers: getActions().getAuthHeaders(),
                    });
                    const data = await resp.json();
                    setStore({ cartItems: data });
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            addToCart: async (product, quantity = 1) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/cart", {
                        method: "POST",
                        headers: getActions().getAuthHeaders(),
                        body: JSON.stringify({ product_id: typeof product === "object" ? product.id : product, quantity }),
                    });
                    const data = await resp.json();
                    if (resp.ok) {
                        await getActions().fetchCart();
                        return { success: true, data };
                    }
                    return { success: false, error: data.error };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            removeFromCart: async (itemId) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + `/api/cart/${itemId}`, {
                        method: "DELETE",
                        headers: getActions().getAuthHeaders(),
                    });
                    if (resp.ok) {
                        const store = getStore();
                        setStore({ cartItems: store.cartItems.filter(i => i.id !== itemId) });
                        return { success: true };
                    }
                    return { success: false, error: "Failed to remove item" };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            clearCart: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/cart", {
                        method: "DELETE",
                        headers: getActions().getAuthHeaders(),
                    });
                    if (resp.ok) {
                        setStore({ cartItems: [] });
                        return { success: true };
                    }
                    return { success: false, error: "Failed to clear cart" };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            // ─── INVOICES ───────────────────────────────────────────
            fetchInvoices: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/invoices", {
                        headers: getActions().getAuthHeaders(),
                    });
                    const data = await resp.json();
                    setStore({ invoices: data.invoices || data });
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            // ─── INVENTORY ──────────────────────────────────────────
            fetchInventory: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/inventory", {
                        headers: getActions().getAuthHeaders(),
                    });
                    const data = await resp.json();
                    setStore({ inventory: data });
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            updateInventory: async (productId, newStock) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + `/api/products/${productId}`, {
                        method: "PUT",
                        headers: getActions().getAuthHeaders(),
                        body: JSON.stringify({ current_stock: newStock }),
                    });
                    const data = await resp.json();
                    if (resp.ok) {
                        await getActions().fetchProducts();
                        return { success: true, data };
                    }
                    return { success: false, error: data.error };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            // ─── DEALS / CAMPAIGNS ──────────────────────────────────
            fetchDeals: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/deals", {
                        headers: getActions().getAuthHeaders(),
                    });
                    const data = await resp.json();
                    setStore({ deals: data });
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            fetchCampaigns: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/campaigns", {
                        headers: getActions().getAuthHeaders(),
                    });
                    const data = await resp.json();
                    setStore({ campaigns: data });
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            addCampaign: async (campaignData) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/campaigns", {
                        method: "POST",
                        headers: getActions().getAuthHeaders(),
                        body: JSON.stringify(campaignData),
                    });
                    const data = await resp.json();
                    if (resp.ok) {
                        await getActions().fetchCampaigns();
                        return { success: true, data };
                    }
                    return { success: false, error: data.error };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            // ─── GROW FARMS ─────────────────────────────────────────
            fetchGrowFarms: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/growfarms", {
                        headers: getActions().getAuthHeaders(),
                    });
                    const data = await resp.json();
                    setStore({ growFarms: data });
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            fetchPlantBatches: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/plant-batches", {
                        headers: getActions().getAuthHeaders(),
                    });
                    const data = await resp.json();
                    setStore({ plantBatches: data });
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            addPlantBatch: async (batchData) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/plant-batches", {
                        method: "POST",
                        headers: getActions().getAuthHeaders(),
                        body: JSON.stringify(batchData),
                    });
                    const data = await resp.json();
                    if (resp.ok) {
                        await getActions().fetchPlantBatches();
                        return { success: true, data };
                    }
                    return { success: false, error: data.error };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            fetchGrowTasks: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/grow-tasks", {
                        headers: getActions().getAuthHeaders(),
                    });
                    const data = await resp.json();
                    setStore({ growTasks: data });
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            addGrowTask: async (taskData) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/grow-tasks", {
                        method: "POST",
                        headers: getActions().getAuthHeaders(),
                        body: JSON.stringify(taskData),
                    });
                    const data = await resp.json();
                    if (resp.ok) {
                        await getActions().fetchGrowTasks();
                        return { success: true, data };
                    }
                    return { success: false, error: data.error };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            updateGrowTask: async (id, taskData) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + `/api/grow-tasks/${id}`, {
                        method: "PUT",
                        headers: getActions().getAuthHeaders(),
                        body: JSON.stringify(taskData),
                    });
                    const data = await resp.json();
                    if (resp.ok) {
                        await getActions().fetchGrowTasks();
                        return { success: true, data };
                    }
                    return { success: false, error: data.error };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            fetchYieldPredictions: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/yield-predictions", {
                        headers: getActions().getAuthHeaders(),
                    });
                    const data = await resp.json();
                    setStore({ yieldPredictions: data });
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            // ─── SEED BANKS ─────────────────────────────────────────
            fetchSeedBanks: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/seedbanks", {
                        headers: getActions().getAuthHeaders(),
                    });
                    const data = await resp.json();
                    setStore({ seedBanks: data });
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            fetchSeedBatches: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/seedbatches", {
                        headers: getActions().getAuthHeaders(),
                    });
                    const data = await resp.json();
                    setStore({ seedBatches: data });
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            addSeedBatch: async (batchData) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/seedbatches", {
                        method: "POST",
                        headers: getActions().getAuthHeaders(),
                        body: JSON.stringify(batchData),
                    });
                    const data = await resp.json();
                    if (resp.ok) {
                        await getActions().fetchSeedBatches();
                        return { success: true, data };
                    }
                    return { success: false, error: data.error };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            fetchSeedReports: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/seedreports", {
                        headers: getActions().getAuthHeaders(),
                    });
                    const data = await resp.json();
                    setStore({ seedReports: data });
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            fetchStorageConditions: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/storageconditions", {
                        headers: getActions().getAuthHeaders(),
                    });
                    const data = await resp.json();
                    setStore({ storageConditions: data });
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            // ─── MEDICAL ────────────────────────────────────────────
            fetchPatients: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/medical/patients", {
                        headers: getActions().getAuthHeaders(),
                    });
                    const data = await resp.json();
                    setStore({ patients: data });
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            fetchPrescriptions: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/prescriptions", {
                        headers: getActions().getAuthHeaders(),
                    });
                    const data = await resp.json();
                    setStore({ prescriptions: data });
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            fetchAppointments: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/medical/appointments", {
                        headers: getActions().getAuthHeaders(),
                    });
                    const data = await resp.json();
                    setStore({ appointments: data });
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            // ─── JOB BOARD ──────────────────────────────────────────
            fetchJobs: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/jobs");
                    const data = await resp.json();
                    setStore({ jobs: data });
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            postJob: async (companyId, jobData) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + `/api/companies/${companyId}/jobs`, {
                        method: "POST",
                        headers: getActions().getAuthHeaders(),
                        body: JSON.stringify(jobData),
                    });
                    const data = await resp.json();
                    if (resp.ok) {
                        await getActions().fetchJobs();
                        return { success: true, data };
                    }
                    return { success: false, error: data.error };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            applyToJob: async (jobId, companyId, formData = {}) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/apply", {
                        method: "POST",
                        headers: getActions().getAuthHeaders(),
                        body: JSON.stringify({
                            job_id: jobId,
                            company_id: companyId,
                            name: formData.name || "",
                            email: formData.email || "",
                            phone: formData.phone || "",
                            cover_letter: formData.cover_letter || ""
                        }),
                    });
                    const data = await resp.json();
                    if (resp.ok) return { success: true, data };
                    return { success: false, error: data.error || data.msg };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            fetchCompanies: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/companies");
                    const data = await resp.json();
                    setStore({ companies: data });
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },


            // ─── MEDICAL ──────────────────────────────────────────
            fetchPatients: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/medical/patients", {
                        headers: getActions().getAuthHeaders()
                    });
                    const data = await resp.json();
                    setStore({ patients: Array.isArray(data) ? data : [] });
                    return { success: true };
                } catch (error) { return { success: false }; }
            },

            addPatient: async (patientData) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/medical/patients", {
                        method: "POST",
                        headers: getActions().getAuthHeaders(),
                        body: JSON.stringify(patientData)
                    });
                    const data = await resp.json();
                    if (resp.ok) { await getActions().fetchPatients(); return { success: true, data }; }
                    return { success: false, error: data.error };
                } catch (error) { return { success: false }; }
            },

            editPatient: async (id, patientData) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + `/api/medical/patients/${id}`, {
                        method: "PUT",
                        headers: getActions().getAuthHeaders(),
                        body: JSON.stringify(patientData)
                    });
                    if (resp.ok) { await getActions().fetchPatients(); return { success: true }; }
                    return { success: false };
                } catch (error) { return { success: false }; }
            },

            deletePatient: async (id) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + `/api/medical/patients/${id}`, {
                        method: "DELETE",
                        headers: getActions().getAuthHeaders()
                    });
                    if (resp.ok) { await getActions().fetchPatients(); return { success: true }; }
                    return { success: false };
                } catch (error) { return { success: false }; }
            },

            fetchPrescriptions: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/medical/prescriptions", {
                        headers: getActions().getAuthHeaders()
                    });
                    const data = await resp.json();
                    setStore({ prescriptions: Array.isArray(data) ? data : [] });
                    return { success: true };
                } catch (error) { return { success: false }; }
            },

            addPrescription: async (rxData) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/medical/prescriptions", {
                        method: "POST",
                        headers: getActions().getAuthHeaders(),
                        body: JSON.stringify(rxData)
                    });
                    const data = await resp.json();
                    if (resp.ok) { await getActions().fetchPrescriptions(); return { success: true, data }; }
                    return { success: false, error: data.error };
                } catch (error) { return { success: false }; }
            },

            deletePrescription: async (id) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + `/api/medical/prescriptions/${id}`, {
                        method: "DELETE",
                        headers: getActions().getAuthHeaders()
                    });
                    if (resp.ok) { await getActions().fetchPrescriptions(); return { success: true }; }
                    return { success: false };
                } catch (error) { return { success: false }; }
            },

            fetchAppointments: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/medical/appointments", {
                        headers: getActions().getAuthHeaders()
                    });
                    const data = await resp.json();
                    setStore({ appointments: Array.isArray(data) ? data : [] });
                    return { success: true };
                } catch (error) { return { success: false }; }
            },

            addAppointment: async (aptData) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/medical/appointments", {
                        method: "POST",
                        headers: getActions().getAuthHeaders(),
                        body: JSON.stringify(aptData)
                    });
                    const data = await resp.json();
                    if (resp.ok) { await getActions().fetchAppointments(); return { success: true, data }; }
                    return { success: false, error: data.error };
                } catch (error) { return { success: false }; }
            },

            updateAppointment: async (id, aptData) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + `/api/medical/appointments/${id}`, {
                        method: "PUT",
                        headers: getActions().getAuthHeaders(),
                        body: JSON.stringify(aptData)
                    });
                    if (resp.ok) { await getActions().fetchAppointments(); return { success: true }; }
                    return { success: false };
                } catch (error) { return { success: false }; }
            },

            deleteAppointment: async (id) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + `/api/medical/appointments/${id}`, {
                        method: "DELETE",
                        headers: getActions().getAuthHeaders()
                    });
                    if (resp.ok) { await getActions().fetchAppointments(); return { success: true }; }
                    return { success: false };
                } catch (error) { return { success: false }; }
            },

            // ─── ANALYTICS ──────────────────────────────────────────
            fetchSalesAnalytics: async (startDate, endDate) => {
                try {
                    let url = process.env.BACKEND_URL + "/api/analytics/sales";
                    if (startDate && endDate) {
                        url += `?start_date=${startDate}&end_date=${endDate}`;
                    }
                    const resp = await fetch(url, {
                        headers: getActions().getAuthHeaders(),
                    });
                    const data = await resp.json();
                    setStore({ salesAnalytics: data });
                    return { success: true, data };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            // ─── LOYALTY ────────────────────────────────────────────
            fetchLoyaltyPoints: async (customerId) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + `/api/loyalty/points/${customerId}`, {
                        headers: getActions().getAuthHeaders(),
                    });
                    const data = await resp.json();
                    setStore({ loyaltyPoints: data.points || 0 });
                    return { success: true, data };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            redeemLoyaltyPoints: async (customerId, points) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/loyalty/points/redeem", {
                        method: "POST",
                        headers: getActions().getAuthHeaders(),
                        body: JSON.stringify({ customer_id: customerId, points }),
                    });
                    const data = await resp.json();
                    if (resp.ok) {
                        setStore({ loyaltyPoints: data.loyalty_points });
                        return { success: true, data };
                    }
                    return { success: false, error: data.error };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            // ─── WISHLIST ───────────────────────────────────────────
            fetchWishlist: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/wishlist", {
                        headers: getActions().getAuthHeaders(),
                    });
                    const data = await resp.json();
                    setStore({ wishlist: data });
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            addToWishlist: async (productId) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/wishlist", {
                        method: "POST",
                        headers: getActions().getAuthHeaders(),
                        body: JSON.stringify({ product_id: productId }),
                    });
                    const data = await resp.json();
                    if (resp.ok) {
                        await getActions().fetchWishlist();
                        return { success: true, data };
                    }
                    return { success: false, error: data.error };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },
        },
    };
};

export default getState;
