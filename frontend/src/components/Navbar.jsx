import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="navbar glass">
            <div className="container navbar-content">
                <Link to="/" className="logo">
                    AgriConnect
                </Link>
                <div className="nav-links">
                    {!user ? (
                        <>
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/register" className="btn btn-primary">Register</Link>
                        </>
                    ) : (
                        <>
                            {user.user_type === 'farmer' && (
                                <Link to="/farmer/dashboard" className="nav-link">Farmer Dashboard</Link>
                            )}
                            {user.user_type === 'supplier' && (
                                <Link to="/supplier/dashboard" className="nav-link">Supplier Dashboard</Link>
                            )}
                            {user.user_type === 'consumer' && (
                                <Link to="/consumer/dashboard" className="nav-link">Marketplace</Link>
                            )}
                            <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
