import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaArrowLeft, FaShoppingCart } from 'react-icons/fa';
import config from '../config/config';
import './Cart.css';

// Use the getApiUrl method from config
const API_URL = config.getApiUrl();

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/cart`);
            if (!response.ok) throw new Error('Failed to fetch cart');
            const items = await response.json();
            setCartItems(items);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Error loading cart:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId, newQuantity) => {
        try {
            const response = await fetch(`${API_URL}/cart/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quantity: newQuantity })
            });

            if (!response.ok) throw new Error('Failed to update quantity');
            await loadCart();
        } catch (err) {
            setError(err.message);
            console.error('Error updating quantity:', err);
        }
    };

    const removeItem = async (itemId) => {
        try {
            const response = await fetch(`${API_URL}/cart/${itemId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to remove item');
            await loadCart();
        } catch (err) {
            setError(err.message);
            console.error('Error removing item:', err);
        }
    };

    const clearCart = async () => {
        try {
            const response = await fetch(`${API_URL}/cart`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to clear cart');
            await loadCart();
        } catch (err) {
            setError(err.message);
            console.error('Error clearing cart:', err);
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="loader"></div>
                <p>Se încarcă coșul...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error">
                <p>{error}</p>
                <button onClick={loadCart} className="retry-button">
                    Încearcă din nou
                </button>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="empty-cart">
                <FaShoppingCart className="empty-cart-icon" />
                <h2>Coșul tău este gol</h2>
                <p>Adaugă produse în coș pentru a continua cumpărăturile</p>
                <button 
                    onClick={() => navigate('/')}
                    className="continue-shopping-button"
                >
                    Continuă cumpărăturile
                </button>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="cart-container">
                <div className="cart-header">
                    <h1>Coșul meu</h1>
                    <button 
                        onClick={clearCart}
                        className="clear-cart-button"
                    >
                        Golește coșul
                    </button>
                </div>

                <div className="cart-items">
                    {cartItems.map(item => (
                        <div key={item.id} className="cart-item">
                            <img 
                                src={`/uploads/products/${item.image_url}`}
                                alt={item.name}
                                className="item-image"
                            />
                            
                            <div className="item-details">
                                <h3>{item.name}</h3>
                                <p className="item-price">{item.price} MDL</p>
                            </div>

                            <div className="quantity-controls">
                                <button
                                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                    disabled={item.quantity <= 1}
                                >
                                    -
                                </button>
                                <span>{item.quantity}</span>
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    disabled={item.quantity >= item.stock}
                                >
                                    +
                                </button>
                            </div>

                            <div className="item-total">
                                {(item.price * item.quantity).toFixed(2)} MDL
                            </div>

                            <button
                                onClick={() => removeItem(item.id)}
                                className="remove-item-button"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="cart-summary">
                    <div className="summary-row">
                        <span>Subtotal:</span>
                        <span>{calculateTotal().toFixed(2)} MDL</span>
                    </div>
                    <div className="summary-row">
                        <span>Transport:</span>
                        <span>Gratuit</span>
                    </div>
                    <div className="summary-row total">
                        <span>Total:</span>
                        <span>{calculateTotal().toFixed(2)} MDL</span>
                    </div>

                    <div className="cart-actions">
                        <button 
                            onClick={() => navigate('/')}
                            className="continue-shopping-button"
                        >
                            <FaArrowLeft />
                            Continuă cumpărăturile
                        </button>
                        <button 
                            onClick={() => navigate('/checkout')}
                            className="checkout-button"
                        >
                            Finalizează comanda
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
