import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';
import ProductGrid from '../components/ProductGrid/ProductGrid';
import config from '../config/config';
import './Category.css';

// Use the getApiUrl method from config
const API_URL = config.getApiUrl();

const SORT_OPTIONS = [
    { value: 'popular', label: 'Cele mai populare' },
    { value: 'newest', label: 'Cele mai noi' },
    { value: 'price-asc', label: 'Preț crescător' },
    { value: 'price-desc', label: 'Preț descrescător' },
    { value: 'discount', label: 'Reduceri' }
];

const CATEGORY_TITLES = {
    'Totul la 99 Lei': 'Totul la 99 Lei',
    'Electrocasnice': 'Electrocasnice',
    'Bucătărie și Veselă': 'Bucătărie și Veselă',
    'Uz Casnic': 'Uz Casnic',
    'Boxe / Audio': 'Boxe / Audio',
    'Textile': 'Textile',
    'Supraveghere video': 'Supraveghere video',
    'Produse chimice': 'Produse chimice',
    'Sănătate și Frumusețe': 'Sănătate și Frumusețe',
    'Vase de Gătit': 'Vase de Gătit',
    'Jocuri și Jucării': 'Jocuri și Jucării'
};

const CATEGORY_BACKGROUNDS = {
    'Totul la 99 Lei': '#fff3e0',
    'Electrocasnice': '#e8eaf6',
    'Bucătărie și Veselă': '#e9f5e9',
    'Uz Casnic': '#fce4ec',
    'Boxe / Audio': '#ede7f6',
    'Textile': '#fff3e0',
    'Supraveghere video': '#e8eaf6',
    'Produse chimice': '#e9f5e9',
    'Sănătate și Frumusețe': '#fce4ec',
    'Vase de Gătit': '#ede7f6',
    'Jocuri și Jucării': '#fff3e0'
};

export default function CategoryPage() {
    const { categoryId } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('popular');

    useEffect(() => {
        setLoading(true);
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API_URL}/products`);
                if (!response.ok) throw new Error('Failed to fetch products');
                const allProducts = await response.json();
                
                // Filter products by category
                const categoryProducts = categoryId === 'all' 
                    ? allProducts 
                    : allProducts.filter(p => p.category === categoryId);
                
                // Sort products
                const sortedProducts = sortProducts(categoryProducts, sortBy);
                setProducts(sortedProducts);
                setError(null);
            } catch (error) {
                console.error('Error fetching products:', error);
                setError('Failed to load products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [categoryId, sortBy]);

    const sortProducts = (products, sortBy) => {
        switch (sortBy) {
            case 'price-asc':
                return [...products].sort((a, b) => a.price - b.price);
            case 'price-desc':
                return [...products].sort((a, b) => b.price - a.price);
            case 'newest':
                return [...products].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            case 'popular':
                return [...products].sort((a, b) => (b.sales || 0) - (a.sales || 0));
            case 'discount':
                return [...products].sort((a, b) => (b.discount || 0) - (a.discount || 0));
            default:
                return products;
        }
    };

    const getCategoryTitle = () => {
        return CATEGORY_TITLES[categoryId] || 'Toate Produsele';
    };

    const getCategoryBackground = () => {
        return CATEGORY_BACKGROUNDS[categoryId] || '#f5f5f5';
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="category-page">
            <div className="category-banner" style={{ backgroundColor: getCategoryBackground() }}>
                <div className="category-banner-content">
                    <h1>{getCategoryTitle()}</h1>
                    <p>{products.length} produse</p>
                </div>
            </div>

            <div className="container">
                <div className="category-content">
                    <div className="products-section">
                        <div className="category-header">
                            <div className="results-count">
                                {products.length} produse
                            </div>
                            <div className="sort-section">
                                <select 
                                    className="sort-select"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    {SORT_OPTIONS.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <FaChevronDown className="select-icon" />
                            </div>
                        </div>

                        <ProductGrid products={products} />
                    </div>
                </div>
            </div>
        </div>
    );
}
