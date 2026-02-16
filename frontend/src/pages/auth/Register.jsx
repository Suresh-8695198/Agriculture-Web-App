import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaMapMarkerAlt, FaExclamationTriangle, FaEye, FaEyeSlash, FaLeaf, FaTractor, FaShoppingBasket, FaChartLine } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialRole = queryParams.get('role') || 'farmer';

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    user_type: initialRole,
    phone_number: '',
    address: '',
    latitude: null,
    longitude: null,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = parseFloat(position.coords.latitude).toFixed(6);
          const lng = parseFloat(position.coords.longitude).toFixed(6);
          setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
          toast.success(`Location detected: ${lat}, ${lng}`);
        },
        (err) => toast.error('Error detecting location: ' + err.message)
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password2) {
      const msg = 'Passwords do not match.';
      setError(msg);
      toast.error(msg);
      return;
    }
    if (formData.password.length < 8) {
      const msg = 'Password must be at least 8 characters long.';
      setError(msg);
      toast.error(msg);
      return;
    }
    if (/^\d+$/.test(formData.password)) {
      const msg = 'Password cannot be entirely numeric.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      toast.success('Registration successful! Welcome to AgriConnect.');
      navigate('/');
    } catch (err) {
      console.error('Registration Error:', err);
      let errorMessage = 'Registration failed.';
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'object') {
          errorMessage = Object.keys(data)
            .map((key) => {
              const msg = Array.isArray(data[key]) ? data[key].join(' ') : data[key];
              return `${key}: ${msg}`;
            })
            .join(' | ');
        } else {
          errorMessage = data;
        }
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const ROLE_META = {
    farmer: { icon: <FaLeaf />, label: 'Farmer', color: 'farmer' },
    supplier: { icon: <FaTractor />, label: 'Supplier', color: 'supplier' },
    consumer: { icon: <FaShoppingBasket />, label: 'Consumer', color: 'consumer' },
  };
  const meta = ROLE_META[formData.user_type] || ROLE_META.farmer;

  return (
    <div className="auth-page">
      {/* ─── Left decorative panel ─── */}
      <div className="auth-left">
        <div className="auth-left-content">
          <img src="/logofarmer.png" alt="AgriConnect" className="auth-left-logo" />
          <h2 className="auth-left-title">Join AgriConnect</h2>
          <p className="auth-left-subtitle">
            Be part of the agricultural revolution. Connect, grow, and thrive with our community.
          </p>
          <div className="auth-left-features">
            <div className="auth-feature-item">
              <span className="auth-feature-icon">
                <FaLeaf />
              </span>
              10,000+ farmers on the platform
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-icon">
                <FaTractor />
              </span>
              Verified suppliers & consumers
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-icon">
                <FaChartLine />
              </span>
              Real-time analytics & insights
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right form panel ─── */}
      <div className="auth-right">
        <div className="auth-right-inner" style={{ maxWidth: '500px' }}>
          <Link to="/" className="auth-back-link">
            ← Back to home
          </Link>

          <div className={`auth-role-badge ${meta.color}`}>
            {meta.icon} {meta.label} Registration
          </div>

          <h1 className="auth-heading">Create Account</h1>
          <p className="auth-subheading">
            Already have an account?{' '}
            <Link to={`/login${initialRole !== 'farmer' ? `?role=${initialRole}` : ''}`}>
              Sign in
            </Link>
          </p>

          {error && (
            <div className="auth-error">
              <span className="auth-error-icon"><FaExclamationTriangle /></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Username */}
            <div className="auth-field">
              <label className="auth-label">Username</label>
              <div className="auth-input-wrapper">
                <input
                  name="username"
                  type="text"
                  className="auth-input"
                  onChange={handleChange}
                  required
                  placeholder="Choose a username"
                />
                <span className="auth-input-icon"><FaUser /></span>
              </div>
            </div>

            {/* Email */}
            <div className="auth-field">
              <label className="auth-label">Email</label>
              <div className="auth-input-wrapper">
                <input
                  name="email"
                  type="email"
                  className="auth-input"
                  onChange={handleChange}
                  required
                  placeholder="john@example.com"
                />
                <span className="auth-input-icon"><FaEnvelope /></span>
              </div>
            </div>

            {/* Phone */}
            <div className="auth-field">
              <label className="auth-label">Phone Number</label>
              <div className="auth-input-wrapper">
                <input
                  name="phone_number"
                  type="tel"
                  className="auth-input"
                  onChange={handleChange}
                  required
                  placeholder="+91 98765 43210"
                />
                <span className="auth-input-icon"><FaPhone /></span>
              </div>
            </div>

            {/* Role */}
            <div className="auth-field">
              <label className="auth-label">I am a...</label>
              <select
                name="user_type"
                className="auth-select"
                value={formData.user_type}
                onChange={handleChange}
              >
                <option value="farmer">Farmer</option>
                <option value="supplier">Supplier</option>
                <option value="consumer">Consumer</option>
              </select>
            </div>

            {/* Address */}
            <div className="auth-field">
              <label className="auth-label">Address</label>
              <textarea
                name="address"
                className="auth-textarea"
                rows="2"
                onChange={handleChange}
                placeholder="Enter your full address"
              />
            </div>

            {/* Location */}
            <div className="auth-field">
              <button
                type="button"
                className={`auth-location-btn ${formData.latitude ? 'detected' : ''}`}
                onClick={handleLocation}
              >
                <FaMapMarkerAlt /> {formData.latitude ? 'Location Detected ✓' : 'Detect My Location'}
              </button>
              {formData.latitude && (
                <p className="auth-location-text">
                  Lat: {formData.latitude}, Lng: {formData.longitude}
                </p>
              )}
            </div>

            {/* Passwords */}
            <div className="auth-form-row">
              <div className="auth-field">
                <label className="auth-label">Password</label>
                <div className="auth-input-wrapper">
                  <input
                    name="password"
                    type={showPwd ? 'text' : 'password'}
                    className="auth-input"
                    onChange={handleChange}
                    required
                    minLength="8"
                    placeholder="Min 8 characters"
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
              <div className="auth-field">
                <label className="auth-label">Confirm Password</label>
                <div className="auth-input-wrapper">
                  <input
                    name="password2"
                    type={showPwd ? 'text' : 'password'}
                    className="auth-input"
                    onChange={handleChange}
                    required
                    placeholder="Re-enter password"
                  />
                  <span className="auth-input-icon"><FaLock /></span>
                </div>
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account?{' '}
            <Link to={`/login${initialRole !== 'farmer' ? `?role=${initialRole}` : ''}`}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
