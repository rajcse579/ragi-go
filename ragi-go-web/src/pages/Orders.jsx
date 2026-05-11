import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();
  const { unreadCount } = useNotifications();
  const showSuccess = location.state?.success;

  useEffect(() => {
    const userPhone = localStorage.getItem('userPhone') || 'Unknown';
    
    // 1. Instant Load from Cache
    const cachedOrders = localStorage.getItem('ordersCache');
    if (cachedOrders) {
      try {
        setOrders(JSON.parse(cachedOrders));
        setLoading(false);
      } catch(e) {}
    }

    // 2. Real-time Firestore Listener
    import('firebase/firestore').then(({ collection, query, where, onSnapshot }) => {
      import('../firebase').then(({ db }) => {
        const ordersQuery = query(collection(db, 'orders'), where('phone', '==', userPhone));
        
        const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
          const fetchedOrders = [];
          snapshot.forEach(doc => {
            fetchedOrders.push({ id: doc.id, ...doc.data() });
          });

          // Sort latest first
          const sorted = fetchedOrders.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          setOrders(sorted);
          localStorage.setItem('ordersCache', JSON.stringify(sorted));
          setLoading(false);
        }, (error) => {
          console.error("Firestore listen error", error);
          setLoading(false);
        });

        // Cleanup listener on unmount
        return () => unsubscribe();
      });
    });
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#ffb700';
      case 'Accepted': return '#60b246';
      case 'Out for Delivery': return '#FC8019';
      case 'Delivered': return '#60b246';
      case 'Cancelled': return '#ff4d4d';
      default: return '#93959f';
    }
  };

  return (
    <div className="page-container" style={{ background: '#f8f8f8' }}>
      <div className="header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <i className='bx bx-left-arrow-alt' style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => navigate('/menu')}></i>
          <h2 style={{ fontSize: '18px', margin: 0 }}>My Orders</h2>
        </div>

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

      <div style={{ padding: '0 20px 20px', flex: 1, width: '100%' }}>
        {showSuccess && (
          <div className="fade-in-up" style={{
            background: '#fff',
            padding: '24px',
            borderRadius: '16px',
            marginBottom: '24px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid #e9e9eb'
          }}>
            <div className="success-icon" style={{ width: '60px', height: '60px', background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 16px' }}>
              <i className='bx bxs-check-circle' style={{ fontSize: '32px', color: 'var(--primary)' }}></i>
            </div>
            <h3 style={{ fontSize: '20px', marginBottom: '4px' }}>Order Placed Successfully!</h3>
            <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '14px' }}>Your healthy meal is being prepared with care.</p>
          </div>
        )}

        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} style={{
              background: '#fff',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '16px',
              border: '1px solid #e9e9eb',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f1f1f6' }}>
                <div style={{ width: '40%' }}>
                  <div className="skeleton skeleton-title" style={{ width: '80%' }}></div>
                  <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
                </div>
                <div style={{ width: '20%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <div className="skeleton skeleton-text" style={{ width: '100%', height: '14px' }}></div>
                  <div className="skeleton skeleton-text" style={{ width: '70%', height: '10px', marginTop: '4px' }}></div>
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <div className="skeleton skeleton-text" style={{ width: '50%' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '40%' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #f1f1f6', paddingTop: '12px' }}>
                <div className="skeleton skeleton-text" style={{ width: '30%' }}></div>
                <div className="skeleton" style={{ width: '70px', height: '24px', borderRadius: '4px' }}></div>
              </div>
            </div>
          ))
        ) : orders.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '60px', textAlign: 'center' }}>
            <div style={{ width: '120px', height: '120px', background: '#fff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <i className='bx bx-receipt' style={{ fontSize: '50px', color: '#e9e9eb' }}></i>
            </div>
            <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '8px' }}>No orders yet</h3>
            <p style={{ color: 'var(--text-light)', maxWidth: '200px' }}>When you place an order, it will appear here.</p>
          </div>
        ) : (
          orders.map((order, index) => {
            const isActive = order.status !== 'Delivered' && order.status !== 'Cancelled';
            const progress = order.status === 'Pending' ? 25 : order.status === 'Accepted' ? 50 : order.status === 'Out for Delivery' ? 75 : 100;
            
            return (
            <div key={order.id} className="fade-in-up" style={{
              background: '#fff',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '16px',
              boxShadow: isActive ? '0 8px 24px rgba(96, 178, 70, 0.15)' : 'var(--shadow-sm)',
              border: isActive ? '1px solid var(--primary)' : '1px solid #e9e9eb',
              animationDelay: `${index * 0.1}s`,
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Active Order Glowing Header */}
              {isActive && (
                <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '8px', margin: '-20px -20px 16px -20px', fontSize: '12px', fontWeight: 800, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                  <i className='bx bx-time-five bx-spin'></i> LIVE ORDER TRACKING
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f1f1f6' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800 }}>Raagi GO</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: getStatusColor(order.status), fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>{order.status}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>ID #{order.id.slice(-5)}</div>
                </div>
              </div>

              {/* Progress Bar for Active Orders */}
              {isActive && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '10px', fontWeight: 800, color: 'var(--text-light)' }}>
                    <span style={{ color: progress >= 25 ? 'var(--primary)' : 'inherit' }}>Pending</span>
                    <span style={{ color: progress >= 50 ? 'var(--primary)' : 'inherit' }}>Accepted</span>
                    <span style={{ color: progress >= 75 ? 'var(--primary)' : 'inherit' }}>On The Way</span>
                  </div>
                  <div style={{ height: '6px', background: '#f1f1f6', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--primary)', width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}></div>
                  </div>
                  <div style={{ marginTop: '12px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center', background: '#f8f8f8', padding: '10px', borderRadius: '8px' }}>
                    {order.status === 'Pending' && "Waiting for restaurant to confirm your order..."}
                    {order.status === 'Accepted' && "Your healthy meal is being prepared!"}
                    {order.status === 'Out for Delivery' && "Your order is on the way to you!"}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <span>{item.quantity} x {item.name}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #f1f1f6', paddingTop: '12px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>Total Paid: <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>₹{order.total}</span></span>
                <button
                  style={{ background: 'none', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}
                  onClick={() => navigate('/menu')}
                >
                  REORDER
                </button>
              </div>
            </div>
          )})
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <div className="nav-item" onClick={() => navigate('/menu')}>
          <i className='bx bx-home-circle'></i>
          <span>Home</span>
        </div>
        <div className="nav-item" onClick={() => navigate('/cart')}>
          <i className='bx bx-shopping-bag'></i>
          <span>Cart</span>
          {cartCount > 0 && <div className="badge">{cartCount}</div>}
        </div>
        <div className="nav-item active" onClick={() => navigate('/orders')}>
          <i className='bx bxs-receipt'></i>
          <span>Orders</span>
        </div>
        <div className="nav-item" onClick={() => navigate('/account')}>
          <i className='bx bx-user-circle'></i>
          <span>Account</span>
        </div>
      </div>
    </div>
  );
}

