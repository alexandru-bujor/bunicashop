import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaUser } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import config from '../../config/config';
import './Login.css';

const Login = () => {
    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showError } = useNotification();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const success = await login(credentials.email, credentials.password);
            if (success) {
                navigate('/admin/dashboard');
            }
        } catch (err) {
            console.error('Login error:', err);
            showError(err.message || 'Eroare la autentificare. Vă rugăm încercați din nou.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="admin-login">
            <div className="login-container">
                <div className="login-header">
                    <h1>Admin Login</h1>
                    <p>Bine ați venit în panoul de administrare</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label>
                            <FaUser className="input-icon" />
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={credentials.email}
                            onChange={handleChange}
                            placeholder="Introduceți email-ul"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            <FaLock className="input-icon" />
                            Parolă
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            placeholder="Introduceți parola"
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? 'Se autentifică...' : 'Autentificare'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;