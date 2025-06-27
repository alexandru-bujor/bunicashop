import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiHome } from 'react-icons/fi';
import './NotFound.css';

export default function NotFound() {
    return (
        <div className="not-found-page">
            <div className="not-found-content">
                <div className="error-code">404</div>
                <h1>Page Not Found</h1>
                <p>
                    Oops! The page you're looking for doesn't exist or has been moved.
                </p>
                <div className="action-buttons">
                    <Link to="/" className="home-button">
                        <FiHome />
                        Back to Home
                    </Link>
                    <button 
                        onClick={() => window.history.back()} 
                        className="back-button"
                    >
                        <FiArrowLeft />
                        Go Back
                    </button>
                </div>
                <div className="suggestions">
                    <h2>You might want to:</h2>
                    <ul>
                        <li>Check the URL for typos</li>
                        <li>Visit our <Link to="/categories">categories</Link></li>
                        <li>Search for products in our <Link to="/search">search page</Link></li>
                        <li>Contact our <Link to="/support">support team</Link></li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
