import React, { memo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LuLayoutDashboard, LuUser, LuBoxes, LuTractor, LuClipboardList,
    LuCalendarCheck, LuWarehouse, LuWallet, LuBell, LuStar,
    LuCircleHelp, LuLogOut, LuMenu, LuX,
    LuChevronLeft, LuChevronRight, LuWheat, LuShoppingCart
} from 'react-icons/lu';
import { toast } from 'react-toastify';
import './SupplierSidebar.css';

const NAV_SECTIONS = (user) => [
    {
        title: 'MAIN',
        items: [
            { path: '/supplier/dashboard', icon: <LuLayoutDashboard />, label: 'Dashboard' },
            { path: '/supplier/profile', icon: <LuUser />, label: 'My Profile' }
        ]
    },
    {
        title: 'PORTAL SWITCH',
        items: [
            ...(user?.has_farmer_profile ? [{ path: '/farmer/dashboard', icon: <LuWheat />, label: 'Farmer Portal' }] : []),
            ...(user?.user_type === 'consumer' || user?.has_consumer_profile ? [{ path: '/consumer/marketplace', icon: <LuShoppingCart />, label: 'Shop Portal' }] : [])
        ]
    },
    {
        title: 'CATALOG',
        items: [
            { path: '/supplier/products', icon: <LuBoxes />, label: 'Products' },
            { path: '/supplier/equipment', icon: <LuTractor />, label: 'Equipment' },
            { path: '/supplier/inventory', icon: <LuWarehouse />, label: 'Inventory' }
        ]
    },
    {
        title: 'OPERATIONS',
        items: [
            { path: '/supplier/orders', icon: <LuClipboardList />, label: 'Orders' },
            { path: '/supplier/rentals', icon: <LuCalendarCheck />, label: 'Rentals' }
        ]
    },
    {
        title: 'FINANCE & TOOLS',
        items: [
            { path: '/supplier/payments', icon: <LuWallet />, label: 'Payments' },
            { path: '/supplier/reports', icon: <LuLayoutDashboard />, label: 'Reports' }
        ]
    },
    {
        title: 'SUPPORT',
        items: [
            { path: '/supplier/notifications', icon: <LuBell />, label: 'Notifications' },
            { path: '/supplier/reviews', icon: <LuStar />, label: 'Reviews' },
            { path: '/supplier/support', icon: <LuCircleHelp />, label: 'Help' }
        ]
    }
].filter(section => section.items.length > 0);

const SupplierSidebar = ({ isOpen, onToggle }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully');
            navigate('/');
        } catch (error) {
            toast.error('Logout failed');
        }
    };

    const toggleSidebar = () => onToggle();

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                className="sidebar-toggle"
                onClick={toggleSidebar}
                aria-label={isOpen ? "Close Menu" : "Open Menu"}
            >
                {isOpen ? <LuX size={24} /> : <LuMenu size={24} />}
            </button>

            {/* Supplier Sidebar */}
            <div className={`supplier-sidebar ${isOpen ? 'open' : 'closed'}`} aria-expanded={isOpen}>
                {/* Desktop Toggle Button */}
                <button
                    className="desktop-toggle-btn"
                    onClick={toggleSidebar}
                    aria-label={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                    title={isOpen ? 'Collapse' : 'Expand'}
                >
                    {isOpen ? <LuChevronLeft size={16} /> : <LuChevronRight size={16} />}
                </button>

                <div className="sidebar-content">
                    {/* Header */}
                    <div className="sidebar-header">
                        <div className="sidebar-logo">
                            <LuTractor className="logo-icon" />
                            {isOpen && <span className="logo-text animate-fade-in">AgriConnect</span>}
                        </div>

                        <div className="sidebar-user">
                            <div className="user-avatar-small">
                                {user?.username?.charAt(0).toUpperCase() || 'S'}
                            </div>
                            {isOpen && (
                                <div className="user-details animate-fade-in">
                                    <p className="user-name">{user?.username || 'Supplier'}</p>
                                    <span className="user-badge">Supplier</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="sidebar-nav">
                        {NAV_SECTIONS(user).map((section) => (
                            <div key={section.title} className="nav-section">
                                <div className="nav-section-title">
                                    {isOpen ? section.title : section.title.charAt(0)}
                                </div>
                                {section.items.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `nav-item ${isActive ? 'active' : ''}`
                                        }
                                        title={!isOpen ? item.label : ''}
                                    >
                                        <span className="nav-icon">{item.icon}</span>
                                        {isOpen && <span className="nav-label animate-fade-in">{item.label}</span>}
                                    </NavLink>
                                ))}
                            </div>
                        ))}
                    </nav>
                </div>

                {/* Logout Button */}
                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        <LuLogOut className="nav-icon" />
                        {isOpen && <span className="nav-label">Logout</span>}
                    </button>
                </div>
            </div>

            {/* Mobile Overlay */}
            {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
        </>
    );
};

export default memo(SupplierSidebar);
