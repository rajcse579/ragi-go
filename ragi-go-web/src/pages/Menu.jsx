import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { useCart } from '../context/CartContext';
import ProgressiveImage from '../components/ProgressiveImage';
import '../Sprite.css';

export default function Menu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, cartCount } = useCart();
  const [cartAnimation, setCartAnimation] = useState(false);
  const [logoTaps, setLogoTaps] = useState(0);
  const navigate = useNavigate();

  const [isShopOpen, setIsShopOpen] = useState(true);

  const handleLogoTap = () => {
    const newTaps = logoTaps + 1;
    setLogoTaps(newTaps);
    const adminNumbers = ['7989800390', '8186903873'];
    const userPhone = localStorage.getItem('userPhone');
    if (newTaps >= 2 && adminNumbers.includes(userPhone)) {
      setLogoTaps(0);
      navigate('/admin');
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
    <div className="page-container">
      
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
      </div>

      {/* Hero / Promo Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Millet Magic 🌿</h1>
          <p>Healthy, tasty, and <span>guilt-free</span> breakfast.</p>
        </div>
      </div>

      <div className="location-service-banner">
        <i className='bx bxs-map-pin'></i>
        <p>Now serving only in <span>Srikakulam City</span></p>
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
          items.map((item, index) => (
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
                    <button className="add-btn" onClick={(e) => { e.stopPropagation(); addToCart(item); }} style={{ pointerEvents: 'auto' }}>
                      ADD
                      <span style={{ position: 'absolute', top: '-5px', right: '-5px', color: 'var(--secondary)', fontWeight: 800 }}>+</span>
                    </button>
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

