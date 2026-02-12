import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    return (
        <div className="home-page animate-fade-in">
            {/* Hero Section */}
            <header className="hero-section">
                <div className="container hero-content">
                    <h1 className="hero-title">
                        Connecting <span className="highlight">Farmers</span>, <span className="highlight-secondary">Suppliers</span>, and <span className="highlight-accent">Consumers</span>
                    </h1>
                    <p className="hero-subtitle">
                        A complete ecosystem for modern agriculture. Find supplies, sell produce, and deliver fresh food directly to homes.
                    </p>
                    <div className="hero-actions">
                        <Link to="/register" className="btn btn-primary btn-lg">Get Started</Link>
                        <Link to="/login" className="btn btn-secondary btn-lg">Login</Link>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section className="features-section container">
                <div className="feature-card glass">
                    <div className="icon-wrapper farmer-bg">🌾</div>
                    <h3>For Farmers</h3>
                    <p>Access quality seeds, fertilizers, and equipment. Sell your harvest directly to consumers at fair prices.</p>
                    <Link to="/register?role=farmer" className="feature-link">Join as Farmer &rarr;</Link>
                </div>

                <div className="feature-card glass">
                    <div className="icon-wrapper supplier-bg">🚜</div>
                    <h3>For Suppliers</h3>
                    <p>Expand your business reach. Connect with local farmers and supply essential agricultural inputs.</p>
                    <Link to="/register?role=supplier" className="feature-link">Join as Supplier &rarr;</Link>
                </div>

                <div className="feature-card glass">
                    <div className="icon-wrapper consumer-bg">🥗</div>
                    <h3>For Consumers</h3>
                    <p>Buy fresh, organic produce directly from the source. Support local farmers and eat healthy.</p>
                    <Link to="/register?role=consumer" className="feature-link">Shop Fresh &rarr;</Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
