import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaUsers, FaShoppingCart, FaBox, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const AdminLayout = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === `/admin/${path}`;
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <h2>BunicaShop</h2>
          <p>Admin Panel</p>
        </div>
        <nav className="admin-nav">
          <Link 
            to="/admin/dashboard" 
            className={`admin-nav-item ${isActive('dashboard') ? 'active' : ''}`}
          >
            <FaTachometerAlt /> Dashboard
          </Link>
          <Link 
            to="/admin/leads" 
            className={`admin-nav-item ${isActive('leads') ? 'active' : ''}`}
          >
            <FaUsers /> Leads
          </Link>
          <Link 
            to="/admin/orders" 
            className={`admin-nav-item ${isActive('orders') ? 'active' : ''}`}
          >
            <FaShoppingCart /> Orders
          </Link>
          <Link 
            to="/admin/products" 
            className={`admin-nav-item ${isActive('products') ? 'active' : ''}`}
          >
            <FaBox /> Products
          </Link>
          <button onClick={logout} className="admin-nav-item logout">
            <FaSignOutAlt /> Logout
          </button>
        </nav>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout; 