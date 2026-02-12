import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="loading-spinner">Loading...</div>; // TODO: styling
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (role && user.user_type !== role) {
        // Redirect to their respective dashboard if they try to access another role's route
        if (user.user_type === 'farmer') return <Navigate to="/farmer/dashboard" replace />;
        if (user.user_type === 'supplier') return <Navigate to="/supplier/dashboard" replace />;
        if (user.user_type === 'consumer') return <Navigate to="/consumer/marketplace" replace />;
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
