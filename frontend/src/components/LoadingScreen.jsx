import React, { useState, useEffect } from 'react';
import './LoadingScreen.css';

const LoadingScreen = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Organic progress: fast at start, slows down, then finishes
        const remaining = 100 - prev;
        const increment = Math.max(1, Math.random() * remaining * 0.15);
        return Math.min(100, prev + increment);
      });
    }, 80);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => onFinish(), 600);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [progress, onFinish]);

  return (
    <div className={`loading-screen ${fadeOut ? 'fade-out' : ''}`}>
      {/* Logo with animated rings */}
      <div className="loading-logo-container">
        <div className="loading-ring-outer" />
        <div className="loading-ring-inner" />
        <div className="loading-ring" />
        <div className="loading-glow" />
        <img
          src="/logofarmer.png"
          alt="AgriConnect"
          className="loading-logo"
        />
      </div>

      {/* Brand */}
      <div className="loading-brand">
        <h1 className="loading-brand-name">AGRICONNECT</h1>
        <p className="loading-brand-tagline">Farm &middot; Supply &middot; Consume</p>
      </div>

      {/* Progress bar */}
      <div className="loading-progress-container">
        <div
          className="loading-progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Dots */}
      <div className="loading-dots">
        <span className="loading-dot" />
        <span className="loading-dot" />
        <span className="loading-dot" />
      </div>
    </div>
  );
};

export default LoadingScreen;
