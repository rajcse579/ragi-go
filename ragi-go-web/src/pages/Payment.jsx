import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { useCart } from '../context/CartContext';
import { hapticSuccess } from '../utils/haptics';

export default function Payment() {
  const { cart, cartTotal, clearCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const orderInfo = location.state || {};

  const placeOrder = () => {
    setLoading(true);

    const orderData = {
      ...orderInfo,
      total: cartTotal + 10,
      items: cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.price }))
    };

    axios.post(`${API_BASE_URL}/orders`, orderData)
      .then(() => {
        // Save details for next time
        localStorage.setItem('savedName', orderInfo.name);
        localStorage.setItem('savedPhone', orderInfo.phone);
        localStorage.setItem('savedAddress', orderInfo.address);
        
        setLoading(false);
        clearCart();
        hapticSuccess();
        navigate('/orders', { state: { success: true } });
      })
      .catch(err => {
        console.error("Error placing order", err);
        alert('Failed to place order.');
        setLoading(false);
      });
  };

  if (!orderInfo.name) {
    return <Navigate to="/checkout" />;
  }

  return (
    <div className="page-container no-scrollbar" style={{ background: '#f8f8f8' }}>
      <div className="header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <i className='bx bx-left-arrow-alt' style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => navigate('/checkout')}></i>
          <h2 style={{ fontSize: '18px', margin: 0 }}>Payment</h2>
        </div>
      </div>

      <div style={{ padding: '0 20px 20px' }}>
        <div className="login-form fade-in-up" style={{ gap: '24px' }}>
          
          {/* Order Info Summary (Small) */}
          <div style={{ background: 'rgba(0,0,0,0.02)', padding: '12px', borderRadius: '12px', border: '1px dashed #ddd', marginBottom: '-10px' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
              Delivering to <span style={{ fontWeight: 700, color: '#333' }}>{orderInfo.name}</span> at 
              <span style={{ fontWeight: 700, color: '#333' }}> {orderInfo.address.substring(0, 30)}...</span>
            </p>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid #e9e9eb' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Payment Method</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', border: '1px solid var(--primary)', background: 'var(--primary-light)' }}>
              <i className='bx bx-money' style={{ fontSize: '24px', color: 'var(--primary)' }}></i>
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)' }}>Cash on Delivery (COD)</span>
              <i className='bx bxs-check-circle' style={{ marginLeft: 'auto', color: 'var(--primary)' }}></i>
            </div>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid #e9e9eb', marginBottom: '40px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Billing Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <span>Item Total</span>
              <span style={{ fontWeight: 600 }}>₹{cartTotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <span>Delivery Fee</span>
              <span style={{ fontWeight: 600 }}>₹10</span>
            </div>
            <div style={{ borderTop: '1px dashed #e9e9eb', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '18px', color: 'var(--text-main)' }}>
              <span>Grand Total</span>
              <span>₹{cartTotal + 10}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '15px 20px', background: '#fff', boxShadow: '0 -4px 20px rgba(0,0,0,0.05)', zIndex: 100 }}>
        <button 
          className="primary-btn" 
          onClick={placeOrder} 
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? 'PLACING ORDER...' : `PLACE ORDER - ₹${cartTotal + 10}`}
        </button>
      </div>
    </div>
  );
}
