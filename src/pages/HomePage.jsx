import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaStar, FaShoppingCart } from 'react-icons/fa';
import axios from 'axios';
import config from '../config/config';

const API_URL = config.getApiUrl();

const HomePage = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const [featuredRes, newArrivalsRes, bestSellersRes] = await Promise.all([
                    axios.get(`${API_URL}/products?featured=true`),
                    axios.get(`${API_URL}/products?sort=newest`),
                    axios.get(`${API_URL}/products?sort=popular`)
                ]);

                setFeaturedProducts(featuredRes.data.slice(0, 3));
                setNewArrivals(newArrivalsRes.data.slice(0, 4));
                setBestSellers(bestSellersRes.data.slice(0, 4));
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch products');
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[600px] bg-[#1a1a1a] text-white">
                <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a] to-transparent z-10"></div>
                <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center"></div>
                <div className="relative z-20 container mx-auto px-4 h-full flex items-center">
                    <div className="max-w-2xl">
                        <h1 className="text-5xl font-bold mb-6">
                            Livrare fulger prin Chișinău
                        </h1>
                        <p className="text-xl mb-8 text-gray-300">
                            Comanzi azi, primești azi!
                        </p>
                        <Link
                            to="/products"
                            className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Cumpără Acum
                            <FaArrowRight className="ml-2" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-12">
                        <h2 className="text-3xl font-bold text-[#1a1a1a]">Produse Populare</h2>
                        <Link
                            to="/products"
                            className="text-blue-600 hover:text-blue-700 flex items-center"
                        >
                            Vezi Toate
                            <FaArrowRight className="ml-2" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {featuredProducts.map((product) => (
                            <div
                                key={product.id}
                                className="group relative bg-white rounded-lg shadow-lg overflow-hidden"
                            >
                                <div className="aspect-w-3 aspect-h-4">
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold mb-2 text-[#1a1a1a]">{product.name}</h3>
                                    <p className="text-gray-600 mb-4">{product.description}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl font-bold text-blue-600">
                                            {product.price} L
                                        </span>
                                        <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                            <FaShoppingCart />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12 text-[#1a1a1a]">Categorii Populare</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[
                            'Terasa, gazon si gradina',
                            'Sport și Aer Liber',
                            'Casă și Bucătărie',
                            'TV, Audio-Video & Foto'
                        ].map((category) => (
                            <Link
                                key={category}
                                to={`/categories/${category.toLowerCase()}`}
                                className="group relative h-64 rounded-lg overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60 group-hover:opacity-70 transition-opacity"></div>
                                <img
                                    src={`/images/categories/${category.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpg`}
                                    alt={category}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                    <h3 className="text-2xl font-bold mb-2">{category}</h3>
                                    <p className="text-sm opacity-90">Explorează Colecția</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* New Arrivals */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-12">
                        <h2 className="text-3xl font-bold text-[#1a1a1a]">Produse Noi</h2>
                        <Link
                            to="/products?sort=newest"
                            className="text-blue-600 hover:text-blue-700 flex items-center"
                        >
                            Vezi Toate
                            <FaArrowRight className="ml-2" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {newArrivals.map((product) => (
                            <div
                                key={product.id}
                                className="group bg-white rounded-lg shadow-lg overflow-hidden"
                            >
                                <div className="aspect-w-3 aspect-h-4">
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold mb-2 text-[#1a1a1a]">{product.name}</h3>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-bold text-blue-600">
                                            {product.price} L
                                        </span>
                                        <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                            <FaShoppingCart />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Best Sellers */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-12">
                        <h2 className="text-3xl font-bold text-[#1a1a1a]">Cele Mai Vândute</h2>
                        <Link
                            to="/products?sort=popular"
                            className="text-blue-600 hover:text-blue-700 flex items-center"
                        >
                            Vezi Toate
                            <FaArrowRight className="ml-2" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {bestSellers.map((product) => (
                            <div
                                key={product.id}
                                className="group bg-white rounded-lg shadow-lg overflow-hidden"
                            >
                                <div className="aspect-w-3 aspect-h-4">
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold mb-2 text-[#1a1a1a]">{product.name}</h3>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-bold text-blue-600">
                                            {product.price} L
                                        </span>
                                        <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                            <FaShoppingCart />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="py-20 bg-blue-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Abonează-te la Newsletter</h2>
                    <p className="text-lg mb-8 max-w-2xl mx-auto">
                        Fii la curent cu ultimele produse, oferte exclusive și reduceri.
                    </p>
                    <form className="max-w-md mx-auto flex gap-4">
                        <input
                            type="email"
                            placeholder="Introdu adresa ta de email"
                            className="flex-1 px-6 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                        />
                        <button
                            type="submit"
                            className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            Abonează-te
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
};

export default HomePage; 