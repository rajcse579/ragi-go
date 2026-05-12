import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../apiConfig';
import ProgressiveImage from '../components/ProgressiveImage';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ["Pending", "Accepted", "Out for Delivery", "Delivered", "Cancelled"];

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastOrderCount, setLastOrderCount] = useState(0);

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'menu'
  const [menuItems, setMenuItems] = useState([]);
  const [deliveryGuys, setDeliveryGuys] = useState([]);
  const [editingItem, setEditingItem] = useState(null); // null for new, {id, name, ...} for edit
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', imageUrl: '', available: true });
  const [promoForm, setPromoForm] = useState({ title: '', body: '' });
  const [isSendingPromo, setIsSendingPromo] = useState(false);
  const [showBroadcastConfirm, setShowBroadcastConfirm] = useState(false);
  const [promoSuccess, setPromoSuccess] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [orderFilter, setOrderFilter] = useState('All');
  const navigate = useNavigate();

  const [isShopOpen, setIsShopOpen] = useState(true);



  useEffect(() => {
    fetchShopStatus();
    fetchMenu();
    fetchDeliveryGuys();

    // Real-time Firestore Listener for Orders
    let unsubscribe;
    import('firebase/firestore').then(({ collection, onSnapshot }) => {
      import('../firebase').then(({ db }) => {
        const ordersQuery = collection(db, 'orders');
        unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
          const fetchedOrders = [];
          snapshot.forEach(doc => {
            fetchedOrders.push({ id: doc.id, ...doc.data() });
          });

          // Sort latest first
          const sorted = fetchedOrders.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

          // Trigger notification if order count increases
          setOrders(prevOrders => {

            return sorted;
          });

          setLoading(false);
        }, (error) => {
          console.error("Firestore listen error", error);
          setLoading(false);
        });
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const fetchShopStatus = () => {
    axios.get(`${API_BASE_URL}/settings/status`)
      .then(res => setIsShopOpen(res.data.isOpen))
      .catch(err => console.error("Error fetching shop status", err));
  };

  const toggleShopStatus = () => {
    const newStatus = !isShopOpen;
    // Removed window.confirm popup as requested

    // Optimistic UI update for instant feedback
    setIsShopOpen(newStatus);

    axios.put(`${API_BASE_URL}/settings/status`, { isOpen: newStatus })
      .catch(err => {
        // Revert on failure
        setIsShopOpen(!newStatus);
        toast.error("Failed to update shop status");
      });
  };

  // fetchOrders is now handled by Firestore listener in useEffect

  const fetchMenu = () => {
    axios.get(`${API_BASE_URL}/menu/all`)
      .then(res => setMenuItems(res.data || []))
      .catch(err => console.error("Error fetching menu", err));
  };

  const fetchDeliveryGuys = () => {
    axios.get(`${API_BASE_URL}/delivery-guys`)
      .then(res => setDeliveryGuys(res.data || []))
      .catch(err => console.error("Error fetching delivery guys", err));
  };

  const handleMenuSubmit = (e) => {
    e.preventDefault();
    const action = editingItem ? axios.put(`${API_BASE_URL}/menu/${editingItem.id}`, formData) : axios.post(`${API_BASE_URL}/menu`, formData);

    action.then(() => {
      fetchMenu();
      setShowMenuModal(false);
      setEditingItem(null);
      setFormData({ name: '', price: '', imageUrl: '', available: true });
    }).catch(err => toast.error('Failed to save menu item'));
  };

  const deleteMenuItem = (id) => {
    setItemToDelete(id);
  };

  const confirmDeleteMenuItem = () => {
    if (itemToDelete) {
      axios.delete(`${API_BASE_URL}/menu/${itemToDelete}`).then(() => {
        fetchMenu();
        setItemToDelete(null);
      });
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name, price: item.price, imageUrl: item.imageUrl, available: item.available });
    setShowMenuModal(true);
  };

  const handleSendPromo = (e) => {
    e.preventDefault();
    if (!promoForm.title || !promoForm.body) {
      toast.error("Title and Message are required!");
      return;
    }
    setShowBroadcastConfirm(true);
  };

  const confirmSendPromo = async () => {
    setShowBroadcastConfirm(false);
    setIsSendingPromo(true);
    try {
      const { collection, addDoc } = await import('firebase/firestore');
      const { db } = await import('../firebase');

      await addDoc(collection(db, 'broadcasts'), {
        title: promoForm.title,
        body: promoForm.body,
        timestamp: Date.now(),
        type: 'promotional'
      });

      setPromoForm({ title: '', body: '' });
      setPromoSuccess(true);
      setTimeout(() => setPromoSuccess(false), 4000);
    } catch (err) {
      console.error("Error sending broadcast", err);
      toast.error("Failed to send broadcast");
    } finally {
      setIsSendingPromo(false);
    }
  };

  const updateStatus = (orderId, targetStatus) => {
    // Optimistic update for instant feedback
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status: targetStatus } : order
      )
    );

    axios.put(`${API_BASE_URL}/orders/${orderId}/status`, { status: targetStatus })
      .catch(err => {
        console.error("Status update failed", err);
        toast.error('Failed to update status');
        // If it fails, the real-time listener will eventually revert it to the server state.
      });
  };

  const deleteOrder = (orderId) => {
    setOrderToDelete(orderId);
  };

  const confirmDeleteOrder = () => {
    if (orderToDelete) {
      axios.delete(`${API_BASE_URL}/orders/${orderToDelete}`)
        .then(() => {
          toast.success('Order deleted successfully');
          setOrderToDelete(null);
        })
        .catch(err => {
          console.error("Delete failed", err);
          toast.error('Failed to delete order');
          setOrderToDelete(null);
        });
    }
  };

  const assignOrder = (orderId, deliveryGuyPhone) => {
    axios.put(`${API_BASE_URL}/orders/${orderId}/assign`, { assignedTo: deliveryGuyPhone })
      .catch(err => {
        console.error("Assign failed", err);
        toast.error('Failed to assign order');
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

        {/* Modern Shop Open/Close Toggle Switch */}
        <div
          onClick={toggleShopStatus}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
        >
          <span style={{
            fontSize: '11px',
            fontWeight: 800,
            color: isShopOpen ? 'var(--primary)' : 'var(--text-light)',
            transition: 'color 0.3s'
          }}>
            {isShopOpen ? 'SHOP OPEN' : 'SHOP CLOSED'}
          </span>
          <div style={{
            width: '44px',
            height: '24px',
            background: isShopOpen ? 'var(--primary)' : '#e9e9eb',
            borderRadius: '24px',
            position: 'relative',
            transition: 'background 0.3s ease',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              background: '#fff',
              borderRadius: '50%',
              position: 'absolute',
              top: '2px',
              left: isShopOpen ? '22px' : '2px',
              transition: 'left 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}></div>
          </div>
        </div>
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
        <div
          onClick={() => setActiveTab('notifications')}
          style={{
            flex: 1, textAlign: 'center', padding: '15px', fontSize: '13px', fontWeight: 800, cursor: 'pointer',
            color: activeTab === 'notifications' ? 'var(--primary)' : 'var(--text-light)',
            borderBottom: activeTab === 'notifications' ? '2px solid var(--primary)' : 'none'
          }}>
          NOTIFY
        </div>
        <div
          onClick={() => setActiveTab('delivery')}
          style={{
            flex: 1, textAlign: 'center', padding: '15px', fontSize: '13px', fontWeight: 800, cursor: 'pointer',
            color: activeTab === 'delivery' ? 'var(--primary)' : 'var(--text-light)',
            borderBottom: activeTab === 'delivery' ? '2px solid var(--primary)' : 'none'
          }}>
          DELIVERY
        </div>
      </div>

      <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
        {activeTab === 'orders' ? (
          <>


            {/* Stats Row */}
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', marginBottom: '24px', paddingBottom: '5px' }}>
              <div 
                onClick={() => setOrderFilter('All')}
                style={{ 
                  background: orderFilter === 'All' ? 'var(--primary-light)' : '#fff', 
                  padding: '16px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid ' + (orderFilter === 'All' ? 'var(--primary)' : '#e9e9eb'),
                  cursor: 'pointer', minWidth: '120px', flexShrink: 0
                }}
              >
                <div style={{ color: 'var(--text-light)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Total Orders</div>
                <div style={{ fontSize: '24px', fontWeight: 800 }}>{orders.length}</div>
              </div>

              {['Pending', 'Accepted', 'Out for Delivery', 'Delivered', 'Cancelled'].map(status => {
                const count = orders.filter(o => o.status === status).length;
                const isSelected = orderFilter === status;
                return (
                  <div 
                    key={status}
                    onClick={() => setOrderFilter(status)}
                    style={{ 
                      background: isSelected ? 'var(--primary-light)' : '#fff', 
                      padding: '16px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid ' + (isSelected ? 'var(--primary)' : '#e9e9eb'),
                      cursor: 'pointer', minWidth: '120px', flexShrink: 0
                    }}
                  >
                    <div style={{ color: 'var(--text-light)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>{status}</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: status === 'Pending' ? 'var(--primary)' : 'inherit' }}>{count}</div>
                  </div>
                );
              })}
            </div>

            {/* Delivery Stats removed from here */}

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}><p>Loading orders...</p></div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: '40px' }}><p>No active orders</p></div>
            ) : (
              orders
                .filter(order => orderFilter === 'All' || order.status === orderFilter)
                .map((order, index) => (
                  <div key={order.id} className="fade-in-up" style={{
                  background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '16px',
                  boxShadow: 'var(--shadow-sm)', border: '1px solid #e9e9eb', animationDelay: `${index * 0.1}s`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f1f1f6' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800 }}>Order #{order.id.slice(-5)}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                        {order.name} • {order.phone} • {order.timestamp ? new Date(order.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true }) : 'N/A'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 800 }}>₹{order.total}</div>
                      <button 
                        onClick={() => deleteOrder(order.id)} 
                        style={{ 
                          background: '#f1f1f6', 
                          border: 'none', 
                          padding: '6px', 
                          borderRadius: '6px', 
                          cursor: 'pointer',
                          color: 'var(--text-light)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <i className='bx bx-trash' style={{ fontSize: '14px' }}></i>
                      </button>
                    </div>
                  </div>
                  <div style={{ marginBottom: '16px', background: '#fafafa', padding: '12px', borderRadius: '8px', border: '1px solid #f1f1f6' }}>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: idx === order.items.length - 1 ? 0 : '6px' }}>
                        <span><span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{item.quantity}</span> x {item.name}</span>
                      </div>
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
                    <span style={{ 
                      fontSize: '11px', fontWeight: 800, color: 'var(--primary)', 
                      display: 'flex', alignItems: 'center', gap: '3px', marginLeft: '10px', flexShrink: 0,
                      background: 'var(--primary-light)', padding: '4px 8px', borderRadius: '4px'
                    }}>
                      <i className='bx bx-navigation' style={{ fontSize: '14px' }}></i> NAVIGATE
                    </span>
                  </div>

                  {/* Management Section */}
                  <div style={{ background: '#f5f5f7', padding: '12px', borderRadius: '12px', marginTop: '16px' }}>
                    <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-light)', flexShrink: 0, width: '100px' }}>STATUS:</label>
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        style={{
                          padding: '8px 30px 8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #e9e9eb',
                          fontSize: '13px',
                          fontWeight: '600',
                          width: '100%',
                          outline: 'none',
                          background: '#fff',
                          cursor: 'pointer',
                          appearance: 'none',
                          WebkitAppearance: 'none',
                          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2393959f' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 10px center',
                          color: 'var(--text-main)',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}
                      >
                        {STATUS_OPTIONS.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>

                    {/* Assign Delivery Guy */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-light)', flexShrink: 0, width: '100px' }}>ASSIGN TO:</label>
                      <select
                        value={order.assignedTo || ''}
                        onChange={(e) => assignOrder(order.id, e.target.value)}
                        disabled={order.status === 'Pending'}
                        style={{
                          padding: '8px 30px 8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #e9e9eb',
                          fontSize: '13px',
                          fontWeight: '600',
                          width: '100%',
                          outline: 'none',
                          background: order.status === 'Pending' ? '#f5f5f7' : '#fff',
                          cursor: order.status === 'Pending' ? 'not-allowed' : 'pointer',
                          appearance: 'none',
                          WebkitAppearance: 'none',
                          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2393959f' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 10px center',
                          color: order.status === 'Pending' ? 'var(--text-light)' : 'var(--text-main)',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}
                      >
                        <option value="">Unassigned</option>
                        {deliveryGuys.map(guy => (
                          <option key={guy.phone} value={guy.phone}>{guy.name} ({guy.phone})</option>
                        ))}
                      </select>
                    </div>
                    </div>
                  </div>
              ))
            )}
          </>
        ) : activeTab === 'menu' ? (
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
        ) : activeTab === 'notifications' ? (
          <div className="notifications-management">
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px' }}>Send App Notification</h3>

            {promoSuccess && (
              <div className="fade-in-up" style={{ background: '#e8f5e9', color: '#2e7d32', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 800 }}>
                <i className='bx bx-check-circle' style={{ fontSize: '20px' }}></i>
                Broadcast sent successfully!
              </div>
            )}

            <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid #e9e9eb' }}>
              <form onSubmit={handleSendPromo}>
                <div className="input-group" style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-light)', marginBottom: '8px', display: 'block' }}>NOTIFICATION TITLE</label>
                  <input
                    type="text" value={promoForm.title} required
                    placeholder="e.g., Weekend Special Offer! 🎉"
                    onChange={e => setPromoForm({ ...promoForm, title: e.target.value })}
                    className="input-field" style={{ width: '100%', fontSize: '14px' }}
                  />
                </div>
                <div className="input-group" style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-light)', marginBottom: '8px', display: 'block' }}>MESSAGE BODY</label>
                  <textarea
                    value={promoForm.body} required rows="4"
                    placeholder="e.g., Get 20% off on all healthy bowls today. Order now!"
                    onChange={e => setPromoForm({ ...promoForm, body: e.target.value })}
                    className="input-field" style={{ width: '100%', resize: 'none', fontSize: '14px' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSendingPromo}
                  style={{ width: '100%', background: 'var(--primary)', color: '#fff', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 800, fontSize: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: isSendingPromo ? 0.7 : 1 }}
                >
                  <i className='bx bxs-megaphone' style={{ fontSize: '18px' }}></i>
                  {isSendingPromo ? 'SENDING BROADCAST...' : 'BROADCAST TO ALL USERS'}
                </button>
              </form>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-light)', textAlign: 'center', marginTop: '16px', lineHeight: 1.5 }}>
              <i className='bx bx-info-circle'></i> This will trigger a native push notification to all users who have the app installed.
            </p>
          </div>
        ) : activeTab === 'delivery' ? (
          <div className="delivery-management">
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px' }}>Delivery Performance</h3>

            <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid #e9e9eb' }}>
              {deliveryGuys.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>No delivery guys registered</div>
              ) : (
                deliveryGuys.map(guy => {
                  const deliveredCount = orders.filter(o => o.assignedTo === guy.phone && o.status === 'Delivered').length;
                  const activeCount = orders.filter(o => o.assignedTo === guy.phone && (o.status === 'Accepted' || o.status === 'Out for Delivery')).length;
                  return (
                    <div key={guy.phone} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', padding: '12px 0', borderBottom: '1px solid #f1f1f6' }}>
                      <div>
                        <div style={{ fontWeight: 800 }}>{guy.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>{guy.phone}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: '#60b246' }}>{deliveredCount} Done</div>
                        <div style={{ fontSize: '11px', color: 'var(--primary)' }}>{activeCount} Active</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Delete Item Confirm Modal */}
      {itemToDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="fade-in-up" style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '350px', padding: '24px', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', background: '#fff5f5', color: '#ff4d4d', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <i className='bx bx-trash' style={{ fontSize: '32px' }}></i>
            </div>
            <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '18px' }}>Delete Item?</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete this item from the menu?
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setItemToDelete(null)} style={{ flex: 1, background: '#f1f1f6', color: 'var(--text-main)', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>CANCEL</button>
              <button onClick={confirmDeleteMenuItem} style={{ flex: 1, background: '#ff4d4d', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>DELETE</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Order Confirm Modal */}
      {orderToDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="fade-in-up" style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '350px', padding: '24px', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', background: '#fff5f5', color: '#ff4d4d', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <i className='bx bx-trash' style={{ fontSize: '32px' }}></i>
            </div>
            <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '18px' }}>Delete Order?</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete this order? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setOrderToDelete(null)} style={{ flex: 1, background: '#f1f1f6', color: 'var(--text-main)', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>CANCEL</button>
              <button onClick={confirmDeleteOrder} style={{ flex: 1, background: '#ff4d4d', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>DELETE</button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Confirm Modal */}
      {showBroadcastConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="fade-in-up" style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '350px', padding: '24px', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', background: '#fff3e0', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <i className='bx bxs-megaphone' style={{ fontSize: '32px' }}></i>
            </div>
            <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '18px' }}>Send Broadcast?</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
              This will immediately send a push notification to <b>all users</b> who have the app installed.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowBroadcastConfirm(false)} style={{ flex: 1, background: '#f1f1f6', color: 'var(--text-main)', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>CANCEL</button>
              <button onClick={confirmSendPromo} style={{ flex: 1, background: 'var(--primary)', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>YES, SEND</button>
            </div>
          </div>
        </div>
      )}

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

