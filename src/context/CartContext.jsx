import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import config from '../config/config';
import { useNotification } from './NotificationContext';

// Use the getApiUrl method from config
const API_URL = config.getApiUrl();

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [cartOpen, setCartOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showSuccess, showError, showInfo } = useNotification();

    // Fetch cart from API on mount and when user logs in
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchCart();
        } else {
            // If no token, try to get cart from localStorage
            const savedCart = localStorage.getItem('cart');
            setCart(savedCart ? JSON.parse(savedCart) : []);
            setLoading(false);
        }
    }, []);

    // Save cart to localStorage when it changes (for non-authenticated users)
    useEffect(() => {
        if (!localStorage.getItem('token')) {
            localStorage.setItem('cart', JSON.stringify(cart));
        }
    }, [cart]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token');
            }

            const response = await fetch(`${API_URL}/cart`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch cart');
            }

            const data = await response.json();
            setCart(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch cart');
            console.error('Error fetching cart:', err);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = useCallback((product, quantity = 1) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            
            if (existingItem) {
                const newQuantity = existingItem.quantity + quantity;
                showSuccess(`Cantitatea pentru ${product.name} a fost actualizată în coș`);
                return prevCart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: newQuantity }
                        : item
                );
            } else {
                showSuccess(`${product.name} a fost adăugat în coș`);
                return [...prevCart, { ...product, quantity }];
            }
        });
    }, [showSuccess]);

    const removeFromCart = useCallback((productId) => {
        setCart(prevCart => {
            const item = prevCart.find(item => item.id === productId);
            if (item) {
                showInfo(`${item.name} a fost eliminat din coș`);
            }
            return prevCart.filter(item => item.id !== productId);
        });
    }, [showInfo]);

    const updateQuantity = useCallback((productId, quantity) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }

        setCart(prevCart => {
            const item = prevCart.find(item => item.id === productId);
            if (item) {
                showSuccess(`Cantitatea pentru ${item.name} a fost actualizată`);
            }
            return prevCart.map(item =>
                item.id === productId
                    ? { ...item, quantity }
                    : item
            );
        });
    }, [removeFromCart, showSuccess]);

    const clearCart = useCallback(() => {
        setCart([]);
        showInfo('Coșul a fost golit');
    }, [showInfo]);

    const getCartTotal = useCallback(() => {
        return cart.reduce((total, item) => {
            const price = parseFloat(item.price);
            const quantity = parseInt(item.quantity);
            return total + (price * quantity);
        }, 0);
    }, [cart]);

    const getCartItemCount = useCallback(() => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    }, [cart]);

    const toggleCart = () => {
        setCartOpen(prev => !prev);
    };

    const value = {
        cart,
        cartOpen,
        loading,
        error,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount,
        toggleCart,
        refreshCart: fetchCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}; 