import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import OrderNotification from './components/OrderNotification';
import './App.css';

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
                  ? (localStorage.getItem('userRole') === 'ADMIN' ? <Navigate to="/admin" /> : <Navigate to="/menu" />)
                  : <Navigate to="/login" />
              } />
              <Route path="/login" element={
                localStorage.getItem('userEmail')
                  ? (localStorage.getItem('userRole') === 'ADMIN' ? <Navigate to="/admin" /> : <Navigate to="/menu" />)
                  : <Login />
              } />
              <Route path="/signup" element={
                localStorage.getItem('userEmail')
                  ? (localStorage.getItem('userRole') === 'ADMIN' ? <Navigate to="/admin" /> : <Navigate to="/menu" />)
                  : <Signup />
              } />

              <Route path="/menu" element={<Menu />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/delivery" element={<DeliveryDashboard />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/account" element={<Account />} />
              <Route path="/notifications" element={<Notifications />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </CartProvider>
      </NotificationProvider>
    </div>
  );
}

export default App;
