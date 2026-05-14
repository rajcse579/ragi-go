import React from 'react';
import { useNavigate } from 'react-router-dom';
import ragiHero from '../assets/ragi_breakfast_hero.png';
import milletField from '../assets/millet_field_wellness.png';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="page-container no-scrollbar" style={{ background: '#fff' }}>
      {/* Header Bar */}
      <div className="header-bar" style={{ position: 'sticky', top: 0, background: 'rgba(255,255,255,0.95)', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <i className='bx bx-left-arrow-alt' style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => navigate(-1)}></i>
          <h2 style={{ fontSize: '18px', margin: 0 }}>About Raagi GO</h2>
        </div>
      </div>

      <div style={{ paddingBottom: '40px' }}>
        {/* Hero Section */}
        <div className="fade-in" style={{ position: 'relative', height: '250px', overflow: 'hidden' }}>
          <img 
            src={ragiHero} 
            alt="Ragi Breakfast" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', 
            padding: '40px 20px 20px',
            color: '#fff'
          }}>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800 }}>Millet Magic</h1>
            <p style={{ margin: '5px 0 0', fontSize: '14px', opacity: 0.9 }}>Revolutionizing your morning meal</p>
          </div>
        </div>

        {/* Mission Section */}
        <div style={{ padding: '30px 20px' }} className="fade-in-up">
          <h2 style={{ color: 'var(--primary)', fontSize: '22px', fontWeight: 800, marginBottom: '15px' }}>What is Raagi GO?</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '15px' }}>
            Raagi GO is a modern wellness initiative dedicated to bringing ancient nutritional wisdom back to your breakfast table. Born in the heart of <strong>Amadalavalasa</strong>, we believe that the secret to a productive day starts with a healthy, traditional meal.
          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '15px', marginTop: '15px' }}>
            We specialize in <strong>100% millet-based tiffins</strong>, prepared using traditional recipes that have been passed down through generations, now delivered directly to your doorstep.
          </p>
        </div>

        {/* Why Millets Section */}
        <div style={{ background: '#f8f9fa', padding: '40px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: 'var(--primary)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <i className='bx bx-leaf' style={{ fontSize: '24px' }}></i>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>Why Millets?</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
            <div style={{ background: '#fff', padding: '15px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <i className='bx bx-check-shield' style={{ color: 'var(--primary)', fontSize: '24px', marginBottom: '8px' }}></i>
              <h4 style={{ margin: '0 0 5px', fontSize: '14px' }}>Nutrient Rich</h4>
              <p style={{ margin: 0, fontSize: '11px', color: '#666' }}>High in fiber, protein, and essential minerals.</p>
            </div>
            <div style={{ background: '#fff', padding: '15px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <i className='bx bx-trending-down' style={{ color: 'var(--primary)', fontSize: '24px', marginBottom: '8px' }}></i>
              <h4 style={{ margin: '0 0 5px', fontSize: '14px' }}>Low GI</h4>
              <p style={{ margin: 0, fontSize: '11px', color: '#666' }}>Perfect for maintaining steady blood sugar levels.</p>
            </div>
            <div style={{ background: '#fff', padding: '15px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <i className='bx bx-heart' style={{ color: 'var(--primary)', fontSize: '24px', marginBottom: '8px' }}></i>
              <h4 style={{ margin: '0 0 5px', fontSize: '14px' }}>Gluten Free</h4>
              <p style={{ margin: 0, fontSize: '11px', color: '#666' }}>Naturally light and easy on your digestion.</p>
            </div>
            <div style={{ background: '#fff', padding: '15px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <i className='bx bx-time-five' style={{ color: 'var(--primary)', fontSize: '24px', marginBottom: '8px' }}></i>
              <h4 style={{ margin: '0 0 5px', fontSize: '14px' }}>Daily Fuel</h4>
              <p style={{ margin: 0, fontSize: '11px', color: '#666' }}>Sustainable energy to keep you going all morning.</p>
            </div>
          </div>

          <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', height: '180px' }}>
            <img src={milletField} alt="Millet Field" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(46, 125, 50, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '18px', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                "Ancient Grains for a Modern You"
              </p>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div style={{ padding: '40px 20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>Our Commitment</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '15px' }}>
              <i className='bx bxs-hot' style={{ fontSize: '28px', color: 'var(--primary)' }}></i>
              <div>
                <h4 style={{ margin: '0 0 5px', fontSize: '16px' }}>Freshly Prepared</h4>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>Every meal is cooked fresh in the morning using high-quality Ragi and Millets.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <i className='bx bxs-truck' style={{ fontSize: '28px', color: 'var(--primary)' }}></i>
              <div>
                <h4 style={{ margin: '0 0 5px', fontSize: '16px' }}>Timely Delivery</h4>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>Serving Amadalavalasa between 7:00 AM - 9:00 AM, exactly when you need it.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <i className='bx bxs-medal' style={{ fontSize: '28px', color: 'var(--primary)' }}></i>
              <div>
                <h4 style={{ margin: '0 0 5px', fontSize: '16px' }}>Authentic Taste</h4>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>Served with our signature ginger chutney and coconut dip for that perfect traditional taste.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ padding: '20px', textAlign: 'center', borderTop: '1px solid #eee' }}>
          <div style={{ marginBottom: '15px' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--primary)', margin: '0 0 5px' }}>Raagi GO</h3>
            <p style={{ fontSize: '12px', color: '#999' }}>A product of Shanvik Technologies</p>
          </div>
          <button 
            className="primary-btn" 
            style={{ width: '100%', marginBottom: '20px' }}
            onClick={() => navigate('/menu')}
          >
            ORDER YOUR MILLET BREAKFAST
          </button>
          <div style={{ fontSize: '14px', color: '#666', display: 'flex', justifyContent: 'center', gap: '20px' }}>
             <a href="/privacy.html" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
             <span>•</span>
             <span>v1.12.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
