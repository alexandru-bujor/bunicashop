import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { FaArrowLeft, FaArrowRight, FaCheck } from 'react-icons/fa';
import { addOrder } from '../data/store';
import './Checkout.css';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { cart, getCartTotal, clearCart } = useCart();
    const { showSuccess, showError } = useNotification();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        notes: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitOrder = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            // Validate cart items
            if (!cart || cart.length === 0) {
                throw new Error('Coșul este gol');
            }

            // Validate customer information
            if (!formData.firstName?.trim() || !formData.lastName?.trim() || !formData.email?.trim()) {
                throw new Error('Vă rugăm completați toate câmpurile obligatorii');
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                throw new Error('Vă rugăm introduceți o adresă de email validă');
            }

            // Validate phone number format
            if (formData.phone && !/^\+?[\d\s-]{8,}$/.test(formData.phone)) {
                throw new Error('Vă rugăm introduceți un număr de telefon valid');
            }

            // Calculate total amount
            const totalAmount = cart.reduce((total, item) => {
                const price = parseFloat(item.price);
                const quantity = parseInt(item.quantity);
                if (isNaN(price) || isNaN(quantity)) {
                    throw new Error(`Preț sau cantitate invalidă pentru produsul: ${item.name}`);
                }
                return total + (price * quantity);
            }, 0);

            if (isNaN(totalAmount) || totalAmount <= 0) {
                throw new Error('Suma totală calculată este invalidă');
            }

            // Prepare order data
            const orderData = {
                shipping_address: `${formData.address?.trim()}, ${formData.city?.trim()}`,
                items: cart.map(item => ({
                    product_id: parseInt(item.product_id || item.id),
                    product_name: item.name,
                    quantity: parseInt(item.quantity),
                    price: parseFloat(item.price)
                })),
                total_amount: totalAmount,
                customer_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
                customer_email: formData.email.trim(),
                customer_phone: formData.phone?.trim() || null
            };

            const result = await addOrder(orderData);

            if (!result.success) {
                throw new Error(result.error || 'Comanda nu a putut fi procesată');
            }

            // Clear cart and show success
            clearCart();
            showSuccess('Comanda a fost plasată cu succes! Veți primi un email de confirmare în curând.');
            setStep(3);
        } catch (error) {
            console.error('Error submitting order:', error);
            showError(error.message || 'A apărut o eroare. Vă rugăm încercați din nou.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderOrderSummary = () => (
        <div className="checkout-summary">
            <h2>Sumar Comandă</h2>
            <div className="checkout-items">
                {cart.map(item => (
                    <div key={item.id} className="checkout-item">
                        <img 
                            src={Array.isArray(item.images) ? item.images[0] : item.image} 
                            alt={item.name}
                            className="checkout-item-image"
                        />
                        <div className="checkout-item-details">
                            <h4>{item.name}</h4>
                            <div className="checkout-item-price">
                                <span>{item.quantity} x {item.price} L</span>
                                <span className="checkout-item-total">
                                    {(item.price * item.quantity).toFixed(2)} L
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="checkout-total">
                <span>Total:</span>
                <span>{getCartTotal().toFixed(2)} L</span>
            </div>
        </div>
    );

    const renderPersonalInfo = () => (
        <div className="checkout-form">
            <h2>Informații Personale</h2>
            <div className="form-grid">
                <div className="form-group">
                    <label htmlFor="firstName">Prenume</label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="lastName">Nume</label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="phone">Telefon</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group full-width">
                    <label htmlFor="address">Adresa</label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="city">Oraș</label>
                    <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group full-width">
                    <label htmlFor="notes">Note comandă (opțional)</label>
                    <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows="3"
                    />
                </div>
            </div>
        </div>
    );

    const renderSuccess = () => (
        <div className="checkout-success">
            <div className="success-icon">
                <FaCheck />
            </div>
            <h2>Comandă Plasată cu Succes!</h2>
            <p>Vă mulțumim pentru comandă. Veți primi un email de confirmare în curând.</p>
            <button 
                className="button-primary"
                onClick={() => navigate('/')}
            >
                Continuă Cumpărăturile
            </button>
        </div>
    );

    return (
        <div className="checkout-page">
            <div className="checkout-progress">
                <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
                    1. Sumar Comandă
                </div>
                <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
                    2. Informații Personale
                </div>
                <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
                    3. Confirmare
                </div>
            </div>

            <div className="checkout-content">
                {step === 1 && (
                    <>
                        {renderOrderSummary()}
                        <div className="checkout-actions">
                            <button 
                                className="button-secondary"
                                onClick={() => navigate('/cart')}
                            >
                                <FaArrowLeft /> Înapoi la Coș
                            </button>
                            <button 
                                className="button-primary"
                                onClick={() => setStep(2)}
                            >
                                Continuă <FaArrowRight />
                            </button>
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        {renderPersonalInfo()}
                        <div className="checkout-actions">
                            <button 
                                className="button-secondary"
                                onClick={() => setStep(1)}
                                disabled={isSubmitting}
                            >
                                <FaArrowLeft /> Înapoi
                            </button>
                            <button 
                                className="button-primary"
                                onClick={handleSubmitOrder}
                                disabled={isSubmitting || !formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.address || !formData.city}
                            >
                                {isSubmitting ? 'Se procesează...' : 'Finalizează Comanda'} <FaCheck />
                            </button>
                        </div>
                    </>
                )}

                {step === 3 && renderSuccess()}
            </div>
        </div>
    );
};

export default CheckoutPage; 