import React, { useState, useEffect } from 'react';
import { FaCookieBite } from 'react-icons/fa';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const hasConsent = localStorage.getItem('cookieConsent');
        if (!hasConsent) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'true');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookieConsent', 'false');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className={`cookie-consent ${isVisible ? 'visible' : ''}`}>
            <div className="cookie-consent-content">
                <div className="cookie-consent-text">
                    <FaCookieBite style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Folosim cookie-uri pentru a vă îmbunătăți experiența pe site-ul nostru. 
                    Prin continuarea navigării, vă exprimați acordul pentru utilizarea acestora.
                </div>
                <div className="cookie-consent-buttons">
                    <button 
                        onClick={handleDecline}
                        className="button button-secondary"
                    >
                        Refuz
                    </button>
                    <button 
                        onClick={handleAccept}
                        className="button button-primary"
                    >
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent; 