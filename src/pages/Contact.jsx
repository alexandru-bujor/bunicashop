import React from 'react';
import ContactForm from '../components/contactForm/contactForm';
import './Contact.css';

const ContactPage = () => {
    return (
        <div className="contact-page">
            <div className="container">
                <div className="contact-content">
                    <div className="contact-info">
                        <h1>Contacte</h1>
                        <div className="info-section">
                            <h3>Program de lucru:</h3>
                            <p>Luni - Vineri: 9:00 - 18:00</p>
                            <p>Sâmbătă: 10:00 - 15:00</p>
                            <p>Duminică: Închis</p>
                        </div>
                        
                        <div className="info-section">
                            <h3>Adresa noastră:</h3>
                            <p>Chișinău, str. Testemiteanu 39, etajul 2</p>
                        </div>
                        
                        <div className="info-section">
                            <h3>Telefon:</h3>
                            <p>+373 79155444 (de bază)</p>
                            <p>+373 79105544 (secundar)</p>
                        </div>
                        
                        <div className="info-section">
                            <h3>Email:</h3>
                            <p>holdingzingshop@gmail.com</p>
                        </div>
                    </div>
                    
                    <div className="contact-form-section">
                        <h2>Trimite un mesaj</h2>
                        <p>Completați formularul și vă vom contacta în cel mai scurt timp.</p>
                        <ContactForm />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage; 