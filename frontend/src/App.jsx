import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes Example */}
          <Route path="/farmer/dashboard" element={<ProtectedRoute role="farmer"><Dashboard /></ProtectedRoute>} />
          <Route path="/supplier/dashboard" element={<ProtectedRoute role="supplier"><Dashboard /></ProtectedRoute>} />
          <Route path="/consumer/marketplace" element={<ProtectedRoute role="consumer"><Dashboard /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

const NotFound = () => (
  <div className="container text-center" style={{ marginTop: '5rem' }}>
    <h1 style={{ fontSize: '3rem', color: '#111827' }}>404</h1>
    <p style={{ color: '#6B7280' }}>Page not found</p>
  </div>
);

export default App;
