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
        <div className="portal-main-content animate-fade-in">
            {/* Header Section */}
            <header className="page-header">
                <div>
                    <h1 className="page-title">Welcome back, {user?.username}!</h1>
                    <p className="page-subtitle">Consumer Portal Marketplace</p>
                </div>
                <button className="btn-primary">
                    <FaShoppingCart /> Browse Marketplace
                </button>
            </header>

            {/* Stats Grid */}
            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-top">
                        <span className="kpi-label">Total Orders</span>
                        <div className="kpi-icon-bg green"><FaShoppingCart /></div>
                    </div>
                    <div className="kpi-value">{stats.totalOrders}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-top">
                        <span className="kpi-label">Pending Orders</span>
                        <div className="kpi-icon-bg orange"><FaBox /></div>
                    </div>
                    <div className="kpi-value">{stats.pendingOrders}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-top">
                        <span className="kpi-label">Completed Orders</span>
                        <div className="kpi-icon-bg blue"><FaCheckCircle /></div>
                    </div>
                    <div className="kpi-value">{stats.completedOrders}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-top">
                        <span className="kpi-label">Favorites</span>
                        <div className="kpi-icon-bg purple"><FaHeart /></div>
                    </div>
                    <div className="kpi-value">{stats.favoriteItems}</div>
                </div>
            </div>

            {/* Main Content */}
            <div className="content-grid">
                {/* Profile Card */}
                <div className="content-card">
                    <div className="card-header">
                        <h3><FaShoppingBasket /> Your Profile</h3>
                        {!isEditing ? (
                            <button className="btn-text" onClick={handleEditClick}>Edit Profile</button>
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
                                    <span className="profile-label">Username</span>
                                    <span className="profile-value">{user.username}</span>
                                </div>
                                <div className="profile-item">
                                    <span className="profile-label"><FaEnvelope /> Email</span>
                                    <span className="profile-value">{user.email}</span>
                                </div>
                                <div className="profile-item">
                                    <span className="profile-label"><FaPhone /> Phone</span>
                                    <span className="profile-value">{user.phone_number}</span>
                                </div>
                                <div className="profile-item">
                                    <span className="profile-label"><FaMapMarkerAlt /> Location</span>
                                    <span className="profile-value">{user.address || 'Not set'}</span>
                                </div>
                                <div className="profile-item">
                                    <span className="profile-label"><FaCalendar /> Member Since</span>
                                    <span className="profile-value">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="profile-edit-form">
                                <div className="form-field">
                                    <label>Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={editData.username}
                                        onChange={handleChange}
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-field">
                                    <label><FaEnvelope /> Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={editData.email}
                                        onChange={handleChange}
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-field">
                                    <label><FaPhone /> Phone</label>
                                    <input
                                        type="tel"
                                        name="phone_number"
                                        value={editData.phone_number}
                                        onChange={handleChange}
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-field full-width">
                                    <label><FaMapMarkerAlt /> Location</label>
                                    <textarea
                                        name="address"
                                        value={editData.address}
                                        onChange={handleChange}
                                        className="form-control"
                                        rows="3"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="content-card">
                    <div className="card-header">
                        <h3>Quick Actions</h3>
                    </div>
                    <div className="card-body">
                        <div className="action-grid">
                            <button className="btn-secondary-supplier w-100 mb-2">
                                <FaShoppingCart /> Browse Products
                            </button>
                            <button className="btn-secondary-supplier w-100 mb-2">
                                <FaBox /> My Orders
                            </button>
                            <button className="btn-secondary-supplier w-100 mb-2">
                                <FaHeart /> Favorites
                            </button>
                            <button className="btn-secondary-supplier w-100">
                                <FaShoppingBasket /> Shopping Cart
                            </button>
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="content-card" style={{ gridColumn: '1 / -1' }}>
                    <div className="card-header">
                        <h3>Recent Orders</h3>
                    </div>
                    <div className="card-body">
                        <div className="empty-state text-center p-5">
                            <FaBox size={48} color="#D1D5DB" />
                            <p style={{ marginTop: '1rem' }}>No orders yet</p>
                            <p className="text-muted">Start shopping to see your orders here</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConsumerDashboard;
