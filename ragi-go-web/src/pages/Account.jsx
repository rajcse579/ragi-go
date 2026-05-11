import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { useNotifications } from '../context/NotificationContext';
import toast from 'react-hot-toast';

export default function Account() {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const [userPhone, setUserPhone] = useState(localStorage.getItem('userPhone') || '');
  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'Guest User');
  const [userAddress, setUserAddress] = useState(localStorage.getItem('userAddress') || '');
  const [userGpsLocation, setUserGpsLocation] = useState(localStorage.getItem('userGpsLocation') || '');
  const userEmail = localStorage.getItem('userEmail') || '';

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({
    name: userName,
    phone: userPhone,
    address: userAddress,
    gpsLocation: userGpsLocation,
    password: ''
  });

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    if (!editData.name || !editData.phone) {
      toast.error("Name and Phone are required.");
      return;
    }
    setLoading(true);

    try {
      const payload = {
        email: userEmail,
        name: editData.name,
        phone: editData.phone,
        address: editData.address,
        password: editData.password
      };
      if (editData.gpsLocation) {
        payload.gpsLocation = editData.gpsLocation;
      }

      const response = await axios.put(`${API_BASE_URL}/auth/profile`, payload);
      
      const updatedUser = response.data;
      localStorage.setItem('userName', updatedUser.name);
      localStorage.setItem('userPhone', updatedUser.phone);
      if (updatedUser.address) {
        localStorage.setItem('userAddress', updatedUser.address);
      }
      if (updatedUser.gpsLocation) {
        localStorage.setItem('userGpsLocation', updatedUser.gpsLocation);
      }
      
      setUserName(updatedUser.name);
      setUserPhone(updatedUser.phone);
      setUserAddress(updatedUser.address || '');
      setUserGpsLocation(updatedUser.gpsLocation || '');
      setIsEditing(false);
      setEditData({ ...editData, password: '' });
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="page-container" style={{ background: '#fcfcfd', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .account-scroll-container::-webkit-scrollbar { display: none; }
        .account-scroll-container { ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="header-bar" style={{ flexShrink: 0, background: '#fff', borderBottom: '1px solid #f1f1f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '18px', margin: 0, fontWeight: 800, color: 'var(--text-main)' }}>Account</h2>

        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => navigate('/notifications')}>
          <i className='bx bx-bell' style={{ fontSize: '24px', color: 'var(--text-main)' }}></i>
          {unreadCount > 0 && (
            <div style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              background: 'var(--primary)',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 800,
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #fff'
            }}>
              {unreadCount}
            </div>
          )}
        </div>
      </div>

      <div className="account-scroll-container" style={{ padding: '10px 20px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* Profile Info */}
        <div style={{ textAlign: 'center', marginBottom: '16px', marginTop: '0px', position: 'relative' }}>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              style={{ position: 'absolute', top: 0, right: 0, background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
            >
              <i className='bx bxs-edit' ></i> EDIT
            </button>
          )}

          <div style={{
            width: '64px', height: '64px', background: '#fff',
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 10px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '2px solid #fff',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '100%', height: '100%',
              background: '#f1f3f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <i className='bx bxs-user' style={{ fontSize: '32px', color: '#93959f' }}></i>
            </div>
          </div>
          
          {!isEditing ? (
            <>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 2px 0' }}>{userName}</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-light)', margin: 0 }}>{userEmail || userPhone}</p>
            </>
          ) : (
            <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', border: '1px solid #f1f1f6', marginTop: '16px', textAlign: 'left', boxShadow: 'var(--shadow-sm)' }}>
              <h4 style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 800 }}>Edit Profile</h4>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#93959f', marginBottom: '6px' }}>FULL NAME</label>
                <input type="text" name="name" value={editData.name} onChange={handleEditChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e9e9eb', outline: 'none', fontFamily: 'inherit', fontSize: '14px' }} />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#93959f', marginBottom: '6px' }}>PHONE NUMBER</label>
                <input type="tel" name="phone" value={editData.phone} onChange={handleEditChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e9e9eb', outline: 'none', fontFamily: 'inherit', fontSize: '14px' }} />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800, color: '#93959f', marginBottom: '6px' }}>
                  <span>COMPLETE ADDRESS</span>
                  {editData.gpsLocation && <span style={{ color: '#2e7d32', fontWeight: 600 }}><i className='bx bx-check-circle'></i> Location Saved</span>}
                </label>
                <textarea name="address" value={editData.address || ''} onChange={handleEditChange} rows="3" placeholder="e.g. Flat No. 101, Amaravathi Rd, Guntur" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e9e9eb', outline: 'none', fontFamily: 'inherit', fontSize: '14px', resize: 'none' }}></textarea>
                
                <button 
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      setLoading(true);
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          setEditData({...editData, gpsLocation: `${pos.coords.latitude},${pos.coords.longitude}`});
                          setLoading(false);
                        },
                        (err) => {
                          toast.error("Could not automatically detect your location.");
                          setLoading(false);
                        }
                      );
                    } else {
                      toast.error("Location services are not supported by your browser");
                    }
                  }}
                  style={{ marginTop: '10px', width: '100%', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: editData.gpsLocation ? '#e8f5e9' : '#f1f1f6', color: editData.gpsLocation ? '#2e7d32' : 'var(--text-main)', border: editData.gpsLocation ? '1px solid #c8e6c9' : '1px solid #e9e9eb', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  <i className='bx bx-current-location' style={{ fontSize: '16px' }}></i> 
                  {editData.gpsLocation ? 'Update Delivery Location' : 'Use Current Location'}
                </button>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#93959f', marginBottom: '6px' }}>NEW PASSWORD <span style={{fontWeight: 400}}>(Optional)</span></label>
                <input type="password" name="password" placeholder="••••••••" value={editData.password} onChange={handleEditChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e9e9eb', outline: 'none', fontFamily: 'inherit', fontSize: '14px' }} />
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setIsEditing(false)} style={{ flex: 1, padding: '12px', background: '#f1f1f6', color: 'var(--text-main)', borderRadius: '10px', fontWeight: 800, fontSize: '13px' }}>CANCEL</button>
                <button onClick={saveProfile} disabled={loading} style={{ flex: 1, padding: '12px', background: 'var(--primary)', color: '#fff', borderRadius: '10px', fontWeight: 800, fontSize: '13px' }}>
                  {loading ? 'SAVING...' : 'SAVE CHANGES'}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Service Status Card */}
        <div style={{
          background: '#fff', padding: '20px', borderRadius: '16px',
          marginBottom: '20px', border: '1px solid #f1f1f6',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: '#f8f8fb', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6e707e' }}>
              <i className='bx bx-map-alt' style={{ fontSize: '20px' }}></i>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#93959f', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>Operating In</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>Amadalavalasa</div>
            </div>
          </div>
          <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 800 }}>ACTIVE</div>
        </div>

        {/* Support Card */}
        <div style={{
          background: '#fff', padding: '20px', borderRadius: '16px',
          marginBottom: '16px', boxShadow: '0 2px 15px rgba(0,0,0,0.04)', border: '1px solid #f1f1f6'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className='bx bxs-help-circle' style={{ color: 'var(--primary)' }}></i>
            Help & Support
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '16px', lineHeight: '1.4' }}>
            Questions about your order? Our team is here to help you.
          </p>
          <a
            href="https://wa.me/918186903873"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              background: '#25D366', color: '#fff', padding: '12px',
              borderRadius: '12px', textDecoration: 'none', fontWeight: 800, fontSize: '12px'
            }}
          >
            <i className='bx bxl-whatsapp' style={{ fontSize: '18px' }}></i>
            CHAT ON WHATSAPP
          </a>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          style={{
            width: '100%', background: '#fff', color: '#ff4d4d', border: '1px solid #ffebeb',
            padding: '14px', borderRadius: '16px', fontWeight: 800, fontSize: '13px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            marginBottom: '20px'
          }}
        >
          <i className='bx bx-log-out'></i>
          LOGOUT
        </button>

        {/* Professional Product Footer */}
        <div style={{ textAlign: 'center', padding: '100px 0 40px', background: 'transparent' }}>
          <div style={{ width: '32px', height: '2px', background: 'linear-gradient(to right, #e2e8f0, #cbd5e0, #e2e8f0)', margin: '0 auto 16px', borderRadius: '2px' }}></div>
          <p style={{
            fontSize: '9px',
            color: '#718096',
            fontWeight: 700,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            marginBottom: '4px'
          }}>
            Powered by
          </p>
          <p style={{
            fontSize: '12px',
            color: '#2d3748',
            fontWeight: 800,
            letterSpacing: '0.5px'
          }}>
            Shanvik Technologies
          </p>
          <div style={{ fontSize: '10px', color: '#a0aec0', marginTop: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#cbd5e0' }}></span>
            Version 1.0.0
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav" style={{ flexShrink: 0 }}>
        <div className="nav-item" onClick={() => navigate('/menu')}>
          <i className='bx bx-home-circle'></i>
          <span>Home</span>
        </div>
        <div className="nav-item" onClick={() => navigate('/cart')}>
          <i className='bx bx-shopping-bag'></i>
          <span>Cart</span>
        </div>
        <div className="nav-item" onClick={() => navigate('/orders')}>
          <i className='bx bx-receipt'></i>
          <span>Orders</span>
        </div>
        <div className="nav-item active" onClick={() => navigate('/account')}>
          <i className='bx bxs-user-circle'></i>
          <span>Account</span>
        </div>
      </div>
    </div>
  );
}
