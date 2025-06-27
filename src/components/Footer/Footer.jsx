import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h3>Despre Noi</h3>
                    <p>BunicaShop este magazinul tău online de încredere pentru produse de calitate la prețuri accesibile.</p>
                    <div className="social-links">
                        <a href="https://facebook.com/bunicashop" target="_blank" rel="noopener noreferrer">
                            <FaFacebook />
                        </a>
                        <a href="https://instagram.com/bunicashop" target="_blank" rel="noopener noreferrer">
                            <FaInstagram />
                        </a>
                        <a href="https://twitter.com/bunicashop" target="_blank" rel="noopener noreferrer">
                            <FaTwitter />
                        </a>
                        <a href="https://youtube.com/bunicashop" target="_blank" rel="noopener noreferrer">
                            <FaYoutube />
                        </a>
                    </div>
                </div>

                <div className="footer-section">
                    <h3>Informații Utile</h3>
                    <ul>
                        <li><Link to="/terms">Termeni și Condiții</Link></li>
                        <li><Link to="/privacy">Politica de Confidențialitate</Link></li>
                        <li><Link to="/shipping">Informații Livrare</Link></li>
                        <li><Link to="/returns">Politica de Retur</Link></li>
                        <li><Link to="/contact">Contact</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3>Categorii Populare</h3>
                    <ul>
                        <li><Link to="/category/garden">Terasa și Grădină</Link></li>
                        <li><Link to="/category/sports">Sport și Aer Liber</Link></li>
                        <li><Link to="/category/home">Casă și Bucătărie</Link></li>
                        <li><Link to="/category/electronics">TV & Electronice</Link></li>
                        <li><Link to="/category/auto">Auto & Moto</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3>Contact</h3>
                    <div className="contact-info">
                        <p><FaPhone /> <a href="tel:+37379155444">+373 79155444</a></p>
                        <p><FaPhone /> <a href="tel:+37379105544">+373 79105544</a></p>
                        <p><FaEnvelope /> <a href="mailto:bunicashop.md@gmail.com ">bunicashop.md@gmail.com</a></p>
                        <p><FaMapMarkerAlt /> str. Testemiteanu 39, etajul 2, Chișinău</p>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} BunicaShop. Toate drepturile rezervate.</p>
            </div>
        </footer>
    );
};

export default Footer; 