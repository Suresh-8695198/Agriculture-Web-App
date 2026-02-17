import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaSeedling, FaChartLine, FaBoxOpen, FaUsers, FaTractor, FaShoppingCart, FaWallet, FaClipboardList } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import { toast } from 'react-toastify';
import './farmer/FarmerPages.css';

const FarmerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats] = useState({
        totalProduce: 5,
        activeListings: 3,
        totalOrders: 12,
        monthlyRevenue: 15750
    });

    const handleQuickAction = (path) => {
        navigate(path);
    };

    if (!user) {
        return (
            <div className="farmer-content-container">
                <div className="farmer-page-header">
                    <h1 className="farmer-page-title">Loading...</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="farmer-content-container">
            {/* Welcome Header */}
            <div className="farmer-page-header">
                <h1 className="farmer-page-title">
                    <MdDashboard style={{ color: '#43A047' }} />
                    Welcome back, {user?.username}!
                </h1>
                <p className="farmer-page-description">
                    Here's what's happening with your farm today
                </p>
            </div>

            {/* Stats Grid */}
            <div className="farmer-grid">
                <div className="farmer-card stat-card-dashboard">
                    <div className="stat-card-icon produce">
                        <FaBoxOpen />
                    </div>
                    <div className="stat-card-content">
                        <h3>{stats.totalProduce}</h3>
                        <p>Total Produce</p>
                    </div>
                </div>
                <div className="farmer-card stat-card-dashboard">
                    <div className="stat-card-icon listings">
                        <FaChartLine />
                    </div>
                    <div className="stat-card-content">
                        <h3>{stats.activeListings}</h3>
                        <p>Active Listings</p>
                    </div>
                </div>
                <div className="farmer-card stat-card-dashboard">
                    <div className="stat-card-icon orders">
                        <FaClipboardList />
                    </div>
                    <div className="stat-card-content">
                        <h3>{stats.totalOrders}</h3>
                        <p>Total Orders</p>
                    </div>
                </div>
                <div className="farmer-card stat-card-dashboard">
                    <div className="stat-card-icon revenue">
                        <FaWallet />
                    </div>
                    <div className="stat-card-content">
                        <h3>₹{stats.monthlyRevenue.toLocaleString()}</h3>
                        <p>Monthly Revenue</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-section">
                <h2 className="section-title">Quick Actions</h2>
                <div className="quick-actions-grid">
                    <button 
                        className="quick-action-card"
                        onClick={() => handleQuickAction('/farmer/sell-produce')}
                    >
                        <div className="action-icon add-produce">
                            <FaSeedling />
                        </div>
                        <h3>Add New Produce</h3>
                        <p>List your crops for sale</p>
                    </button>
                    <button 
                        className="quick-action-card"
                        onClick={() => handleQuickAction('/farmer/buy-products')}
                    >
                        <div className="action-icon buy-products">
                            <FaShoppingCart />
                        </div>
                        <h3>Buy Products</h3>
                        <p>Purchase seeds & fertilizers</p>
                    </button>
                    <button 
                        className="quick-action-card"
                        onClick={() => handleQuickAction('/farmer/rent-equipment')}
                    >
                        <div className="action-icon rent-equipment">
                            <FaTractor />
                        </div>
                        <h3>Rent Equipment</h3>
                        <p>Book tractors & machinery</p>
                    </button>
                    <button 
                        className="quick-action-card"
                        onClick={() => handleQuickAction('/farmer/search-supplier')}
                    >
                        <div className="action-icon find-suppliers">
                            <FaUsers />
                        </div>
                        <h3>Find Suppliers</h3>
                        <p>Search nearby suppliers</p>
                    </button>
                </div>
            </div>

            {/* Recent Activity & Profile Summary */}
            <div className="dashboard-bottom-grid">
                <div className="farmer-card dashboard-activity-card">
                    <h2 className="section-title">Recent Activity</h2>
                    <div className="activity-list">
                        <div className="activity-item">
                            <div className="activity-icon success">
                                <FaBoxOpen />
                            </div>
                            <div className="activity-details">
                                <p className="activity-title">Order Delivered</p>
                                <p className="activity-time">2 hours ago</p>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-icon info">
                                <FaTractor />
                            </div>
                            <div className="activity-details">
                                <p className="activity-title">Tractor Booking Confirmed</p>
                                <p className="activity-time">5 hours ago</p>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-icon success">
                                <FaWallet />
                            </div>
                            <div className="activity-details">
                                <p className="activity-title">Payment Received</p>
                                <p className="activity-time">1 day ago</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="farmer-card dashboard-profile-summary">
                    <h2 className="section-title">Profile Summary</h2>
                    <div className="profile-summary-content">
                        <div className="profile-summary-avatar">
                            {user?.username?.charAt(0).toUpperCase() || 'F'}
                        </div>
                        <div className="profile-summary-info">
                            <h3>{user?.username}</h3>
                            <p>{user?.email}</p>
                            <p>{user?.phone_number || 'Phone not set'}</p>
                        </div>
                        <button 
                            className="farmer-btn-secondary"
                            onClick={() => handleQuickAction('/farmer/profile')}
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FarmerDashboard;
