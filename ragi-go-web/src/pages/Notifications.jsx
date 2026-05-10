import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

export default function Notifications() {
  const navigate = useNavigate();
  const { notifications, markAllAsRead, clearNotifications } = useNotifications();

  useEffect(() => {
    // Mark as read when opening the page
    markAllAsRead();
  }, []);

  const getIcon = (status) => {
    if (status === 'Accepted') return <div style={{background: '#e8f5e9', color: '#2e7d32', padding: '10px', borderRadius: '50%'}}><i className='bx bx-check-circle' style={{fontSize: '24px'}}></i></div>;
    if (status === 'Out for Delivery') return <div style={{background: '#fff3e0', color: '#FC8019', padding: '10px', borderRadius: '50%'}}><i className='bx bx-cycling' style={{fontSize: '24px'}}></i></div>;
    if (status === 'Delivered') return <div style={{background: '#e8f5e9', color: '#2e7d32', padding: '10px', borderRadius: '50%'}}><i className='bx bxs-package' style={{fontSize: '24px'}}></i></div>;
    if (status === 'Promo') return <div style={{background: 'var(--primary-light)', color: 'var(--primary)', padding: '10px', borderRadius: '50%'}}><i className='bx bxs-megaphone' style={{fontSize: '24px'}}></i></div>;
    return <div style={{background: '#f1f1f6', color: '#93959f', padding: '10px', borderRadius: '50%'}}><i className='bx bx-bell' style={{fontSize: '24px'}}></i></div>;
  };

  const formatTime = (timestamp) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="page-container no-scrollbar" style={{ background: '#f8f8f8' }}>
      <div className="header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <i className='bx bx-left-arrow-alt' style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => navigate(-1)}></i>
          <h2 style={{ fontSize: '18px', margin: 0 }}>Notifications</h2>
        </div>
        {notifications.length > 0 && (
          <button 
            onClick={clearNotifications}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '12px', fontWeight: 700 }}
          >
            CLEAR ALL
          </button>
        )}
      </div>

      <div style={{ padding: '20px' }}>
        {notifications.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '60px', textAlign: 'center' }}>
            <div style={{ width: '120px', height: '120px', background: '#fff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <i className='bx bx-bell-off' style={{ fontSize: '50px', color: '#e9e9eb' }}></i>
            </div>
            <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '8px' }}>No notifications yet</h3>
            <p style={{ color: 'var(--text-light)', maxWidth: '250px' }}>When you receive updates about your order, they will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications.map((notif) => (
              <div key={notif.id} className="fade-in-up" style={{
                background: '#fff',
                padding: '16px',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                gap: '16px',
                border: '1px solid #e9e9eb'
              }}>
                {getIcon(notif.status)}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '14px', margin: 0, color: 'var(--text-main)' }}>{notif.title}</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 600 }}>{formatTime(notif.timestamp)}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                    {notif.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
