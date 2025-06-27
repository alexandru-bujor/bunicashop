import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import QuickView from '../QuickView/QuickView';
import { FaTruck, FaShieldAlt, FaUndo } from 'react-icons/fa';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [showQuickView, setShowQuickView] = useState(false);
    const { addToCart } = useCart();

    const {
        id,
        name,
        brand,
        price,
        originalPrice,
        discount,
        imageUrl,
        secondaryImageUrl,
        rating,
        reviewCount,
        isNew,
        isBestseller,
        colors,
        stockStatus
    } = product;

    const toggleWishlist = () => setIsWishlisted(!isWishlisted);

    const handleQuickView = (e) => {
        e.preventDefault();
        setShowQuickView(true);
    };

    const handleAddToCart = (e) => {
        e.preventDefault();
        addToCart(product, 1);
    };

    return (
        <>
            <div className="product-card">
                <div className="product-badges">
                    {discount > 0 && <span className="badge discount">-{discount}%</span>}
                    {isNew && <span className="badge new">NEW</span>}
                    {isBestseller && <span className="badge bestseller">Bestseller</span>}
                    {stockStatus === 'low' && <span className="badge stock-low">Low Stock</span>}
                </div>

                <button
                    className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                    onClick={toggleWishlist}
                >
                    ♥
                </button>

                <div className="product-image-container">
                    <img
                        src={imageUrl}
                        alt={name}
                        className="primary-image"
                        onMouseEnter={secondaryImageUrl ? () => document.getElementById(`product-image-${id}`).src = secondaryImageUrl : null}
                        onMouseLeave={secondaryImageUrl ? () => document.getElementById(`product-image-${id}`).src = imageUrl : null}
                        id={`product-image-${id}`}
                    />
                    <button className="quick-view-btn" onClick={handleQuickView}>
                        Quick View
                    </button>
                </div>

                <div className="product-info">
                    {brand && <div className="product-brand">{brand}</div>}
                    <h3 className="product-name">{name}</h3>

                    <div className="price-section">
                        <span className="current-price">${price.toFixed(2)}</span>
                        {originalPrice && originalPrice > price && (
                            <span className="original-price">${originalPrice.toFixed(2)}</span>
                        )}
                    </div>

                    <div className="rating-section">
                        <div className="stars">
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className={`star ${i < Math.floor(rating) ? 'filled' : ''} ${i === Math.floor(rating) && rating % 1 > 0 ? 'half-filled' : ''}`}>
                                    ★
                                </span>
                            ))}
                        </div>
                        <span className="review-count">({reviewCount})</span>
                    </div>

                    {colors && colors.length > 0 && (
                        <div className="color-options">
                            {colors.slice(0, 5).map((color, index) => (
                                <span
                                    key={index}
                                    className="color-swatch"
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                />
                            ))}
                            {colors.length > 5 && <span className="more-colors">+{colors.length - 5}</span>}
                        </div>
                    )}

                    <button className="add-to-cart-btn" onClick={handleAddToCart}>
                        Add to Cart
                    </button>
                </div>

                <div className="product-info-list">
                    <div className="info-item">
                        <FaTruck />
                        <div>
                            <span className="info-title">Livrare în 24-36 ore în Chișinău.</span>
                            <div className="info-content">1-3 zile pe întreg teritoriul Republici Moldova</div>
                        </div>
                    </div>
                    
                    <div className="info-item">
                        <FaShieldAlt />
                        <div>
                            <span className="info-title">Garanție</span>
                            <div className="info-content">6 luni - 24 luni (În conformitate cu produsul electric)</div>
                        </div>
                    </div>
                    
                    <div className="info-item">
                        <FaUndo />
                        <div>
                            <span className="info-title">Retur în 14 zile</span>
                            <div className="info-content">Articolele pe care le returnați trebuie să fie în aceeași stare în care le-ați primit.</div>
                        </div>
                    </div>
                </div>
            </div>

            {showQuickView && (
                <QuickView
                    product={product}
                    onClose={() => setShowQuickView(false)}
                />
            )}
        </>
    );
};

export default ProductCard;