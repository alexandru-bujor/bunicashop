import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    FaPlus, 
    FaEdit, 
    FaTrash, 
    FaImage, 
    FaBox, 
    FaShoppingCart, 
    FaUsers, 
    FaChartLine,
    FaHome,
    FaList,
    FaCog,
    FaSignOutAlt
} from 'react-icons/fa';
import axios from 'axios';
import config from '../config/config';
import './AdminDashboard.css';

const API_URL = config.getApiUrl();

const AdminDashboard = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [statistics, setStatistics] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0
    });
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        image: null,
        images: []
    });
    const [previewImages, setPreviewImages] = useState([]);
    const [categories] = useState([
        'Terasa, gazon si gradina',
        'Sport și Aer Liber',
        'Casă și Bucătărie',
        'TV, Audio-Video & Foto',
        'Electronice',
        'Modă',
        'Jucării',
        'Auto',
        'Construcții',
        'Altele'
    ]);
    const location = useLocation();

    useEffect(() => {
        fetchProducts();
        fetchStatistics();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${API_URL}/products`, {
                headers: {
                    'Authorization': 'Bearer admin-token'
                }
            });
            setProducts(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to fetch products');
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const response = await axios.get(`${API_URL}/admin/statistics`, {
                headers: {
                    'Authorization': 'Bearer admin-token'
                }
            });
            setStatistics(response.data);
        } catch (err) {
            console.error('Failed to fetch statistics:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prev => ({
            ...prev,
            images: files
        }));

        // Create preview URLs
        const previews = files.map(file => URL.createObjectURL(file));
        setPreviewImages(previews);

        // Cleanup old preview URLs
        return () => {
            previews.forEach(url => URL.revokeObjectURL(url));
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('stock', formData.stock);

            // Append all images
            formData.images.forEach((image) => {
                formDataToSend.append('images', image);
            });

            if (selectedProduct) {
                // Update existing product
                await axios.put(`${API_URL}/products/${selectedProduct.id}`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': 'Bearer admin-token'
                    }
                });
            } else {
                // Create new product
                await axios.post(`${API_URL}/products`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': 'Bearer admin-token'
                    }
                });
            }

            // Reset form and close modal
            setFormData({
                name: '',
                description: '',
                price: '',
                category: '',
                stock: '',
                image: null,
                images: []
            });
            setPreviewImages([]);
            setSelectedProduct(null);
            setIsModalOpen(false);
            fetchProducts();
        } catch (err) {
            setError('Failed to save product');
        }
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            stock: product.stock,
            image: null,
            images: []
        });
        setPreviewImages(product.images ? [product.image_url, ...product.images] : [product.image_url]);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`${API_URL}/products/${id}`, {
                    headers: {
                        'Authorization': 'Bearer admin-token'
                    }
                });
                fetchProducts();
            } catch (err) {
                setError('Failed to delete product');
            }
        }
    };

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h1 className="sidebar-title">Admin Panel</h1>
                    <p className="sidebar-subtitle">Manage your store</p>
                </div>
                <nav>
                    <ul className="nav-menu">
                        <li className="nav-item">
                            <Link to="/admin/dashboard" className="nav-link active">
                                <FaHome className="nav-icon" />
                                Dashboard
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/admin/products" className="nav-link">
                                <FaBox className="nav-icon" />
                                Products
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/admin/orders" className="nav-link">
                                <FaShoppingCart className="nav-icon" />
                                Orders
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/admin/leads" className="nav-link">
                                <FaUsers className="nav-icon" />
                                Leads
                            </Link>
                        </li>
                        <li className="nav-item">
                            <a href="/admin/settings" className="nav-link">
                                <FaCog className="nav-icon" />
                                Settings
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="/admin/logout" className="nav-link">
                                <FaSignOutAlt className="nav-icon" />
                                Logout
                            </a>
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <div className="page-header">
                    <h1 className="page-title">Dashboard Overview</h1>
                    <p className="page-description">Welcome back! Here's what's happening with your store today.</p>
                </div>

                {/* Statistics Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon blue">
                            <FaBox className="text-2xl" />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{statistics.totalProducts}</div>
                            <div className="stat-label">Total Products</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon green">
                            <FaShoppingCart className="text-2xl" />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{statistics.totalOrders}</div>
                            <div className="stat-label">Total Orders</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon orange">
                            <FaChartLine className="text-2xl" />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{statistics.totalRevenue} L</div>
                            <div className="stat-label">Total Revenue</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon purple">
                            <FaUsers className="text-2xl" />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{statistics.totalCustomers}</div>
                            <div className="stat-label">Total Customers</div>
                        </div>
                    </div>
                </div>

                {/* Products Section */}
                <div className="content-card">
                    <div className="card-header">
                        <h2 className="card-title">Recent Products</h2>
                        <button
                            onClick={() => {
                                setSelectedProduct(null);
                                setFormData({
                                    name: '',
                                    description: '',
                                    price: '',
                                    category: '',
                                    stock: '',
                                    image: null,
                                    images: []
                                });
                                setPreviewImages([]);
                                setIsModalOpen(true);
                            }}
                            className="add-product-btn"
                        >
                            <FaPlus />
                            Add Product
                        </button>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <div className="products-table">
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <th className="table-header">Product</th>
                                    <th className="table-header">Category</th>
                                    <th className="table-header">Price</th>
                                    <th className="table-header">Stock</th>
                                    <th className="table-header">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id} className="table-row">
                                        <td>
                                            <div className="flex items-center">
                                                <img
                                                    src={`${API_URL}/uploads/products/${product.image_url}`}
                                                    alt={product.name}
                                                    className="product-image"
                                                />
                                                <div className="ml-4">
                                                    <div className="font-medium text-gray-900">
                                                        {product.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-gray-900">{product.category}</td>
                                        <td className="text-gray-900">{product.price} L</td>
                                        <td className="text-gray-900">{product.stock}</td>
                                        <td>
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="action-btn edit-btn"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="action-btn delete-btn ml-2"
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {selectedProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    rows="3"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="form-label">Price</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Stock</label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Images</label>
                                <div className="image-upload">
                                    <div className="text-center">
                                        <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="mt-2">
                                            <label
                                                htmlFor="file-upload"
                                                className="cursor-pointer text-blue-600 hover:text-blue-500"
                                            >
                                                <span>Upload images</span>
                                                <input
                                                    id="file-upload"
                                                    name="images"
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="sr-only"
                                                />
                                            </label>
                                            <p className="text-sm text-gray-500 mt-1">
                                                or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                PNG, JPG, GIF up to 5MB
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {previewImages.length > 0 && (
                                    <div className="image-preview-grid">
                                        {previewImages.map((preview, index) => (
                                            <div key={index} className="image-preview">
                                                <img
                                                    src={preview}
                                                    alt={`Preview ${index + 1}`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="cancel-btn"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="submit-btn"
                                >
                                    {selectedProduct ? 'Update Product' : 'Add Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard; 