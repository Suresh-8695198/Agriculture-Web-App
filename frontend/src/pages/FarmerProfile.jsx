import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
    FaUser, FaPhone, FaEnvelope, FaCalendarAlt, FaVenusMars,
    FaHome, FaLeaf, FaSeedling, FaWater, FaVial, FaCheckCircle,
    FaStore, FaUniversity, FaIdCard, FaGlobe, FaMoon, FaBell,
    FaLock, FaTrophy, FaTractor, FaBoxOpen, FaEdit, FaSave, FaTimes,
    FaCoins, FaChartLine, FaCog, FaShieldAlt
} from 'react-icons/fa';
import { LuLogOut, LuShieldCheck, LuSmartphone } from "react-icons/lu";
import { toast } from 'react-toastify';
import api from '../api/axios';
import './farmer/FarmerProfile.css';

const FarmerProfile = () => {
    const { user, setUser, logout } = useAuth();
    const { t, changeLanguage, language } = useLanguage();
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Extended state for all profile sections
    const fd = user?.farmer_data || {};
    const [formData, setFormData] = useState({
        // Personal
        username: user?.username || '',
        phone_number: user?.phone_number || '',
        email: user?.email || '',
        dob: fd.dob || '',
        gender: fd.gender || 'Male',

        // Farm Details
        farm_name: fd.farm_name || '',
        farm_size: fd.farm_size || '',
        crops_grown: fd.crops_grown || '',
        soil_type: fd.soil_type || '',
        irrigation_type: fd.irrigation_type || '',

        // Business
        pan_number: fd.pan_number || '',

        // Bank
        bank_name: fd.bank_name || '',
        upi_id: fd.upi_id || '',

        // Settings
        darkMode: fd.dark_mode || false,
        language: fd.interface_language || 'en',

        // Notifications
        notif_order: fd.notif_order ?? true,
        notif_whatsapp: fd.notif_whatsapp ?? true,
        notif_market: fd.notif_market ?? true
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleToggle = (name) => {
        setFormData(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Send all frontend data to backend
            const payload = {
                username: formData.username,
                email: formData.email,
                phone_number: formData.phone_number,
                dob: formData.dob,
                gender: formData.gender,
                farm_name: formData.farm_name,
                farm_size: formData.farm_size,
                crops_grown: formData.crops_grown,
                soil_type: formData.soil_type,
                irrigation_type: formData.irrigation_type,
                bank_name: formData.bank_name,
                upi_id: formData.upi_id,
                pan_number: formData.pan_number,
                dark_mode: formData.darkMode,
                interface_language: formData.language,
                notif_order: formData.notif_order,
                notif_whatsapp: formData.notif_whatsapp,
                notif_market: formData.notif_market
            };
            const response = await api.patch('accounts/profile/', payload);
            setUser(response.data);
            setIsEditing(false);
            toast.success('Enterprise profile updated successfully!');
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (!user) return <div className="ent-loading">Preparing your farm profile...</div>;

    const availableLanguages = [
        { code: 'en', label: 'English' },
        { code: 'hi', label: 'Hindi' },
        { code: 'ta', label: 'Tamil' },
        { code: 'te', label: 'Telugu' },
        { code: 'kn', label: 'Kannada' }
    ];

    return (
        <div className="profile-container animate-fade-in" style={{ background: '#f8fafc', minHeight: '100vh' }}>
            {/* 🎯 HEADER - Glassmorphic Branding */}
            <div className="profile-header-card">
                <div className="profile-avatar-wrapper">
                    <img
                        src="/assets/images/farmer_profile.png"
                        alt="Profile"
                        className="profile-avatar-large"
                        onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=" + user.username + "&background=1e293b&color=fff&size=80&rounded=12" }}
                    />
                    <div className="verification-badge">
                        <FaCheckCircle size={10} />
                    </div>
                </div>

                <div className="profile-header-info">
                    <div className="profile-role-tag">Elite Farmer Member</div>
                    <h1 className="profile-name">{user.username}</h1>
                    <p className="profile-meta">
                        <FaGlobe size={13} /> Sector: Punjab North • <FaCalendarAlt size={13} /> Digital Farm ID: #{String(user.id || '882').padStart(6, '0')}
                    </p>
                </div>

                <div className="profile-header-actions">
                    {!isEditing ? (
                        <button className="btn-premium-sm" onClick={() => setIsEditing(true)}>
                            <FaEdit size={14} /> Configure Profile
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn-premium-sm" style={{ background: '#22c55e' }} onClick={handleSave} disabled={saving}>
                                <FaSave size={14} /> {saving ? 'Applying...' : 'Apply Changes'}
                            </button>
                            <button className="btn-premium-outline-sm" onClick={() => setIsEditing(false)}>
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="profile-main-grid">

                {/* 📝 IDENTITY */}
                <div className="section-card" style={{ gridColumn: 'span 5' }}>
                    <div className="section-header">
                        <h2 className="section-title"><FaUser className="section-icon" /> Identity</h2>
                    </div>

                    <div className="data-fields-grid">
                        <div className="data-field">
                            <div className="field-content">
                                <span className="field-label">Legal Name</span>
                                {isEditing ? <input name="username" value={formData.username} onChange={handleChange} className="form-input" style={{ fontSize: '14px', padding: '4px 8px' }} /> : <span className="field-value">{formData.username}</span>}
                            </div>
                        </div>
                        <div className="data-field">
                            <div className="field-content">
                                <span className="field-label">Mobile</span>
                                {isEditing ? <input name="phone_number" value={formData.phone_number} onChange={handleChange} className="form-input" style={{ fontSize: '14px', padding: '4px 8px' }} /> : <span className="field-value">{formData.phone_number}</span>}
                            </div>
                        </div>
                        <div className="data-field">
                            <div className="field-content">
                                <span className="field-label">Email</span>
                                {isEditing ? <input name="email" value={formData.email} onChange={handleChange} className="form-input" style={{ fontSize: '14px', padding: '4px 8px' }} /> : <span className="field-value">{formData.email}</span>}
                            </div>
                        </div>
                        <div className="data-field">
                            <div className="field-content">
                                <span className="field-label">Birth</span>
                                {isEditing ? <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="form-input" style={{ fontSize: '14px', padding: '4px 8px' }} /> : <span className="field-value">{formData.dob || 'Not Set'}</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🌾 ASSETS */}
                <div className="section-card" style={{ gridColumn: 'span 7' }}>
                    <div className="section-header">
                        <h2 className="section-title"><FaLeaf className="section-icon" /> Farm Assets</h2>
                    </div>
                    <div className="data-fields-grid">
                        <div className="data-field">
                            <div className="field-content">
                                <span className="field-label">Entity Name</span>
                                {isEditing ? <input name="farm_name" value={formData.farm_name} onChange={handleChange} className="form-input" style={{ fontSize: '14px', padding: '4px 8px' }} /> : <span className="field-value">{formData.farm_name || 'Not Set'}</span>}
                            </div>
                        </div>
                        <div className="data-field">
                            <div className="field-content">
                                <span className="field-label">Holding Size (Acres)</span>
                                {isEditing ? <input type="number" step="0.1" name="farm_size" value={formData.farm_size} onChange={handleChange} className="form-input" style={{ fontSize: '14px', padding: '4px 8px' }} /> : <span className="field-value">{formData.farm_size ? `${formData.farm_size} Acres` : 'Not Set'}</span>}
                            </div>
                        </div>
                        <div className="data-field">
                            <div className="field-content">
                                <span className="field-label">Primary Produce</span>
                                {isEditing ? <input name="crops_grown" value={formData.crops_grown} onChange={handleChange} className="form-input" style={{ fontSize: '14px', padding: '4px 8px' }} placeholder="e.g. Rice, Wheat" /> : <span className="field-value">{formData.crops_grown || 'Not Set'}</span>}
                            </div>
                        </div>
                        <div className="data-field">
                            <div className="field-content">
                                <span className="field-label">Soil Profile</span>
                                {isEditing ? <input name="soil_type" value={formData.soil_type} onChange={handleChange} className="form-input" style={{ fontSize: '14px', padding: '4px 8px' }} /> : <span className="field-value">{formData.soil_type || 'Not Set'}</span>}
                            </div>
                        </div>
                        <div className="data-field">
                            <div className="field-content">
                                <span className="field-label">Irrigation</span>
                                {isEditing ? <input name="irrigation_type" value={formData.irrigation_type} onChange={handleChange} className="form-input" style={{ fontSize: '14px', padding: '4px 8px' }} /> : <span className="field-value">{formData.irrigation_type || 'Not Set'}</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🏦 FINTECH */}
                <div className="section-card" style={{ gridColumn: 'span 4' }}>
                    <div className="section-header">
                        <h2 className="section-title"><FaUniversity className="section-icon" /> Fintech</h2>
                    </div>
                    <div className="settings-list">
                        <div className="doc-item">
                            <div className="field-content" style={{ width: '100%' }}>
                                <span className="field-label">Primary Bank</span>
                                {isEditing ? <input name="bank_name" value={formData.bank_name} onChange={handleChange} className="form-input" style={{ fontSize: '14px', padding: '4px 8px', width: '100%' }} /> : <span className="field-value" style={{ fontSize: '11px' }}>{formData.bank_name || 'Not Set'}</span>}
                            </div>
                        </div>
                        <div className="doc-item">
                            <div className="field-content" style={{ width: '100%' }}>
                                <span className="field-label">UPI Interface</span>
                                {isEditing ? <input name="upi_id" value={formData.upi_id} onChange={handleChange} className="form-input" style={{ fontSize: '14px', padding: '4px 8px', width: '100%' }} /> : <span className="field-value" style={{ color: '#2E7D32', fontSize: '11px' }}>{formData.upi_id || 'Not Set'}</span>}
                            </div>
                        </div>
                        <div className="doc-item">
                            <div className="field-content" style={{ width: '100%' }}>
                                <span className="field-label">TIN/PAN</span>
                                {isEditing ? <input name="pan_number" value={formData.pan_number} onChange={handleChange} className="form-input" style={{ fontSize: '14px', padding: '4px 8px', width: '100%' }} /> : <span className="field-value" style={{ fontSize: '11px' }}>{formData.pan_number || 'Not Set'}</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🛡️ TRUST SCORE */}
                <div className="section-card" style={{ gridColumn: 'span 4' }}>
                    <div className="section-header">
                        <h2 className="section-title"><FaIdCard className="section-icon" /> Documents</h2>
                    </div>
                    <div className="document-grid">
                        <div className="doc-item">
                            <span className="doc-name">National ID</span>
                            <span className="status-indicator verified">Active</span>
                        </div>
                        <div className="doc-item">
                            <span className="doc-name">Title Deed</span>
                            <span className="status-indicator verified">Active</span>
                        </div>
                        <div className="doc-item">
                            <span className="doc-name">Passbook</span>
                            <span className="status-indicator verified">Active</span>
                        </div>
                    </div>
                </div>

                {/* 📊 PERFORMANCE */}
                <div className="section-card" style={{ gridColumn: 'span 4' }}>
                    <div className="section-header">
                        <h2 className="section-title"><FaChartLine className="section-icon" /> Metrics</h2>
                    </div>
                    <div className="stats-grid">
                        <div className="stat-box">
                            <span className="stat-number">12</span>
                            <span className="stat-label">Sales</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-number">03</span>
                            <span className="stat-label">Rents</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-number">₹45k</span>
                            <span className="stat-label">Volume</span>
                        </div>
                    </div>
                </div>

                {/* ⚙️ CONFIG */}
                <div className="section-card" style={{ gridColumn: 'span 6' }}>
                    <div className="section-header">
                        <h2 className="section-title"><FaCog className="section-icon" /> System Config</h2>
                    </div>
                    <div style={{ marginBottom: '0.75rem' }}>
                        <span className="field-label" style={{ display: 'block', marginBottom: '6px' }}>Interface Language</span>
                        <div className="lang-selector">
                            {availableLanguages.map(lang => (
                                <div
                                    key={lang.code}
                                    className={`lang-option ${language === lang.code ? 'active' : ''}`}
                                    onClick={() => changeLanguage(lang.code)}
                                >
                                    {lang.label}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="settings-list">
                        <div className="setting-item">
                            <span className="setting-label">Atmospheric Mode</span>
                            <div className={`toggle-switch ${formData.darkMode ? 'active' : ''}`} onClick={() => handleToggle('darkMode')}>
                                <div className="toggle-knob"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🔔 ALERTS */}
                <div className="section-card" style={{ gridColumn: 'span 6' }}>
                    <div className="section-header">
                        <h2 className="section-title"><FaBell className="section-icon" /> Alerts</h2>
                    </div>
                    <div className="settings-list" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                        <div className="setting-item">
                            <span className="setting-label">Push Stream</span>
                            <div className={`toggle-switch ${formData.notif_order ? 'active' : ''}`} onClick={() => handleToggle('notif_order')}><div className="toggle-knob"></div></div>
                        </div>
                        <div className="setting-item">
                            <span className="setting-label">WhatsApp Sync</span>
                            <div className={`toggle-switch ${formData.notif_whatsapp ? 'active' : ''}`} onClick={() => handleToggle('notif_whatsapp')}><div className="toggle-knob"></div></div>
                        </div>
                        <div className="setting-item">
                            <span className="setting-label">Market Pulse</span>
                            <div className={`toggle-switch ${formData.notif_market ? 'active' : ''}`} onClick={() => handleToggle('notif_market')}><div className="toggle-knob"></div></div>
                        </div>
                    </div>
                </div>

                {/* 🔒 CORE SECURITY */}
                <div className="section-card" style={{ gridColumn: 'span 12' }}>
                    <div className="section-header">
                        <h2 className="section-title"><FaLock className="section-icon" /> Security Protocol</h2>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <button className="btn-premium-outline-sm">Reset Credentials</button>
                        <button className="btn-premium-outline-sm">MFA Token</button>
                        <button className="btn-premium-outline-sm">Session Map</button>
                        <button
                            className="btn-danger-outline-sm"
                            style={{ marginLeft: 'auto' }}
                            onClick={logout}
                        >
                            <LuLogOut /> Terminate Session
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FarmerProfile;
