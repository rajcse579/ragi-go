import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { useCart } from '../context/CartContext';
import { hapticSuccess } from '../utils/haptics';

export default function Checkout() {
  const { cartTotal } = useCart();
  
  // Load saved details from localStorage on initial render
  const [name, setName] = useState(localStorage.getItem('savedName') || localStorage.getItem('userName') || '');
  const [phone, setPhone] = useState(localStorage.getItem('savedPhone') || localStorage.getItem('userPhone') || '');
  const [address, setAddress] = useState(localStorage.getItem('savedAddress') || '');
  
  const navigate = useNavigate();

  const handleNext = () => {
    if (!name || !address || !phone) {
      alert("Please enter name, phone and address");
      return;
    }
    
    // Pass delivery info to the payment page
    navigate('/payment', { 
      state: { name, phone, address } 
    });
  };

  return (
    <div className="page-container no-scrollbar" style={{ background: '#f8f8f8' }}>
      <div className="header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <i className='bx bx-left-arrow-alt' style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => navigate('/cart')}></i>
          <h2 style={{ fontSize: '18px', margin: 0 }}>Delivery Details</h2>
        </div>
      </div>

      <div style={{ padding: '0 20px 20px' }}>
        <div className="login-form fade-in-up" style={{ gap: '24px' }}>
          <div style={{ background: '#fff', padding: '25px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid #e9e9eb', marginTop: '10px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '20px', color: 'var(--primary)', fontWeight: 700 }}>Where should we deliver?</h3>
            
            <div className="input-group" style={{ marginBottom: '20px' }}>
              <label>FULL NAME</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="input-field" 
                placeholder="e.g. Rajesh Kumar"
              />
            </div>

            <div className="input-group" style={{ marginBottom: '20px' }}>
              <label>PHONE NUMBER</label>
              <input 
                type="tel" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                className="input-field" 
                placeholder="e.g. 79898000390"
              />
            </div>

            <div className="input-group">
              <label>COMPLETE ADDRESS</label>
              <textarea 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                className="input-field" 
                rows="4"
                placeholder="e.g. Flat No. 101, Amaravathi Rd, Guntur"
                style={{ resize: 'none' }}
              />
            </div>
          </div>

          <div style={{ padding: '10px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#888' }}>
              <i className='bx bx-shield-quarter'></i> Your details are safe with us.
            </p>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '15px 20px', background: '#fff', boxShadow: '0 -4px 20px rgba(0,0,0,0.05)', zIndex: 100 }}>
        <button 
          className="primary-btn" 
          onClick={handleNext} 
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        >
          CONTINUE TO PAYMENT <i className='bx bx-right-arrow-alt'></i>
        </button>
      </div>
    </div>
  );
}

