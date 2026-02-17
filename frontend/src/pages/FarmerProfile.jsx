import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaSave, FaTimes, FaEdit, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../api/axios';
import './farmer/FarmerPages.css';

const FarmerProfile = () => {
    const { user, setUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editData, setEditData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        phone_number: user?.phone_number || '',
        address: user?.address || ''
    });

    const handleChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const handleEditClick = () => {
        setEditData({
            username: user?.username || '',
            email: user?.email || '',
            phone_number: user?.phone_number || '',
            address: user?.address || ''
        });
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditData({
            username: user?.username || '',
            email: user?.email || '',
            phone_number: user?.phone_number || '',
            address: user?.address || ''
        });
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
            <div className="farmer-content-container">
                <div className="farmer-page-header">
                    <h1 className="farmer-page-title">Loading...</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="farmer-content-container">
            <div className="farmer-page-header">
                <h1 className="farmer-page-title">
                    <FaUser style={{ color: '#43A047' }} />
                    My Profile
                </h1>
                <p className="farmer-page-description">
                    Manage your personal information and account settings
                </p>
            </div>

            <div className="profile-layout">
                <div className="profile-card">
                    <div className="profile-header">
                        <div className="profile-avatar-large">
                            {user?.username?.charAt(0).toUpperCase() || 'F'}
                        </div>
                        <div className="profile-header-info">
                            <h2>{user?.username}</h2>
                            <span className="profile-role-badge">
                                <FaUser /> Farmer
                            </span>
                        </div>
                        {!isEditing && (
                            <button className="farmer-btn-primary" onClick={handleEditClick}>
                                <FaEdit /> Edit Profile
                            </button>
                        )}
                    </div>

                    <div className="profile-details">
                        {!isEditing ? (
                            <>
                                <div className="profile-detail-item">
                                    <div className="detail-label">
                                        <FaUser className="detail-icon" />
                                        <span>Full Name</span>
                                    </div>
                                    <div className="detail-value">{user?.username || 'Not set'}</div>
                                </div>

                                <div className="profile-detail-item">
                                    <div className="detail-label">
                                        <FaEnvelope className="detail-icon" />
                                        <span>Email Address</span>
                                    </div>
                                    <div className="detail-value">{user?.email || 'Not set'}</div>
                                </div>

                                <div className="profile-detail-item">
                                    <div className="detail-label">
                                        <FaPhone className="detail-icon" />
                                        <span>Phone Number</span>
                                    </div>
                                    <div className="detail-value">{user?.phone_number || 'Not set'}</div>
                                </div>

                                <div className="profile-detail-item">
                                    <div className="detail-label">
                                        <FaMapMarkerAlt className="detail-icon" />
                                        <span>Address</span>
                                    </div>
                                    <div className="detail-value">{user?.address || 'Not set'}</div>
                                </div>
                            </>
                        ) : (
                            <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
                                <div className="form-group">
                                    <label>
                                        <FaUser className="detail-icon" />
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={editData.username}
                                        onChange={handleChange}
                                        placeholder="Enter your name"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        <FaEnvelope className="detail-icon" />
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={editData.email}
                                        onChange={handleChange}
                                        placeholder="your.email@example.com"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        <FaPhone className="detail-icon" />
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone_number"
                                        value={editData.phone_number}
                                        onChange={handleChange}
                                        placeholder="+91 98765 43210"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        <FaMapMarkerAlt className="detail-icon" />
                                        Address
                                    </label>
                                    <textarea
                                        name="address"
                                        value={editData.address}
                                        onChange={handleChange}
                                        placeholder="Enter your address"
                                        rows="3"
                                    ></textarea>
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="farmer-btn-secondary"
                                        onClick={handleCancelEdit}
                                        disabled={saving}
                                    >
                                        <FaTimes /> Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="farmer-btn-primary"
                                        disabled={saving}
                                    >
                                        <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                <div className="profile-stats-card">
                    <h3>Account Statistics</h3>
                    <div className="profile-stats-grid">
                        <div className="profile-stat-item">
                            <div className="stat-icon-profile">📦</div>
                            <div>
                                <div className="stat-value-profile">12</div>
                                <div className="stat-label-profile">Total Orders</div>
                            </div>
                        </div>
                        <div className="profile-stat-item">
                            <div className="stat-icon-profile">🚜</div>
                            <div>
                                <div className="stat-value-profile">3</div>
                                <div className="stat-label-profile">Rentals</div>
                            </div>
                        </div>
                        <div className="profile-stat-item">
                            <div className="stat-icon-profile">🌾</div>
                            <div>
                                <div className="stat-value-profile">5</div>
                                <div className="stat-label-profile">Listings</div>
                            </div>
                        </div>
                        <div className="profile-stat-item">
                            <div className="stat-icon-profile">💰</div>
                            <div>
                                <div className="stat-value-profile">₹15,750</div>
                                <div className="stat-label-profile">Wallet Balance</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FarmerProfile;
