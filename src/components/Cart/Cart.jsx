import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaTrash, FaMinus, FaPlus, FaTimes } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import './Cart.css';

const Cart = () => {
    const navigate = useNavigate();
    const {
        cart,
        cartOpen,
        toggleCart,
        removeFromCart,
        updateQuantity,
        getCartTotal,
        getCartItemCount
    } = useCart();

    const handleCheckout = () => {
        toggleCart();
        navigate('/checkout');
    };

    return (
        <div className="cart-container">
            <button 
                className="cart-trigger" 
                onClick={toggleCart}
                aria-label="Toggle Cart"
            >
                <FaShoppingCart />
                {getCartItemCount() > 0 && (
                    <span className="cart-badge">
                        {getCartItemCount()}
                    </span>
                )}
            </button>

            {cartOpen && (
                <div className="cart-dropdown">
                    <div className="cart-header">
                        <h3>Coșul meu ({getCartItemCount()} produse)</h3>
                        <button 
                            className="close-button"
                            onClick={toggleCart}
                            aria-label="Close Cart"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {cart.length === 0 ? (
                        <div className="empty-cart">
                            <p>Coșul dvs. este gol</p>
                            <Link to="/" className="continue-shopping" onClick={toggleCart}>
                                Continuă cumpărăturile
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="cart-items">
                                {cart.map(item => (
                                    <div key={item.id} className="cart-item">
                                        <img 
                                            src={Array.isArray(item.images) ? item.images[0] : item.image} 
                                            alt={item.name}
                                            className="item-image"
                                        />
                                        <div className="item-details">
                                            <Link 
                                                to={`/products/${item.id}`} 
                                                onClick={toggleCart}
                                                className="item-name"
                                            >
                                                {item.name}
                                            </Link>
                                            <div className="item-price">
                                                <span className="current-price">{item.price} MDL</span>
                                                {item.originalPrice && (
                                                    <span className="original-price">{item.originalPrice} MDL</span>
                                                )}
                                            </div>
                                            <div className="item-actions">
                                                <div className="quantity-controls">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                        aria-label="Decrease Quantity"
                                                    >
                                                        <FaMinus />
                                                    </button>
                                                    <span>{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        aria-label="Increase Quantity"
                                                    >
                                                        <FaPlus />
                                                    </button>
                                                </div>
                                                <button
                                                    className="remove-button"
                                                    onClick={() => removeFromCart(item.id)}
                                                    aria-label="Remove Item"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="cart-footer">
                                <div className="cart-total">
                                    <span>Total:</span>
                                    <span>{getCartTotal().toFixed(2)} MDL</span>
                                </div>
                                <button 
                                    className="checkout-button"
                                    onClick={handleCheckout}
                                >
                                    Finalizează comanda
                                </button>
                                <Link 
                                    to="/cart" 
                                    className="view-cart-button"
                                    onClick={toggleCart}
                                >
                                    Vezi coșul complet
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default Cart; 