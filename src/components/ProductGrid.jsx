import React from 'react';
import { Link } from 'react-router-dom';
import './ProductGrid.css';

const ProductGrid = ({ products }) => {
    return (
        <div className="product-grid">
            {products.map((product) => (
                <Link 
                    to={`/product/${product.id}`} 
                    key={product.id} 
                    className="product-card"
                >
                    <div className="product-image">
                        <img src={product.image} alt={product.name} />
                        {product.discount > 0 && (
                            <span className="discount-badge">
                                -{product.discount}%
                            </span>
                        )}
                    </div>
                    <div className="product-info">
                        <h3 className="product-name">{product.name}</h3>
                        <div className="product-price">
                            {product.discount > 0 ? (
                                <>
                                    <span className="original-price">
                                        ${product.price.toFixed(2)}
                                    </span>
                                    <span className="discounted-price">
                                        ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                                    </span>
                                </>
                            ) : (
                                <span className="price">
                                    ${product.price.toFixed(2)}
                                </span>
                            )}
                        </div>
                        <div className="product-meta">
                            <span className="stock-status">
                                {product.stock > -1 ? 'In Stock' : 'Out of Stock'}
                            </span>
                            {product.rating && (
                                <div className="rating">
                                    <span className="stars">
                                        {'★'.repeat(Math.floor(product.rating))}
                                        {'☆'.repeat(5 - Math.floor(product.rating))}
                                    </span>
                                    <span className="rating-value">
                                        {product.rating.toFixed(1)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default ProductGrid; 