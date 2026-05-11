import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Request, 2: Reset
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
      toast.success('Reset code sent to your email.');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data || 'Error sending reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!token || !newPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/reset-password`, { email, token, newPassword });
      toast.success('Password reset successfully. Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container no-scrollbar" style={{ background: '#fff' }}>
      <div style={{ height: '80px', background: 'var(--primary)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff', position: 'relative', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', flexShrink: 0 }}>
        <h1 style={{ color: '#fff', fontSize: '28px', fontWeigth: 800, letterSpacing: '1px', margin: 0 }}>Raagi GO</h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', marginTop: '4px', fontWeight: 500 }}>Reset Password</p>
      </div>

      <div className="login-form" style={{ padding: '0 30px 20px' }}>
        <div className="login-header" style={{ marginBottom: '20px', marginTop: '20px' }}>
          <h1 style={{ fontSize: '24px' }}>{step === 1 ? 'FORGOT PASSWORD' : 'RESET PASSWORD'}</h1>
          <p style={{ fontSize: '14px' }}>{step === 1 ? 'Enter your email to receive a code' : 'Enter the code and your new password'}</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequest}>
            <div className="input-group">
              <label>EMAIL</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                style={{ marginBottom: '20px' }}
              />
            </div>
            <button type="submit" className="primary-btn" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'SENDING...' : 'SEND CODE'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            <div className="input-group">
              <label>RESET CODE</label>
              <input
                type="text"
                placeholder="6-digit code"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="input-field"
                style={{ marginBottom: '15px' }}
              />
            </div>
            <div className="input-group">
              <label>NEW PASSWORD</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field"
                style={{ marginBottom: '20px' }}
              />
            </div>
            <button type="submit" className="primary-btn" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'RESETTING...' : 'RESET PASSWORD'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
          Back to <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
