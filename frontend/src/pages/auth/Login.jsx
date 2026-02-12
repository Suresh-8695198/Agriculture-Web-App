import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaLock, FaSeedling, FaTruck, FaShoppingCart, FaExclamationTriangle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Auth.css';

const ROLE_META = {
  farmer:   { icon: <FaSeedling />, label: 'Farmer',   color: 'farmer' },
  supplier: { icon: <FaTruck />, label: 'Supplier', color: 'supplier' },
  consumer: { icon: <FaShoppingCart />, label: 'Consumer', color: 'consumer' },
};

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const role = new URLSearchParams(location.search).get('role');
  const meta = ROLE_META[role] || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await login(username, password, role);
      toast.success('Login successful! Welcome back.');
      
      // Redirect based on user role
      const userType = response.user.user_type;
      if (userType === 'farmer') {
        navigate('/farmer/dashboard');
      } else if (userType === 'supplier') {
        navigate('/supplier/dashboard');
      } else if (userType === 'consumer') {
        navigate('/consumer/marketplace');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      let msg = 'Invalid credentials. Please check your username and password.';
      
      // Check for specific error messages from backend
      if (err.response?.data?.error) {
        msg = err.response.data.error;
      } else if (err.response?.data?.detail) {
        msg = err.response.data.detail;
      } else if (err.message) {
        msg = err.message;
      }
      
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ─── Left decorative panel ─── */}
      <div className="auth-left">
        <div className="auth-left-content">
          <img src="/logofarmer.png" alt="AgriConnect" className="auth-left-logo" />
          <h2 className="auth-left-title">AgriConnect</h2>
          <p className="auth-left-subtitle">
            Your trusted platform connecting farmers, suppliers, and consumers in one ecosystem.
          </p>
          <div className="auth-left-features">
            <div className="auth-feature-item">
              <span className="auth-feature-icon"><FaSeedling /></span>
              Direct farm-to-table marketplace
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-icon"><FaTruck /></span>
              Reliable supply chain management
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-icon"><FaUser /></span>
              Real-time analytics & insights
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right form panel ─── */}
      <div className="auth-right">
        <div className="auth-right-inner">
          <Link to="/" className="auth-back-link">
            ← Back to home
          </Link>

          {meta && (
            <div className={`auth-role-badge ${meta.color}`}>
              {meta.icon} {meta.label} Portal
            </div>
          )}

          <h1 className="auth-heading">Welcome back</h1>
          <p className="auth-subheading">
            Sign in to continue to your dashboard
          </p>

          {error && (
            <div className="auth-error">
              <span className="auth-error-icon"><FaExclamationTriangle /></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label className="auth-label" htmlFor="username">Username or Email</label>
              <div className="auth-input-wrapper">
                <input
                  type="text"
                  id="username"
                  className="auth-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Enter your username or email"
                  autoComplete="username"
                />
                <span className="auth-input-icon"><FaUser /></span>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="password">Password</label>
              <div className="auth-input-wrapper">
                <input
                  type={showPwd ? 'text' : 'password'}
                  id="password"
                  className="auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <span className="auth-input-icon"><FaLock /></span>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPwd(!showPwd)}
                  tabIndex={-1}
                >
                  {showPwd ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider">or</div>

          <p className="auth-footer-text">
            Don't have an account?{' '}
            <Link to={`/register${role ? `?role=${role}` : ''}`}>
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
