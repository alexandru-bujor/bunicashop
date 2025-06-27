import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    FaSearch, 
    FaUser, 
    FaHeart, 
    FaShoppingCart, 
    FaBars, 
    FaHome, 
    FaLeaf, 
    FaRunning, 
    FaTv, 
    FaCar, 
    FaTimes,
    FaTag,
    FaPlug,
    FaUtensils,
    FaBroom,
    FaVolumeUp,
    FaTshirt,
    FaVideo,
    FaFlask,
    FaHeartbeat,
    FaGamepad
} from 'react-icons/fa';
import SearchBar from '../SearchBar/SearchBar';
import './Navbar.css';

const categoryData = [
    {
        name: "Totul la 99 Lei",
        icon: <FaTag />,
        class: "discount",
        slug: "totul-la-99-lei"
    },
    {
        name: "Electrocasnice",
        icon: <FaPlug />,
        class: "electronics",
        slug: "electrocasnice"
    },
    {
        name: "Bucătărie și Veselă",
        icon: <FaUtensils />,
        class: "kitchen",
        slug: "bucatarie-si-vesela"
    },
    {
        name: "Uz Casnic",
        icon: <FaBroom />,
        class: "household",
        slug: "uz-casnic"
    },
    {
        name: "Boxe / Audio",
        icon: <FaVolumeUp />,
        class: "audio",
        slug: "boxe-audio"
    },
    {
        name: "Textile",
        icon: <FaTshirt />,
        class: "textile",
        slug: "textile"
    },
    {
        name: "Supraveghere video",
        icon: <FaVideo />,
        class: "video",
        slug: "supraveghere-video"
    },
    {
        name: "Produse chimice",
        icon: <FaFlask />,
        class: "chemicals",
        slug: "produse-chimice"
    },
    {
        name: "Sănătate și Frumusețe",
        icon: <FaHeartbeat />,
        class: "health",
        slug: "sanatate-si-frumusete"
    },
    {
        name: "Vase de Gătit",
        icon: <FaUtensils />,
        class: "cooking",
        slug: "vase-de-gatit"
    },
    {
        name: "Jocuri și Jucării",
        icon: <FaGamepad />,
        class: "toys",
        slug: "jocuri-si-jucarii"
    }
];

const Navbar = () => {
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showCategories, setShowCategories] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const navbarRef = useRef(null);
    const location = useLocation();

    // Close menus when route changes
    useEffect(() => {
        setShowMobileMenu(false);
        setShowCategories(false);
    }, [location]);

    // Handle scroll events
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 80);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle click outside to close menus
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navbarRef.current && !navbarRef.current.contains(event.target)) {
                setShowCategories(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (showMobileMenu) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [showMobileMenu]);

    return (
        <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`} ref={navbarRef}>
            <div className="container">
                <div className="navbar-content">
                    <div className="navbar-left">
                        <Link to="/" className="navbar-brand">
                            <img src="/img/BunicaShop.png" alt="BunicaShop" />
                        </Link>
                        <button 
                            className={`categories-toggle ${showCategories ? 'active' : ''}`}
                            onClick={() => setShowCategories(!showCategories)}
                            aria-expanded={showCategories}
                            aria-label="Toggle categories menu"
                        >
                            <FaBars />
                            <span>Categorii</span>
                        </button>
                    </div>

                    <div className="navbar-center">
                        <SearchBar />
                    </div>

                    <div className="navbar-right">
                        <Link to="/account" className="nav-icon" title="Contul meu">
                            <FaUser />
                            <span className="nav-icon-text">Cont</span>
                        </Link>
                        <Link to="/favorites" className="nav-icon" title="Favorite">
                            <FaHeart />
                            <span className="nav-icon-text">Favorite</span>
                        </Link>
                        <Link to="/cart" className="nav-icon cart-icon" title="Coșul meu">
                            <FaShoppingCart />
                            <span className="cart-count">0</span>
                            <span className="nav-icon-text">Coș</span>
                        </Link>
                    </div>

                    <button 
                        className="mobile-menu-toggle"
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        aria-expanded={showMobileMenu}
                        aria-label="Toggle mobile menu"
                    >
                        {showMobileMenu ? <FaTimes /> : <FaBars />}
                    </button>
                </div>

                {/* Categories Menu */}
                <div className={`categories-menu ${showCategories ? 'active' : ''}`}>
                    {categoryData.map((category, index) => (
                        <Link 
                            key={index}
                            to={`/category/${category.slug}`}
                            className={`category-item ${category.class}`}
                            onClick={() => setShowCategories(false)}
                        >
                            <i>{category.icon}</i>
                            <span>{category.name}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${showMobileMenu ? 'active' : ''}`}>
                <div className="mobile-menu-header">
                    <Link to="/" className="mobile-brand" onClick={() => setShowMobileMenu(false)}>
                        <img src="/img/BunicaShop.png" alt="BunicaShop" />
                    </Link>
                    <button 
                        className="mobile-menu-close"
                        onClick={() => setShowMobileMenu(false)}
                        aria-label="Close menu"
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className="mobile-search">
                    <SearchBar />
                </div>

                <div className="mobile-nav">
                    <Link to="/account" className="mobile-nav-item" onClick={() => setShowMobileMenu(false)}>
                        <FaUser />
                        <span>Contul meu</span>
                    </Link>
                    <Link to="/favorites" className="mobile-nav-item" onClick={() => setShowMobileMenu(false)}>
                        <FaHeart />
                        <span>Favorite</span>
                    </Link>
                    <Link to="/cart" className="mobile-nav-item" onClick={() => setShowMobileMenu(false)}>
                        <FaShoppingCart />
                        <span>Coșul meu</span>
                        <span className="mobile-cart-count">0</span>
                    </Link>
                </div>

                <div className="mobile-categories">
                    <h3>Categorii</h3>
                    {categoryData.map((category, index) => (
                        <Link 
                            key={index}
                            to={`/category/${category.slug}`}
                            className={`mobile-category-item ${category.class}`}
                            onClick={() => setShowMobileMenu(false)}
                        >
                            <i>{category.icon}</i>
                            <span>{category.name}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;