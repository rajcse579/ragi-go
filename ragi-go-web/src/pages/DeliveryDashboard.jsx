import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../apiConfig';

const STATUS_OPTIONS = ["Pending", "Accepted", "Out for Delivery", "Delivered", "Cancelled"];

export default function DeliveryDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = () => {
    const userPhone = localStorage.getItem('userPhone');
    if (!userPhone) {
      setLoading(false);
      return;
    }

    axios.get(`${API_BASE_URL}/orders/assigned/${userPhone}`)
      .then(res => {
        const data = res.data || [];
        const sorted = data.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setOrders(sorted);
        setLastOrderCount(data.length);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching orders", err);
        setLoading(false);
      });
  };

  const updateStatus = (orderId, targetStatus) => {
    if (targetStatus !== "Out for Delivery" && targetStatus !== "Delivered") return; // Restrict to delivery flow
    
    // Optimistic UI update
    const previousOrders = [...orders];
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: targetStatus } : order
    ));
    
    axios.put(`${API_BASE_URL}/orders/${orderId}/status`, { status: targetStatus })
      .then(() => {
        // Just fetch to ensure sync, UI is already updated
        fetchOrders();
      })
      .catch(err => {
        console.error("Status update failed", err);
        alert('Failed to update status');
        setOrders(previousOrders); // Revert on failure
      });
  };

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
    <div className="page-container" style={{ background: '#f8f8f8', position: 'relative', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="header-bar" style={{ flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <i className='bx bx-left-arrow-alt' style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => navigate('/menu')}></i>
          <h2 style={{ fontSize: '18px', margin: 0 }}>Delivery Dashboard</h2>
        </div>
      </div>


      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          <div style={{ background: '#fff', padding: '12px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid #e9e9eb', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-light)', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Total</div>
            <div style={{ fontSize: '18px', fontWeight: 800 }}>{orders.length}</div>
          </div>
          <div style={{ background: '#fff', padding: '12px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid #e9e9eb', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-light)', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Active</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)' }}>
              {orders.filter(o => o.status === 'Accepted' || o.status === 'Out for Delivery').length}
            </div>
          </div>
          <div style={{ background: '#fff', padding: '12px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid #e9e9eb', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-light)', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Done</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#60b246' }}>
              {orders.filter(o => o.status === 'Delivered').length}
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-light)' }}>Loading orders...</div>
        ) : orders.filter(o => o.status === 'Accepted' || o.status === 'Out for Delivery' || o.status === 'Delivered').length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>No orders assigned</div>
        ) : (
          orders.filter(o => o.status === 'Accepted' || o.status === 'Out for Delivery' || o.status === 'Delivered').map(order => (
            <div key={order.id} style={{ background: '#fff', padding: '20px', borderRadius: '16px', marginBottom: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid #e9e9eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f1f1f6' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800 }}>Order #{order.id.slice(-5)}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>{order.name} • {order.phone}</div>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 800 }}>₹{order.total}</div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.quantity} x {item.name}</div>
                ))}
              </div>
              <div 
                onClick={() => {
                  const query = order.gpsLocation || order.address;
                  if (query) {
                    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
                  }
                }}
                style={{ 
                  fontSize: '12px', color: 'var(--text-light)', marginBottom: '16px', padding: '10px', 
                  background: '#f8f8f8', borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <i className='bx bx-map' style={{ marginRight: '5px', color: 'var(--primary)' }}></i>
                    {order.address}
                  </div>
                  {order.gpsLocation && (
                    <div style={{ fontSize: '11px', color: '#2e7d32', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                      <i className='bx bx-target-lock' style={{ fontSize: '14px' }}></i> GPS Location Linked
                    </div>
                  )}
                </div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '3px', marginLeft: '10px', flexShrink: 0 }}>
                  <i className='bx bx-navigation' style={{ fontSize: '14px' }}></i> NAVIGATE
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px' }}>
                {["Out for Delivery", "Delivered"].map(status => {
                  const isCurrent = order.status === status;
                  const isClickable = order.status !== 'Delivered';
                  
                  return (
                    <button
                      key={status} 
                      onClick={() => { if(isClickable) updateStatus(order.id, status); }}
                      style={{
                        padding: '10px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, flex: 1,
                        border: '1px solid ' + (isCurrent ? getStatusColor(status) : '#e9e9eb'),
                        background: isCurrent ? getStatusColor(status) : '#fff',
                        color: isCurrent ? '#fff' : 'var(--text-secondary)',
                        boxShadow: isCurrent ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                        opacity: isClickable ? 1 : 0.7,
                        cursor: isClickable ? 'pointer' : 'not-allowed'
                      }}
                    >{status}</button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
