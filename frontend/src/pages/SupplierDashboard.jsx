import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    FaTruck,
    FaBoxOpen,
    FaChartBar,
    FaShoppingCart,
    FaMapMarkerAlt,
    FaPhone,
    FaEnvelope,
    FaCalendar,
    FaWarehouse,
    FaSave,
    FaTimes,
    FaClipboardList,
    FaMoneyBillWave,
    FaUserEdit,
    FaPlusCircle
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../api/axios';
import './Dashboard.css';

const SupplierDashboard = () => {
    const { user, setUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [saving, setSaving] = useState(false);

    // Mock data for stats - in a real app these would come from an API
    const [stats] = useState({
        totalProducts: 12,
        pendingOrders: 5,
        completedDeliveries: 45,
        monthlyRevenue: 125000
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
            <header className="dashboard-header animate-fade-in">
                <div className="header-content">
                    <div className="header-left">
                        <div className="user-avatar supplier-avatar">
                            <FaTruck />
                        </div>
                        <div className="user-info">
                            <h1>Welcome, {user?.username}!</h1>
                            <p className="user-role supplier-role">
                                <FaTruck /> Supplier Portal
                            </p>
                        </div>
                    </div>
                    <div className="header-right">
                        <button className="btn-action supplier-btn" title="Create a new product listing">
                            <FaPlusCircle /> Add Product
                        </button>
                    </div>
                </div>
            </header>

            {/* key Stats Grid - Large & Visual */}
            <div className="stats-grid">
                <div className="stat-card supplier-card">
                    <div className="stat-icon supplier-icon">
                        <FaWarehouse />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.totalProducts}</h3>
                        <p>Total Products</p>
                    </div>
                </div>

                <div className="stat-card supplier-card">
                    <div className="stat-icon supplier-icon" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}>
                        <FaClipboardList />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.pendingOrders}</h3>
                        <p>Pending Orders</p>
                    </div>
                </div>

                <div className="stat-card supplier-card">
                    <div className="stat-icon supplier-icon" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
                        <FaTruck />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.completedDeliveries}</h3>
                        <p>Delivered</p>
                    </div>
                </div>

                <div className="stat-card supplier-card">
                    <div className="stat-icon supplier-icon" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}>
                        <FaMoneyBillWave />
                    </div>
                    <div className="stat-content">
                        <h3>₹{stats.monthlyRevenue.toLocaleString()}</h3>
                        <p>Total Earnings</p>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="dashboard-content">

                {/* Left Column: Activity & History */}
                <div className="content-side-left">
                    {/* Recent Orders / Activity */}
                    <div className="content-card activity-card">
                        <div className="card-header">
                            <h2><FaShoppingCart style={{ color: '#8B6F47' }} /> Recent Orders</h2>
                            <button className="btn-link">View All</button>
                        </div>
                        <div className="card-body">
                            {/* Visual Empty State */}
                            <div className="empty-state">
                                <FaBoxOpen />
                                <h3>No New Orders</h3>
                                <p className="text-muted">Orders from farmers will appear here automatically.</p>
                            </div>
                        </div>
                    </div>

                    {/* Business Profile */}
                    <div className="content-card profile-card" style={{ marginTop: '2rem' }}>
                        <div className="card-header">
                            <h2><FaUserEdit style={{ color: '#8B6F47' }} /> Business Profile</h2>
                            {!isEditing ? (
                                <button className="btn-link" onClick={handleEditClick}>Edit Details</button>
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
                                        <span className="profile-label"><FaEnvelope /> Email</span>
                                        <span className="profile-value">{user.email}</span>
                                    </div>
                                    <div className="profile-item">
                                        <span className="profile-label"><FaPhone /> Phone</span>
                                        <span className="profile-value">{user.phone_number || 'Not set'}</span>
                                    </div>
                                    <div className="profile-item">
                                        <span className="profile-label"><FaMapMarkerAlt /> Address</span>
                                        <span className="profile-value">{user.address || 'No address provided'}</span>
                                    </div>
                                    <div className="profile-item">
                                        <span className="profile-label"><FaCalendar /> Member Since</span>
                                        <span className="profile-value">{new Date(user.created_at).toLocaleDateString()}</span>
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
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label><FaEnvelope /> Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={editData.email}
                                            onChange={handleChange}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label><FaPhone /> Phone</label>
                                        <input
                                            type="tel"
                                            name="phone_number"
                                            value={editData.phone_number}
                                            onChange={handleChange}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                                        <label><FaMapMarkerAlt /> Address</label>
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
                </div>

                {/* Right Column: Quick Actions */}
                <div className="content-card actions-card">
                    <div className="card-header">
                        <h2>Quick Actions</h2>
                    </div>
                    <div className="card-body">
                        <div className="action-grid">
                            <button className="action-button supplier-action">
                                <FaBoxOpen />
                                <span>Add New Product</span>
                            </button>
                            <button className="action-button supplier-action">
                                <FaWarehouse />
                                <span>My Inventory</span>
                            </button>
                            <button className="action-button supplier-action">
                                <FaClipboardList />
                                <span>Order History</span>
                            </button>
                            <button className="action-button supplier-action">
                                <FaChartBar />
                                <span>Sales Reports</span>
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SupplierDashboard;
