import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <header className="home-hero">
        <div className="container">
          <div className="home-hero-badge">
            <span className="home-hero-badge-dot" />
            Welcome to AgriConnect
          </div>

          <h1 className="home-hero-title">
            Connecting{' '}
            <span className="text-green">Farmers</span>,{' '}
            <span className="text-orange">Suppliers</span> &amp;{' '}
            <span className="text-blue">Consumers</span>
          </h1>

          <p className="home-hero-subtitle">
            A complete ecosystem for modern agriculture. Find supplies, sell produce, and deliver fresh food directly to homes.
          </p>

          {!user && (
            <div className="home-hero-actions">
              <Link to="/register" className="home-btn-primary">Get Started</Link>
              <Link to="/login" className="home-btn-outline">Sign In</Link>
            </div>
          )}
        </div>
      </header>

      {/* Features Section */}
      <section className="home-features container">
        <div className="home-feature-card">
          <div className="home-feature-icon green-bg">🌾</div>
          <h3 className="home-feature-title">For Farmers</h3>
          <p className="home-feature-desc">
            Access quality seeds, fertilizers, and equipment. Sell your harvest directly to consumers at fair prices.
          </p>
          <Link to="/register?role=farmer" className="home-feature-link green-link">
            Join as Farmer <span className="home-feature-arrow">→</span>
          </Link>
        </div>

        <div className="home-feature-card">
          <div className="home-feature-icon orange-bg">🚛</div>
          <h3 className="home-feature-title">For Suppliers</h3>
          <p className="home-feature-desc">
            Expand your business reach. Connect with local farmers and supply essential agricultural inputs.
          </p>
          <Link to="/register?role=supplier" className="home-feature-link orange-link">
            Join as Supplier <span className="home-feature-arrow">→</span>
          </Link>
        </div>

        <div className="home-feature-card">
          <div className="home-feature-icon blue-bg">🛒</div>
          <h3 className="home-feature-title">For Consumers</h3>
          <p className="home-feature-desc">
            Buy fresh, organic produce directly from the source. Support local farmers and eat healthy.
          </p>
          <Link to="/register?role=consumer" className="home-feature-link blue-link">
            Shop Fresh <span className="home-feature-arrow">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
