import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FaTachometerAlt, FaUser, FaBoxes, FaTractor, FaClipboardList,
    FaCalendarCheck, FaWarehouse, FaMoneyBillWave, FaBell, FaStar,
    FaChartBar, FaQuestionCircle, FaSignOutAlt, FaBars, FaTimes,
    FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import './SupplierSidebar.css';

const SupplierSidebar = () => {
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
        { path: '/supplier/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
        { path: '/supplier/profile', icon: <FaUser />, label: 'My Profile' },
        { path: '/supplier/products', icon: <FaBoxes />, label: 'Product Management' },
        { path: '/supplier/equipment', icon: <FaTractor />, label: 'Equipment Management' },
        { path: '/supplier/orders', icon: <FaClipboardList />, label: 'Orders & Requests' },
        { path: '/supplier/rentals', icon: <FaCalendarCheck />, label: 'Rentals' },
        { path: '/supplier/inventory', icon: <FaWarehouse />, label: 'Inventory / Stock' },
        { path: '/supplier/payments', icon: <FaMoneyBillWave />, label: 'Payments & Earnings' },
        { path: '/supplier/notifications', icon: <FaBell />, label: 'Notifications' },
        { path: '/supplier/reviews', icon: <FaStar />, label: 'Ratings & Reviews' },
        { path: '/supplier/reports', icon: <FaChartBar />, label: 'Reports' },
        { path: '/supplier/support', icon: <FaQuestionCircle />, label: 'Support / Help' },
    ];

    return (
        <>
            {/* Toggle Button for Mobile */}
            <button className="sidebar-toggle" onClick={toggleSidebar}>
                {isOpen ? <FaTimes /> : <FaBars />}
            </button>

            {/* Sidebar */}
            <div className={`supplier-sidebar ${isOpen ? 'open' : 'closed'}`}>
                {/* Desktop Toggle Button - Moved to Edge */}
                <button className="desktop-toggle-btn" onClick={toggleSidebar} title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
                    {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
                </button>

                {/* Header */}
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <FaTractor className="logo-icon" />
                        {isOpen && <span className="logo-text">AgriConnect</span>}
                    </div>

                    {isOpen && (
                        <div className="sidebar-user">
                            <div className="user-avatar-small">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-details">
                                <p className="user-name">{user?.username}</p>
                                <span className="user-badge">Supplier</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Menu */}
                <nav className="sidebar-nav">
                    {menuItems.map((item, index) => (
                        <NavLink
                            key={index}
                            to={item.path}
                            className={({ isActive }) =>
                                `nav-item ${isActive ? 'active' : ''}`
                            }
                            title={!isOpen ? item.label : ''}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {isOpen && <span className="nav-label">{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout Button */}
                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        <span className="nav-icon"><FaSignOutAlt /></span>
                        {isOpen && <span className="nav-label">Logout</span>}
                    </button>
                </div>
            </div>

            {/* Overlay for mobile */}
            {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
        </>
    );
};

export default SupplierSidebar;
