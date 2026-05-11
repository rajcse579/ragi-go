import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import toast from 'react-hot-toast';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');
    if (userEmail) {
      if (userRole === 'ADMIN') {
        navigate('/admin');
      } else if (userRole === 'DELIVERY') {
        navigate('/delivery');
      } else {
        navigate('/menu');
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, formData);
      const user = response.data;
      
      // Auto-login after signup
      if (user.token) localStorage.setItem('token', user.token);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', user.name);
      localStorage.setItem('userPhone', user.phone);
      localStorage.setItem('userRole', user.role || 'USER');
      
      setShowSuccess(true);
      setTimeout(() => {
        const userRole = localStorage.getItem('userRole');
        if (userRole === 'ADMIN') {
          navigate('/admin');
        } else if (userRole === 'DELIVERY') {
          navigate('/delivery');
        } else {
          navigate('/menu');
        }
      }, 2000);
    } catch (error) {
      console.error("Signup error", error);
      toast.error(error.response?.data || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container no-scrollbar" style={{ background: '#fff' }}>
      <div style={{ height: '80px', background: 'var(--primary)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', flexShrink: 0 }}>
        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 800, margin: 0 }}>Create Account</h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', marginTop: '4px' }}>Join the wellness revolution</p>
      </div>

      <div className="login-form" style={{ padding: '20px 30px', gap: '15px' }}>
        <form onSubmit={handleSignup}>
          <div className="input-group">
            <label>FULL NAME</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label>EMAIL ADDRESS</label>
            <input
              type="email"
              name="email"
              placeholder="e.g. john.doe@example.com"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label>PHONE NUMBER</label>
            <input
              type="tel"
              name="phone"
              placeholder="e.g. 9876543210"
              value={formData.phone}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label>PASSWORD</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <button
            type="submit"
            className="primary-btn"
            disabled={loading}
            style={{ width: '100%', marginTop: '10px' }}
          >
            {loading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Login</Link>
        </p>
      </div>

      {showSuccess && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#fff',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '30px',
          textAlign: 'center'
        }}>
          <div className="success-icon" style={{
            width: '80px',
            height: '80px',
            background: 'var(--primary-light)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px'
          }}>
            <i className='bx bx-check' style={{ fontSize: '50px', color: 'var(--primary)' }}></i>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px' }}>
            Welcome to Raagi GO!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
            Your account has been created successfully.
          </p>
        </div>
      )}
    </div>
  );
}
