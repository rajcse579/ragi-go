import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');
    if (userEmail) {
      if (userRole === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/menu');
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      alert('Please enter your email/phone and password');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { identifier, password });
      const user = response.data;
      
      // Store user info
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', user.name);
      localStorage.setItem('userPhone', user.phone);
      localStorage.setItem('userRole', user.role);
      
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/menu');
      }
    } catch (error) {
      console.error("Login error", error);
      alert(error.response?.data || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container no-scrollbar" style={{ background: '#fff' }}>
      {/* Visual Header */}
      <div style={{ height: '80px', background: 'var(--primary)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff', position: 'relative', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', flexShrink: 0 }}>
        <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: 800, letterSpacing: '1px', margin: 0 }}>Raagi GO</h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', marginTop: '4px', fontWeight: 500 }}>Millet-Powered Wellness</p>
      </div>

      <div className="login-form" style={{ padding: '0 30px 20px' }}>
        <div className="login-header" style={{ marginBottom: '20px', marginTop: '20px' }}>
          <h1 style={{ fontSize: '24px' }}>LOGIN</h1>
          <p style={{ fontSize: '14px' }}>Enter your credentials to proceed</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>EMAIL OR PHONE</label>
            <input
              type="text"
              placeholder="Email or Phone Number"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="input-field"
              style={{ marginBottom: '15px' }}
            />
          </div>
          <div className="input-group">
            <label>PASSWORD</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              style={{ marginBottom: '20px' }}
            />
          </div>
          <button
            type="submit"
            className="primary-btn"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'LOGGING IN...' : 'CONTINUE'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 700 }}>Sign Up</Link>
        </p>
      </div>

      {/* Footer / Terms */}
      <div style={{ marginTop: 'auto', padding: '15px 0', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <p style={{ fontSize: '10px', color: 'var(--text-light)', lineHeight: 1.4 }}>
          By continuing, you agree to our <br />
          <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Privacy Policy</span> and <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Terms of Service</span>.
        </p>
      </div>
    </div>
  );
}
