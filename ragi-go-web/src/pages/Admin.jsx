import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../apiConfig';
import ProgressiveImage from '../components/ProgressiveImage';

const STATUS_OPTIONS = ["Pending", "Accepted", "Out for Delivery", "Delivered", "Cancelled"];

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'menu'
  const [menuItems, setMenuItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null); // null for new, {id, name, ...} for edit
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', imageUrl: '', available: true });
  const navigate = useNavigate();

  // Professional notification sound
  const notificationSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

  useEffect(() => {
    fetchOrders();
    fetchMenu();
    // Auto-refresh every 5 seconds for real-time feel
    const interval = setInterval(() => {
      if (activeTab === 'orders') fetchOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, [lastOrderCount, activeTab]);

  const fetchOrders = () => {
    axios.get(`${API_BASE_URL}/orders`)
      .then(res => {
        const data = res.data || [];
        // Show latest first by timestamp
        const sorted = data.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        // Trigger notification if order count increases
        if (data.length > lastOrderCount && lastOrderCount !== 0) {
          notificationSound.play().catch(e => console.log("Sound play blocked by browser"));
          setNewOrderAlert(true);
          setTimeout(() => setNewOrderAlert(false), 8000);
        }

        setOrders(sorted);
        if (data.length > 0) setLastOrderCount(data.length);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching orders", err);
        setLoading(false);
      });
  };

  const fetchMenu = () => {
    axios.get(`${API_BASE_URL}/menu/all`)
      .then(res => setMenuItems(res.data || []))
      .catch(err => console.error("Error fetching menu", err));
  };

  const handleMenuSubmit = (e) => {
    e.preventDefault();
    const action = editingItem ? axios.put(`${API_BASE_URL}/menu/${editingItem.id}`, formData) : axios.post(`${API_BASE_URL}/menu`, formData);

    action.then(() => {
      fetchMenu();
      setShowMenuModal(false);
      setEditingItem(null);
      setFormData({ name: '', price: '', imageUrl: '', available: true });
    }).catch(err => alert('Failed to save menu item'));
  };

  const deleteMenuItem = (id) => {
    if (window.confirm('Delete this item?')) {
      axios.delete(`${API_BASE_URL}/menu/${id}`).then(fetchMenu);
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name, price: item.price, imageUrl: item.imageUrl, available: item.available });
    setShowMenuModal(true);
  };

  const updateStatus = (orderId, targetStatus) => {
    axios.put(`${API_BASE_URL}/orders/${orderId}/status`, { status: targetStatus })
      .then(() => {
        fetchOrders(); // Refresh list
      })
      .catch(err => {
        console.error("Status update failed", err);
        alert('Failed to update status');
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
          <h2 style={{ fontSize: '18px', margin: 0 }}>Admin Dashboard</h2>
        </div>
        <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 800 }}>LIVE</div>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', background: '#fff', borderBottom: '1px solid #e9e9eb', flexShrink: 0 }}>
        <div
          onClick={() => setActiveTab('orders')}
          style={{
            flex: 1, textAlign: 'center', padding: '15px', fontSize: '13px', fontWeight: 800, cursor: 'pointer',
            color: activeTab === 'orders' ? 'var(--primary)' : 'var(--text-light)',
            borderBottom: activeTab === 'orders' ? '2px solid var(--primary)' : 'none'
          }}>
          ORDERS
        </div>
        <div
          onClick={() => setActiveTab('menu')}
          style={{
            flex: 1, textAlign: 'center', padding: '15px', fontSize: '13px', fontWeight: 800, cursor: 'pointer',
            color: activeTab === 'menu' ? 'var(--primary)' : 'var(--text-light)',
            borderBottom: activeTab === 'menu' ? '2px solid var(--primary)' : 'none'
          }}>
          MENU
        </div>
      </div>

      <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
        {activeTab === 'orders' ? (
          <>
            {/* Floating Alert for New Orders */}
            {newOrderAlert && (
              <div className="fade-in-up" style={{
                position: 'absolute', top: '120px', left: '10px', right: '10px',
                background: 'var(--primary)', color: '#fff', padding: '10px 15px', borderRadius: '50px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 8px 20px rgba(252, 128, 25, 0.4)', zIndex: 9999, fontWeight: 800, fontSize: '11px', textAlign: 'center'
              }}>
                <i className='bx bxs-bell-ring bx-tada' style={{ fontSize: '16px' }}></i>
                NEW ORDER RECEIVED!
              </div>
            )}

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid #e9e9eb' }}>
                <div style={{ color: 'var(--text-light)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Total Orders</div>
                <div style={{ fontSize: '24px', fontWeight: 800 }}>{orders.length}</div>
              </div>
              <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid #e9e9eb' }}>
                <div style={{ color: 'var(--text-light)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Pending</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>
                  {orders.filter(o => o.status === 'Pending').length}
                </div>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}><p>Loading orders...</p></div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: '40px' }}><p>No active orders</p></div>
            ) : (
              orders.map((order, index) => (
                <div key={order.id} className="fade-in-up" style={{
                  background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '16px',
                  boxShadow: 'var(--shadow-sm)', border: '1px solid #e9e9eb', animationDelay: `${index * 0.1}s`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f1f1f6' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800 }}>Order #{order.id}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>{order.name} • {order.phone}</div>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 800 }}>₹{order.total}</div>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.quantity} x {item.name}</div>
                    ))}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '16px', padding: '10px', background: '#f8f8f8', borderRadius: '8px' }}>
                    <i className='bx bx-map' style={{ marginRight: '5px' }}></i>{order.address}
                  </div>
                  <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '5px' }}>
                    {STATUS_OPTIONS.map(status => (
                      <button
                        key={status} onClick={() => updateStatus(order.id, status)}
                        style={{
                          padding: '6px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 800, cursor: 'pointer', flex: 1,
                          border: '1px solid ' + (order.status === status ? getStatusColor(status) : '#e9e9eb'),
                          background: order.status === status ? getStatusColor(status) : '#fff',
                          color: order.status === status ? '#fff' : 'var(--text-secondary)'
                        }}
                      >{status}</button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </>
        ) : (
          <div className="menu-management">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Manage Menu</h3>
              <button
                onClick={() => { setEditingItem(null); setFormData({ name: '', price: '', imageUrl: '', available: true }); setShowMenuModal(true); }}
                style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 800 }}
              >+ ADD ITEM</button>
            </div>

            {menuItems.map(item => (
              <div key={item.id} style={{
                background: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '12px',
                display: 'flex', alignItems: 'center', gap: '12px', boxShadow: 'var(--shadow-sm)',
                border: '1px solid #e9e9eb',
                opacity: item.available ? 1 : 0.8
              }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                  <ProgressiveImage src={item.imageUrl} alt="" />
                  {!item.available && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#fff', fontSize: '6px', fontWeight: 800 }}>SOLD OUT</span>
                    </div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {item.name}
                    {!item.available && <span style={{ fontSize: '8px', background: '#ff4d4d', color: '#fff', padding: '1px 4px', borderRadius: '4px' }}>OUT OF STOCK</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 800 }}>₹{item.price}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => openEditModal(item)} style={{ background: '#f8f8f8', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><i className='bx bx-edit-alt' style={{ fontSize: '18px', color: 'var(--text-main)' }}></i></button>
                  <button onClick={() => deleteMenuItem(item.id)} style={{ background: '#fff5f5', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><i className='bx bx-trash' style={{ fontSize: '18px', color: '#ff4d4d' }}></i></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Menu Modal */}
      {showMenuModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="fade-in-up" style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '400px', padding: '24px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
            <form onSubmit={handleMenuSubmit}>
              <div className="input-group" style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-light)', marginBottom: '5px', display: 'block' }}>NAME</label>
                <input
                  type="text" value={formData.name} required
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="input-field" style={{ width: '100%' }}
                />
              </div>
              <div className="input-group" style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-light)', marginBottom: '5px', display: 'block' }}>PRICE (₹)</label>
                <input
                  type="number" value={formData.price} required
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  className="input-field" style={{ width: '100%' }}
                />
              </div>
              <div className="input-group" style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-light)', marginBottom: '5px', display: 'block' }}>IMAGE URL</label>
                <input
                  type="text" value={formData.imageUrl} required
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="input-field" style={{ width: '100%' }}
                />
                <p style={{ fontSize: '10px', color: 'var(--text-light)', marginTop: '4px' }}>
                  <i className='bx bx-info-circle'></i> Tip: Use <b>.webp</b> for 3x faster loading.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                <input
                  type="checkbox" checked={!formData.available}
                  onChange={e => setFormData({ ...formData, available: !e.target.checked })}
                />
                <label style={{ fontSize: '13px', fontWeight: 600 }}>Out of Stock</label>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowMenuModal(false)} style={{ flex: 1, background: '#f1f1f6', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 800 }}>CANCEL</button>
                <button type="submit" style={{ flex: 2, background: 'var(--primary)', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 800 }}>SAVE ITEM</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

