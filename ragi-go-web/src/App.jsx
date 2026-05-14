import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import OrderNotification from './components/OrderNotification';
import './App.css';
import { Toaster } from 'react-hot-toast';

import { Suspense, lazy } from 'react';

// Pages lazily loaded for code splitting
const Login = lazy(() => import('./pages/Login'));
const Menu = lazy(() => import('./pages/Menu'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Admin = lazy(() => import('./pages/Admin'));
const DeliveryDashboard = lazy(() => import('./pages/DeliveryDashboard'));
const Orders = lazy(() => import('./pages/Orders'));
const Account = lazy(() => import('./pages/Account'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Signup = lazy(() => import('./pages/Signup'));
const Payment = lazy(() => import('./pages/Payment'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const About = lazy(() => import('./pages/About'));


const ProtectedRoute = ({ children, requiredRole }) => {
  const userEmail = localStorage.getItem('userEmail');
  const userRole = localStorage.getItem('userRole');

  if (!userEmail) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const [isOffline, setIsOffline] = React.useState(!navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="mobile-app-container">
      <Toaster position="top-center" reverseOrder={false} />
      {isOffline && (
        <div className="offline-banner">
          <i className='bx bx-wifi-off'></i>
          You are currently offline. Viewing cached data.
        </div>
      )}
      <NotificationProvider>
        <OrderNotification />
        <CartProvider>
        <BrowserRouter>
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--primary)' }}>Loading...</div>}>
            <Routes>
              <Route path="/" element={
                localStorage.getItem('userEmail') 
                  ? (localStorage.getItem('userRole') === 'ADMIN' ? <Navigate to="/admin" /> : (localStorage.getItem('userRole') === 'DELIVERY' ? <Navigate to="/delivery" /> : <Navigate to="/menu" />))
                  : <Navigate to="/login" />
              } />
              <Route path="/login" element={
                localStorage.getItem('userEmail')
                  ? (localStorage.getItem('userRole') === 'ADMIN' ? <Navigate to="/admin" /> : (localStorage.getItem('userRole') === 'DELIVERY' ? <Navigate to="/delivery" /> : <Navigate to="/menu" />))
                  : <Login />
              } />
              <Route path="/signup" element={
                localStorage.getItem('userEmail')
                  ? (localStorage.getItem('userRole') === 'ADMIN' ? <Navigate to="/admin" /> : (localStorage.getItem('userRole') === 'DELIVERY' ? <Navigate to="/delivery" /> : <Navigate to="/menu" />))
                  : <Signup />
              } />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/about" element={<About />} />

              <Route path="/menu" element={<ProtectedRoute><Menu /></ProtectedRoute>} />
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute requiredRole="ADMIN"><Admin /></ProtectedRoute>} />
              <Route path="/delivery" element={<ProtectedRoute><DeliveryDashboard /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </CartProvider>
      </NotificationProvider>
    </div>
  );
}

export default App;
