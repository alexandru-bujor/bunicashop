import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaSearch, FaBars, FaTimes, FaPhone, FaEnvelope } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { cartItems } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${
            isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
        }`}>
            {/* Top Bar */}
            <div className="bg-[#1a1a1a] text-white py-2">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="flex items-center space-x-6">
                        <a href="tel:+37322882828" className="text-sm hover:text-gray-300 flex items-center">
                            <FaPhone className="mr-2" />
                            022 882 828
                        </a>
                        <a href="tel:+37368889797" className="text-sm hover:text-gray-300 flex items-center">
                            <FaPhone className="mr-2" />
                            068 889 797
                        </a>
                    </div>
                    <div className="flex items-center space-x-6">
                        <Link to="/about" className="text-sm hover:text-gray-300">Despre Noi</Link>
                        <Link to="/contact" className="text-sm hover:text-gray-300">Contacte</Link>
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <div className="bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <Link to="/" className="flex items-center">
                            <span className="text-2xl font-bold text-[#1a1a1a]">TopMag</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link to="/" className="text-[#1a1a1a] hover:text-blue-600 font-medium">
                                Toate
                            </Link>
                            <Link to="/products?category=reduceri" className="text-[#1a1a1a] hover:text-blue-600 font-medium">
                                Reduceri 50%
                            </Link>
                            <Link to="/products?category=oferte" className="text-[#1a1a1a] hover:text-blue-600 font-medium">
                                Oferte
                            </Link>
                            <Link to="/products?category=new" className="text-[#1a1a1a] hover:text-blue-600 font-medium">
                                New
                            </Link>
                        </div>

                        {/* Search, Cart, and User Icons */}
                        <div className="hidden md:flex items-center space-x-6">
                            <form onSubmit={handleSearch} className="relative">
                                <input
                                    type="text"
                                    placeholder="Caută..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-48 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <FaSearch />
                                </button>
                            </form>

                            <Link to="/cart" className="relative text-[#1a1a1a] hover:text-blue-600">
                                <FaShoppingCart className="text-xl" />
                                {cartItems.length > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {cartItems.length}
                                    </span>
                                )}
                            </Link>

                            <Link to="/account" className="text-[#1a1a1a] hover:text-blue-600">
                                <FaUser className="text-xl" />
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden text-[#1a1a1a]"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex flex-col space-y-4">
                            <Link
                                to="/"
                                className="text-[#1a1a1a] hover:text-blue-600 font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Toate
                            </Link>
                            <Link
                                to="/products?category=reduceri"
                                className="text-[#1a1a1a] hover:text-blue-600 font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Reduceri 50%
                            </Link>
                            <Link
                                to="/products?category=oferte"
                                className="text-[#1a1a1a] hover:text-blue-600 font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Oferte
                            </Link>
                            <Link
                                to="/products?category=new"
                                className="text-[#1a1a1a] hover:text-blue-600 font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                New
                            </Link>
                            <form onSubmit={handleSearch} className="relative">
                                <input
                                    type="text"
                                    placeholder="Caută..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <FaSearch />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar; 