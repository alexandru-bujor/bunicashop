import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { addLead } from '../../data/store';
import './ContactForm.css';

const ContactForm = ({ currentProduct = null }) => {
    const location = useLocation();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
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
                path: location.pathname,
                product: currentProduct ? {
                    id: currentProduct.id,
                    name: currentProduct.name,
                    price: currentProduct.price
                } : null
            }
        };

        addLead(leadData);

        setTimeout(() => {
            setIsSubmitting(false);
            setIsSubmitted(true);

            setTimeout(() => {
                setIsSubmitted(false);
                setFormData({
                    name: '',
                    phone: '',
                    agreeToPolicy: false
                });
            }, 5000);
        }, 1500);
    };

    if (isSubmitted) {
        return (
            <div className="call-request-form">
                <div className="success-message">
                    Mulțumim! Vă vom contacta în curând.
                </div>
            </div>
        );
    }

    return (
        <div className="call-request-form">
            <h2 className="form-title">Solicitați un apel</h2>
            <p className="form-subtitle">
                Completați formularul și vă vom contacta în cel mai scurt timp
            </p>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Nume</label>
                    <input
                        id="name"
                        type="text"
                        name="name"
                        className="form-input"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Introduceți numele dvs."
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="phone">Telefon</label>
                    <input
                        id="phone"
                        type="tel"
                        name="phone"
                        className="form-input"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+373 __ ___ ___"
                        required
                    />
                </div>

                <div className="checkbox-group">
                    <input
                        type="checkbox"
                        id="agreeToPolicy"
                        name="agreeToPolicy"
                        checked={formData.agreeToPolicy}
                        onChange={handleChange}
                        required
                    />
                    <label htmlFor="agreeToPolicy">
                        Sunt de acord cu <a href="/privacy-policy">Politica de confidențialitate</a>
                    </label>
                </div>

                <button
                    type="submit"
                    className="submit-button"
                    disabled={isSubmitting || !formData.agreeToPolicy}
                >
                    {isSubmitting ? 'Se trimite...' : 'Solicitați apel'}
                </button>
            </form>
        </div>
    );
};

export default ContactForm;