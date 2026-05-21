import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';
import ProgressiveImage from '../components/ProgressiveImage';
import '../Sprite.css';

export default function Menu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { cart, addToCart, decreaseQuantity, cartCount } = useCart();
  const { unreadCount } = useNotifications();
  const [cartAnimation, setCartAnimation] = useState(false);
  const [logoTaps, setLogoTaps] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = (e) => {
    if (!touchStart || !touchEnd) return;
    const distance = touchEnd - touchStart;
    const isDownSwipe = distance > 70;

    if (isDownSwipe && e.currentTarget.scrollTop === 0) {
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 1500);
    }
  };

  const [isShopOpen, setIsShopOpen] = useState(true);

  const handleLogoTap = () => {
    const newTaps = logoTaps + 1;
    setLogoTaps(newTaps);
    const userRole = localStorage.getItem('userRole');

    if (newTaps >= 2) {
      if (userRole === 'ADMIN') {
        setLogoTaps(0);
        navigate('/admin');
      } else if (userRole === 'DELIVERY') {
        setLogoTaps(0);
        navigate('/delivery');
      }
    }
  };

  useEffect(() => {
    if (cartCount > 0) {
      setCartAnimation(true);
      const timer = setTimeout(() => setCartAnimation(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  useEffect(() => {
    // Fetch Shop Status via Real-time Listener
    import('firebase/firestore').then(({ doc, onSnapshot }) => {
      import('../firebase').then(({ db }) => {
        const unsubStatus = onSnapshot(doc(db, 'settings', 'shop_status'), (docSnap) => {
          if (docSnap.exists()) {
            setIsShopOpen(docSnap.data().isOpen);
          }
        });

        // Save the unsub function to a ref or just let it live for the session since it's a root component
      });
    });

    // Try to load from cache first for instant UI
    const cachedMenu = localStorage.getItem('menuCache');
    if (cachedMenu) {
      try {
        const parsed = JSON.parse(cachedMenu);
        const sorted = parsed.sort((a, b) => {
          if (a.available === b.available) return 0;
          return a.available ? -1 : 1;
        });
        setItems(sorted);
        setLoading(false);
      } catch (e) {
        console.error("Cache parse error", e);
      }
    }

    // Set up real-time listener for instant menu updates
    import('firebase/firestore').then(({ collection, onSnapshot }) => {
      import('../firebase').then(({ db }) => {
        const unsubscribe = onSnapshot(collection(db, 'menu_items'), (snapshot) => {
          const fetchedItems = [];
          snapshot.forEach(doc => {
            fetchedItems.push({ id: doc.id, ...doc.data() });
          });

          const sortedItems = fetchedItems.sort((a, b) => {
            if (a.available === b.available) return 0;
            return a.available ? -1 : 1;
          });

          setItems(sortedItems);
          localStorage.setItem('menuCache', JSON.stringify(sortedItems));
          setLoading(false);
        }, (error) => {
          console.error("Firestore listen error", error);
          setLoading(false);
        });

        // Cleanup listener on unmount to save bandwidth
        return () => unsubscribe();
      });
    });
  }, []);

  return (
    <div
      className="page-container"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ overflowY: 'auto' }}
    >
      {refreshing && (
        <div style={{ textAlign: 'center', padding: '10px', background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '12px', fontWeight: 800, position: 'sticky', top: 0, zIndex: 100 }}>
          <i className='bx bx-loader-alt bx-spin' style={{ marginRight: '5px' }}></i> REFRESHING...
        </div>
      )}

      {/* SHOP CLOSED BANNER */}
      {!isShopOpen && (
        <div style={{
          background: '#ff4d4d', color: '#fff', padding: '12px 20px',
          textAlign: 'center', fontSize: '13px', fontWeight: 800,
          position: 'sticky', top: 0, zIndex: 100, display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: '8px',
          boxShadow: '0 4px 10px rgba(255, 77, 77, 0.3)'
        }}>
          <i className='bx bx-store-alt bx-tada' style={{ fontSize: '18px' }}></i>
          THE RESTAURANT IS CURRENTLY CLOSED
        </div>
      )}

      {/* Simplified Header with Logout */}
      <div className="header-bar">
        <h2
          onClick={handleLogoTap}
          style={{ fontSize: '18px', margin: 0, fontWeight: 800, color: 'var(--primary)', cursor: 'pointer' }}
        >
          Raagi GO
        </h2>

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

      {/* Hero / Promo Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Millet Magic 🌿</h1>
          <p>Healthy, tasty, and <span>guilt-free</span> millet snacks & drinks.</p>
        </div>
      </div>

      <div className="location-service-banner" style={{ 
        background: '#ffffff', 
        padding: '14px 20px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        margin: '0 20px 20px', 
        borderRadius: '16px', 
        border: '1px solid #e9e9eb', 
        boxShadow: 'var(--shadow-sm)'
      }}>
        <i className='bx bxs-map-pin' style={{ color: 'var(--primary)', fontSize: '20px' }}></i>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-main)', fontWeight: 600 }}>
          Now serving exclusively in <span style={{ color: 'var(--primary)', fontWeight: 800 }}>Amadalavalasa</span><br /><span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 600 }}>Operating Hours: 7:00 AM - 9:00 AM</span>
        </p>
      </div>

      <div className="search-and-filter" style={{ padding: '0 20px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <i className='bx bx-search' style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)', fontSize: '20px' }}></i>
          <input
            type="text"
            placeholder="Search for healthy food..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 14px 14px 48px',
              borderRadius: '16px',
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              fontFamily: 'inherit',
              background: '#f1f1f6',
              color: 'var(--text-main)',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => e.target.style.background = '#e9e9f0'}
            onBlur={(e) => e.target.style.background = '#f1f1f6'}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }} className="no-scrollbar">
          {["All", "Millet", "Snacks", "Drinks"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '10px 20px',
                borderRadius: '25px',
                border: 'none',
                background: selectedCategory === cat ? 'var(--primary)' : '#f1f1f6',
                color: selectedCategory === cat ? '#fff' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                boxShadow: selectedCategory === cat ? '0 4px 12px rgba(252, 128, 25, 0.25)' : 'none'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="section-title">Popular Items</div>

      <div className="menu-list">
        {loading && items.length === 0 ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="menu-card" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="menu-info">
                <div className="skeleton skeleton-circle"></div>
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-text" style={{ width: '30%' }}></div>
                <div className="skeleton skeleton-text" style={{ height: '40px', marginTop: '10px' }}></div>
              </div>
              <div className="menu-card-right">
                <div className="skeleton skeleton-img"></div>
              </div>
            </div>
          ))
        ) : (
          items.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
            const nameLower = item.name.toLowerCase();
            const matchesCategory = selectedCategory === 'All' ||
              (selectedCategory === 'Millet' && (
                // All items in our menu are traditional millet-based
                true
              )) ||
              (selectedCategory === 'Snacks' && (
                // Everything except Ragi Java / drinks
                !nameLower.includes('java') && !nameLower.includes('drink') && !nameLower.includes('juice') && !nameLower.includes('tea') && !nameLower.includes('coffee')
              )) ||
              (selectedCategory === 'Drinks' && (
                nameLower.includes('java') || nameLower.includes('drink') || nameLower.includes('juice') || nameLower.includes('tea') || nameLower.includes('coffee')
              ));

            return matchesSearch && matchesCategory;
          }).map((item, index) => (
            <div
              key={item.id}
              className={`menu-card fade-in-up ${!item.available ? 'is-out-of-stock' : ''}`}
              style={{
                animationDelay: `${index * 0.1}s`,
                opacity: item.available ? 1 : 0.6,
                pointerEvents: item.available ? 'auto' : 'none',
                filter: item.available ? 'none' : 'grayscale(0.8)'
              }}
            >
              <div className="menu-info">
                <i className='bx bxs-circle' style={{ color: item.available ? 'var(--secondary)' : '#93959f', fontSize: '10px', border: '1px solid ' + (item.available ? 'var(--secondary)' : '#93959f'), padding: '1px', marginBottom: '4px', display: 'inline-block' }}></i>
                <h3 style={{ color: item.available ? 'inherit' : 'var(--text-light)' }}>{item.name}</h3>
                <p className="price" style={{ color: item.available ? 'inherit' : 'var(--text-light)' }}>₹{item.price}</p>
                <p className="desc" style={{ color: 'var(--text-light)' }}>
                  Traditional millet-based {item.name.toLowerCase()} served with spicy ginger chutney and coconut dip.
                  {!item.available && <span style={{ display: 'block', color: '#ff4d4d', fontWeight: 800, fontSize: '10px', marginTop: '4px' }}>Currently Unavailable</span>}
                </p>
              </div>
              <div className="menu-card-right">
                <div className="sprite-container" style={{ position: 'relative' }}>
                  <ProgressiveImage
                    src={item.imageUrl}
                    alt={item.name}
                    className="menu-sprite"
                  />
                  {!item.available && (
                    <div className="out-of-stock-banner" style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(255, 255, 255, 0.95)',
                      color: '#3d4152',
                      fontSize: '9px',
                      fontWeight: 900,
                      padding: '4px 8px',
                      borderRadius: '4px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                      whiteSpace: 'nowrap',
                      zIndex: 3,
                      border: '1px solid #e9e9eb'
                    }}>
                      OUT OF STOCK
                    </div>
                  )}
                </div>
                <div className="add-btn-container" style={{ pointerEvents: 'none' }}>
                  {isShopOpen && item.available ? (
                    (() => {
                      const cartItem = cart.find(c => c.id === item.id);
                      if (cartItem) {
                        return (
                          <div className="qty-control" style={{ 
                            pointerEvents: 'auto', 
                            boxShadow: 'var(--shadow-md)', 
                            height: '36px', 
                            padding: '4px 6px', 
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border)',
                            background: '#fff'
                          }}>
                            <button className="qty-btn" onClick={(e) => { e.stopPropagation(); decreaseQuantity(item.id); }}>-</button>
                            <span className="qty-val">{cartItem.quantity}</span>
                            <button className="qty-btn" onClick={(e) => { e.stopPropagation(); addToCart(item); }}>+</button>
                          </div>
                        );
                      }
                      return (
                        <button className="add-btn" onClick={(e) => { e.stopPropagation(); addToCart(item); }} style={{ pointerEvents: 'auto' }}>
                          ADD
                          <span style={{ position: 'absolute', top: '-5px', right: '-5px', color: 'var(--secondary)', fontWeight: 800 }}>+</span>
                        </button>
                      );
                    })()
                  ) : (
                    <button className="add-btn" disabled style={{ background: '#fff', color: '#bebfc5', border: '1px solid #bebfc5', cursor: 'not-allowed', boxShadow: 'none' }}>
                      {!isShopOpen ? 'CLOSED' : 'ADD'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <div className="nav-item active" onClick={() => navigate('/menu')}>
          <i className='bx bxs-home-circle'></i>
          <span>Home</span>
        </div>
        <div className="nav-item" onClick={() => navigate('/cart')} style={{ position: 'relative' }}>
          <i className='bx bx-shopping-bag'></i>
          <span>Cart</span>
          {cartCount > 0 && <div className={`badge ${cartAnimation ? 'badge-pop' : ''}`}>{cartCount}</div>}
        </div>
        <div className="nav-item" onClick={() => navigate('/orders')}>
          <i className='bx bx-receipt'></i>
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

