import config from '../config/config';

// Use the getApiUrl method from config
const API_URL = config.getApiUrl();

// Cart operations
let cart = [];

// Products operations
export const getProducts = async () => {
    try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        const products = await response.json();
        return products.map(product => ({
            ...product,
            inStock: product.stock > 0
        }));
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

export const getProductById = async (id) => {
    try {
        const response = await fetch(`${API_URL}/products/${id}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        const product = await response.json();
        return {
            ...product,
            inStock: product.stock > 0
        };
    } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
    }
};

export const getProductsByCategory = async (category) => {
    try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        const products = await response.json();
        const filteredProducts = category === 'all' 
            ? products 
            : products.filter(p => p.category === category);
        
        return filteredProducts.map(product => ({
            ...product,
            inStock: product.stock > 0
        }));
    } catch (error) {
        console.error('Error fetching products by category:', error);
        throw error;
    }
};

export const searchProducts = async (query) => {
    try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        const products = await response.json();
        const searchQuery = query.toLowerCase();
        
        return products.filter(product => 
            product.name.toLowerCase().includes(searchQuery) ||
            product.description.toLowerCase().includes(searchQuery) ||
            product.category.toLowerCase().includes(searchQuery)
        );
    } catch (error) {
        console.error('Error searching products:', error);
        throw error;
    }
};

// Cart operations
export const getCart = async () => {
    try {
        const response = await fetch(`${API_URL}/cart`);
        if (!response.ok) throw new Error('Failed to fetch cart');
        return await response.json();
    } catch (error) {
        console.error('Error fetching cart:', error);
        throw error;
    }
};

export const addToCart = async (productId, quantity = 1) => {
    try {
        const response = await fetch(`${API_URL}/cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ product_id: productId, quantity })
        });
        if (!response.ok) throw new Error('Failed to add to cart');
        return await response.json();
    } catch (error) {
        console.error('Error adding to cart:', error);
        throw error;
    }
};

export const removeFromCart = async (cartItemId) => {
    try {
        const response = await fetch(`${API_URL}/cart/${cartItemId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to remove from cart');
        return await response.json();
    } catch (error) {
        console.error('Error removing from cart:', error);
        throw error;
    }
};

// Mock data for orders and leads
const mockOrders = [];
const mockLeads = [
    {
        id: 1,
        name: "Ion Popescu",
        phone: "079123456",
        source: {
            path: "/products/garden",
            product: { name: "Set mobilier gradina" }
        },
        status: "new",
        createdAt: new Date().toISOString(),
        notifications: { isNew: true },
        orderDetails: {
            price: 0,
            callerName: "",
            notes: "",
            completedAt: null
        }
    }
];

// Order operations
export const addOrder = async (orderData) => {
    try {
        console.log('Sending order data to server:', orderData);

        // Validate required fields
        if (!orderData.customer_name?.trim()) {
            throw new Error('Customer name is required');
        }
        if (!orderData.customer_email?.trim()) {
            throw new Error('Customer email is required');
        }
        if (!orderData.shipping_address?.trim()) {
            throw new Error('Shipping address is required');
        }
        if (!orderData.items?.length) {
            throw new Error('Order must contain at least one item');
        }
        if (!orderData.total_amount || isNaN(parseFloat(orderData.total_amount)) || parseFloat(orderData.total_amount) <= 0) {
            throw new Error('Invalid total amount');
        }

        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });

        console.log('Server response status:', response.status);
        const data = await response.json();
        console.log('Server response data:', data);

        if (!response.ok) {
            throw new Error(data.error || 'Failed to create order');
        }

        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error('Error in addOrder:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

export const getOrders = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Nu sunteți autentificat');
        }

        const response = await fetch(`${API_URL}/admin/orders`, {
            headers: {
                'Authorization': token
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Sesiunea a expirat. Vă rugăm să vă autentificați din nou.');
            }
            throw new Error('Failed to fetch orders');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};

// Lead operations
export const addLead = async (leadData) => {
    const lead = {
        ...leadData,
        id: Date.now(),
        status: 'new',
        createdAt: new Date().toISOString(),
        notifications: { isNew: true },
        orderDetails: {
            price: 0,
            callerName: '',
            notes: '',
            completedAt: null
        }
    };
    mockLeads.push(lead);
    return lead;
};

export const getLeads = async () => {
    return mockLeads;
};

export const updateLead = async (id, updates) => {
    const lead = mockLeads.find(l => l.id === id);
    if (lead) {
        Object.assign(lead, updates);
        if (updates.status === 'completed' && !lead.orderDetails.completedAt) {
            lead.orderDetails.completedAt = new Date().toISOString();
        }
    }
    return lead;
};

export const deleteLead = async (id) => {
    const index = mockLeads.findIndex(l => l.id === id);
    if (index !== -1) {
        mockLeads.splice(index, 1);
    }
    return true;
};

export const markLeadAsViewed = async (id) => {
    const lead = mockLeads.find(l => l.id === id);
    if (lead) {
        lead.notifications.isNew = false;
        lead.status = lead.status === 'new' ? 'viewed' : lead.status;
    }
    return lead;
};

export const getNewLeadsCount = async () => {
    return mockLeads.filter(lead => lead.notifications.isNew).length;
};

// Statistics
export const getStatistics = async () => {
    try {
        const response = await fetch(`${API_URL}/admin/statistics`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch statistics');
        return await response.json();
    } catch (error) {
        console.error('Error fetching statistics:', error);
        throw error;
    }
};

// Product Management
export const addProduct = async (product) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Nu sunteți autentificat');
        }

        const response = await fetch(`${API_URL}/admin/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(product)
        });
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Sesiunea a expirat. Vă rugăm să vă autentificați din nou.');
            }
            throw new Error('Failed to add product');
        }
        return await response.json();
    } catch (error) {
        console.error('Error adding product:', error);
        throw error;
    }
};

export const updateProduct = async (id, productData) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Nu sunteți autentificat');
        }

        const response = await fetch(`${API_URL}/admin/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(productData)
        });
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Sesiunea a expirat. Vă rugăm să vă autentificați din nou.');
            }
            throw new Error('Failed to update product');
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
};

export const deleteProduct = async (id) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Nu sunteți autentificat');
        }

        const response = await fetch(`${API_URL}/admin/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token
            }
        });
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Sesiunea a expirat. Vă rugăm să vă autentificați din nou.');
            }
            throw new Error('Failed to delete product');
        }
        return await response.json();
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
};

export const getAdminOrders = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Nu sunteți autentificat');
        }

        const response = await fetch(`${API_URL}/admin/orders`, {
            headers: {
                'Authorization': token
            }
        });
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Sesiunea a expirat. Vă rugăm să vă autentificați din nou.');
            }
            throw new Error('Failed to fetch orders');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};

export const updateOrderStatus = async (orderId, status) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Nu sunteți autentificat');
        }

        const response = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({ status })
        });
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Sesiunea a expirat. Vă rugăm să vă autentificați din nou.');
            }
            throw new Error('Failed to update order status');
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
};

export const getAdminStatistics = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Nu sunteți autentificat');
        }

        const response = await fetch(`${API_URL}/admin/statistics`, {
            headers: {
                'Authorization': token
            }
        });
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Sesiunea a expirat. Vă rugăm să vă autentificați din nou.');
            }
            throw new Error('Failed to fetch statistics');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching statistics:', error);
        throw error;
    }
};