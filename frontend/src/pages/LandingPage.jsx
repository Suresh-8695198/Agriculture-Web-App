import React, { useEffect, useState } from 'react';
import translations from '../i18n/translations';
import { motion } from 'framer-motion';
import GridMotion from '../components/GridMotion';
import { Link } from 'react-router-dom';
import {
  FaLeaf,
  FaTractor,
  FaShoppingBasket,
  FaArrowRight,
  FaChartLine,
  FaUsers,
  FaHandHoldingUsd,
  FaSearchLocation,
  FaTruckLoading,
  FaMobileAlt,
  FaMapMarkedAlt,
  FaSignInAlt,
  FaUserPlus,
  FaQuoteLeft,
  FaStar,
  FaFont,
  FaLanguage,
  FaGlobe
} from 'react-icons/fa';
import {
  SketchFarmer,
  SketchArrow,
  SketchSpring,
  SketchStar,
  SketchPlant,
  SketchBulb,
  SketchTractor,
  SketchDrone,
  SketchChart,
  SketchLocation,
  SketchMobile,
  SketchBasket,
  SketchShield,
  SketchHandshake,
  SketchWallet,
  SketchLeafPulse,
  SketchCloudPulse,
  SketchSoil,
  SketchAnalysis,
  SketchCircle,
  SketchScribble,
  SketchLoop,
  SketchWaveArrow,
  SketchQuote,
  SketchCurvyArrow
} from '../components/SketchIcons';
import './LandingPage.css';

const LandingPage = () => {
  const [fontSize, setFontSize] = useState('md');
  const [scrolled, setScrolled] = useState(false);
  const [language, setLanguage] = useState('en');

  const t = translations[language] || translations['en'];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const changeFontSize = (size) => {
    setFontSize(size);
    const root = document.documentElement;
    if (size === 'sm') root.style.fontSize = '14px';
    if (size === 'md') root.style.fontSize = '16px';
    if (size === 'lg') root.style.fontSize = '18px';
  };

  // Testimonials Data for Marquee
  const testimonialList = t.testimonials || translations.en.testimonials;
  const testimonials = testimonialList.map((item, index) => ({
    ...item,
    icon: index % 2 === 0 ? <SketchFarmer /> : <SketchTractor />, // Fallback icons
    companyLogo: [
      "https://img.icons8.com/color/48/toyota.png",
      "https://img.icons8.com/color/48/mahindra.png",
      "https://img.icons8.com/color/48/bigbasket.png",
      "https://img.icons8.com/color/48/dhl.png",
      "https://img.icons8.com/color/48/google-logo.png",
      "https://img.icons8.com/color/48/microsoft.png"
    ][index % 6]
  }));

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-page pencil-texture">
      {/* ─── 0. NAVIGATION ─── */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="landing-nav-brand">
          <div className="brand-logo">
            <img src="/logofarmer.png" alt="AgriConnect Logo" className="navbar-logo-img" />
          </div>
          <span className="landing-nav-title">{t.nav.brand}</span>
        </div>

        <div className="landing-nav-right">
          {/* Accessibility & Language Tools */}
          <div className="nav-tools">
            <div className="tool-group accessibility-group">
              <span className="tool-label">{t.nav.textSize}</span>
              <button
                className={`tool-btn ${fontSize === 'sm' ? 'active' : ''}`}
                onClick={() => changeFontSize('sm')} aria-label="Decrease Font Size">A-</button>
              <button
                className={`tool-btn ${fontSize === 'md' ? 'active' : ''}`}
                onClick={() => changeFontSize('md')} aria-label="Default Font Size">A</button>
              <button
                className={`tool-btn ${fontSize === 'lg' ? 'active' : ''}`}
                onClick={() => changeFontSize('lg')} aria-label="Increase Font Size">A+</button>
            </div>

            <div className="separator"></div>

            <div className="tool-group language-group">
              <FaGlobe className="tool-icon" />
              <select
                className="lang-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                aria-label="Select Language"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="te">తెలుగు</option>
                <option value="ta">தமிழ்</option>
                <option value="kn">ಕನ್ನಡ</option>
              </select>
            </div>
          </div>

          <div className="landing-nav-links">
            <Link to="/login" className="landing-nav-link ghost">{t.nav.signIn}</Link>
            <Link to="/register" className="landing-nav-link filled">{t.nav.getStarted}</Link>
          </div>
        </div>
      </nav>

      {/* ─── 1. HERO SECTION ─── */}
      <header className="hero-section section-light">

        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge reveal">
              {t.hero.badge}
            </div>
            {/* Modern Abstract Decorations */}
            <div className="modern-hero-blobs">
              <div className="blob blob-1" />
              <div className="blob blob-2" />
            </div>
            <h1 className="hero-title reveal">
              {t.hero.titleStart}<span className="sketch-circle-wrapper">{t.hero.titleFuture} <SketchCircle className="sketch-circle-deco" style={{ color: 'var(--accent-orange)' }} /></span>{t.hero.titleMid}<span className="text-gradient sketch-highlight sketch-underline-animate">{t.hero.titleConnected}</span>
            </h1>
            <p className="hero-subtitle reveal">
              {t.hero.subtitle}
            </p>
            <div className="hero-actions reveal">
              <a href="#portal-selection" className="btn-sketch-pro">
                {t.hero.explorePortals} <SketchArrow style={{ width: 20 }} />
              </a>
              <a href="#how-it-works" className="btn-secondary-outline">
                {t.hero.learnMore}
              </a>
              <SketchCurvyArrow
                className="hero-deco-arrow d-none-mobile"
                style={{ width: '80px', color: 'var(--accent-orange)' }}
              />
            </div>
          </div>

          <div className="hero-viz reveal">
            <div className="mockup-wrapper">
              <div className="main-mockup">
                {/* Simulated Dashboard UI */}
                <div className="mockup-header">
                  <div className="mockup-dots"><span /><span /><span /></div>
                  <div className="mockup-search">Search market...</div>
                </div>
                <div className="mockup-body">
                  <div className="mockup-rows">
                    <div className="mockup-row short" />
                    <div className="mockup-grid">
                      <div className="mockup-card"><FaChartLine className="m-icon" /></div>
                      <div className="mockup-card"><FaMapMarkedAlt className="m-icon" /></div>
                    </div>
                    <div className="mockup-row" />
                    <div className="mockup-row" />
                  </div>
                </div>
              </div>
              <div className="floating-card c-1">
                <FaLeaf /> <span>{t.hero.cropHealth}</span>
              </div>
              <div className="floating-card c-2">
                <FaHandHoldingUsd /> <span>{t.hero.earned}</span>
              </div>
              <div className="floating-card c-3">
                <FaTruckLoading /> <span>{t.hero.delivery}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ─── 2. PORTAL SELECTION (New Interactive Section) ─── */}
      <section id="portal-selection" className="portal-section reveal section-white">

        <div className="portal-container">
          <div className="portal-grid">
            {/* Farmer Card */}
            <div className="portal-card farmer sketch-border">
              <div className="portal-badge-popular">
                Recommended
                <SketchCircle className="sketch-circle-deco" style={{ width: '110%', color: 'white', opacity: 1 }} />
              </div>
              <div className="portal-icon-wrapper farmer">
                <SketchFarmer style={{ fontSize: '3rem' }} />
              </div>
              <h3 className="sketch-font">{t.portals.farmerTitle}</h3>
              <p>{t.portals.farmerDesc}</p>
              <Link to="/login?role=farmer" className="landing-nav-link filled portal-btn farmer" style={{ width: 'auto' }}>
                {t.portals.farmerLogin} <FaSignInAlt />
              </Link>
              <Link to="/register?role=farmer" className="portal-link-secondary">
                {t.portals.newFarmer} <FaArrowRight style={{ fontSize: '0.7em' }} />
              </Link>
            </div>

            {/* Supplier Card */}
            <div className="portal-card supplier sketch-border">
              <div className="portal-icon-wrapper supplier">
                <FaTractor />
                <SketchScribble className="sketch-deco" style={{ position: 'absolute', bottom: -10, left: '20%', width: 60, color: 'var(--accent-brown)', opacity: 0.3 }} />
              </div>
              <h3 className="sketch-font">{t.portals.supplierTitle}</h3>
              <p>{t.portals.supplierDesc}</p>
              <Link to="/login?role=supplier" className="landing-nav-link filled portal-btn supplier" style={{ width: 'auto', background: 'var(--accent-brown)' }}>
                {t.portals.supplierLogin} <FaSignInAlt />
              </Link>
              <Link to="/register?role=supplier" className="portal-link-secondary">
                {t.portals.partner} <FaArrowRight style={{ fontSize: '0.7em' }} />
              </Link>
            </div>

            {/* Consumer Card */}
            <div className="portal-card consumer sketch-border">
              <div className="portal-icon-wrapper consumer">
                <FaShoppingBasket />
              </div>
              <h3 className="sketch-font">{t.portals.consumerTitle}</h3>
              <p>{t.portals.consumerDesc} <SketchStar style={{ width: 20, color: '#f59e0b' }} /></p>
              <Link to="/login?role=consumer" className="landing-nav-link filled portal-btn consumer" style={{ width: 'auto' }}>
                {t.portals.consumerLogin} <FaSignInAlt />
              </Link>
              <Link to="/register?role=consumer" className="portal-link-secondary">
                {t.portals.startShopping} <FaArrowRight style={{ fontSize: '0.7em' }} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. TRUST & SOCIAL PROOF ─── */}
      <section className="trust-section reveal section-light">

        <div className="trust-container">
          <div className="trust-header-modern">
            <span className="pill-badge">{t.trust.pill}</span>
            <h2>{t.trust.titleTrusted} <span className="sketch-circle-wrapper">{t.trust.farmersCount} <SketchCircle className="sketch-circle-deco" /></span> {t.trust.titleFarmers} <span className="highlight-text">
              {t.trust.titleEverywhere}
              <svg className="marker-svg" viewBox="0 0 200 12" xmlns="http://www.w3.org/2000/svg">
                <motion.path
                  className="marker-path"
                  d="M5,10 Q100,2 195,10"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                />
              </svg>
            </span></h2>
            <p>{t.trust.subtitle}</p>
          </div>

          <div className="trust-grid-modern">
            <div className="trust-card stats-card sketch-border">
              <div className="icon-circle green-glass"><SketchFarmer /></div>
              <div className="stat-content">
                <h3>{t.trust.farmersCount}</h3>
                <p>{t.trust.farmersLabel}</p>
              </div>
              <div className="stat-trend">
                <span className="trend-icon">↗</span> {language === 'en' ? '12% Growth' : '12% वृद्धि'}
              </div>
            </div>

            <div className="trust-card stats-card sketch-border">
              <div className="icon-circle brown-glass"><SketchShield /></div>
              <div className="stat-content">
                <h3>{t.trust.suppliersCount}</h3>
                <p>{t.trust.suppliersLabel}</p>
              </div>
              <div className="stat-trend">
                <span className="trend-icon">↗</span> {language === 'en' ? '8% Growth' : '8% वृद्धि'}
              </div>
            </div>

            <div className="trust-card stats-card sketch-border">
              <div className="icon-circle orange-glass"><SketchChart /></div>
              <div className="stat-content">
                <h3>{t.trust.transactionsCount}</h3>
                <p>{t.trust.transactionsLabel}</p>
              </div>
              <div className="stat-trend">
                <span className="trend-icon">↗</span> {language === 'en' ? '25% Growth' : '25% वृद्धि'}
              </div>
            </div>
          </div>


          {/* ─── TESTIMONIALS DOME (Interactive 3D Grid) ─── */}
          <div style={{ height: '900px', position: 'relative', width: '100%', overflow: 'hidden' }}>
            <GridMotion
              items={Array.from({ length: 28 }).map((_, i) => {
                const t = testimonials[i % testimonials.length];
                return (
                  <div key={`t-${i}`} className="marquee-testimonial-card">
                    <SketchQuote className="testimonial-quote-mark" />

                    <div className="testimonial-header-right">
                      <SketchCurvyArrow className="testimonial-curvy-arrow" />
                      <div className="testimonial-profile">
                        <div className="profile-img-container">
                          <img src={`https://i.pravatar.cc/150?u=${t.name}`} alt={t.name} />
                        </div>
                        <div className="profile-info">
                          <strong className="profile-name">{t.name}</strong>
                          <span className="profile-role">{t.role}</span>
                        </div>
                      </div>
                    </div>

                    <div className="testimonial-content">
                      <p className="testimonial-bold-text">
                        {t.text}
                      </p>
                    </div>

                    <div className="testimonial-footer-logo">
                      <img src={t.companyLogo} alt="Partner Logo" />
                    </div>
                  </div>
                );
              })}
              gradientColor="#F1F8E9"
            />
          </div>

          {/* Decorative Scribbles at Section Bottom */}
          <div className="section-bottom-deco">
            <SketchScribble style={{ width: 120, height: 40, color: 'var(--accent-orange)' }} />
            <SketchScribble style={{ width: 100, height: 35, color: '#f59e0b', opacity: 0.6, marginLeft: -40 }} />
          </div>
        </div>
      </section>

      {/* ─── 4. HOW IT WORKS ─── */}
      <section id="how-it-works" className="how-it-works-section section-white reveal">
        <div className="section-header">
          <h2 className="section-title sketch-font">
            {t.howItWorks.title} <span className="sketch-circle-wrapper">{t.nav.brand} <SketchCircle className="sketch-circle-deco" style={{ color: 'var(--primary)', opacity: 0.6 }} /></span> {t.howItWorks.titleMid}
          </h2>
          <p className="section-subtitle">{t.howItWorks.subtitle}</p>
          <SketchScribble className="sketch-deco" style={{ width: 100, color: 'var(--primary)', opacity: 0.2, margin: '0 auto' }} />
        </div>

        <div className="flow-container">
          <div className="flow-step reveal sketch-card-advanced">
            <div className="step-num">01</div>
            <div className="step-icon-box">
              <SketchPlant />
            </div>
            <h3 className="sketch-font">{t.howItWorks.step1Title}</h3>
            <p>{t.howItWorks.step1Desc}</p>
            <div className="flow-arrow d-none-mobile">
              <SketchWaveArrow className="sketch-arrow-wave" />
            </div>
          </div>

          <div className="flow-step reveal sketch-card-advanced">
            <div className="step-num">02</div>
            <div className="step-icon-box">
              <SketchTractor />
            </div>
            <h3 className="sketch-font">{t.howItWorks.step2Title}</h3>
            <p>{t.howItWorks.step2Desc}</p>
            <div className="flow-arrow d-none-mobile">
              <SketchWaveArrow className="sketch-arrow-wave" style={{ transform: 'rotate(5deg) scaleY(-1)' }} />
            </div>
          </div>

          <div className="flow-step reveal sketch-card-advanced">
            <div className="step-num">03</div>
            <div className="step-icon-box">
              <SketchBasket />
            </div>
            <h3 className="sketch-font">{t.howItWorks.step3Title}</h3>
            <p>{t.howItWorks.step3Desc}</p>
          </div>
        </div>
      </section>

      {/* ─── 5. FEATURES SECTION ─── */}
      <section className="features-section section-light reveal">
        <div className="section-header">
          <h2 className="section-title sketch-font">
            <span className="text-black-solid">{t.features.titleSmart}</span> <span className="text-green-solid">{t.features.titleFeatures}</span>
            <SketchBulb className="sketch-star-blink" style={{ width: 40, height: 40, color: '#FBC02D', verticalAlign: 'top' }} />
          </h2>
          <p className="section-subtitle">{t.features.subtitle}</p>
        </div>

        <div className="features-grid">
          <div className="feature-card reveal sketch-card-advanced">
            <div className="feature-icon-circle green">
              <SketchLocation />
            </div>
            <h3 className="sketch-font">{t.features.searchTitle}</h3>
            <p>{t.features.searchDesc}</p>
          </div>

          <div className="feature-card reveal sketch-card-advanced">
            <div className="feature-icon-circle brown">
              <SketchTractor />
            </div>
            <h3 className="sketch-font">{t.features.equipTitle}</h3>
            <p>{t.features.equipDesc}</p>
          </div>

          <div className="feature-card reveal sketch-card-advanced">
            <div className="feature-icon-circle orange">
              <SketchBasket />
            </div>
            <h3 className="sketch-font">{t.features.marketTitle}</h3>
            <p>{t.features.marketDesc}</p>
          </div>

          <div className="feature-card reveal sketch-card-advanced">
            <div className="feature-icon-circle blue">
              <SketchMobile />
            </div>
            <h3 className="sketch-font">{t.features.appTitle}</h3>
            <p>{t.features.appDesc}</p>
          </div>
        </div>
      </section>

      {/* ─── 6. WHY CHOOSE US (Modernized) ─── */}
      <section className="why-us-section reveal">
        <div className="why-us-container">
          <div className="why-item">
            <span className="why-visual">
              <img src="https://img.icons8.com/3d-fluency/94/sprout.png" alt={t.whyUs.empowerTitle} />
            </span>
            <h3>{t.whyUs.empowerTitle}</h3>
            <p>{t.whyUs.empowerDesc}</p>
          </div>
          <div className="why-item">
            <span className="why-visual">
              <img src="https://img.icons8.com/3d-fluency/94/handshake.png" alt={t.whyUs.strengthenTitle} />
            </span>
            <h3>{t.whyUs.strengthenTitle}</h3>
            <p>{t.whyUs.strengthenDesc}</p>
          </div>
          <div className="why-item">
            <span className="why-visual">
              <img src="https://img.icons8.com/3d-fluency/94/wallet.png" alt={t.whyUs.financialTitle} />
            </span>
            <h3>{t.whyUs.financialTitle}</h3>
            <p>{t.whyUs.financialDesc}</p>
          </div>
        </div>
      </section>


      {/* ─── 7. CALL TO ACTION ─── */}
      <section className="cta-section reveal">
        <div className="cta-content">
          <h2 className="sketch-font">{t.cta.title}</h2>
          <p>{t.cta.subtitle}</p>
          <Link to="/register" className="btn-cta sketch-border">
            {t.cta.btn}
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="main-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <FaLeaf /> {t.nav.brand}
          </div>
          <div className="footer-links">
            {/* Additional links can be added here */}
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 {t.nav.brand}. {t.footer.initiative}</p>
          <div className="footer-links">
            <a href="#privacy">{t.footer.privacy}</a>
            <a href="#terms">{t.footer.terms}</a>
            <a href="#contact">{t.footer.contact}</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
