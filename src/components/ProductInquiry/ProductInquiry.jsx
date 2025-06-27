import React, { useState } from 'react';
import { addLead } from '../../data/store';
import './ProductInquiry.css';

const ProductInquiry = ({ product }) => {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        message: '',
        agreeToPolicy: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const leadData = {
            ...formData,
            source: {
                path: window.location.pathname,
                product: {
                    id: product.id,
                    name: product.name,
                    price: product.price
                }
            },
            type: 'product_inquiry'
        };

        addLead(leadData);

        setTimeout(() => {
            setIsSubmitting(false);
            setIsSubmitted(true);
            setIsFormVisible(false);

            setTimeout(() => {
                setIsSubmitted(false);
                setFormData({
                    name: '',
                    phone: '',
                    message: '',
                    agreeToPolicy: false
                });
            }, 5000);
        }, 1500);
    };

    return (
        <div className="product-inquiry">
            {!isFormVisible && !isSubmitted && (
                <button 
                    className="inquiry-trigger"
                    onClick={() => setIsFormVisible(true)}
                >
                    Aveți întrebări? Lăsați un mesaj
                </button>
            )}

            {isFormVisible && (
                <div className="inquiry-form">
                    <h3>Întrebări despre {product.name}?</h3>
                    <p>Completați formularul și vă vom contacta în curând</p>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Numele</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Introduceți numele dumneavoastră"
                            />
                        </div>

                        <div className="form-group">
                            <label>Telefon</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                placeholder="Introduceți numărul de telefon"
                            />
                        </div>

                        <div className="form-group">
                            <label>Mesajul dumneavoastră</label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                placeholder="Scrieți întrebarea dumneavoastră aici..."
                            />
                        </div>

                        <div className="checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="agreeToPolicy"
                                    checked={formData.agreeToPolicy}
                                    onChange={handleChange}
                                    required
                                />
                                <span>Sunt de acord cu Politica de confidențialitate</span>
                            </label>
                        </div>

                        <div className="form-actions">
                            <button 
                                type="button" 
                                className="cancel-button"
                                onClick={() => setIsFormVisible(false)}
                            >
                                Anulează
                            </button>
                            <button
                                type="submit"
                                className="submit-button"
                                disabled={isSubmitting || !formData.agreeToPolicy}
                            >
                                {isSubmitting ? 'Se trimite...' : 'Trimite'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {isSubmitted && (
                <div className="success-message">
                    Mulțumim! Vă vom contacta în cel mai scurt timp.
                </div>
            )}
        </div>
    );
};

export default ProductInquiry; 