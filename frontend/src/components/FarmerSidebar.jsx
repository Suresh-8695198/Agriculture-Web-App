import React, { memo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LuLayoutDashboard, LuSearch,
    LuShoppingCart, LuTractor, LuLeaf, LuClipboardList, LuWallet,
    LuBell, LuCircleHelp, LuLogOut, LuMenu, LuX,
    LuChevronLeft, LuChevronRight, LuWheat, LuUser
} from 'react-icons/lu';
import { toast } from 'react-toastify';
import './FarmerSidebar.css';

const NAV_SECTIONS = (user) => [
    {
        title: 'MAIN',
        items: [
            { path: '/farmer/dashboard', icon: <LuLayoutDashboard />, label: 'Dashboard' },
            { path: '/farmer/profile', icon: <LuUser />, label: 'Profile' }
        ]
    },
    {
        title: 'PORTAL SWITCH',
        items: [
            ...(user?.has_supplier_profile ? [{ path: '/supplier/dashboard', icon: <LuTractor />, label: 'Supplier Portal' }] : []),
            ...(user?.user_type === 'consumer' || user?.has_consumer_profile ? [{ path: '/consumer/marketplace', icon: <LuShoppingCart />, label: 'Shop Portal' }] : [])
        ]
    },
    {
        title: 'FARM ACTIONS',
        items: [
            { path: '/farmer/sell-produce', icon: <LuLeaf />, label: 'Add Crop' },
            { path: '/farmer/buy-products', icon: <LuShoppingCart />, label: 'Buy Seeds' },
            { path: '/farmer/rent-equipment', icon: <LuTractor />, label: 'Rent Tractor' },
            { path: '/farmer/search-supplier', icon: <LuSearch />, label: 'Find Supplier' }
        ]
    },
    {
        title: 'FINANCE',
        items: [
            { path: '/farmer/wallet', icon: <LuWallet />, label: 'Money' },
            { path: '/farmer/orders', icon: <LuClipboardList />, label: 'Orders' }
        ]
    },
    {
        title: 'SUPPORT',
        items: [
            { path: '/farmer/notifications', icon: <LuBell />, label: 'Notifications' },
            { path: '/farmer/support', icon: <LuCircleHelp />, label: 'Help' }
        ]
    }
].filter(section => section.items.length > 0);

const FarmerSidebar = ({ isOpen, onToggle }) => {
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
                className="farmer-sidebar-toggle"
                onClick={toggleSidebar}
                aria-label={isOpen ? "Close Menu" : "Open Menu"}
            >
                {isOpen ? <LuX size={24} /> : <LuMenu size={24} />}
            </button>

            {/* Farmer Sidebar */}
            <div className={`farmer-sidebar ${isOpen ? 'open' : 'closed'}`} aria-expanded={isOpen}>
                {/* Desktop Toggle Button */}
                <button
                    className="farmer-desktop-toggle-btn"
                    onClick={toggleSidebar}
                    aria-label={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                    title={isOpen ? 'Collapse' : 'Expand'}
                >
                    {isOpen ? <LuChevronLeft size={16} /> : <LuChevronRight size={16} />}
                </button>

                <div className="farmer-sidebar-content">
                    {/* Header Section */}
                    <div className="farmer-sidebar-header">
                        <div className="farmer-sidebar-logo">
                            <LuWheat className="logo-icon" />
                            {isOpen && (
                                <div className="logo-content animate-fade-in">
                                    <span className="logo-text">AgriConnect</span>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Navigation Menu */}
                    <nav className="farmer-sidebar-nav">
                        {NAV_SECTIONS(user).map((section, sIndex) => (
                            <div key={section.title} className="nav-section">
                                <div className="nav-section-title">
                                    {isOpen ? section.title : section.title.charAt(0)}
                                </div>
                                {section.items.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `farmer-nav-item ${isActive ? 'active' : ''}`
                                        }
                                        title={!isOpen ? item.label : ''}
                                    >
                                        <span className="nav-icon">{item.icon}</span>
                                        {isOpen && (
                                            <span className="nav-label animate-fade-in">{item.label}</span>
                                        )}
                                    </NavLink>
                                ))}
                            </div>
                        ))}
                    </nav>
                </div>

                {/* Logout Button */}
                <div className="farmer-sidebar-footer">
                    <button className="farmer-logout-btn" onClick={handleLogout}>
                        <LuLogOut className="nav-icon" />
                        {isOpen && <span className="nav-label">Logout</span>}
                    </button>
                </div>
            </div>
        </>
    );
};

export default memo(FarmerSidebar);

