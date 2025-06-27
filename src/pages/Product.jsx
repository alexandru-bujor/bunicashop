import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaStar, FaRegStar, FaTruck, FaShieldAlt, FaUndo } from 'react-icons/fa';
import config from '../config/config';
import './Product.css';

// Use the getApiUrl method from config
const API_URL = config.getApiUrl();

const Product = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        if (productId) {
            loadProduct();
        } else {
            setError('ID-ul produsului lipsește');
            setLoading(false);
        }
    }, [productId]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/products/${productId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Produsul nu a fost găsit');
                }
                throw new Error('Failed to fetch product');
            }

            const data = await response.json();
            setProduct(data);
            
            // Load related products after we have the product data
            if (data.category) {
                loadRelatedProducts(data.category, productId);
            }
        } catch (err) {
            console.error('Error loading product:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadRelatedProducts = async (category, excludeId) => {
        try {
            const response = await fetch(`${API_URL}/products?category=${category}&exclude=${excludeId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch related products');
            }

            const related = await response.json();
            setRelatedProducts(related);
        } catch (err) {
            console.error('Error loading related products:', err);
        }
    };

    const addToCart = async () => {
        try {
            const response = await fetch(`${API_URL}/cart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    product_id: product.id,
                    quantity: quantity
                })
            });

            if (!response.ok) {
                throw new Error('Failed to add to cart');
            }

            alert('Produs adăugat în coș!');
            navigate('/cart');
        } catch (err) {
            setError(err.message);
            console.error('Error adding to cart:', err);
        }
    };

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (value > 0 && value <= (product?.stock || 10)) {
            setQuantity(value);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <p>Se încarcă produsul...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p className="error-message">{error}</p>
                <button onClick={loadProduct} className="retry-button">
                    Încearcă din nou
                </button>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="error-container">
                <p className="error-message">Produsul nu a fost găsit</p>
                <button onClick={() => navigate('/')} className="retry-button">
                    Înapoi la pagina principală
                </button>
            </div>
        );
    }

    return (
        <div className="product-page">
            <div className="product-container">
                <div className="product-gallery">
                    <div className="main-image">
                        <img
                            src={`/uploads/products/${selectedImage === 0 ? product.image_url : JSON.parse(product.images || '[]')[selectedImage - 1]}`}
                            alt={product.name}
                            className="product-image"
                        />
                    </div>
                    <div className="thumbnail-gallery">
                        <img
                            src={`/uploads/products/${product.image_url}`}
                            alt={product.name}
                            className={`thumbnail ${selectedImage === 0 ? 'active' : ''}`}
                            onClick={() => setSelectedImage(0)}
                        />
                        {product.images && JSON.parse(product.images).map((image, index) => (
                            <img
                                key={index}
                                src={`/uploads/products/${image}`}
                                alt={`${product.name} - ${index + 1}`}
                                className={`thumbnail ${selectedImage === index + 1 ? 'active' : ''}`}
                                onClick={() => setSelectedImage(index + 1)}
                            />
                        ))}
                    </div>
                </div>

                <div className="product-details">
                    <div className="product-header">
                        <h1 className="product-title">{product.name}</h1>
                        <div className="product-rating">
                            {[...Array(5)].map((_, i) => (
                                i < Math.floor(product.rating || 0)
                                    ? <FaStar key={i} className="star filled" />
                                    : <FaRegStar key={i} className="star" />
                            ))}
                            <span className="rating-count">
                                ({product.rating_count || 0} review-uri)
                            </span>
                        </div>
                    </div>

                    <div className="product-price-section">
                        <div className="price-container">
                            <div className="product-price">
                                {product.discount ? (
                                    <>
                                        <span className="current-price">{product.price} MDL</span>
                                        <span className="original-price">{product.original_price} MDL</span>
                                        <span className="discount-badge">-{product.discount}%</span>
                                    </>
                                ) : (
                                    <span className="current-price">{product.price} MDL</span>
                                )}
                            </div>
                            <div className="stock-badge">
                                {product.stock > 0 ? (
                                    <span className="in-stock">
                                        În stoc: {product.stock} bucăți
                                    </span>
                                ) : (
                                    <span className="out-of-stock">
                                        Stoc epuizat
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="product-actions">
                        <div className="quantity-selector">
                            <button
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                disabled={quantity <= 1}
                                className="quantity-btn"
                            >
                                -
                            </button>
                            <input
                                type="number"
                                value={quantity}
                                onChange={handleQuantityChange}
                                min="1"
                                max={product.stock || 10}
                                className="quantity-input"
                            />
                            <button
                                onClick={() => setQuantity(q => Math.min(product.stock || 10, q + 1))}
                                disabled={quantity >= (product.stock || 10)}
                                className="quantity-btn"
                            >
                                +
                            </button>
                        </div>

                        <button
                            className="add-to-cart-button"
                            onClick={addToCart}
                        >
                            <FaShoppingCart />
                            Adaugă în coș
                        </button>
                    </div>

                    <div className="product-description">
                        <h2>Descriere</h2>
                        <p>{product.description || 'Nu există descriere disponibilă.'}</p>
                    </div>

                    <div className="product-features">
                        <div className="feature">
                            <FaTruck className="feature-icon" />
                            <span>Livrare gratuită pentru comenzi peste 500 MDL</span>
                        </div>
                        <div className="feature">
                            <FaShieldAlt className="feature-icon" />
                            <span>Garanție 2 ani</span>
                        </div>
                        <div className="feature">
                            <FaUndo className="feature-icon" />
                            <span>Retur gratuit în 14 zile</span>
                        </div>
                    </div>
                </div>
            </div>

            {relatedProducts.length > 0 && (
                <div className="related-products">
                    <h2>Produse similare</h2>
                    <div className="related-products-grid">
                        {relatedProducts.map(relatedProduct => (
                            <div
                                key={relatedProduct.id}
                                className="related-product-card"
                                onClick={() => navigate(`/products/${relatedProduct.id}`)}
                            >
                                <img
                                    src={`/uploads/products/${relatedProduct.image_url}`}
                                    alt={relatedProduct.name}
                                />
                                <h3>{relatedProduct.name}</h3>
                                <p className="price">{relatedProduct.price} MDL</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Product;