import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaTruck, FaCheck, FaTimes } from 'react-icons/fa';
import config from '../../config/config';
import './Orders.css';

const API_URL = config.getApiUrl();

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/admin/orders`, { headers: { "Authorization": "Bearer admin-token" } });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Sesiunea a expirat. Vă rugăm să vă autentificați din nou.');
                }
                throw new Error('Eroare la încărcarea comenzilor');
            }

            const data = await response.json();
            setOrders(data);
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

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Nu sunteți autentificat');
            }

            const response = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Sesiunea a expirat. Vă rugăm să vă autentificați din nou.');
                }
                throw new Error('Eroare la actualizarea comenzii');
            }

            await loadOrders();
        } catch (err) {
            setError(err.message);
            if (err.message.includes('autentificați')) {
                navigate('/admin/login');
            }
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { icon: <FaTruck />, text: 'În Așteptare', class: 'pending' },
            processing: { icon: <FaTruck />, text: 'În Procesare', class: 'processing' },
            shipped: { icon: <FaTruck />, text: 'Expediat', class: 'shipped' },
            delivered: { icon: <FaCheck />, text: 'Livrat', class: 'delivered' },
            cancelled: { icon: <FaTimes />, text: 'Anulat', class: 'cancelled' }
        };

        const badge = badges[status] || badges.pending;
        return (
            <span className={`status-badge ${badge.class}`}>
                {badge.icon} {badge.text}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="orders-loading">
                <div className="loader"></div>
                <p>Se încarcă comenzile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="orders-error">
                <p>{error}</p>
                <button onClick={loadOrders}>Reîncearcă</button>
            </div>
        );
    }

    return (
        <div className="orders">
            <h2>Comenzi</h2>
            <div className="orders-table-container">
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Client</th>
                            <th>Total</th>
                            <th>Data</th>
                            <th>Status</th>
                            <th>Acțiuni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td>#{order.id}</td>
                                <td>
                                    <div className="customer-info">
                                        <p className="customer-name">{order.customer_name}</p>
                                        <p className="customer-email">{order.customer_email}</p>
                                    </div>
                                </td>
                                <td>{order.total_amount} RON</td>
                                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                <td>
                                    <select
                                        value={order.status}
                                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                        className={`status-select ${order.status}`}
                                    >
                                        <option value="pending">În Așteptare</option>
                                        <option value="processing">În Procesare</option>
                                        <option value="shipped">Expediat</option>
                                        <option value="delivered">Livrat</option>
                                        <option value="cancelled">Anulat</option>
                                    </select>
                                </td>
                                <td>
                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        className="view-button"
                                    >
                                        <FaEye /> Vezi
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedOrder && (
                <div className="order-modal">
                    <div className="modal-content">
                        <h3>Detalii Comandă #{selectedOrder.id}</h3>
                        <div className="order-details">
                            <div className="detail-section">
                                <h4>Informații Client</h4>
                                <p><strong>Nume:</strong> {selectedOrder.customer_name}</p>
                                <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                            </div>
                            <div className="detail-section">
                                <h4>Detalii Comandă</h4>
                                <p><strong>Total:</strong> {selectedOrder.total_amount} RON</p>
                                <p><strong>Data:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                                <p><strong>Status:</strong> {getStatusBadge(selectedOrder.status)}</p>
                            </div>
                            <div className="detail-section">
                                <h4>Adresă de Livrare</h4>
                                <p>{selectedOrder.shipping_address}</p>
                            </div>
                            {selectedOrder.items && (
                                <div className="detail-section">
                                    <h4>Produse</h4>
                                    <div className="order-items">
                                        {selectedOrder.items.map((item, index) => (
                                            <div key={index} className="order-item">
                                                <img src={item.image_url} alt={item.name} />
                                                <div className="item-details">
                                                    <p className="item-name">{item.name}</p>
                                                    <p className="item-price">{item.price} RON x {item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="close-button"
                        >
                            Închide
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
} 