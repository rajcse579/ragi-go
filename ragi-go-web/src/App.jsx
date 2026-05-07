import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import './App.css';

// Pages
import Login from './pages/Login';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import Orders from './pages/Orders';
import Account from './pages/Account';
import Signup from './pages/Signup';
import Payment from './pages/Payment';


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
      <CartProvider>
        <BrowserRouter>
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
            <Route path="/orders" element={<Orders />} />
            <Route path="/account" element={<Account />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </div>
  );
}

export default App;
