import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import FarmerDashboard from './pages/FarmerDashboard';
import ConsumerDashboard from './pages/ConsumerDashboard';

// Supplier Portal Pages
import SupplierDashboard from './pages/supplier/SupplierDashboard';
import SupplierProfile from './pages/supplier/SupplierProfile';
import ProductManagement from './pages/supplier/ProductManagement';
import EquipmentManagement from './pages/supplier/EquipmentManagement';
import OrdersManagement from './pages/supplier/OrdersManagement';
import RentalsManagement from './pages/supplier/RentalsManagement';
import InventoryManagement from './pages/supplier/InventoryManagement';
import SupplierComingSoon from './pages/supplier/SupplierComingSoon';

import { FaClipboardList, FaCalendarCheck, FaWarehouse, FaMoneyBillWave, FaBell, FaStar, FaChartBar, FaQuestionCircle } from 'react-icons/fa';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

/* Pages that should hide the global Navbar */
const NO_NAVBAR_PATHS = ['/', '/login', '/register', '/supplier'];

const AppLayout = () => {
  const location = useLocation();
  const hideNavbar = NO_NAVBAR_PATHS.some(
    (p) => location.pathname === p ||
      location.pathname.startsWith('/login') ||
      location.pathname.startsWith('/register') ||
      location.pathname.startsWith('/supplier')
  );

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        {/* Landing page (public) */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Home (logged‑in hub) */}
        <Route path="/home" element={<Home />} />

        {/* Protected Routes */}
        <Route
          path="/farmer/dashboard"
          element={
            <ProtectedRoute role="farmer">
              <FarmerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Supplier Portal Routes */}
        <Route
          path="/supplier/dashboard"
          element={
            <ProtectedRoute role="supplier">
              <SupplierDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplier/profile"
          element={
            <ProtectedRoute role="supplier">
              <SupplierProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplier/products"
          element={
            <ProtectedRoute role="supplier">
              <ProductManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplier/equipment"
          element={
            <ProtectedRoute role="supplier">
              <EquipmentManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplier/orders"
          element={
            <ProtectedRoute role="supplier">
              <OrdersManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplier/rentals"
          element={
            <ProtectedRoute role="supplier">
              <RentalsManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplier/inventory"
          element={
            <ProtectedRoute role="supplier">
              <InventoryManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplier/payments"
          element={
            <ProtectedRoute role="supplier">
              <SupplierComingSoon
                title="Payments & Earnings"
                subtitle="View your payments and earnings history"
                icon={<FaMoneyBillWave />}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplier/notifications"
          element={
            <ProtectedRoute role="supplier">
              <SupplierComingSoon
                title="Notifications"
                subtitle="View all your notifications"
                icon={<FaBell />}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplier/reviews"
          element={
            <ProtectedRoute role="supplier">
              <SupplierComingSoon
                title="Ratings & Reviews"
                subtitle="View customer ratings and reviews"
                icon={<FaStar />}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplier/reports"
          element={
            <ProtectedRoute role="supplier">
              <SupplierComingSoon
                title="Reports"
                subtitle="Generate and view business reports"
                icon={<FaChartBar />}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplier/support"
          element={
            <ProtectedRoute role="supplier">
              <SupplierComingSoon
                title="Support / Help"
                subtitle="Get help and support"
                icon={<FaQuestionCircle />}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/consumer/marketplace"
          element={
            <ProtectedRoute role="consumer">
              <ConsumerDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

function App() {
  const [loaded, setLoaded] = useState(false);
  const handleLoadFinish = useCallback(() => setLoaded(true), []);

  return (
    <AuthProvider>
      {!loaded && <LoadingScreen onFinish={handleLoadFinish} />}
      <Router>
        <AppLayout />
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </AuthProvider>
  );
}

const NotFound = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      padding: '2rem',
    }}
  >
    <h1 style={{ fontSize: '5rem', fontWeight: 900, color: '#2E7D32', lineHeight: 1 }}>404</h1>
    <p style={{ color: '#6B7280', fontSize: '1.1rem', marginTop: '0.5rem' }}>
      The page you're looking for doesn't exist.
    </p>
    <a
      href="/"
      style={{
        marginTop: '1.5rem',
        padding: '0.75rem 2rem',
        background: 'linear-gradient(135deg, #2E7D32, #388E3C)',
        color: 'white',
        borderRadius: '12px',
        fontWeight: 600,
        textDecoration: 'none',
        boxShadow: '0 4px 14px rgba(46,125,50,0.3)',
      }}
    >
      Go Home
    </a>
  </div>
);

export default App;
