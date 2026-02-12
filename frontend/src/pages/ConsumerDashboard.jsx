import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaShoppingCart, FaShoppingBasket, FaBox, FaCheckCircle, FaMapMarkerAlt, FaPhone, FaEnvelope, FaCalendar, FaHeart, FaSave, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../api/axios';
import './Dashboard.css';

const ConsumerDashboard = () => {
    const { user, setUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [saving, setSaving] = useState(false);
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        favoriteItems: 0
    });

    const handleEditClick = () => {
        setEditData({
            username: user.username,
            email: user.email,
            phone_number: user.phone_number,
            address: user.address || ''
        });
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditData({});
    };

    const handleChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const response = await api.patch('accounts/profile/', editData);
            setUser(response.data);
            setIsEditing(false);
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Profile update error:', error);
            toast.error('Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (!user) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Header Section */}
            <div className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <div className="user-avatar consumer-avatar">
                            <FaShoppingBasket />
                        </div>
                        <div className="user-info">
                            <h1>Welcome back, {user?.username}!</h1>
                            <p className="user-role consumer-role">
                                <FaShoppingBasket /> Consumer Portal
                            </p>
                        </div>
                    </div>
                    <div className="header-right">
                        <button className="btn-action consumer-btn">
                            <FaShoppingCart /> Browse Marketplace
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card consumer-card">
                    <div className="stat-icon consumer-icon">
                        <FaShoppingCart />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.totalOrders}</h3>
                        <p>Total Orders</p>
                    </div>
                </div>
                <div className="stat-card consumer-card">
                    <div className="stat-icon consumer-icon">
                        <FaBox />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.pendingOrders}</h3>
                        <p>Pending Orders</p>
                    </div>
                </div>
                <div className="stat-card consumer-card">
                    <div className="stat-icon consumer-icon">
                        <FaCheckCircle />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.completedOrders}</h3>
                        <p>Completed Orders</p>
                    </div>
                </div>
                <div className="stat-card consumer-card">
                    <div className="stat-icon consumer-icon">
                        <FaHeart />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.favoriteItems}</h3>
                        <p>Favorite Items</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="dashboard-content">
                {/* Profile Card */}
                <div className="content-card profile-card">
                    <div className="card-header consumer-header">
                        <h2>
                            <FaShoppingBasket /> Your Profile
                        </h2>
                        {!isEditing ? (
                            <button className="btn-link" onClick={handleEditClick}>Edit Profile</button>
                        ) : (
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button className="btn-save" onClick={handleSaveProfile} disabled={saving}>
                                    <FaSave /> {saving ? 'Saving...' : 'Save'}
                                </button>
                                <button className="btn-cancel" onClick={handleCancelEdit} disabled={saving}>
                                    <FaTimes /> Cancel
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="card-body">
                        {!isEditing ? (
                            <div className="profile-grid">
                                <div className="profile-item">
                                    <span className="profile-label">Username:</span>
                                    <span className="profile-value">{user.username}</span>
                                </div>
                                <div className="profile-item">
                                    <span className="profile-label">
                                        <FaEnvelope /> Email:
                                    </span>
                                    <span className="profile-value">{user.email}</span>
                                </div>
                                <div className="profile-item">
                                    <span className="profile-label">
                                        <FaPhone /> Phone:
                                    </span>
                                    <span className="profile-value">{user.phone_number}</span>
                                </div>
                                <div className="profile-item">
                                    <span className="profile-label">
                                        <FaMapMarkerAlt /> Location:
                                    </span>
                                    <span className="profile-value">{user.address || 'Not set'}</span>
                                </div>
                                <div className="profile-item">
                                    <span className="profile-label">
                                        <FaCalendar /> Member Since:
                                    </span>
                                    <span className="profile-value">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="profile-edit-form">
                                <div className="form-field">
                                    <label>Username:</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={editData.username}
                                        onChange={handleChange}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-field">
                                    <label><FaEnvelope /> Email:</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={editData.email}
                                        onChange={handleChange}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-field">
                                    <label><FaPhone /> Phone:</label>
                                    <input
                                        type="tel"
                                        name="phone_number"
                                        value={editData.phone_number}
                                        onChange={handleChange}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-field full-width">
                                    <label><FaMapMarkerAlt /> Location:</label>
                                    <textarea
                                        name="address"
                                        value={editData.address}
                                        onChange={handleChange}
                                        className="form-input"
                                        rows="3"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="content-card actions-card">
                    <div className="card-header consumer-header">
                        <h2>Quick Actions</h2>
                    </div>
                    <div className="card-body">
                        <div className="action-grid">
                            <button className="action-button consumer-action">
                                <FaShoppingCart />
                                <span>Browse Products</span>
                            </button>
                            <button className="action-button consumer-action">
                                <FaBox />
                                <span>My Orders</span>
                            </button>
                            <button className="action-button consumer-action">
                                <FaHeart />
                                <span>Favorites</span>
                            </button>
                            <button className="action-button consumer-action">
                                <FaShoppingBasket />
                                <span>Shopping Cart</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="content-card activity-card">
                    <div className="card-header consumer-header">
                        <h2>Recent Orders</h2>
                    </div>
                    <div className="card-body">
                        <div className="empty-state">
                            <FaBox />
                            <p>No orders yet</p>
                            <p className="text-muted">Start shopping to see your orders here</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConsumerDashboard;
