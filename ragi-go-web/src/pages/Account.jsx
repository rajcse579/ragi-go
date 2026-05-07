import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Account() {
  const navigate = useNavigate();
  const userPhone = localStorage.getItem('userPhone') || '';
  const userName = localStorage.getItem('userName') || 'Guest User';
  const userEmail = localStorage.getItem('userEmail') || '';


  return (
    <div className="page-container" style={{ background: '#fcfcfd', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .account-scroll-container::-webkit-scrollbar { display: none; }
        .account-scroll-container { ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="header-bar" style={{ flexShrink: 0, background: '#fff', borderBottom: '1px solid #f1f1f6' }}>
        <h2 style={{ fontSize: '18px', margin: 0, fontWeight: 800, color: 'var(--text-main)' }}>Account</h2>
      </div>

      <div className="account-scroll-container" style={{ padding: '10px 20px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* Profile Info */}
        <div style={{ textAlign: 'center', marginBottom: '16px', marginTop: '0px' }}>
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
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 2px 0' }}>{userName}</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-light)', margin: 0 }}>{userEmail || userPhone}</p>

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
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>Srikakulam City</div>
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
