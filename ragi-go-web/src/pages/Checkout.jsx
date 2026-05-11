import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { useCart } from '../context/CartContext';
import { hapticSuccess } from '../utils/haptics';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { cartTotal } = useCart();
  
  // Load saved details from localStorage on initial render
  const [name, setName] = useState(localStorage.getItem('savedName') || localStorage.getItem('userName') || '');
  const [phone, setPhone] = useState(localStorage.getItem('savedPhone') || localStorage.getItem('userPhone') || '');
  const [address, setAddress] = useState(localStorage.getItem('userAddress') || localStorage.getItem('savedAddress') || '');
  const [gpsLocation, setGpsLocation] = useState(localStorage.getItem('userGpsLocation') || null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const navigate = useNavigate();

  const handleNext = () => {
    if (cartTotal === 0) {
      toast.error("Your cart is empty. Please add some items before checking out.");
      navigate('/menu');
      return;
    }
    if (!name || !address || !phone) {
      toast.error("Please enter name, phone and address");
      return;
    }
    if (!gpsLocation) {
      toast.error("Please capture your current location using the 'Use Current Location' button before proceeding.");
      return;
    }
    navigate('/payment', { state: { name, phone, address, gpsLocation } });
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
                placeholder="e.g. John Doe"
              />
            </div>

            <div className="input-group" style={{ marginBottom: '20px' }}>
              <label>PHONE NUMBER</label>
              <input 
                type="tel" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                className="input-field" 
                placeholder="e.g. 9876543210"
              />
            </div>

            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>COMPLETE ADDRESS</span>
                {gpsLocation && <span style={{ color: '#2e7d32', fontWeight: 600, fontSize: '11px' }}><i className='bx bx-check-circle'></i> Location Saved</span>}
              </label>
              <textarea 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                className="input-field" 
                rows="4"
                placeholder="e.g. Flat No. 101, Amaravathi Rd, Guntur"
                style={{ resize: 'none' }}
              />
              
              <button 
                type="button"
                onClick={() => {
                  if (navigator.geolocation) {
                    setIsProcessing(true);
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        setGpsLocation(`${pos.coords.latitude},${pos.coords.longitude}`);
                        setIsProcessing(false);
                      },
                      (err) => {
                        toast.error("Could not automatically detect your location.");
                        setIsProcessing(false);
                      }
                    );
                  } else {
                    toast.error("Location services are not supported by your browser");
                  }
                }}
                style={{ marginTop: '10px', width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: gpsLocation ? '#e8f5e9' : '#f1f1f6', color: gpsLocation ? '#2e7d32' : 'var(--text-main)', border: gpsLocation ? '1px solid #c8e6c9' : '1px solid #e9e9eb', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                <i className='bx bx-current-location' style={{ fontSize: '16px' }}></i> 
                {isProcessing ? 'Detecting Location...' : gpsLocation ? 'Update Delivery Location' : 'Use Current Location'}
              </button>
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
          disabled={isProcessing}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        >
          CONTINUE TO PAYMENT <i className='bx bx-right-arrow-alt'></i>
        </button>
      </div>
    </div>
  );
}

