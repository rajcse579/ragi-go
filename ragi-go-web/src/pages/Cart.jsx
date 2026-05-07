import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../Sprite.css';

export default function Cart() {
  const { cart, addToCart, removeFromCart, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();

  return (
    <div className="page-container" style={{ background: '#fff' }}>
      <div className="header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <i className='bx bx-left-arrow-alt' style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => navigate('/menu')}></i>
          <h2 style={{ fontSize: '18px', margin: 0 }}>Review Order</h2>
        </div>
      </div>

      {cart.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 40px', background: '#fff' }}>
          <div style={{ width: '150px', height: '150px', background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px' }}>
            <i className='bx bx-shopping-bag' style={{ fontSize: '60px', color: 'var(--primary)' }}></i>
          </div>
          <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>Your cart is empty</h2>
          <p style={{ color: 'var(--text-light)', textAlign: 'center', marginBottom: '32px', fontSize: '15px' }}>
            Looks like you haven't added anything to your cart yet. Let's find something healthy!
          </p>
          <button className="primary-btn" onClick={() => navigate('/menu')} style={{ maxWidth: '250px' }}>
            SEE ALL DISHES
          </button>
        </div>
      ) : (
        <>
          <div style={{ padding: '0 20px 20px' }}>
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', padding: '16px', boxShadow: 'var(--shadow-sm)' }}>
              <div className="cart-list" style={{ padding: 0 }}>
                {cart.map(item => (
                  <div key={item.id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '16px 0',
                    borderBottom: '1px solid #f1f1f6'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #f1f1f6' }}>
                         <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                          <i className='bx bxs-circle' style={{ color: 'var(--secondary)', fontSize: '8px', border: '1px solid var(--secondary)', padding: '1px' }}></i>
                          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>{item.name}</h4>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>₹{item.price}</div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        border: '1px solid #bebfc5', 
                        borderRadius: '6px',
                        padding: '2px 8px',
                        gap: '10px',
                        background: '#fff'
                      }}>
                        <button style={{ border: 'none', background: 'none', color: '#bebfc5', fontSize: '18px', cursor: 'pointer', padding: '0 4px' }} onClick={() => removeFromCart(item.id)}>-</button>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--secondary)', minWidth: '12px', textAlign: 'center' }}>{item.quantity}</span>
                        <button style={{ border: 'none', background: 'none', color: 'var(--secondary)', fontSize: '18px', cursor: 'pointer', padding: '0 4px' }} onClick={() => addToCart(item)}>+</button>
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 800, minWidth: '45px', textAlign: 'right', color: 'var(--text-main)' }}>₹{item.price * item.quantity}</div>
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
                  <span style={{ fontWeight: 600 }}>₹10</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #f1f1f6', fontWeight: 800, fontSize: '18px' }}>
                  <span>To Pay</span>
                  <span>₹{cartTotal + 10}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: 70, left: 0, right: 0, padding: '15px 20px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', boxShadow: '0 -4px 20px rgba(0,0,0,0.05)', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', zIndex: 100 }}>
             <button className="primary-btn" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', margin: 0 }} onClick={() => navigate('/checkout')}>
               <span style={{ fontSize: '14px', fontWeight: 800 }}>PLACE ORDER</span>
               <span style={{ fontSize: '16px', fontWeight: 800 }}>₹{cartTotal + 10}</span>
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

