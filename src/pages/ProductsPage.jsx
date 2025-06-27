import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaShoppingCart, FaFilter, FaTimes, FaStar } from 'react-icons/fa';
import axios from 'axios';
import config from '../config/config';

const API_URL = config.getApiUrl();

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
    const [sortBy, setSortBy] = useState('newest');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const category = searchParams.get('category');
                const sort = searchParams.get('sort');
                
                let url = `${API_URL}/products`;
                const params = new URLSearchParams();
                
                if (category) params.append('category', category);
                if (sort) params.append('sort', sort);
                
                const response = await axios.get(`${url}?${params.toString()}`);
                setProducts(response.data);
                
                // Extract unique categories
                const uniqueCategories = [...new Set(response.data.map(p => p.category))];
                setCategories(uniqueCategories);
                
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch products');
                setLoading(false);
            }
        };

        fetchProducts();
    }, [searchParams]);

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    };

    const handlePriceChange = (e) => {
        const { name, value } = e.target;
        setPriceRange(prev => ({
            ...prev,
            [name]: Number(value)
        }));
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };

    const filteredProducts = products.filter(product => {
        const matchesCategory = !selectedCategory || product.category === selectedCategory;
        const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
        return matchesCategory && matchesPrice;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'newest':
                return new Date(b.created_at) - new Date(a.created_at);
            case 'popular':
                return b.rating - a.rating;
            default:
                return 0;
        }
    });

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
        <div className="min-h-screen bg-gray-50 pt-24">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#1a1a1a]">Produsele Noastre</h1>
                    <p className="text-gray-600 mt-2">Descoperă colecția noastră de produse premium</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Mobile Filter Button */}
                    <button
                        className="lg:hidden flex items-center justify-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md"
                        onClick={() => setIsFilterOpen(true)}
                    >
                        <FaFilter />
                        Filtre
                    </button>

                    {/* Filters Sidebar */}
                    <div className={`lg:w-64 space-y-6 ${isFilterOpen ? 'fixed inset-0 z-50 bg-white p-6' : 'hidden lg:block'}`}>
                        {isFilterOpen && (
                            <button
                                className="lg:hidden absolute top-4 right-4 text-gray-500"
                                onClick={() => setIsFilterOpen(false)}
                            >
                                <FaTimes className="text-xl" />
                            </button>
                        )}

                        {/* Categories */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-[#1a1a1a]">Categorii</h3>
                            <div className="space-y-2">
                                <button
                                    className={`block w-full text-left px-4 py-2 rounded-lg ${
                                        !selectedCategory
                                            ? 'bg-blue-600 text-white'
                                            : 'hover:bg-gray-100'
                                    }`}
                                    onClick={() => handleCategoryChange('')}
                                >
                                    Toate Categoriile
                                </button>
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        className={`block w-full text-left px-4 py-2 rounded-lg ${
                                            selectedCategory === category
                                                ? 'bg-blue-600 text-white'
                                                : 'hover:bg-gray-100'
                                        }`}
                                        onClick={() => handleCategoryChange(category)}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-[#1a1a1a]">Interval de Preț</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">Preț Minim</label>
                                    <input
                                        type="number"
                                        name="min"
                                        value={priceRange.min}
                                        onChange={handlePriceChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">Preț Maxim</label>
                                    <input
                                        type="number"
                                        name="max"
                                        value={priceRange.max}
                                        onChange={handlePriceChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sort By */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-[#1a1a1a]">Sortează După</h3>
                            <select
                                value={sortBy}
                                onChange={handleSortChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="newest">Cele Mai Noi</option>
                                <option value="price-low">Preț: Crescător</option>
                                <option value="price-high">Preț: Descrescător</option>
                                <option value="popular">Cele Mai Populare</option>
                            </select>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sortedProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="bg-white rounded-lg shadow-lg overflow-hidden group"
                                >
                                    <Link to={`/products/${product.id}`}>
                                        <div className="aspect-w-3 aspect-h-4">
                                            <img
                                                src={`/uploads/products/${product.image_url}`}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                    </Link>
                                    <div className="p-6">
                                        <Link to={`/products/${product.id}`}>
                                            <h3 className="text-xl font-semibold mb-2 hover:text-blue-600 text-[#1a1a1a]">
                                                {product.name}
                                            </h3>
                                        </Link>
                                        <p className="text-gray-600 mb-4 line-clamp-2">
                                            {product.description}
                                        </p>
                                        <div className="flex items-center mb-4">
                                            <div className="flex items-center text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <FaStar
                                                        key={i}
                                                        className={i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-gray-600 ml-2">
                                                ({product.rating.toFixed(1)})
                                            </span>
                                        </div>
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

                        {sortedProducts.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-600">Nu s-au găsit produse care să corespundă criteriilor tale.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductsPage; 