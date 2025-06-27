import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaImage } from 'react-icons/fa';
import config from '../../config/config';
import './Products.css';

const API_URL = config.getApiUrl();

const categories = [
    'Totul la 99 Lei',
    'Electrocasnice',
    'Bucătărie și Veselă',
    'Uz Casnic',
    'Boxe / Audio',
    'Textile',
    'Supraveghere video',
    'Produse chimice',
    'Sănătate și Frumusețe',
    'Vase de Gătit',
    'Jocuri și Jucării'
];

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        loadProducts();
    }, []);

    // Cleanup preview URLs when component unmounts
    useEffect(() => {
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Nu sunteți autentificat');
            }

            const response = await fetch(`${API_URL}/admin/products`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Sesiunea a expirat. Vă rugăm să vă autentificați din nou.');
                }
                throw new Error('Eroare la încărcarea produselor');
            }

            const data = await response.json();
            setProducts(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            if (err.message.includes('autentificați')) {
                navigate('/admin/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setIsEditing(true);
        setShowModal(true);
        // Set preview URLs for existing images
        if (product.images) {
            const urls = [product.image_url, ...JSON.parse(product.images)].map(
                img => `${API_URL}/uploads/products/${img}`
            );
            setPreviewUrls(urls);
        }
    };

    const handleAddProduct = () => {
        setSelectedProduct(null);
        setIsEditing(false);
        setShowModal(true);
        setSelectedFiles([]);
        setPreviewUrls([]);
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);

        // Create preview URLs
        const urls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(urls);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Sigur doriți să ștergeți acest produs?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Nu sunteți autentificat');
            }

            const response = await fetch(`${API_URL}/admin/products/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Sesiunea a expirat. Vă rugăm să vă autentificați din nou.');
                }
                throw new Error('Eroare la ștergerea produsului');
            }

            await loadProducts();
        } catch (err) {
            setError(err.message);
            if (err.message.includes('autentificați')) {
                navigate('/admin/login');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Nu sunteți autentificat');
            }

            const formData = new FormData();
            
            // Add form fields to FormData
            formData.append('name', e.target.name.value);
            formData.append('description', e.target.description.value);
            formData.append('price', e.target.price.value);
            formData.append('category', e.target.category.value);
            formData.append('stock', e.target.stock.value);
            
            // Add files to FormData
            selectedFiles.forEach((file) => {
                formData.append('images', file);
            });

            const url = isEditing 
                ? `${API_URL}/admin/products/${selectedProduct.id}`
                : `${API_URL}/admin/products`;

            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Sesiunea a expirat. Vă rugăm să vă autentificați din nou.');
                }
                throw new Error(`Eroare la ${isEditing ? 'actualizarea' : 'adăugarea'} produsului`);
            }

            await loadProducts();
            setShowModal(false);
            setSelectedProduct(null);
            setSelectedFiles([]);
            setPreviewUrls([]);
        } catch (err) {
            setError(err.message);
            if (err.message.includes('autentificați')) {
                navigate('/admin/login');
            }
        }
    };

    if (loading) {
        return (
            <div className="products-loading">
                <div className="loader"></div>
                <p>Se încarcă produsele...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="products-error">
                <p>{error}</p>
                <button onClick={loadProducts}>Reîncearcă</button>
            </div>
        );
    }

    return (
        <div className="products">
            <div className="products-header">
                <h2>Produse</h2>
                <button
                    onClick={handleAddProduct}
                    className="add-button"
                >
                    <FaPlus /> Adaugă Produs
                </button>
            </div>

            <div className="products-grid">
                {products.map(product => (
                    <div key={product.id} className="product-card">
                        <div className="product-image">
                            <img src={`${API_URL}/uploads/products/${product.image_url}`} alt={product.name} />
                        </div>
                        <div className="product-info">
                            <h3>{product.name}</h3>
                            <p className="product-price">{product.price} RON</p>
                            <p className="product-category">{product.category}</p>
                            <div className="product-actions">
                                <button
                                    onClick={() => handleEdit(product)}
                                    className="edit-button"
                                >
                                    <FaEdit /> Editează
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="delete-button"
                                >
                                    <FaTrash /> Șterge
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="product-modal">
                    <div className="modal-content">
                        <h3>{isEditing ? 'Editează Produs' : 'Adaugă Produs Nou'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Nume Produs</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    defaultValue={selectedProduct?.name}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="description">Descriere</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    defaultValue={selectedProduct?.description}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="price">Preț (RON)</label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    step="0.01"
                                    defaultValue={selectedProduct?.price}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="stock">Stoc</label>
                                <input
                                    type="number"
                                    id="stock"
                                    name="stock"
                                    defaultValue={selectedProduct?.stock || 0}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="category">Categorie</label>
                                <select
                                    id="category"
                                    name="category"
                                    defaultValue={selectedProduct?.category}
                                    required
                                >
                                    <option value="">Selectează o categorie</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="images">Imagini</label>
                                <div className="image-upload">
                                    <div className="upload-area">
                                        <FaImage className="upload-icon" />
                                        <p>Drag & drop imagini aici sau</p>
                                        <label htmlFor="file-input" className="upload-button">
                                            Selectează fișiere
                                        </label>
                                        <input
                                            id="file-input"
                                            type="file"
                                            name="images"
                                            multiple
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </div>
                                    {previewUrls.length > 0 && (
                                        <div className="image-preview-grid">
                                            {previewUrls.map((url, index) => (
                                                <div key={index} className="image-preview">
                                                    <img src={url} alt={`Preview ${index + 1}`} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="save-button">
                                    {isEditing ? 'Salvează' : 'Adaugă'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedProduct(null);
                                        setIsEditing(false);
                                        setShowModal(false);
                                        setSelectedFiles([]);
                                        setPreviewUrls([]);
                                    }}
                                    className="cancel-button"
                                >
                                    Anulează
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products; 