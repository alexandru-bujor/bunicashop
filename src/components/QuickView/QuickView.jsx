import React, { useState } from 'react';
import { FiMinus, FiPlus, FiX, FiShoppingCart } from 'react-icons/fi';
import './QuickView.css';

const QuickView = ({ product, onClose, onAddToCart }) => {
    const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || null);
    const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || null);
    const [quantity, setQuantity] = useState(1);

    const handleQuantityChange = (value) => {
        const newQuantity = Math.max(1, Math.min(10, value));
        setQuantity(newQuantity);
    };

    const handleAddToCart = () => {
        onAddToCart({
            ...product,
            selectedColor,
            selectedSize,
            quantity
        });
        onClose();
    };

    const getStockStatus = () => {
        if (product.stockLevel > 10) {
            return <span className="in-stock">✓ In Stock</span>;
        } else if (product.stockLevel > 0) {
            return <span className="low-stock">⚠ Low Stock - Only {product.stockLevel} left</span>;
        }
        return <span className="out-of-stock">✕ Out of Stock</span>;
    };

    return (
        <div className="quick-view-overlay" onClick={onClose}>
            <div className="quick-view-modal" onClick={e => e.stopPropagation()}>
                <button className="quick-view-close" onClick={onClose}>
                    <FiX size={20} />
                </button>

                <div className="quick-view-image-section">
                    <img 
                        src={product.image} 
                        alt={product.name}
                        className="quick-view-image"
                    />
                </div>

                <div className="quick-view-details">
                    <div>
                        <h2 className="quick-view-title">{product.name}</h2>
                        <div className="quick-view-price">
                            ${product.price.toFixed(2)}
                        </div>
                        <div className="stock-status">
                            {getStockStatus()}
                        </div>
                        <p className="quick-view-description">
                            {product.description}
                        </p>
                    </div>

                    <div className="quick-view-options">
                        {product.colors && (
                            <div className="option-group">
                                <label className="option-label">Color</label>
                                <div className="option-buttons">
                                    {product.colors.map(color => (
                                        <button
                                            key={color.name}
                                            className={`option-button ${selectedColor === color ? 'selected' : ''}`}
                                            onClick={() => setSelectedColor(color)}
                                        >
                                            {color.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {product.sizes && (
                            <div className="option-group">
                                <label className="option-label">Size</label>
                                <div className="option-buttons">
                                    {product.sizes.map(size => (
                                        <button
                                            key={size}
                                            className={`option-button ${selectedSize === size ? 'selected' : ''}`}
                                            onClick={() => setSelectedSize(size)}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="quantity-selector">
                        <button 
                            className="quantity-button"
                            onClick={() => handleQuantityChange(quantity - 1)}
                            disabled={quantity <= 1}
                        >
                            <FiMinus size={16} />
                        </button>
                        <input
                            type="number"
                            className="quantity-input"
                            value={quantity}
                            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                            min="1"
                            max="10"
                        />
                        <button 
                            className="quantity-button"
                            onClick={() => handleQuantityChange(quantity + 1)}
                            disabled={quantity >= 10}
                        >
                            <FiPlus size={16} />
                        </button>
                    </div>

                    <button 
                        className="add-to-cart-button"
                        onClick={handleAddToCart}
                        disabled={product.stockLevel === 0}
                    >
                        <FiShoppingCart size={20} />
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuickView; 