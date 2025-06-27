import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Topbar from './components/Topbar/topbar';
import Navbar from './components/Navbar/navbar';
import CategoryTabs from './components/CategoryTabs/CategoryTabs';
import HomePage from './pages/Home';
import CategoryPage from './pages/Category';
import ProductPage from './pages/Product';
import CartPage from './pages/Cart';
import CheckoutPage from './pages/Checkout';
import ContactPage from './pages/Contact';
import NotFoundPage from './pages/NotFound';
import AdminLogin from './pages/Admin/Login';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminLeads from './pages/Admin/Leads';
import AdminOrders from './pages/Admin/Orders';
import AdminProducts from './pages/Admin/Products';
import AdminLayout from './pages/Admin/Layout';
import Footer from './components/Footer/Footer';
import Cart from './components/Cart/Cart';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import CookieConsent from './components/CookieConsent/CookieConsent';
import Newsletter from './components/Newsletter/Newsletter';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Se verifică autentificarea...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Se încarcă BunicaShop...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <CartProvider>
        <div className="app">
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="leads" element={<AdminLeads />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="products" element={<AdminProducts />} />
            </Route>

            {/* Main Website Routes */}
            <Route path="/*" element={
              <>
                <Topbar />
                <Navbar />
                <main className="main-content">
                  <div className="container">
                    <ErrorBoundary>
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/category/:categoryId" element={<CategoryPage />} />
                        <Route path="/products/:productId" element={<ProductPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </ErrorBoundary>
                  </div>
                </main>
                <Newsletter />
                <Footer />
              </>
            } />
          </Routes>
          <Cart />
          <ScrollToTop />
          <CookieConsent />
        </div>
      </CartProvider>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
