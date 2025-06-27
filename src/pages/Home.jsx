import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronRight, FaShoppingCart } from 'react-icons/fa';
import ProductGrid from '../components/ProductGrid/ProductGrid';
import Features from '../components/Features/Features';
import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary';
import config from '../config/config';
import './Home.css';

// Use the getApiUrl method from config
const API_URL = config.getApiUrl();

const categories = [
    {
        id: 'Totul la 99 Lei',
        name: 'Totul la 99 Lei',
        description: 'Produse la prețul de 99 Lei'
    },
    {
        id: 'Electrocasnice',
        name: 'Electrocasnice',
        description: 'Electrocasnice pentru casa ta'
    },
    {
        id: 'Bucătărie și Veselă',
        name: 'Bucătărie și Veselă',
        description: 'Tot ce ai nevoie pentru bucătărie'
    },
    {
        id: 'Uz Casnic',
        name: 'Uz Casnic',
        description: 'Produse pentru uz casnic'
    },
    {
        id: 'Boxe / Audio',
        name: 'Boxe / Audio',
        description: 'Boxe și sisteme audio'
    },
    {
        id: 'Textile',
        name: 'Textile',
        description: 'Textile pentru casa ta'
    },
    {
        id: 'Supraveghere video',
        name: 'Supraveghere video',
        description: 'Sisteme de supraveghere video'
    },
    {
        id: 'Produse chimice',
        name: 'Produse chimice',
        description: 'Produse chimice pentru uz casnic'
    },
    {
        id: 'Sănătate și Frumusețe',
        name: 'Sănătate și Frumusețe',
        description: 'Produse pentru sănătate și frumusețe'
    },
    {
        id: 'Vase de Gătit',
        name: 'Vase de Gătit',
        description: 'Vase și ustensile pentru bucătărie'
    },
    {
        id: 'Jocuri și Jucării',
        name: 'Jocuri și Jucării',
        description: 'Jocuri și jucării pentru toate vârstele'
    }
];

const transformProducts = (products) => {
    return categories.reduce((acc, category) => {
        acc[category.id] = products
            .filter(p => p.category === category.id)
            .slice(0, 4);
        return acc;
    }, {});
};

const HomePage = () => {
    const [productsByCategory, setProductsByCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(`${API_URL}/products`);
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const products = await response.json();
            if (!Array.isArray(products)) {
                throw new Error('Invalid response format from server');
            }

            setProductsByCategory(transformProducts(products));
        } catch (err) {
            console.error('Failed to fetch products:', err);
            setError(
                err.message.includes('Failed to fetch') 
                    ? 'Nu s-a putut conecta la server. Verificați dacă serverul rulează.'
                    : err.message
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const addToCart = async (productId) => {
        try {
            const response = await fetch(`${API_URL}/cart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    product_id: productId,
                    quantity: 1
                })
            });

            if (!response.ok) {
                throw new Error('Failed to add to cart');
            }

            alert('Product added to cart!');
        } catch (err) {
            setError(err.message);
            console.error('Error adding to cart:', err);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <p>Se încarcă...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p className="error-message">{error}</p>
                <button onClick={fetchProducts} className="retry-button">
                    Încearcă din nou
                </button>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className="home-page">
                <section className="hero-section">
                    <div className="hero-content">
                        <h1>Bine ai venit la BunicaShop</h1>
                        <p>Descoperă cele mai bune produse pentru tine și familia ta</p>
                        <Link to="/category/all" className="cta-button">
                            Vezi toate produsele
                            <FaChevronRight />
                        </Link>
                    </div>
                </section>

                <Features />

                {categories.map(category => (
                    <section key={category.id} className="category-section">
                        <div className="section-header">
                            <h2>{category.name}</h2>
                            <p>{category.description}</p>
                            <Link to={`/category/${category.id}`} className="view-all">
                                Vezi toate
                                <FaChevronRight />
                            </Link>
                        </div>
                        <ProductGrid 
                            products={productsByCategory[category.id] || []} 
                            onAddToCart={addToCart}
                        />
                    </section>
                ))}
            </div>
        </ErrorBoundary>
    );
};

export default HomePage;
