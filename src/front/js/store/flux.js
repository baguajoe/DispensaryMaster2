const getState = ({ getStore, getActions, setStore }) => {
    return {
        store: {
            token: localStorage.getItem("token") || null,
            currentUser: JSON.parse(localStorage.getItem("currentUser")) || null,
            message: null,
            products: [],
            stores: [],

        },
        actions: {
            // Use getActions to call a function within a fuction
            // ****************** PRODUCTS ******************
            // ****************** PRODUCTS ******************
            // ****************** PRODUCTS ******************
            fetchProducts: async () => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) throw new Error('Authentication required');

                    const response = await fetch(process.env.BACKEND_URL + '/api/products', {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        if (response.status === 422) {
                            const errorData = await response.json();
                            throw new Error(errorData.message || 'Validation error occurred');
                        }
                        throw new Error('Failed to fetch products');
                    }

                    const data = await response.json();
                    setStore({ products: data.products || [] });
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            // Add new product
            addProduct: async (productData) => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) throw new Error('Authentication required');

                    const response = await fetch(process.env.BACKEND_URL + '/api/products', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ product: productData }),
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Failed to add product');
                    }

                    // Refresh products list
                    await getActions().fetchProducts();
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            // Edit product
            editProduct: async (productId, productData) => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) throw new Error('Authentication required');

                    const response = await fetch(`${process.env.BACKEND_URL}/api/products/${productId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ product: productData }),
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Failed to update product');
                    }

                    // Refresh products list
                    await getActions().fetchProducts();
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            // Delete product
            deleteProduct: async (productId) => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) throw new Error('Authentication required');

                    const response = await fetch(`${process.env.BACKEND_URL}/api/products/${productId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Failed to delete product');
                    }

                    // Refresh products list
                    await getActions().fetchProducts();
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            // ****************** STORES ******************
            // ****************** STORES ******************
            // ****************** STORES ******************
            fetchStores: async () => {
                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/api/store`, {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${localStorage.getItem("token")}`
                        }
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    const storesArray = Array.isArray(data) ? data : (data.stores || data.data || []);

                    setStore({ stores: storesArray });
                    return { success: true };
                } catch (error) {
                    console.error("Error fetching stores:", error);
                    return { success: false, error: error.message };
                }
            },

            addStore: async (storeData) => {
                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/api/store`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${localStorage.getItem("token")}`
                        },
                        body: JSON.stringify(storeData)
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    return { success: true, data };
                } catch (error) {
                    console.error("Error adding store:", error);
                    return { success: false, error: error.message };
                }
            },

            editStore: async (storeId, storeData) => {
                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/api/store/${storeId}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${localStorage.getItem("token")}`
                        },
                        body: JSON.stringify(storeData)
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    return { success: true, data };
                } catch (error) {
                    console.error("Error editing store:", error);
                    return { success: false, error: error.message };
                }
            },

            deleteStore: async (storeId) => {
                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/api/store/${storeId}`, {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${localStorage.getItem("token")}`
                        }
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                    }

                    return { success: true };
                } catch (error) {
                    console.error("Error deleting store:", error);
                    return { success: false, error: error.message };
                }
            },

            // ****************** ORDERS ******************
            // ****************** ORDERS ******************
            // ****************** ORDERS ******************
            fetchOrders: async () => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) throw new Error('Authentication required');

                    const response = await fetch(process.env.BACKEND_URL + '/api/orders', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        if (response.status === 422) {
                            const errorData = await response.json();
                            throw new Error(errorData.message || 'Validation error occurred');
                        }
                        throw new Error('Failed to fetch orders');
                    }

                    const data = await response.json();
                    setStore({ orders: data });
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            addOrder: async (orderData) => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) throw new Error('Authentication required');

                    const response = await fetch(process.env.BACKEND_URL + '/api/orders', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(orderData),
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Failed to add order');
                    }

                    await getActions().fetchOrders();
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            editOrder: async (orderId, orderData) => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) throw new Error('Authentication required');

                    const response = await fetch(`${process.env.BACKEND_URL}/api/orders/${orderId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(orderData),
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Failed to update order');
                    }

                    await getActions().fetchOrders();
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            deleteOrder: async (orderId) => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) throw new Error('Authentication required');

                    const response = await fetch(`${process.env.BACKEND_URL}/api/orders/${orderId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Failed to delete order');
                    }

                    await getActions().fetchOrders();
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            }

        }
    };
};

export default getState;
