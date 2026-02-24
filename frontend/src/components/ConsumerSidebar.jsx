import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LuLayoutDashboard,
    LuUser,
    LuShoppingCart,
    LuShoppingBag,
    LuHeart,
    LuSettings,
    LuLogOut,
    LuMenu,
    LuX,
    LuTractor,
    LuStore
} from 'react-icons/lu';
import { useAuth } from '../context/AuthContext';
import './FarmerSidebar.css'; // Reusing base styles

const NAV_SECTIONS = (user) => [
    {
        title: 'MAIN',
        items: [
            { path: '/consumer/marketplace', icon: <LuLayoutDashboard />, label: 'Dashboard' },
            { path: '/consumer/profile', icon: <LuUser />, label: 'My Profile' }
        ]
    },
    {
        title: 'PORTAL SWITCH',
        items: [
            ...(user?.has_farmer_profile ? [{ path: '/farmer/dashboard', icon: <LuTractor />, label: 'Farmer Portal' }] : []),
            ...(user?.has_supplier_profile ? [{ path: '/supplier/dashboard', icon: <LuStore />, label: 'Supplier Portal' }] : [])
        ]
    },
    {
        title: 'SHOPPING',
        items: [
            { path: '/consumer/orders', icon: <LuShoppingBag />, label: 'My Orders' },
            { path: '/consumer/favorites', icon: <LuHeart />, label: 'Favorites' },
            { path: '/consumer/cart', icon: <LuShoppingCart />, label: 'Shopping Cart' }
        ]
    },
    {
        title: 'ACCOUNT',
        items: [
            { path: '/consumer/settings', icon: <LuSettings />, label: 'Settings' }
        ]
    }
].filter(section => section.items.length > 0);

const ConsumerSidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const toggleSidebar = () => setIsOpen(!isOpen);

    const sections = NAV_SECTIONS(user);

    return (
        <>
            {/* Mobile Toggle Button */}
            <button className="mobile-toggle" onClick={toggleSidebar}>
                {isOpen ? <LuX /> : <LuMenu />}
            </button>

            {/* Backdrop for mobile */}
            {isOpen && <div className="sidebar-backdrop" onClick={toggleSidebar}></div>}

            <aside className={`farmer-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="logo-icon consumer-logo">
                            <LuShoppingCart />
                        </div>
                        <span className="logo-text">Consumer<span>Portal</span></span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {sections.map((section, idx) => (
                        <div key={idx} className="nav-section">
                            <h3 className="section-title">{section.title}</h3>
                            <div className="section-items">
                                {section.items.map((item, itemIdx) => (
                                    <NavLink
                                        key={itemIdx}
                                        to={item.path}
                                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <span className="nav-icon">{item.icon}</span>
                                        <span className="nav-label">{item.label}</span>
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-brief">
                        <div className="user-avatar-small consumer-avatar">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                            <p className="user-name">{user?.username}</p>
                            <p className="user-email">{user?.email}</p>
                        </div>
                    </div>
                    <button className="logout-button" onClick={handleLogout}>
                        <LuLogOut />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default ConsumerSidebar;
