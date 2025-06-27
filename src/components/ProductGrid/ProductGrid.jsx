import React from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaHeart, FaHome, FaTree, FaRunning, FaLaptop, FaCar, FaEye } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import config from '../../config/config';
import './ProductGrid.css';

const API_URL = config.isDevelopment ? 'http://localhost:3001' : config.apiUrl;

const CategoryIcon = ({ category }) => {
    switch (category) {
        case 'home':
            return <FaHome />;
        case 'garden':
            return <FaTree />;
        case 'sports':
            return <FaRunning />;
        case 'electronics':
            return <FaLaptop />;
        case 'auto':
            return <FaCar />;
        default:
            return null;
    }
};

const ProductGrid = ({ products = [] }) => {
    const { addToCart } = useCart();

    if (!products.length) {
        return <div className="no-products">Nu există produse în această categorie</div>;
    }

    const handleAddToCart = (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
    };

    const calculateDiscount = (price, originalPrice) => {
        if (!originalPrice) return null;
        const discount = ((originalPrice - price) / originalPrice) * 100;
        return Math.round(discount);
    };

    return (
        <div className="products-grid">
            {products.map(product => {
                const discount = calculateDiscount(product.price, product.originalPrice);
                
                return (
                    <div key={product.id} className="product-card">
                        <div className="product-badges">
                            {discount && (
                                <span className="badge sale">-{discount}%</span>
                            )}
                            {product.isTopSeller && (
                                <span className="badge top-seller">Top</span>
                            )}
                        </div>
                        
                        <Link 
                            to={`/products/${product.id}`}
                            state={{ product }}
                            className="product-image-container"
                        >
                            <div className="image-wrapper">
                                <img 
                                    src={`/uploads/products/${product.image_url}`}
                                    alt={product.name}
                                    className="product-image"
                                    loading="lazy"
                                />
                            </div>
                        </Link>

                        <div className="product-info">
                            <div className="product-category">
                                <CategoryIcon category={product.category} />
                                <span>{product.category}</span>
                            </div>

                            <Link 
                                to={`/products/${product.id}`}
                                state={{ product }}
                                className="product-name"
                            >
                                {product.name}
                            </Link>

                            <div className="product-bottom">
                                <div className="price-stock-container">
                                    <div className="product-price">
                                        {product.discount ? (
                                            <>
                                                <span className="current-price">{product.price} MDL</span>
                                                <span className="original-price">{product.originalPrice} MDL</span>
                                            </>
                                        ) : (
                                            <span>{product.price} MDL</span>
                                        )}
                                    </div>
                                    
                                </div>

                                <div className="product-actions">
                                    <button
                                        className="add-to-cart"
                                        onClick={(e) => handleAddToCart(e, product)}
                                    >
                                        <FaShoppingCart />
                                        <span className="button-text">
                                            Adaugă în coș
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ProductGrid; 