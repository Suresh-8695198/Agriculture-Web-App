import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
    FaUser, FaSave, FaTimes, FaEdit, FaPhone, FaEnvelope,
    FaMapMarkerAlt, FaGlobe, FaCheckCircle, FaTractor, FaBoxOpen, FaSeedling
} from 'react-icons/fa';
import { LuLogOut, LuSettings, LuBell } from "react-icons/lu";
import { toast } from 'react-toastify';
import api from '../api/axios';
import './farmer/FarmerPages.css';

const FarmerProfile = () => {
    const { user, setUser, logout } = useAuth();
    const { t, changeLanguage, language } = useLanguage();
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
        return <div className="adv-loading">Loading Profile...</div>;
    }

    const availableLanguages = [
        { code: 'en', label: 'English' },
        { code: 'hi', label: 'हिन्दी' },
        { code: 'ta', label: 'தமிழ்' },
        { code: 'te', label: 'తెలుగు' },
        { code: 'kn', label: 'ಕನ್ನಡ' }
    ];

    return (
        <div className="adv-dashboard-container">
            {/* 1️⃣ HEADER */}
            <header className="adv-header">
                <div>
                    <h1>{t('profile.title')}</h1>
                    <p className="adv-subtitle">{t('profile.subtitle')}</p>
                </div>
                <div className="adv-header-actions">
                    <button className="adv-btn-secondary" style={{ marginRight: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <LuBell /> {t('profile.notifications')}
                    </button>
                    <div className="adv-profile-pill">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                </div>
            </header>

            {/* MAIN GRID */}
            <div className="adv-grid-layout">

                {/* 2️⃣ LEFT COLUMN: IDENTITY CARD */}
                <div className="adv-card" style={{ gridColumn: 'span 4', textAlign: 'center', alignItems: 'center' }}>
                    <div className="profile-agri-avatar-container" style={{ position: 'relative', margin: '20px 0' }}>
                        <div className="profile-agri-avatar" style={{
                            width: '120px', height: '120px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #43A047, #66BB6A)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '3rem', color: 'white', fontWeight: 'bold',
                            border: '4px solid #E8F5E9', boxShadow: '0 8px 24px rgba(46, 125, 50, 0.2)'
                        }}>
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{
                            position: 'absolute', bottom: '5px', right: '5px',
                            background: '#fff', borderRadius: '50%', padding: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                            <FaCheckCircle color="#2E7D32" size={20} />
                        </div>
                    </div>

                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#1B5E20' }}>{user?.username}</h2>
                    <span className="adv-status-badge completed" style={{ fontSize: '0.9rem', padding: '4px 12px' }}>
                        {t('profile.verified')}
                    </span>

                    <div style={{ marginTop: '2rem', width: '100%', textAlign: 'left' }}>
                        <h4 style={{ color: '#555', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                            <FaGlobe style={{ marginRight: '8px', color: '#2E7D32' }} /> {t('profile.language')}
                        </h4>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {availableLanguages.map((lang) => (
                                <button
                                    key={lang.code}
                                    className={`adv-btn-secondary ${language === lang.code ? 'active' : ''}`}
                                    style={{
                                        background: language === lang.code ? '#2E7D32' : '#f0f0f0',
                                        color: language === lang.code ? '#fff' : '#333',
                                        border: 'none'
                                    }}
                                    onClick={() => changeLanguage(lang.code)}
                                >
                                    {lang.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginTop: 'auto', width: '100%', paddingTop: '2rem' }}>
                        <button
                            className="adv-btn-secondary"
                            style={{ width: '100%', color: '#d32f2f', borderColor: '#d32f2f', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                            onClick={logout}
                        >
                            <LuLogOut /> {t('profile.logout')}
                        </button>
                    </div>
                </div>

                {/* 3️⃣ RIGHT COLUMN: EDITABLE DETAILS */}
                <div className="adv-card" style={{ gridColumn: 'span 8' }}>
                    <div className="adv-card-header">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FaUser style={{ color: '#2E7D32' }} /> {t('profile.personalInfo')}</h3>
                        {!isEditing && (
                            <button
                                className="adv-btn-primary-sm"
                                onClick={handleEditClick}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <FaEdit /> {t('profile.editDetails')}
                            </button>
                        )}
                    </div>

                    {!isEditing ? (
                        <div className="profile-read-view" style={{ display: 'grid', gap: '1.5rem' }}>
                            <div className="profile-item-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#F9FAFB', borderRadius: '12px' }}>
                                <div style={{ background: '#E8F5E9', padding: '12px', borderRadius: '50%', color: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px' }}><FaUser size={20} /></div>
                                <div>
                                    <span style={{ fontSize: '0.85rem', color: '#666', display: 'block' }}>{t('profile.fullName')}</span>
                                    <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>{user?.username || 'Not Provided'}</span>
                                </div>
                            </div>

                            <div className="profile-item-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#F9FAFB', borderRadius: '12px' }}>
                                <div style={{ background: '#E3F2FD', padding: '12px', borderRadius: '50%', color: '#1565C0', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px' }}><FaPhone size={20} /></div>
                                <div>
                                    <span style={{ fontSize: '0.85rem', color: '#666', display: 'block' }}>{t('profile.phoneNumber')}</span>
                                    <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>{user?.phone_number || 'Not Provided'}</span>
                                </div>
                            </div>

                            <div className="profile-item-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#F9FAFB', borderRadius: '12px' }}>
                                <div style={{ background: '#FFF3E0', padding: '12px', borderRadius: '50%', color: '#EF6C00', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px' }}><FaEnvelope size={20} /></div>
                                <div>
                                    <span style={{ fontSize: '0.85rem', color: '#666', display: 'block' }}>{t('profile.email')}</span>
                                    <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>{user?.email || 'Not Provided'}</span>
                                </div>
                            </div>

                            <div className="profile-item-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#F9FAFB', borderRadius: '12px' }}>
                                <div style={{ background: '#F3E5F5', padding: '12px', borderRadius: '50%', color: '#7B1FA2', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px' }}><FaMapMarkerAlt size={20} /></div>
                                <div>
                                    <span style={{ fontSize: '0.85rem', color: '#666', display: 'block' }}>{t('profile.address')}</span>
                                    <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>{user?.address || 'Not Provided'}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} style={{ display: 'grid', gap: '1.5rem' }}>
                            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontWeight: '500', color: '#444' }}>{t('profile.fullName')}</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={editData.username}
                                    onChange={handleChange}
                                    className="adv-form-input"
                                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontWeight: '500', color: '#444' }}>{t('profile.phoneNumber')}</label>
                                <input
                                    type="tel"
                                    name="phone_number"
                                    value={editData.phone_number}
                                    onChange={handleChange}
                                    className="adv-form-input"
                                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                                />
                            </div>
                            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontWeight: '500', color: '#444' }}>{t('profile.email')}</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editData.email}
                                    onChange={handleChange}
                                    className="adv-form-input"
                                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontWeight: '500', color: '#444' }}>{t('profile.address')}</label>
                                <textarea
                                    name="address"
                                    value={editData.address}
                                    onChange={handleChange}
                                    className="adv-form-input"
                                    rows="3"
                                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                                ></textarea>
                            </div>

                            <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    className="adv-btn-secondary"
                                    onClick={handleCancelEdit}
                                    disabled={saving}
                                    style={{ flex: 1 }}
                                >
                                    <FaTimes /> {t('profile.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="adv-btn-primary"
                                    disabled={saving}
                                    style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                                >
                                    <FaSave /> {saving ? t('profile.saving') : t('profile.save')}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* 4️⃣ BOTTOM ROW: STATS SUMMARY */}
                <div className="adv-card" style={{ gridColumn: 'span 12', background: 'linear-gradient(to right, #2E7D32, #1B5E20)', color: 'white' }}>
                    <div className="adv-card-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                        <h3 style={{ color: 'white' }}>{t('profile.journey')}</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}><FaBoxOpen size={24} /></div>
                            <div>
                                <span style={{ fontSize: '2rem', fontWeight: 'bold', display: 'block' }}>12</span>
                                <span style={{ opacity: 0.8 }}>{t('profile.totalOrders')}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}><FaTractor size={24} /></div>
                            <div>
                                <span style={{ fontSize: '2rem', fontWeight: 'bold', display: 'block' }}>3</span>
                                <span style={{ opacity: 0.8 }}>{t('profile.equipmentRents')}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}><FaSeedling size={24} /></div>
                            <div>
                                <span style={{ fontSize: '2rem', fontWeight: 'bold', display: 'block' }}>5</span>
                                <span style={{ opacity: 0.8 }}>{t('profile.activeListings')}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FarmerProfile;
