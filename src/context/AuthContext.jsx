import React, { createContext, useContext, useState, useEffect } from 'react';
import config from '../config/config';
import { useNotification } from './NotificationContext';

// Use the getApiUrl method from config
const API_URL = config.getApiUrl();

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { showError } = useNotification();

    // Development mode token
    const DEV_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBidW5pY2FzaG9wLm1kIiwicm9sZSI6ImFkbWluIiwibmFtZSI6IkFkbWluIFVzZXIiLCJpYXQiOjE3MDk5MjM0NTYsImV4cCI6MTcxMDUyODI1Nn0.dummy_signature';

    useEffect(() => {
        // Auto-set admin user on mount
        const adminUser = {
            id: 1,
            email: 'admin@bunicashop.md',
            role: 'admin',
            name: 'Admin User'
        };
        setUser(adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
        localStorage.setItem('token', DEV_TOKEN);
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        // Auto-login as admin
        const adminUser = {
            id: 1,
            email: email,
            role: 'admin',
            name: 'Admin User'
        };
        setUser(adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
        localStorage.setItem('token', DEV_TOKEN);
        return true;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: true, // Always authenticated in development
        isAdmin: true // Always admin in development
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
} 