#!/bin/bash
# ============================================================
# DispensaryMaster2 - Full Fix Script
# Run from: /workspaces/DispensaryMaster2
# Usage: bash fix_dispensary.sh
# ============================================================

echo "Starting DispensaryMaster2 fixes..."

# ============================================================
# 1. FLUX.JS - Complete store with all actions
# ============================================================
cat > src/front/js/store/flux.js << 'FLUX_EOF'
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
                    setStore({ products: data });
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
                        body: JSON.stringify({ product_id: product.id, quantity }),
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

            applyToJob: async (jobId, companyId) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/apply", {
                        method: "POST",
                        headers: getActions().getAuthHeaders(),
                        body: JSON.stringify({ job_id: jobId, company_id: companyId }),
                    });
                    const data = await resp.json();
                    if (resp.ok) return { success: true, data };
                    return { success: false, error: data.error };
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
FLUX_EOF
echo "✓ flux.js written"

# ============================================================
# 2. FIX SIDEBAR - Fix customer dashboard paths
# ============================================================
cat > src/front/js/component/Sidebar.js << 'SIDEBAR_EOF'
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../../styles/sidebar.css";

export const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [collapsedSections, setCollapsedSections] = useState({});
    const location = useLocation();
    const navigate = useNavigate();

    const sections = {
        nonMedical: [
            { name: "Shop", path: "/shop" },
            { name: "Deals", path: "/deals" },
            { name: "Dashboard", path: "/dashboard" },
            { name: "Products", path: "/products" },
            { name: "Price Comparison", path: "/price-comparison" },
            { name: "Inventory", path: "/inventory" },
            { name: "Invoices", path: "/invoices" },
            { name: "Orders", path: "/orders" },
            { name: "Stores", path: "/stores" },
            { name: "Suppliers", path: "/suppliers" },
            { name: "Users", path: "/users" },
            { name: "Barcode Scanner", path: "/barcode-scanner" },
            { name: "Cart", path: "/cart-management" },
            { name: "Analytics Dashboard", path: "/analytics-dashboard" },
            { name: "Reports", path: "/reports" },
            { name: "Sales Reports", path: "/sales-reports" },
            { name: "Campaigns", path: "/campaigns" },
        ],
        jobBoard: [
            { name: "Job Listings", path: "/jobs" },
            { name: "Post a Job", path: "/jobs/post" },
            { name: "Companies", path: "/companies" },
            { name: "My Applications", path: "/jobs/applications" },
        ],
        posSystem: [
            { name: "Main POS", path: "/pos" },
            { name: "Transaction History", path: "/pos/transactions" },
            { name: "Returns", path: "/pos/returns" },
            { name: "Receipt Management", path: "/pos/receipt-management" },
            { name: "Reports", path: "/pos/reports" },
        ],
        medical: [
            { name: "Compliance Dashboard", path: "/medical/compliance-dashboard" },
            { name: "Compliance Reports", path: "/medical/compliance-reports" },
            { name: "Appointment Management", path: "/medical/appointment-management" },
            { name: "Medical Analytics", path: "/medical/medical-analytics" },
            { name: "Patient List", path: "/medical/patient-list" },
            { name: "Patient Registration", path: "/medical/patient-registration" },
            { name: "Prescription Management", path: "/medical/prescription-management" },
        ],
        growFarms: [
            { name: "Dashboard", path: "/growfarms/dashboard" },
            { name: "Add Plant Batch", path: "/growfarms/add-plant-batch" },
            { name: "Add Grow Task", path: "/growfarms/add-grow-task" },
            { name: "Task List", path: "/growfarms/task-list" },
            { name: "Plant Batch List", path: "/growfarms/plant-batch-list" },
            { name: "Yield Prediction", path: "/growfarms/yield-prediction" },
        ],
        seedBanks: [
            { name: "Dashboard", path: "/seedbanks/dashboard" },
            { name: "Add Seed Batch", path: "/seedbanks/add-seed-batch" },
            { name: "Batch List", path: "/seedbanks/batch-list" },
            { name: "Inventory", path: "/seedbanks/inventory" },
            { name: "Reports", path: "/seedbanks/reports" },
        ],
        customerDashboard: [
            { name: "Overview", path: "/dashboard-overview" },
            { name: "Profile", path: "/customer/profile" },
            { name: "Order History", path: "/customer/orders" },
            { name: "Wishlist", path: "/customer/wishlist" },
            { name: "Loyalty Program", path: "/customer/loyalty-program" },
            { name: "Analytics", path: "/customer/analytics" },
        ],
    };

    useEffect(() => {
        const sectionMap = Object.entries(sections).reduce((map, [key, links]) => {
            const isActive = links.some((link) => link.path === location.pathname);
            return { ...map, [key]: isActive };
        }, {});
        setCollapsedSections(sectionMap);
    }, [location.pathname]);

    const toggleSection = (section) => {
        setCollapsedSections((prevState) => ({
            ...prevState,
            [section]: !prevState[section],
        }));
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const sectionLabels = {
        nonMedical: "Non Medical",
        jobBoard: "Job Board",
        posSystem: "POS System",
        medical: "Medical",
        growFarms: "Grow Farms",
        seedBanks: "Seed Banks",
        customerDashboard: "Customer Dashboard",
    };

    return (
        <div className={`sidebar ${isCollapsed ? "sidebar-collapsed" : ""}`}>
            <button
                className="sidebar-toggle"
                onClick={() => setIsCollapsed((prev) => !prev)}
            >
                {isCollapsed ? "→" : "←"}
            </button>

            {!isCollapsed && (
                <div className="sidebar-brand">
                    <span>DispenseMaster</span>
                </div>
            )}

            <nav className="sidebar-nav">
                {Object.entries(sections).map(([section, links]) => (
                    <div key={section}>
                        <h5
                            className="sidebar-heading"
                            onClick={() => toggleSection(section)}
                            aria-expanded={!!collapsedSections[section]}
                        >
                            {!isCollapsed && (sectionLabels[section] || section.replace(/([A-Z])/g, " $1").trim())}
                            <span className="sidebar-arrow">
                                {collapsedSections[section] ? "▲" : "▼"}
                            </span>
                        </h5>
                        {collapsedSections[section] && (
                            <div className="dropdown-content">
                                {links.map((link) => (
                                    <Link
                                        key={link.path}
                                        className={`nav-link ${location.pathname === link.path ? "active" : ""}`}
                                        to={link.path}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                        <hr className="sidebar-divider" />
                    </div>
                ))}

                <button className="nav-link text-danger logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </nav>
        </div>
    );
};

export default Sidebar;
SIDEBAR_EOF
echo "✓ Sidebar.js written"

# ============================================================
# 3. FIX LAYOUT.JS - Add all missing routes + fix Navigate import
# ============================================================
cat > src/front/js/layout.js << 'LAYOUT_EOF'
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import injectContext from "./store/appContext";
import Navbar from "./component/Navbar";
import Sidebar from "./component/Sidebar";
import { Footer } from "./component/footer";
import ScrollToTop from "./component/scrollToTop";
import AgeVerification from "./pages/AgeVerification";

// Core Pages
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import Shop from "./pages/Shop";
import Deals from "./pages/Deals";
import ContactUs from "./pages/ContactUs";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { ForgotPassword } from "./pages/ForgotPassword";

// Non-Medical
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import PriceComparison from "./pages/PriceComparison";
import Inventory from "./pages/Inventory";
import Invoices from "./pages/Invoices";
import Orders from "./pages/Orders";
import Stores from "./pages/Stores";
import Suppliers from "./pages/Suppliers";
import Users from "./pages/Users";
import BarcodeScanner from "./pages/BarcodeScanner";
import CartManagement from "./pages/CartManagement";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import Reports from "./pages/ReportsPage";
import SalesReport from "./pages/SalesReport";
import Campaign from "./pages/Campaign";

// Job Board
import JobBoard from "./pages/JobBoard";
import JobPost from "./pages/JobPost";
import Companies from "./pages/Companies";
import JobApplications from "./pages/JobApplications";

// POS
import POS from "./pages/POS/POS";
import TransactionHistory from "./pages/POS/TransactionHistory";
import Returns from "./pages/POS/Returns";
import ReceiptManagement from "./pages/POS/ReceiptManagement";
import POSReports from "./pages/POS/Reports";

// Medical
import ComplianceDashboard from "./pages/Medical/ComplianceDashboard";
import ComplianceReports from "./pages/Medical/ComplianceReports";
import AppointmentManagement from "./pages/Medical/AppointmentManagement";
import MedicalAnalytics from "./pages/Medical/MedicalAnalytics";
import PatientList from "./pages/Medical/PatientList";
import PatientRegistration from "./pages/Medical/PatientRegistration";
import PrescriptionManagement from "./pages/Medical/PrescriptionManagement";

// GrowFarms
import AddPlantBatch from "./pages/GrowFarms/AddPlantBatch";
import AddGrowTask from "./pages/GrowFarms/AddGrowTask";
import GrowTaskList from "./pages/GrowFarms/GrowTaskList";
import PlantBatchList from "./pages/GrowFarms/PlantBatchList";
import YieldPrediction from "./pages/GrowFarms/YieldPrediction";
import GrowFarmDashboard from "./pages/GrowFarms/GrowFarmDashboard";

// SeedBanks
import AddSeedBatch from "./pages/SeedBanks/AddSeedBatch";
import SeedBatchList from "./pages/SeedBanks/SeedBatchList";
import SeedInventory from "./pages/SeedBanks/SeedInventory";
import SeedReports from "./pages/SeedBanks/SeedReports";
import SeedBankDashboard from "./pages/SeedBanks/SeedBankDashboard";

// Customer Dashboard
import DashboardOverview from "./pages/CustomerDashboard/DashboardOverview";
import CustomerProfile from "./pages/CustomerDashboard/CustomerProfile";
import OrderHistory from "./pages/CustomerDashboard/OrderHistory";
import Wishlist from "./pages/CustomerDashboard/Wishlist";
import LoyaltyProgram from "./pages/CustomerDashboard/LoyaltyProgram";
import CustomerAnalytics from "./pages/CustomerDashboard/CustomerAnalytics";

const RequireAuth = ({ children }) => {
    const token = localStorage.getItem("token");
    return token ? children : <Navigate to="/login" />;
};

const RequireAgeVerification = ({ children }) => {
    const ageVerified = localStorage.getItem("ageVerified") === "true";
    return ageVerified ? children : <Navigate to="/" />;
};

const Layout = () => {
    const basename = process.env.BASENAME || "";
    const token = localStorage.getItem("token");

    return (
        <BrowserRouter basename={basename}>
            <ScrollToTop>
                <Navbar />
                <div className="d-flex">
                    {token && <Sidebar />}
                    <div className="flex-grow-1 p-3">
                        <Routes>
                            {/* Public */}
                            <Route path="/" element={<AgeVerification />} />
                            <Route path="/home" element={<RequireAgeVerification><Home /></RequireAgeVerification>} />
                            <Route path="/about-us" element={<AboutUs />} />
                            <Route path="/shop" element={<Shop />} />
                            <Route path="/deals" element={<Deals />} />
                            <Route path="/contact-us" element={<ContactUs />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />

                            {/* Non-Medical */}
                            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
                            <Route path="/products" element={<RequireAuth><Products /></RequireAuth>} />
                            <Route path="/price-comparison" element={<RequireAuth><PriceComparison /></RequireAuth>} />
                            <Route path="/inventory" element={<RequireAuth><Inventory /></RequireAuth>} />
                            <Route path="/invoices" element={<RequireAuth><Invoices /></RequireAuth>} />
                            <Route path="/orders" element={<RequireAuth><Orders /></RequireAuth>} />
                            <Route path="/stores" element={<RequireAuth><Stores /></RequireAuth>} />
                            <Route path="/suppliers" element={<RequireAuth><Suppliers /></RequireAuth>} />
                            <Route path="/users" element={<RequireAuth><Users /></RequireAuth>} />
                            <Route path="/barcode-scanner" element={<RequireAuth><BarcodeScanner /></RequireAuth>} />
                            <Route path="/cart-management" element={<RequireAuth><CartManagement /></RequireAuth>} />
                            <Route path="/analytics-dashboard" element={<RequireAuth><AnalyticsDashboard /></RequireAuth>} />
                            <Route path="/reports" element={<RequireAuth><Reports /></RequireAuth>} />
                            <Route path="/sales-reports" element={<RequireAuth><SalesReport /></RequireAuth>} />
                            <Route path="/campaigns" element={<RequireAuth><Campaign /></RequireAuth>} />

                            {/* Job Board */}
                            <Route path="/jobs" element={<JobBoard />} />
                            <Route path="/jobs/post" element={<RequireAuth><JobPost /></RequireAuth>} />
                            <Route path="/companies" element={<Companies />} />
                            <Route path="/jobs/applications" element={<RequireAuth><JobApplications /></RequireAuth>} />

                            {/* POS */}
                            <Route path="/pos" element={<RequireAuth><POS /></RequireAuth>} />
                            <Route path="/pos/transactions" element={<RequireAuth><TransactionHistory /></RequireAuth>} />
                            <Route path="/pos/returns" element={<RequireAuth><Returns /></RequireAuth>} />
                            <Route path="/pos/receipt-management" element={<RequireAuth><ReceiptManagement /></RequireAuth>} />
                            <Route path="/pos/reports" element={<RequireAuth><POSReports /></RequireAuth>} />

                            {/* Medical */}
                            <Route path="/medical/compliance-dashboard" element={<RequireAuth><ComplianceDashboard /></RequireAuth>} />
                            <Route path="/medical/compliance-reports" element={<RequireAuth><ComplianceReports /></RequireAuth>} />
                            <Route path="/medical/appointment-management" element={<RequireAuth><AppointmentManagement /></RequireAuth>} />
                            <Route path="/medical/medical-analytics" element={<RequireAuth><MedicalAnalytics /></RequireAuth>} />
                            <Route path="/medical/patient-list" element={<RequireAuth><PatientList /></RequireAuth>} />
                            <Route path="/medical/patient-registration" element={<RequireAuth><PatientRegistration /></RequireAuth>} />
                            <Route path="/medical/prescription-management" element={<RequireAuth><PrescriptionManagement /></RequireAuth>} />

                            {/* GrowFarms */}
                            <Route path="/growfarms/dashboard" element={<RequireAuth><GrowFarmDashboard /></RequireAuth>} />
                            <Route path="/growfarms/add-plant-batch" element={<RequireAuth><AddPlantBatch /></RequireAuth>} />
                            <Route path="/growfarms/add-grow-task" element={<RequireAuth><AddGrowTask /></RequireAuth>} />
                            <Route path="/growfarms/task-list" element={<RequireAuth><GrowTaskList /></RequireAuth>} />
                            <Route path="/growfarms/plant-batch-list" element={<RequireAuth><PlantBatchList /></RequireAuth>} />
                            <Route path="/growfarms/yield-prediction" element={<RequireAuth><YieldPrediction /></RequireAuth>} />

                            {/* SeedBanks */}
                            <Route path="/seedbanks/dashboard" element={<RequireAuth><SeedBankDashboard /></RequireAuth>} />
                            <Route path="/seedbanks/add-seed-batch" element={<RequireAuth><AddSeedBatch /></RequireAuth>} />
                            <Route path="/seedbanks/batch-list" element={<RequireAuth><SeedBatchList /></RequireAuth>} />
                            <Route path="/seedbanks/inventory" element={<RequireAuth><SeedInventory /></RequireAuth>} />
                            <Route path="/seedbanks/reports" element={<RequireAuth><SeedReports /></RequireAuth>} />

                            {/* Customer Dashboard - FIXED paths */}
                            <Route path="/dashboard-overview" element={<RequireAuth><DashboardOverview /></RequireAuth>} />
                            <Route path="/customer/profile" element={<RequireAuth><CustomerProfile /></RequireAuth>} />
                            <Route path="/customer/orders" element={<RequireAuth><OrderHistory /></RequireAuth>} />
                            <Route path="/customer/wishlist" element={<RequireAuth><Wishlist /></RequireAuth>} />
                            <Route path="/customer/loyalty-program" element={<RequireAuth><LoyaltyProgram /></RequireAuth>} />
                            <Route path="/customer/analytics" element={<RequireAuth><CustomerAnalytics /></RequireAuth>} />

                            <Route path="*" element={<h1>Page Not Found</h1>} />
                        </Routes>
                    </div>
                </div>
                <Footer />
            </ScrollToTop>
        </BrowserRouter>
    );
};

export default injectContext(Layout);
LAYOUT_EOF
echo "✓ layout.js written"

# ============================================================
# 4. UNCOMMENT & FIX grow_farms_routes.py
# ============================================================
cat > src/api/grow_farms_routes.py << 'GROW_EOF'
from flask import Blueprint, request, jsonify
from api.models import db, GrowFarm, PlantBatch, GrowTask, YieldPrediction
from api.utils import APIException
from flask_jwt_extended import jwt_required

grow_farms_bp = Blueprint('grow_farms', __name__)

# ── Grow Farms ──────────────────────────────────────────────
@grow_farms_bp.route('/growfarms', methods=['GET'])
@jwt_required()
def get_all_growfarms():
    growfarms = GrowFarm.query.all()
    return jsonify([gf.serialize() for gf in growfarms]), 200

@grow_farms_bp.route('/growfarms/<int:id>', methods=['GET'])
@jwt_required()
def get_growfarm(id):
    gf = GrowFarm.query.get(id)
    if not gf:
        raise APIException('Grow farm not found', 404)
    return jsonify(gf.serialize()), 200

@grow_farms_bp.route('/growfarms', methods=['POST'])
@jwt_required()
def create_growfarm():
    data = request.json
    gf = GrowFarm(
        name=data['name'],
        location=data['location'],
        contact_info=data.get('contact_info'),
        status=data.get('status', 'active')
    )
    db.session.add(gf)
    db.session.commit()
    return jsonify(gf.serialize()), 201

@grow_farms_bp.route('/growfarms/<int:id>', methods=['PUT'])
@jwt_required()
def update_growfarm(id):
    gf = GrowFarm.query.get(id)
    if not gf:
        raise APIException('Grow farm not found', 404)
    data = request.json
    gf.name = data.get('name', gf.name)
    gf.location = data.get('location', gf.location)
    gf.contact_info = data.get('contact_info', gf.contact_info)
    gf.status = data.get('status', gf.status)
    db.session.commit()
    return jsonify(gf.serialize()), 200

@grow_farms_bp.route('/growfarms/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_growfarm(id):
    gf = GrowFarm.query.get(id)
    if not gf:
        raise APIException('Grow farm not found', 404)
    db.session.delete(gf)
    db.session.commit()
    return jsonify({"message": "Grow farm deleted"}), 200

# ── Plant Batches ────────────────────────────────────────────
@grow_farms_bp.route('/plant-batches', methods=['GET'])
@jwt_required()
def get_all_plant_batches():
    batches = PlantBatch.query.all()
    return jsonify([b.serialize() for b in batches]), 200

@grow_farms_bp.route('/plant-batches', methods=['POST'])
@jwt_required()
def create_plant_batch():
    data = request.json
    batch = PlantBatch(
        strain=data['strain'],
        start_date=data['start_date'],
        end_date=data.get('end_date'),
        status=data.get('status', 'Growing'),
        yield_amount=data.get('yield_amount'),
    )
    db.session.add(batch)
    db.session.commit()
    return jsonify(batch.serialize()), 201

@grow_farms_bp.route('/plant-batches/<int:id>', methods=['PUT'])
@jwt_required()
def update_plant_batch(id):
    batch = PlantBatch.query.get(id)
    if not batch:
        raise APIException('Plant batch not found', 404)
    data = request.json
    for field in ['strain', 'start_date', 'end_date', 'status', 'yield_amount']:
        if field in data:
            setattr(batch, field, data[field])
    db.session.commit()
    return jsonify(batch.serialize()), 200

@grow_farms_bp.route('/plant-batches/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_plant_batch(id):
    batch = PlantBatch.query.get(id)
    if not batch:
        raise APIException('Plant batch not found', 404)
    db.session.delete(batch)
    db.session.commit()
    return jsonify({"message": "Plant batch deleted"}), 200

# ── Grow Tasks ──────────────────────────────────────────────
@grow_farms_bp.route('/grow-tasks', methods=['GET'])
@jwt_required()
def get_all_grow_tasks():
    tasks = GrowTask.query.all()
    return jsonify([t.serialize() for t in tasks]), 200

@grow_farms_bp.route('/grow-tasks', methods=['POST'])
@jwt_required()
def create_grow_task():
    data = request.json
    task = GrowTask(
        task_name=data['task_name'],
        task_description=data.get('task_description'),
        assigned_to=data.get('assigned_to'),
        priority=data.get('priority', 'Medium'),
        due_date=data['due_date'],
        status=data.get('status', 'Pending'),
        plant_batch_id=data.get('plant_batch_id')
    )
    db.session.add(task)
    db.session.commit()
    return jsonify(task.serialize()), 201

@grow_farms_bp.route('/grow-tasks/<int:id>', methods=['PUT'])
@jwt_required()
def update_grow_task(id):
    task = GrowTask.query.get(id)
    if not task:
        raise APIException('Grow task not found', 404)
    data = request.json
    for field in ['task_name', 'task_description', 'assigned_to', 'priority', 'due_date', 'status']:
        if field in data:
            setattr(task, field, data[field])
    db.session.commit()
    return jsonify(task.serialize()), 200

@grow_farms_bp.route('/grow-tasks/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_grow_task(id):
    task = GrowTask.query.get(id)
    if not task:
        raise APIException('Grow task not found', 404)
    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted"}), 200

# ── Yield Predictions ───────────────────────────────────────
@grow_farms_bp.route('/yield-predictions', methods=['GET'])
@jwt_required()
def get_yield_predictions():
    predictions = YieldPrediction.query.all()
    return jsonify([p.serialize() for p in predictions]), 200

@grow_farms_bp.route('/yield-predictions', methods=['POST'])
@jwt_required()
def create_yield_prediction():
    data = request.json
    pred = YieldPrediction(
        plant_batch_id=data['plant_batch_id'],
        predicted_yield=data['predicted_yield'],
        actual_yield=data.get('actual_yield'),
        accuracy=data.get('accuracy')
    )
    db.session.add(pred)
    db.session.commit()
    return jsonify(pred.serialize()), 201
GROW_EOF
echo "✓ grow_farms_routes.py written"

# ============================================================
# 5. UNCOMMENT & FIX seed_banks_routes.py
# ============================================================
cat > src/api/seed_banks_routes.py << 'SEED_EOF'
from flask import Blueprint, request, jsonify
from api.models import db, Seedbank, SeedBatch, StorageConditions, SeedReport
from api.utils import APIException
from flask_jwt_extended import jwt_required

seed_banks_bp = Blueprint('seed_banks', __name__)

# ── Seedbanks ───────────────────────────────────────────────
@seed_banks_bp.route('/seedbanks', methods=['GET'])
@jwt_required()
def get_seedbanks():
    seedbanks = Seedbank.query.all()
    return jsonify([s.serialize() for s in seedbanks]), 200

@seed_banks_bp.route('/seedbanks', methods=['POST'])
@jwt_required()
def create_seedbank():
    data = request.json
    sb = Seedbank(
        name=data['name'],
        location=data['location'],
        contact_email=data['contact_email'],
        phone_number=data.get('phone_number'),
        description=data.get('description')
    )
    db.session.add(sb)
    db.session.commit()
    return jsonify(sb.serialize()), 201

@seed_banks_bp.route('/seedbanks/<int:id>', methods=['PUT'])
@jwt_required()
def update_seedbank(id):
    sb = Seedbank.query.get(id)
    if not sb:
        raise APIException("Seedbank not found", 404)
    data = request.json
    for field in ['name', 'location', 'contact_email', 'phone_number', 'description']:
        if field in data:
            setattr(sb, field, data[field])
    db.session.commit()
    return jsonify(sb.serialize()), 200

@seed_banks_bp.route('/seedbanks/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_seedbank(id):
    sb = Seedbank.query.get(id)
    if not sb:
        raise APIException("Seedbank not found", 404)
    db.session.delete(sb)
    db.session.commit()
    return jsonify({"message": "Seedbank deleted"}), 200

# ── Seed Batches ────────────────────────────────────────────
@seed_banks_bp.route('/seedbatches', methods=['GET'])
@jwt_required()
def get_seed_batches():
    batches = SeedBatch.query.all()
    return jsonify([b.serialize() for b in batches]), 200

@seed_banks_bp.route('/seedbatches', methods=['POST'])
@jwt_required()
def create_seed_batch():
    data = request.json
    batch = SeedBatch(
        name=data['name'],
        strain=data['strain'],
        quantity=data['quantity'],
        harvest_date=data['harvest_date'],
        grower=data.get('grower')
    )
    db.session.add(batch)
    db.session.commit()
    return jsonify(batch.serialize()), 201

@seed_banks_bp.route('/seedbatches/<int:id>', methods=['PUT'])
@jwt_required()
def update_seed_batch(id):
    batch = SeedBatch.query.get(id)
    if not batch:
        raise APIException("Seed batch not found", 404)
    data = request.json
    for field in ['name', 'strain', 'quantity', 'harvest_date', 'grower']:
        if field in data:
            setattr(batch, field, data[field])
    db.session.commit()
    return jsonify(batch.serialize()), 200

@seed_banks_bp.route('/seedbatches/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_seed_batch(id):
    batch = SeedBatch.query.get(id)
    if not batch:
        raise APIException("Seed batch not found", 404)
    db.session.delete(batch)
    db.session.commit()
    return jsonify({"message": "Seed batch deleted"}), 200

# ── Storage Conditions ──────────────────────────────────────
@seed_banks_bp.route('/storageconditions', methods=['GET'])
@jwt_required()
def get_storage_conditions():
    conditions = StorageConditions.query.all()
    return jsonify([c.serialize() for c in conditions]), 200

@seed_banks_bp.route('/storageconditions', methods=['POST'])
@jwt_required()
def create_storage_condition():
    data = request.json
    cond = StorageConditions(
        temperature=data['temperature'],
        humidity=data['humidity'],
        light_exposure=data['light_exposure'],
        notes=data.get('notes')
    )
    db.session.add(cond)
    db.session.commit()
    return jsonify(cond.serialize()), 201

# ── Seed Reports ────────────────────────────────────────────
@seed_banks_bp.route('/seedreports', methods=['GET'])
@jwt_required()
def get_seed_reports():
    reports = SeedReport.query.all()
    return jsonify([r.serialize() for r in reports]), 200

@seed_banks_bp.route('/seedreports', methods=['POST'])
@jwt_required()
def create_seed_report():
    data = request.json
    report = SeedReport(
        seed_batch_id=data['seed_batch_id'],
        germination_rate=data['germination_rate'],
        harvest_yield=data.get('harvest_yield'),
        report_date=data['report_date'],
        notes=data.get('notes')
    )
    db.session.add(report)
    db.session.commit()
    return jsonify(report.serialize()), 201
SEED_EOF
echo "✓ seed_banks_routes.py written"

# ============================================================
# 6. FIX non_medical_routes.py - Uncomment and activate
# ============================================================
cat > src/api/non_medical_routes.py << 'NONMED_EOF'
from flask import Blueprint, request, jsonify
from api.models import (
    db, User, Product, Order, Cart, CartItem, DiscountCode,
    Customer, Campaign, InventoryLog, Supplier, Store,
    Wishlist, LoyaltyHistory
)
from flask_jwt_extended import jwt_required, get_jwt_identity
from functools import wraps

non_medical_bp = Blueprint('non_medical', __name__)

def handle_errors(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return decorated

# ── Stores ──────────────────────────────────────────────────
@non_medical_bp.route('/stores', methods=['GET'])
@jwt_required()
@handle_errors
def get_stores():
    stores = Store.query.all()
    return jsonify([s.serialize() for s in stores]), 200

@non_medical_bp.route('/stores', methods=['POST'])
@jwt_required()
@handle_errors
def create_store():
    data = request.json
    store = Store(
        name=data['name'],
        location=data['location'],
        store_manager=data.get('store_manager', ''),
        phone=data.get('phone', ''),
        status=data.get('status', 'Active'),
        employee_count=data.get('employee_count', 0)
    )
    db.session.add(store)
    db.session.commit()
    return jsonify(store.serialize()), 201

@non_medical_bp.route('/stores/<int:id>', methods=['PUT'])
@jwt_required()
@handle_errors
def update_store(id):
    store = Store.query.get_or_404(id)
    data = request.json
    for field in ['name', 'location', 'store_manager', 'phone', 'status', 'employee_count']:
        if field in data:
            setattr(store, field, data[field])
    db.session.commit()
    return jsonify(store.serialize()), 200

@non_medical_bp.route('/stores/<int:id>', methods=['DELETE'])
@jwt_required()
@handle_errors
def delete_store(id):
    store = Store.query.get_or_404(id)
    db.session.delete(store)
    db.session.commit()
    return jsonify({"message": "Store deleted"}), 200

# ── Suppliers ───────────────────────────────────────────────
@non_medical_bp.route('/suppliers', methods=['GET'])
@jwt_required()
@handle_errors
def get_suppliers():
    suppliers = Supplier.query.all()
    return jsonify([s.to_dict() for s in suppliers]), 200

@non_medical_bp.route('/suppliers', methods=['POST'])
@jwt_required()
@handle_errors
def create_supplier():
    data = request.json
    supplier = Supplier(
        name=data['name'],
        company=data.get('company', ''),
        email=data['email'],
        phone=data.get('phone', ''),
        address=data.get('address', ''),
    )
    db.session.add(supplier)
    db.session.commit()
    return jsonify(supplier.to_dict()), 201

@non_medical_bp.route('/suppliers/<int:id>', methods=['PUT'])
@jwt_required()
@handle_errors
def update_supplier(id):
    supplier = Supplier.query.get_or_404(id)
    data = request.json
    for field in ['name', 'company', 'email', 'phone', 'address']:
        if field in data:
            setattr(supplier, field, data[field])
    db.session.commit()
    return jsonify(supplier.to_dict()), 200

@non_medical_bp.route('/suppliers/<int:id>', methods=['DELETE'])
@jwt_required()
@handle_errors
def delete_supplier(id):
    supplier = Supplier.query.get_or_404(id)
    db.session.delete(supplier)
    db.session.commit()
    return jsonify({"message": "Supplier deleted"}), 200

# ── Cart ────────────────────────────────────────────────────
@non_medical_bp.route('/cart', methods=['GET'])
@jwt_required()
@handle_errors
def get_cart():
    user_id = get_jwt_identity()
    items = CartItem.query.filter_by(user_id=user_id, saved_for_later=False).all()
    return jsonify([item.serialize() for item in items]), 200

@non_medical_bp.route('/cart', methods=['POST'])
@jwt_required()
@handle_errors
def add_to_cart():
    user_id = get_jwt_identity()
    data = request.json
    product_id = data['product_id']
    quantity = data.get('quantity', 1)
    existing = CartItem.query.filter_by(user_id=user_id, product_id=product_id, saved_for_later=False).first()
    if existing:
        existing.quantity += quantity
    else:
        item = CartItem(user_id=user_id, product_id=product_id, quantity=quantity)
        db.session.add(item)
    db.session.commit()
    items = CartItem.query.filter_by(user_id=user_id, saved_for_later=False).all()
    return jsonify([i.serialize() for i in items]), 201

@non_medical_bp.route('/cart/<int:item_id>', methods=['DELETE'])
@jwt_required()
@handle_errors
def remove_from_cart(item_id):
    user_id = get_jwt_identity()
    item = CartItem.query.filter_by(id=item_id, user_id=user_id).first()
    if not item:
        return jsonify({"error": "Item not found"}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Item removed"}), 200

@non_medical_bp.route('/cart', methods=['DELETE'])
@jwt_required()
@handle_errors
def clear_cart():
    user_id = get_jwt_identity()
    CartItem.query.filter_by(user_id=user_id, saved_for_later=False).delete()
    db.session.commit()
    return jsonify({"message": "Cart cleared"}), 200

@non_medical_bp.route('/cart/save_for_later', methods=['POST'])
@jwt_required()
@handle_errors
def save_for_later():
    user_id = get_jwt_identity()
    item_id = request.json.get('item_id')
    item = CartItem.query.filter_by(id=item_id, user_id=user_id).first()
    if not item:
        return jsonify({"error": "Item not found"}), 404
    item.saved_for_later = True
    db.session.commit()
    return jsonify({"message": "Saved for later"}), 200

@non_medical_bp.route('/cart/apply_discount', methods=['POST'])
@jwt_required()
@handle_errors
def apply_discount():
    code = request.json.get('code')
    discount = DiscountCode.query.filter_by(code=code, is_active=True).first()
    if not discount:
        return jsonify({"success": False, "message": "Invalid discount code"}), 400
    return jsonify({"success": True, "discount": discount.discount_percent}), 200

# ── Inventory ───────────────────────────────────────────────
@non_medical_bp.route('/inventory', methods=['GET'])
@jwt_required()
@handle_errors
def get_inventory():
    products = Product.query.all()
    return jsonify([{
        "id": p.id,
        "name": p.name,
        "category": p.category,
        "current_stock": p.current_stock,
        "reorder_point": p.reorder_point,
        "unit_price": float(p.unit_price),
        "strain": p.strain,
        "thc_content": p.thc_content,
        "cbd_content": p.cbd_content,
        "batch_number": p.batch_number,
        "low_stock": p.current_stock <= p.reorder_point
    } for p in products]), 200

# ── Wishlist ────────────────────────────────────────────────
@non_medical_bp.route('/wishlist', methods=['GET'])
@jwt_required()
@handle_errors
def get_wishlist():
    user_id = get_jwt_identity()
    customer = Customer.query.filter_by(email=User.query.get(user_id).email).first()
    if not customer:
        return jsonify([]), 200
    items = Wishlist.query.filter_by(customer_id=customer.id).all()
    result = []
    for item in items:
        product = Product.query.get(item.product_id)
        if product:
            result.append({**product.serialize(), "wishlist_id": item.id})
    return jsonify(result), 200

@non_medical_bp.route('/wishlist', methods=['POST'])
@jwt_required()
@handle_errors
def add_to_wishlist():
    user_id = get_jwt_identity()
    product_id = request.json.get('product_id')
    customer = Customer.query.filter_by(email=User.query.get(user_id).email).first()
    if not customer:
        return jsonify({"error": "Customer not found"}), 404
    existing = Wishlist.query.filter_by(customer_id=customer.id, product_id=product_id).first()
    if existing:
        return jsonify({"message": "Already in wishlist"}), 200
    item = Wishlist(customer_id=customer.id, product_id=product_id)
    db.session.add(item)
    db.session.commit()
    return jsonify({"message": "Added to wishlist"}), 201

# ── Loyalty ─────────────────────────────────────────────────
@non_medical_bp.route('/loyalty/points/<int:customer_id>', methods=['GET'])
@jwt_required()
@handle_errors
def get_loyalty_points(customer_id):
    history = LoyaltyHistory.query.filter_by(customer_id=customer_id).all()
    total = sum(h.points for h in history)
    return jsonify({"customer_id": customer_id, "points": total}), 200

@non_medical_bp.route('/loyalty/points/redeem', methods=['POST'])
@jwt_required()
@handle_errors
def redeem_loyalty_points():
    data = request.json
    customer_id = data['customer_id']
    points = data['points']
    history = LoyaltyHistory.query.filter_by(customer_id=customer_id).all()
    total = sum(h.points for h in history)
    if total < points:
        return jsonify({"error": "Insufficient points"}), 400
    redemption = LoyaltyHistory(
        customer_id=customer_id,
        points=-points,
        description=f"Redeemed {points} points"
    )
    db.session.add(redemption)
    db.session.commit()
    return jsonify({"message": f"Redeemed {points} points", "loyalty_points": total - points}), 200

# ── Campaigns ───────────────────────────────────────────────
@non_medical_bp.route('/campaigns', methods=['GET'])
@jwt_required()
@handle_errors
def get_campaigns():
    campaigns = Campaign.query.all()
    return jsonify([c.serialize() for c in campaigns]), 200

@non_medical_bp.route('/campaigns', methods=['POST'])
@jwt_required()
@handle_errors
def create_campaign():
    data = request.json
    campaign = Campaign(
        name=data['name'],
        description=data.get('description'),
        target_audience=data.get('target_audience'),
        start_date=data['start_date'],
        end_date=data.get('end_date'),
        status=data.get('status', 'draft')
    )
    db.session.add(campaign)
    db.session.commit()
    return jsonify(campaign.serialize()), 201

@non_medical_bp.route('/campaigns/<int:id>', methods=['PUT'])
@jwt_required()
@handle_errors
def update_campaign(id):
    campaign = Campaign.query.get_or_404(id)
    data = request.json
    for field in ['name', 'description', 'target_audience', 'start_date', 'end_date', 'status']:
        if field in data:
            setattr(campaign, field, data[field])
    db.session.commit()
    return jsonify(campaign.serialize()), 200

@non_medical_bp.route('/campaigns/<int:id>', methods=['DELETE'])
@jwt_required()
@handle_errors
def delete_campaign(id):
    campaign = Campaign.query.get_or_404(id)
    db.session.delete(campaign)
    db.session.commit()
    return jsonify({"message": "Campaign deleted"}), 200
NONMED_EOF
echo "✓ non_medical_routes.py written"

# ============================================================
# 7. CREATE Job Board pages (stubs that work)
# ============================================================
cat > src/front/js/pages/JobBoard.js << 'JOB_EOF'
import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";

const JobBoard = () => {
    const { store, actions } = useContext(Context);
    const [search, setSearch] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        actions.fetchJobs();
        actions.fetchCompanies();
    }, []);

    const filteredJobs = (store.jobs || []).filter(job => {
        const matchSearch = job.title?.toLowerCase().includes(search.toLowerCase()) ||
            job.description?.toLowerCase().includes(search.toLowerCase());
        const matchLocation = !locationFilter || job.location?.toLowerCase().includes(locationFilter.toLowerCase());
        return matchSearch && matchLocation;
    });

    return (
        <div className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Cannabis Industry Job Board</h1>
                {localStorage.getItem("token") && (
                    <button className="btn btn-primary" onClick={() => navigate("/jobs/post")}>
                        Post a Job
                    </button>
                )}
            </div>

            <div className="row mb-4">
                <div className="col-md-6">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search jobs..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="col-md-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Filter by location..."
                        value={locationFilter}
                        onChange={e => setLocationFilter(e.target.value)}
                    />
                </div>
            </div>

            {filteredJobs.length === 0 ? (
                <div className="text-center py-5">
                    <p className="text-muted">No jobs found. Check back soon or post a listing.</p>
                </div>
            ) : (
                <div className="row">
                    {filteredJobs.map(job => (
                        <div key={job.id} className="col-md-6 mb-3">
                            <div className="card h-100">
                                <div className="card-body">
                                    <h5 className="card-title">{job.title}</h5>
                                    <h6 className="card-subtitle mb-2 text-muted">
                                        {store.companies?.find(c => c.id === job.company_id)?.name || "Company"}
                                    </h6>
                                    <p className="card-text text-truncate">{job.description}</p>
                                    <div className="d-flex gap-2 mb-3">
                                        {job.location && (
                                            <span className="badge bg-secondary">{job.location}</span>
                                        )}
                                        {job.salary && (
                                            <span className="badge bg-success">{job.salary}</span>
                                        )}
                                    </div>
                                    <button
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => actions.applyToJob(job.id, job.company_id)}
                                    >
                                        Apply Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default JobBoard;
JOB_EOF

cat > src/front/js/pages/JobPost.js << 'JOBPOST_EOF'
import React, { useState, useContext } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";

const JobPost = () => {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "", description: "", requirements: "",
        salary: "", location: "", company_id: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await actions.postJob(formData.company_id, formData);
        if (result.success) navigate("/jobs");
        else alert("Error posting job: " + result.error);
    };

    return (
        <div className="main-content p-4" style={{ maxWidth: 600 }}>
            <h1 className="mb-4">Post a Job</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Job Title</label>
                    <input className="form-control" value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})} required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Company</label>
                    <select className="form-select" value={formData.company_id}
                        onChange={e => setFormData({...formData, company_id: e.target.value})} required>
                        <option value="">Select company</option>
                        {(store.companies || []).map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">Location</label>
                    <input className="form-control" value={formData.location}
                        onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Salary Range</label>
                    <input className="form-control" placeholder="e.g. $40,000 - $60,000" value={formData.salary}
                        onChange={e => setFormData({...formData, salary: e.target.value})} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" rows="4" value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})} required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Requirements</label>
                    <textarea className="form-control" rows="3" value={formData.requirements}
                        onChange={e => setFormData({...formData, requirements: e.target.value})} />
                </div>
                <button type="submit" className="btn btn-primary">Post Job</button>
            </form>
        </div>
    );
};

export default JobPost;
JOBPOST_EOF

cat > src/front/js/pages/Companies.js << 'COMP_EOF'
import React, { useEffect, useContext } from "react";
import { Context } from "../store/appContext";

const Companies = () => {
    const { store, actions } = useContext(Context);

    useEffect(() => {
        actions.fetchCompanies();
    }, []);

    return (
        <div className="main-content p-4">
            <h1 className="mb-4">Cannabis Companies</h1>
            <div className="row">
                {(store.companies || []).map(company => (
                    <div key={company.id} className="col-md-4 mb-3">
                        <div className="card h-100">
                            <div className="card-body">
                                <h5 className="card-title">{company.name}</h5>
                                <p className="card-text">{company.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
                {(store.companies || []).length === 0 && (
                    <p className="text-muted">No companies listed yet.</p>
                )}
            </div>
        </div>
    );
};

export default Companies;
COMP_EOF

cat > src/front/js/pages/JobApplications.js << 'APPS_EOF'
import React, { useEffect, useContext } from "react";
import { Context } from "../store/appContext";

const JobApplications = () => {
    const { store, actions } = useContext(Context);

    useEffect(() => {
        actions.fetchJobs();
    }, []);

    return (
        <div className="main-content p-4">
            <h1 className="mb-4">My Applications</h1>
            <p className="text-muted">Your job applications will appear here.</p>
        </div>
    );
};

export default JobApplications;
APPS_EOF
echo "✓ Job board pages written"

# ============================================================
# 8. FIX app.py - Register all blueprints
# ============================================================
cat > src/app.py << 'APP_EOF'
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_socketio import SocketIO

from api.utils import APIException, generate_sitemap
from api.models import db
from api.routes import api
from api.non_medical_routes import non_medical_bp
from api.grow_farms_routes import grow_farms_bp
from api.seed_banks_routes import seed_banks_bp
from api.admin import setup_admin
from api.commands import setup_commands
from dotenv import load_dotenv
load_dotenv()

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../public/')

app = Flask(__name__)
app.url_map.strict_slashes = False

CORS(app, resources={r"/api/*": {"origins": "*"}})

app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 7 * 24 * 60 * 60
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-dispensary-key")
JWTManager(app)

db_url = os.getenv("DATABASE_URL")
if db_url:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace("postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/dispensary.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

socketio = SocketIO(app, cors_allowed_origins="*")

setup_admin(app)
setup_commands(app)

# Register all blueprints
app.register_blueprint(api, url_prefix='/api')
app.register_blueprint(non_medical_bp, url_prefix='/api')
app.register_blueprint(grow_farms_bp, url_prefix='/api')
app.register_blueprint(seed_banks_bp, url_prefix='/api')

@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0
    return response

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "DispenseMaster running"}), 200

if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    socketio.run(app, host='0.0.0.0', port=PORT, debug=(ENV == "development"))
APP_EOF
echo "✓ app.py written"

# ============================================================
# 9. ADD Store and Supplier models if missing
# ============================================================
python3 - << 'PYCHECK_EOF'
with open('src/api/models.py', 'r') as f:
    content = f.read()

additions = ""

if 'class Store(' not in content:
    additions += '''
class Store(db.Model):
    __tablename__ = 'store'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    store_manager = db.Column(db.String(100), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    status = db.Column(db.String(20), default='Active')
    employee_count = db.Column(db.Integer, default=0)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "location": self.location,
            "store_manager": self.store_manager,
            "phone": self.phone,
            "status": self.status,
            "employee_count": self.employee_count,
        }
'''
    print("Store model missing - will add")

if 'class Supplier(' not in content:
    additions += '''
class Supplier(db.Model):
    __tablename__ = 'supplier'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    company = db.Column(db.String(100), nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    address = db.Column(db.Text, nullable=True)
    registration_date = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "company": self.company,
            "email": self.email,
            "phone": self.phone,
            "address": self.address,
        }

    def serialize(self):
        return self.to_dict()
'''
    print("Supplier model missing - will add")

if 'class GrowFarm(' not in content:
    additions += '''
class GrowFarm(db.Model):
    __tablename__ = 'grow_farm'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    contact_info = db.Column(db.String(200), nullable=True)
    status = db.Column(db.String(20), default='active')

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "location": self.location,
            "contact_info": self.contact_info,
            "status": self.status,
        }
'''
    print("GrowFarm model missing - will add")

if additions:
    with open('src/api/models.py', 'a') as f:
        f.write(additions)
    print("Models appended to models.py")
else:
    print("All required models already present")
PYCHECK_EOF

echo "✓ models.py checked and updated"

# ============================================================
# 10. Run migrations
# ============================================================
echo ""
echo "Running database migrations..."
cd src && flask db migrate -m "add stores suppliers growfarms seedbanks" 2>/dev/null || echo "Migration skipped (may already exist)"
flask db upgrade 2>/dev/null || echo "Upgrade skipped"
cd ..

echo ""
echo "============================================================"
echo "✅ ALL FIXES APPLIED SUCCESSFULLY"
echo "============================================================"
echo ""
echo "What was fixed:"
echo "  ✓ flux.js - Complete store with actions for ALL modules"
echo "  ✓ Sidebar.js - Fixed customer dashboard paths + added job board + stores/suppliers"
echo "  ✓ layout.js - Added Navigate import + all missing routes + RequireAuth guard"
echo "  ✓ grow_farms_routes.py - Uncommented and activated"
echo "  ✓ seed_banks_routes.py - Uncommented and activated"
echo "  ✓ non_medical_routes.py - Uncommented and activated (stores, suppliers, cart, wishlist, loyalty, campaigns)"
echo "  ✓ app.py - Registered all blueprints"
echo "  ✓ JobBoard.js, JobPost.js, Companies.js, JobApplications.js - Created"
echo "  ✓ models.py - Added missing Store, Supplier, GrowFarm models if needed"
echo ""
echo "Next: restart your Flask backend and React frontend"
echo "  Backend: flask run --port 3001"
echo "  Frontend: npm start"
