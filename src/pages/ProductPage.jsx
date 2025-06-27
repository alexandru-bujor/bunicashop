import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaShoppingCart, FaHeart, FaShare, FaStar, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import config from '../config/config';

const API_URL = config.getApiUrl();

const ProductPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isWishlist, setIsWishlist] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const [productRes, similarRes] = await Promise.all([
                    axios.get(`${API_URL}/products/${id}`),
                    axios.get(`${API_URL}/products?category=${product?.category}&limit=4`)
                ]);

                setProduct(productRes.data);
                setSimilarProducts(similarRes.data.filter(p => p.id !== parseInt(id)));
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch product details');
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleQuantityChange = (value) => {
        const newQuantity = quantity + value;
        if (newQuantity >= 1 && newQuantity <= 10) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = () => {
        // Add to cart logic here
        console.log('Adding to cart:', { product, quantity });
    };

    const handleWishlist = () => {
        setIsWishlist(!isWishlist);
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: product.name,
                text: product.description,
                url: window.location.href,
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-600">{error || 'Product not found'}</div>
            </div>
        );
    }

    const images = [product.image_url, ...(product.images || [])];

    return (
        <div className="min-h-screen bg-gray-50 pt-24">
            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <div className="mb-8">
                    <Link
                        to="/products"
                        className="inline-flex items-center text-gray-600 hover:text-blue-600"
                    >
                        <FaArrowLeft className="mr-2" />
                        Back to Products
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product Images */}
                    <div className="space-y-4">
                        <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden">
                            <img
                                src={images[selectedImage]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {images.map((image, index) => (
                                <button
                                    key={index}
                                    className={`aspect-w-1 aspect-h-1 rounded-lg overflow-hidden ${
                                        selectedImage === index
                                            ? 'ring-2 ring-blue-600'
                                            : 'hover:opacity-75'
                                    }`}
                                    onClick={() => setSelectedImage(index)}
                                >
                                    <img
                                        src={image}
                                        alt={`${product.name} ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {product.name}
                            </h1>
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
                            <p className="text-3xl font-bold text-blue-600 mb-4">
                                ${product.price}
                            </p>
                            <p className="text-gray-600">
                                {product.description}
                            </p>
                        </div>

                        {/* Quantity and Add to Cart */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center border rounded-lg">
                                    <button
                                        className="px-4 py-2 text-gray-600 hover:text-blue-600"
                                        onClick={() => handleQuantityChange(-1)}
                                    >
                                        -
                                    </button>
                                    <span className="px-4 py-2">{quantity}</span>
                                    <button
                                        className="px-4 py-2 text-gray-600 hover:text-blue-600"
                                        onClick={() => handleQuantityChange(1)}
                                    >
                                        +
                                    </button>
                                </div>
                                <button
                                    className="flex-1 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                                    onClick={handleAddToCart}
                                >
                                    <FaShoppingCart className="mr-2" />
                                    Add to Cart
                                </button>
                            </div>

                            <div className="flex items-center space-x-4">
                                <button
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                                        isWishlist
                                            ? 'text-red-600 bg-red-50'
                                            : 'text-gray-600 hover:text-red-600'
                                    }`}
                                    onClick={handleWishlist}
                                >
                                    <FaHeart />
                                    <span>{isWishlist ? 'Saved' : 'Save'}</span>
                                </button>
                                <button
                                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-blue-600 rounded-lg"
                                    onClick={handleShare}
                                >
                                    <FaShare />
                                    <span>Share</span>
                                </button>
                            </div>
                        </div>

                        {/* Product Details */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4">Product Details</h3>
                            <div className="space-y-2">
                                <p><span className="font-medium">Category:</span> {product.category}</p>
                                <p><span className="font-medium">Availability:</span> In Stock</p>
                                <p><span className="font-medium">SKU:</span> {product.id}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Similar Products */}
                {similarProducts.length > 0 && (
                    <div className="mt-20">
                        <h2 className="text-2xl font-bold mb-8">Similar Products</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {similarProducts.map((similarProduct) => (
                                <Link
                                    key={similarProduct.id}
                                    to={`/products/${similarProduct.id}`}
                                    className="group"
                                >
                                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                                        <div className="aspect-w-3 aspect-h-4">
                                            <img
                                                src={similarProduct.image_url}
                                                alt={similarProduct.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600">
                                                {similarProduct.name}
                                            </h3>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xl font-bold text-blue-600">
                                                    ${similarProduct.price}
                                                </span>
                                                <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                                                    <FaShoppingCart />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductPage;