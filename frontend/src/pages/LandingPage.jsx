import React from 'react';
import { Link } from 'react-router-dom';
import { GiFarmer, GiWheat } from 'react-icons/gi';
import { FaTruckMoving, FaShoppingBasket } from 'react-icons/fa';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* ─── Top Navigation ─── */}
      <nav className="landing-nav">
        <div className="landing-nav-brand">
          <img
            src="/logofarmer.png"
            alt="AgriConnect"
            className="landing-nav-logo"
          />
          <span className="landing-nav-title">AgriConnect</span>
        </div>
        <div className="landing-nav-links">
          <Link to="/login" className="landing-nav-link ghost">
            Sign In
          </Link>
          <Link to="/register" className="landing-nav-link filled">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="landing-hero">
        <div className="landing-hero-badge">
          <span className="landing-hero-badge-dot" />
          Trusted by 10,000+ farmers across India
        </div>

        <h1 className="landing-hero-title">
          The Future of Farming<br />
          is <span className="text-green">Connected</span>
        </h1>

        <p className="landing-hero-subtitle">
          One platform linking farmers, suppliers, and consumers.
          Grow smarter, supply efficiently, and eat fresher — together.
        </p>

        {/* ─── Role Selection Cards ─── */}
        <div className="landing-roles">
          {/* Farmer */}
          <Link to="/login?role=farmer" className="role-card farmer">
            <div className="role-icon">
              <GiFarmer />
            </div>
            <h3 className="role-card-title">Farmer</h3>
            <p className="role-card-desc">
              Manage crops, access supplies, and sell your
              harvest directly to consumers.
            </p>
            <span className="role-card-action">
              Farmer Login <span className="role-arrow">→</span>
            </span>
          </Link>

          {/* Supplier */}
          <Link to="/login?role=supplier" className="role-card supplier">
            <div className="role-icon">
              <FaTruckMoving />
            </div>
            <h3 className="role-card-title">Supplier</h3>
            <p className="role-card-desc">
              Distribute seeds, fertilizers, and equipment to
              farmers in your region.
            </p>
            <span className="role-card-action">
              Supplier Login <span className="role-arrow">→</span>
            </span>
          </Link>

          {/* Consumer */}
          <Link to="/login?role=consumer" className="role-card consumer">
            <div className="role-icon">
              <FaShoppingBasket />
            </div>
            <h3 className="role-card-title">Consumer</h3>
            <p className="role-card-desc">
              Buy fresh organic produce straight from the farm.
              Support local agriculture.
            </p>
            <span className="role-card-action">
              Consumer Login <span className="role-arrow">→</span>
            </span>
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="landing-footer">
        &copy; 2026 AgriConnect &nbsp;·&nbsp;
        <a href="#privacy">Privacy</a> &nbsp;·&nbsp;
        <a href="#terms">Terms</a> &nbsp;·&nbsp;
        <a href="#contact">Contact</a>
      </footer>
    </div>
  );
};

export default LandingPage;
