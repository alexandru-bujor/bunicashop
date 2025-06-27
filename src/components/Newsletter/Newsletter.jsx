import React, { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';

const Newsletter = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setStatus('success');
            setEmail('');
            setTimeout(() => setStatus(''), 3000);
        } catch (error) {
            setStatus('error');
            setTimeout(() => setStatus(''), 3000);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="newsletter">
            <div className="newsletter-container">
                <h2>Abonează-te la newsletter</h2>
                <p>
                    Fii primul care află despre ofertele și promoțiile noastre speciale!
                </p>
                <form onSubmit={handleSubmit} className="newsletter-form">
                    <input
                        type="email"
                        className="newsletter-input"
                        placeholder="Adresa ta de email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button 
                        type="submit" 
                        className="newsletter-button"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            'Se procesează...'
                        ) : (
                            <>
                                <FaPaperPlane style={{ marginRight: '8px' }} />
                                Abonează-te
                            </>
                        )}
                    </button>
                </form>
                {status === 'success' && (
                    <p className="text-success" style={{ marginTop: '1rem' }}>
                        Te-ai abonat cu succes la newsletter!
                    </p>
                )}
                {status === 'error' && (
                    <p className="text-error" style={{ marginTop: '1rem' }}>
                        A apărut o eroare. Te rugăm să încerci din nou.
                    </p>
                )}
            </div>
        </section>
    );
};

export default Newsletter; 