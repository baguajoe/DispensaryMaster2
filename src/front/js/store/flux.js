const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			token: localStorage.getItem("token") || null,
			currentUser: JSON.parse(localStorage.getItem("currentUser")) || null,
			message: null,
            products: [],
			
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
            }
		}
	};
};

export default getState;
