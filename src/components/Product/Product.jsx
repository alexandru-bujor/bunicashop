import React, { useState } from 'react';
import { addToCart } from '../../data/store';
import ProductInquiry from '../ProductInquiry/ProductInquiry';
import ContactForm from '../contactForm/contactForm';
import './Product.css';

const Product = ({ product }) => {
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [showContactForm, setShowContactForm] = useState(false);

    const handleAddToCart = () => {
        setIsAddingToCart(true);
        addToCart(product.id);
        
        setTimeout(() => {
            setIsAddingToCart(false);
        }, 1000);
    };

    return (
        <div className="product-card">
            <img 
                src={product.image} 
                alt={product.name} 
                className="product-image"
            />
            
            <div className="product-info">
                <h3>{product.name}</h3>
                <div className="price-container">
                    <span className="current-price">{product.price} MDL</span>
                    {product.originalPrice && (
                        <span className="original-price">{product.originalPrice} MDL</span>
                    )}
                </div>
                
                <p className="product-description">{product.description}</p>
                
                <div className="product-actions">
                    <button 
                        className={`add-to-cart-button ${isAddingToCart ? 'adding' : ''}`}
                        onClick={handleAddToCart}
                        disabled={isAddingToCart}
                    >
                        {isAddingToCart ? 'Se adaugă...' : 'Adaugă în coș'}
                    </button>
                </div>

                <div className="product-contact">
                    <button 
                        className="contact-toggle"
                        onClick={() => setShowContactForm(!showContactForm)}
                    >
                        {showContactForm ? 'Ascunde formularul' : 'Aveți întrebări? Contactați-ne'}
                    </button>
                    
                    {showContactForm && (
                        <div className="product-contact-form">
                            <ContactForm productContext={product} />
                        </div>
                    )}
                </div>

                <ProductInquiry product={product} />
            </div>
        </div>
    );
};

export default Product; 