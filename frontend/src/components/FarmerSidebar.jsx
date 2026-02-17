import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FaTachometerAlt, FaUser, FaSeedling, FaMapMarkedAlt, FaSearchLocation,
    FaShoppingCart, FaTractor, FaLeaf, FaClipboardList, FaWallet,
    FaBell, FaQuestionCircle, FaSignOutAlt, FaBars, FaTimes,
    FaChevronLeft, FaChevronRight, FaLocationArrow, FaBoxes, FaTimesCircle
} from 'react-icons/fa';
import { GiFertilizerBag, GiWheat, GiTomato, GiFarmTractor, GiField } from 'react-icons/gi';
import { MdDashboard, MdLocationOn, MdShoppingBasket } from 'react-icons/md';
import { toast } from 'react-toastify';
import './FarmerSidebar.css';

const FarmerSidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(true);

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out successfully');
        navigate('/');
    };

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const menuItems = [
        { 
            path: '/farmer/dashboard', 
            icon: <MdDashboard />, 
            label: 'Dashboard',
            description: 'Overview & Stats'
        },
        { 
            path: '/farmer/profile', 
            icon: <FaUser />, 
            label: 'My Profile',
            description: 'Personal Info'
        },
        { 
            path: '/farmer/land-details', 
            icon: <GiField />, 
            label: 'Land Details',
            description: 'Manage Farm Land'
        },
        { 
            path: '/farmer/search-supplier', 
            icon: <FaSearchLocation />, 
            label: 'Find Suppliers',
            description: 'Location-based Search'
        },
        { 
            path: '/farmer/buy-products', 
            icon: <FaShoppingCart />, 
            label: 'Buy Products',
            description: 'Seeds, Fertilizer, Manure'
        },
        { 
            path: '/farmer/rent-equipment', 
            icon: <GiFarmTractor />, 
            label: 'Rent Equipment',
            description: 'Tractor & Machinery'
        },
        { 
            path: '/farmer/sell-produce', 
            icon: <MdShoppingBasket />, 
            label: 'Sell Produce',
            description: 'Sell Your Crops'
        },
        { 
            path: '/farmer/orders', 
            icon: <FaClipboardList />, 
            label: 'Order Tracking',
            description: 'Track Your Orders'
        },
        { 
            path: '/farmer/wallet', 
            icon: <FaWallet />, 
            label: 'Wallet & Payments',
            description: 'Manage Finances'
        },
        { 
            path: '/farmer/notifications', 
            icon: <FaBell />, 
            label: 'Notifications',
            description: 'Alerts & Updates'
        },
        { 
            path: '/farmer/support', 
            icon: <FaQuestionCircle />, 
            label: 'Support & Help',
            description: 'Get Assistance'
        },
    ];

    return (
        <>
            {/* Mobile Toggle Button */}
            <button className="farmer-sidebar-toggle" onClick={toggleSidebar}>
                {isOpen ? <FaTimes /> : <FaBars />}
            </button>

            {/* Farmer Sidebar */}
            <div className={`farmer-sidebar ${isOpen ? 'open' : 'closed'}`}>
                {/* Desktop Toggle Button - Floating Edge Design */}
                <button 
                    className="farmer-desktop-toggle-btn" 
                    onClick={toggleSidebar} 
                    title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                    {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
                </button>

                {/* Header Section */}
                <div className="farmer-sidebar-header">
                    <div className="farmer-sidebar-logo">
                        <div className="logo-icon-wrapper">
                            <FaSeedling className="logo-icon" />
                        </div>
                        {isOpen && (
                            <div className="logo-content">
                                <span className="logo-text">AgriConnect</span>
                                <span className="logo-tagline">Smart Agriculture</span>
                            </div>
                        )}
                    </div>

                    {isOpen && (
                        <div className="farmer-sidebar-user">
                            <div className="user-avatar">
                                <div className="avatar-circle">
                                    {user?.username?.charAt(0).toUpperCase()}
                                </div>
                                <div className="status-indicator"></div>
                            </div>
                            <div className="user-info">
                                <p className="user-name">{user?.username || 'Farmer'}</p>
                                <span className="user-badge">
                                    <FaLeaf className="badge-icon" />
                                    FARMER
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Stats Section (When Open) */}
                {isOpen && (
                    <div className="farmer-quick-stats">
                        <div className="stat-card">
                            <div className="stat-icon-box">
                                <FaShoppingCart className="stat-icon" />
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">12</span>
                                <span className="stat-label">Orders</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon-box">
                                <FaTractor className="stat-icon" />
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">3</span>
                                <span className="stat-label">Rentals</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Menu */}
                <nav className="farmer-sidebar-nav">
                    <div className="nav-section-title">
                        {isOpen && <span>Main Menu</span>}
                    </div>
                    {menuItems.map((item, index) => (
                        <NavLink
                            key={index}
                            to={item.path}
                            className={({ isActive }) =>
                                `farmer-nav-item ${isActive ? 'active' : ''}`
                            }
                            title={!isOpen ? item.label : ''}
                        >
                            <span className="nav-icon-wrapper">
                                <span className="nav-icon">{item.icon}</span>
                                <span className="nav-ripple"></span>
                            </span>
                            {isOpen && (
                                <div className="nav-content">
                                    <span className="nav-label">{item.label}</span>
                                    <span className="nav-description">{item.description}</span>
                                </div>
                            )}
                            <span className="nav-indicator"></span>
                        </NavLink>
                    ))}
                </nav>

                {/* Logout Button */}
                <div className="farmer-sidebar-footer">
                    {isOpen && (
                        <div className="footer-info">
                            <p className="app-version">Version 2.0.1</p>
                        </div>
                    )}
                    <button className="farmer-logout-btn" onClick={handleLogout}>
                        <span className="nav-icon-wrapper">
                            <span className="nav-icon"><FaSignOutAlt /></span>
                        </span>
                        {isOpen && <span className="nav-label">Logout</span>}
                    </button>
                </div>
            </div>

            {/* Overlay for Mobile */}
            {isOpen && <div className="farmer-sidebar-overlay" onClick={toggleSidebar}></div>}
        </>
    );
};

export default FarmerSidebar;
