import React from 'react';
import { FaShieldAlt, FaTruck, FaClock, FaCreditCard } from 'react-icons/fa';
import './Features.css';

const features = [
    {
        icon: <FaShieldAlt />,
        title: "Plată sigură",
        description: "Achitați când primiți produsul."
    },
    {
        icon: <FaTruck />,
        title: "Livrare în orice regiune",
        description: "Vă garantăm livrarea la timp a tuturor comenzilor."
    },
    {
        icon: <FaShieldAlt />,
        title: "Garanție",
        description: "90 zile garanție la toate produsele electronice."
    },
    {
        icon: <FaClock />,
        title: "Preluarea comenzii 24/7",
        description: "Plasați o comanda în magazinul online chiar acum!"
    }
];

const Features = () => {
    return (
        <section className="features-section">
            <div className="container">
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card">
                            <div className="feature-icon">
                                {feature.icon}
                            </div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features; 