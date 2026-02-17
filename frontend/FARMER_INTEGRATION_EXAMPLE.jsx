/* ═══════════════════════════════════════════════════════════
   FARMER PORTAL INTEGRATION EXAMPLE
   
   This file shows how to integrate the Farmer Portal into your
   React application with React Router.
   ═══════════════════════════════════════════════════════════ */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import FarmerLayout from './pages/FarmerLayout';

// Farmer Portal Pages
import FarmerDashboard from './pages/FarmerDashboard';
import LandDetails from './pages/farmer/LandDetails';
import SearchSupplier from './pages/farmer/SearchSupplier';
import BuyProducts from './pages/farmer/BuyProducts';
import RentEquipment from './pages/farmer/RentEquipment';
import SellProduce from './pages/farmer/SellProduce';
import OrderTracking from './pages/farmer/OrderTracking';
import Wallet from './pages/farmer/Wallet';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';

// Import Toastify for notifications
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ═══════════════════════════════════════════════════
              FARMER PORTAL ROUTES
              All farmer routes are protected and use FarmerLayout
              which includes the FarmerSidebar
              ═══════════════════════════════════════════════ */}
          <Route
            path="/farmer"
            element={
              <ProtectedRoute requiredRole="farmer">
                <FarmerLayout />
              </ProtectedRoute>
            }
          >
            {/* Default redirect to dashboard */}
            <Route index element={<Navigate to="dashboard" replace />} />
            
            {/* Dashboard */}
            <Route path="dashboard" element={<FarmerDashboard />} />
            
            {/* Profile */}
            <Route path="profile" element={<FarmerProfile />} />
            
            {/* Land Management */}
            <Route path="land-details" element={<LandDetails />} />
            
            {/* Supplier Search */}
            <Route path="search-supplier" element={<SearchSupplier />} />
            
            {/* Shopping */}
            <Route path="buy-products" element={<BuyProducts />} />
            
            {/* Equipment Rental */}
            <Route path="rent-equipment" element={<RentEquipment />} />
            
            {/* Sell Crops */}
            <Route path="sell-produce" element={<SellProduce />} />
            
            {/* Orders */}
            <Route path="orders" element={<OrderTracking />} />
            
            {/* Wallet */}
            <Route path="wallet" element={<Wallet />} />
            
            {/* Notifications */}
            <Route path="notifications" element={<FarmerNotifications />} />
            
            {/* Support */}
            <Route path="support" element={<FarmerSupport />} />
          </Route>

          {/* Other Portal Routes (Supplier, Consumer, etc.) */}
          <Route path="/supplier/*" element={<SupplierRoutes />} />
          <Route path="/consumer/*" element={<ConsumerRoutes />} />

          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Toast Notifications Container */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

/* ═══════════════════════════════════════════════════════════
   EXAMPLE: ProtectedRoute Component
   ═══════════════════════════════════════════════════════════ */

/*
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
*/

/* ═══════════════════════════════════════════════════════════
   EXAMPLE: FarmerProfile Component (if not exists)
   ═══════════════════════════════════════════════════════════ */

/*
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser } from 'react-icons/fa';
import './farmer/FarmerPages.css';

const FarmerProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="farmer-content-container">
      <div className="farmer-page-header">
        <h1 className="farmer-page-title">
          <FaUser style={{ color: '#43A047' }} />
          My Profile
        </h1>
        <p className="farmer-page-description">
          Manage your personal information and preferences
        </p>
      </div>
      
      <div className="farmer-card">
        {// Profile content here }
      </div>
    </div>
  );
};

export default FarmerProfile;
*/

/* ═══════════════════════════════════════════════════════════
   EXAMPLE: FarmerNotifications Component
   ═══════════════════════════════════════════════════════════ */

/*
import React from 'react';
import { FaBell } from 'react-icons/fa';
import './farmer/FarmerPages.css';

const FarmerNotifications = () => {
  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'Order Accepted',
      message: 'Your order for Organic Fertilizer has been accepted',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Supplier Unavailable',
      message: 'Green Valley Suppliers is currently unavailable',
      time: '5 hours ago'
    },
    {
      id: 3,
      type: 'info',
      title: 'Booking Confirmed',
      message: 'Your tractor booking for Feb 18 is confirmed',
      time: '1 day ago'
    }
  ];

  return (
    <div className="farmer-content-container">
      <div className="farmer-page-header">
        <h1 className="farmer-page-title">
          <FaBell style={{ color: '#43A047' }} />
          Notifications
        </h1>
        <p className="farmer-page-description">
          Stay updated with your orders and activities
        </p>
      </div>
      
      <div className="farmer-card">
        {notifications.map(notif => (
          <div key={notif.id} className="notification-item">
            {// Notification content }
          </div>
        ))}
      </div>
    </div>
  );
};

export default FarmerNotifications;
*/

/* ═══════════════════════════════════════════════════════════
   EXAMPLE: FarmerSupport Component
   ═══════════════════════════════════════════════════════════ */

/*
import React, { useState } from 'react';
import { FaQuestionCircle, FaPhone, FaEnvelope } from 'react-icons/fa';
import './farmer/FarmerPages.css';

const FarmerSupport = () => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle support request
  };

  return (
    <div className="farmer-content-container">
      <div className="farmer-page-header">
        <h1 className="farmer-page-title">
          <FaQuestionCircle style={{ color: '#43A047' }} />
          Support & Help
        </h1>
        <p className="farmer-page-description">
          Get assistance with your queries and issues
        </p>
      </div>
      
      <div className="farmer-grid">
        <div className="farmer-card">
          <h3>Contact Information</h3>
          <div className="contact-info">
            <div className="contact-item">
              <FaPhone /> +91 1800-XXX-XXXX
            </div>
            <div className="contact-item">
              <FaEnvelope /> support@agriconnect.com
            </div>
          </div>
        </div>
        
        <div className="farmer-card">
          <h3>Submit a Query</h3>
          <form onSubmit={handleSubmit}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue..."
              rows="5"
            />
            <button type="submit" className="farmer-btn-primary">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FarmerSupport;
*/

/* ═══════════════════════════════════════════════════════════
   USAGE TIPS:
   
   1. Make sure all imports point to correct file paths
   2. Update AuthContext path if different
   3. Create placeholder components for missing pages
   4. Customize ProtectedRoute based on your auth logic
   5. Add proper error boundaries
   6. Implement proper loading states
   7. Add analytics tracking if needed
   
   ═══════════════════════════════════════════════════════════ */
