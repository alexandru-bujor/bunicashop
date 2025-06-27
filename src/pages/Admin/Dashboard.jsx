import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaShoppingCart, FaBox, FaChartLine, FaEye } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';
import config from '../../config/config';

const API_URL = config.getApiUrl();

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        totalLeads: 0,
        totalProducts: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Nu sunteți autentificat');
            }

            // Fetch statistics
            const statsResponse = await fetch(`${API_URL}/admin/statistics`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!statsResponse.ok) {
                if (statsResponse.status === 401) {
                    throw new Error('Sesiunea a expirat. Vă rugăm să vă autentificați din nou.');
                }
                throw new Error('Eroare la încărcarea statisticilor');
            }

            const statsData = await statsResponse.json();
            setStats(statsData);

            // Fetch recent orders
            const ordersResponse = await fetch(`${API_URL}/admin/orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!ordersResponse.ok) {
                if (ordersResponse.status === 401) {
                    throw new Error('Sesiunea a expirat. Vă rugăm să vă autentificați din nou.');
                }
                throw new Error('Eroare la încărcarea comenzilor recente');
            }

            const ordersData = await ordersResponse.json();
            setRecentOrders(ordersData.slice(0, 5)); // Get only the 5 most recent orders
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

            await loadData();
        } catch (err) {
            setError(err.message);
            if (err.message.includes('autentificați')) {
                navigate('/admin/login');
            }
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { text: 'În Așteptare', class: 'pending' },
            processing: { text: 'În Procesare', class: 'processing' },
            shipped: { text: 'Expediat', class: 'shipped' },
            delivered: { text: 'Livrat', class: 'delivered' },
            cancelled: { text: 'Anulat', class: 'cancelled' }
        };
        return badges[status] || { text: status, class: 'default' };
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loader"></div>
                <p>Se încarcă datele...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <p>{error}</p>
                <button onClick={loadData} className="retry-button">
                    Reîncearcă
                </button>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <h1>Dashboard</h1>
            
            <div className="quick-actions">
                <button onClick={() => navigate('/admin/leads')} className="action-button">
                    <FaUsers /> Leads
                </button>
                <button onClick={() => navigate('/admin/orders')} className="action-button">
                    <FaShoppingCart /> Orders
                </button>
                <button onClick={() => navigate('/admin/products')} className="action-button">
                    <FaBox /> Products
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">
                        <FaShoppingCart />
                        </div>
                    <div className="stat-info">
                        <h3>Total Orders</h3>
                        <p>{stats.totalOrders}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <FaChartLine />
                        </div>
                    <div className="stat-info">
                        <h3>Total Revenue</h3>
                        <p>{stats.totalRevenue} RON</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <FaUsers />
                        </div>
                    <div className="stat-info">
                        <h3>Total Leads</h3>
                        <p>{stats.totalLeads}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <FaBox />
                        </div>
                    <div className="stat-info">
                        <h3>Total Products</h3>
                        <p>{stats.totalProducts}</p>
                    </div>
                </div>
            </div>

            <div className="recent-orders">
                <h2>Comenzi Recente</h2>
                <div className="orders-table-container">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Client</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Data</th>
                                <th>Acțiuni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map(order => (
                                <tr key={order.id}>
                                    <td>#{order.id}</td>
                                    <td>{order.customer_name}</td>
                                    <td>{order.total_amount} RON</td>
                                    <td>
                                        <span className={`status-badge ${getStatusBadge(order.status).class}`}>
                                            {getStatusBadge(order.status).text}
                                        </span>
                                    </td>
                                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <button
                                            onClick={() => navigate(`/admin/orders/${order.id}`)}
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
            </div>
        </div>
    );
};

export default Dashboard; 