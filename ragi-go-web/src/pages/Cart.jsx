import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import '../Sprite.css';

export default function Cart() {
  const { cart, addToCart, removeFromCart, cartTotal, cartCount, decreaseQuantity } = useCart();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const [isShopOpen, setIsShopOpen] = React.useState(true);

  React.useEffect(() => {
    import('firebase/firestore').then(({ doc, onSnapshot }) => {
      import('../firebase').then(({ db }) => {
        const unsubStatus = onSnapshot(doc(db, 'settings', 'shop_status'), (docSnap) => {
          if (docSnap.exists()) {
            setIsShopOpen(docSnap.data().isOpen);
          }
        });
      });
    });
  }, []);

  const deliveryFee = cartTotal > 99 ? 0 : 10;
  const toPay = cartTotal + deliveryFee;

  return (
    <div className="page-container" style={{ background: '#fff' }}>
      
      {/* SHOP CLOSED BANNER */}
      {!isShopOpen && (
        <div style={{
          background: '#ff4d4d', color: '#fff', padding: '12px 20px', 
          textAlign: 'center', fontSize: '13px', fontWeight: 800, 
          position: 'sticky', top: 0, zIndex: 100, display: 'flex', 
          alignItems: 'center', justifyContent: 'center', gap: '8px',
          boxShadow: '0 4px 10px rgba(255, 77, 77, 0.3)'
        }}>
          <i className='bx bx-error-circle' style={{ fontSize: '18px' }}></i>
          THE RESTAURANT IS CURRENTLY CLOSED
        </div>
      )}

      <div className="header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <i className='bx bx-left-arrow-alt' style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => navigate('/menu')}></i>
          <h2 style={{ fontSize: '18px', margin: 0 }}>Review Order</h2>
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

      {cart.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 40px', background: '#fff' }}>
          <div style={{ width: '150px', height: '150px', background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px' }}>
            <i className='bx bx-shopping-bag' style={{ fontSize: '60px', color: 'var(--primary)' }}></i>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }}>Your cart is empty</h3>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '32px', fontSize: '14px', lineHeight: '1.5' }}>
            Looks like you haven't added anything to your cart yet. Let's find something healthy!
          </p>
          <button className="primary-btn" onClick={() => navigate('/menu')} style={{ maxWidth: '250px' }}>
            SEE ALL DISHES
          </button>
        </div>
      ) : (
        <>
          <div style={{ padding: '20px 20px 0' }}>
            {cartTotal > 99 ? (
              <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #c8e6c9', boxShadow: '0 2px 5px rgba(46,125,50,0.05)' }}>
                <i className='bx bxs-party' style={{ fontSize: '20px' }}></i>
                <span>Yay! You get <strong>FREE Delivery</strong> on this order.</span>
              </div>
            ) : (
              <div style={{ background: '#fff3e0', color: '#e65100', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #ffe0b2', boxShadow: '0 2px 5px rgba(230,81,0,0.05)' }}>
                <i className='bx bx-run' style={{ fontSize: '20px' }}></i>
                <span>Add <strong>₹{100 - cartTotal}</strong> more to get <strong>FREE Delivery!</strong></span>
              </div>
            )}
          </div>

          <div style={{ padding: '20px' }}>
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', padding: '16px', boxShadow: 'var(--shadow-sm)' }}>
              <div className="cart-list" style={{ padding: 0 }}>
                {cart.map(item => (
                  <div key={item.id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '16px 0',
                    borderBottom: '1px solid #f1f1f6',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                      <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #f1f1f6', flexShrink: 0 }}>
                         <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                          <i className='bx bxs-circle' style={{ color: 'var(--secondary)', fontSize: '8px', border: '1px solid var(--secondary)', padding: '1px', marginTop: '3px', flexShrink: 0 }}></i>
                          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', lineHeight: '1.3' }}>{item.name}</h4>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>₹{item.price}</div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        border: '1px solid #bebfc5', 
                        borderRadius: '6px',
                        padding: '2px 8px',
                        gap: '10px',
                        background: '#fff'
                      }}>
                        <button style={{ border: 'none', background: 'none', color: '#bebfc5', fontSize: '18px', cursor: 'pointer', padding: '0 4px' }} onClick={() => decreaseQuantity(item.id)}>-</button>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--secondary)', minWidth: '12px', textAlign: 'center' }}>{item.quantity}</span>
                        <button style={{ border: 'none', background: 'none', color: 'var(--secondary)', fontSize: '18px', cursor: 'pointer', padding: '0 4px' }} onClick={() => addToCart(item)}>+</button>
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 800, minWidth: '50px', textAlign: 'right', color: 'var(--text-main)' }}>₹{item.price * item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Item Total</span>
                  <span style={{ fontWeight: 600 }}>₹{cartTotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Delivery Fee</span>
                  <span style={{ fontWeight: 600 }}>{deliveryFee === 0 ? <span style={{color: 'var(--primary)'}}>FREE</span> : `₹${deliveryFee}`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #f1f1f6', fontWeight: 800, fontSize: '18px' }}>
                  <span>To Pay</span>
                  <span>₹{toPay}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: 70, left: 0, right: 0, padding: '15px 20px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', boxShadow: '0 -4px 20px rgba(0,0,0,0.05)', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', zIndex: 100 }}>
             <button 
               className="primary-btn" 
               disabled={!isShopOpen || cartTotal < 30}
               style={{ 
                 display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', margin: 0,
                 background: (isShopOpen && cartTotal >= 30) ? 'var(--primary)' : '#bebfc5',
                 cursor: (isShopOpen && cartTotal >= 30) ? 'pointer' : 'not-allowed'
               }} 
               onClick={() => navigate('/checkout')}
             >
               <span style={{ fontSize: '14px', fontWeight: 800 }}>
                 {!isShopOpen ? 'RESTAURANT CLOSED' : cartTotal < 30 ? `ADD ₹${30 - cartTotal} MORE TO ORDER` : 'PLACE ORDER'}
               </span>
               <span style={{ fontSize: '16px', fontWeight: 800 }}>₹{toPay}</span>
             </button>
          </div>
        </>
      )}

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <div className="nav-item" onClick={() => navigate('/menu')}>
          <i className='bx bx-home-circle'></i>
          <span>Home</span>
        </div>
        <div className="nav-item active" onClick={() => navigate('/cart')}>
          <i className='bx bxs-shopping-bag'></i>
          <span>Cart</span>
          {cartCount > 0 && <div className="badge">{cartCount}</div>}
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

