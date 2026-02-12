import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container navbar-inner">
        <Link to={user ? '/home' : '/'} className="navbar-brand">
          <img src="/logofarmer.png" alt="AgriConnect" className="navbar-logo-img" />
          <span className="navbar-brand-text">AgriConnect</span>
        </Link>

        <div className="navbar-actions">
          {!user ? (
            <>
              <Link to="/login" className="navbar-link">Sign In</Link>
              <Link to="/register" className="navbar-btn-primary">Get Started</Link>
            </>
          ) : (
            <>
              {user.user_type === 'farmer' && (
                <Link to="/farmer/dashboard" className="navbar-link">Dashboard</Link>
              )}
              {user.user_type === 'supplier' && (
                <Link to="/supplier/dashboard" className="navbar-link">Dashboard</Link>
              )}
              {user.user_type === 'consumer' && (
                <Link to="/consumer/marketplace" className="navbar-link">Marketplace</Link>
              )}
              <div className="navbar-user-badge">
                <span className="navbar-user-avatar">
                  {user.username[0].toUpperCase()}
                </span>
                <span className="navbar-user-name">{user.username}</span>
              </div>
              <button onClick={handleLogout} className="navbar-btn-outline">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
