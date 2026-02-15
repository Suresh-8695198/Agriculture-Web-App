import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    FaStore, FaUser, FaPhone, FaEnvelope, FaFileAlt, FaMapMarkerAlt,
    FaIdCard, FaImage, FaSave, FaEdit, FaTimes, FaSeedling, FaIndustry,
    FaTractor
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import SupplierSidebar from '../../components/SupplierSidebar';
import '../SupplierPortal.css';

const SupplierProfile = () => {
    const { user, setUser } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        // Basic Details
        shop_name: '',
        owner_name: '',
        business_name: '',
        gst_number: '',
        license_number: '',
        description: '',

        // Contact - User fields
        phone_number: '',
        email: '',
        alternate_number: '',

        // Address - User field
        address: '',
        
        // Supplier Address
        village: '',
        district: '',
        state: '',
        pin_code: '',

        // Business Type
        business_types: []
    });
    const [documents, setDocuments] = useState({
        id_proof: null,
        business_license_doc: null,
        shop_image: null
    });

    const businessTypeOptions = [
        { value: 'seeds', label: 'Seeds', icon: <FaSeedling /> },
        { value: 'fertilizer', label: 'Fertilizer', icon: <FaIndustry /> },
        { value: 'manure', label: 'Manure', icon: <FaIndustry /> },
        { value: 'equipment_rental', label: 'Equipment Rental', icon: <FaTractor /> }
    ];

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('suppliers/profiles/my_profile/');
            setProfile(response.data);

            // Parse business_types string to array
            const businessTypesArray = response.data.business_types
                ? response.data.business_types.split(',').map(bt => bt.trim())
                : [];

            setFormData({
                shop_name: response.data.shop_name || '',
                owner_name: response.data.owner_name || '',
                business_name: response.data.business_name || '',
                gst_number: response.data.gst_number || '',
                license_number: response.data.license_number || '',
                description: response.data.description || '',
                phone_number: user?.phone_number || '',
                email: user?.email || '',
                address: user?.address || '',
                alternate_number: response.data.alternate_number || '',
                village: response.data.village || '',
                district: response.data.district || '',
                state: response.data.state || '',
                pin_code: response.data.pin_code || '',
                business_types: businessTypesArray
            });
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBusinessTypeToggle = (value) => {
        setFormData(prev => ({
            ...prev,
            business_types: prev.business_types.includes(value)
                ? prev.business_types.filter(bt => bt !== value)
                : [...prev.business_types, value]
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setDocuments(prev => ({ ...prev, [name]: files[0] }));
        }
    };

    const openEditModal = () => {
        // Reset form with current data when opening modal
        const businessTypesArray = profile?.business_types
            ? profile.business_types.split(',').map(bt => bt.trim())
            : [];

        setFormData({
            shop_name: profile?.shop_name || '',
            owner_name: profile?.owner_name || '',
            business_name: profile?.business_name || '',
            gst_number: profile?.gst_number || '',
            license_number: profile?.license_number || '',
            description: profile?.description || '',
            phone_number: user?.phone_number || '',
            email: user?.email || '',
            address: user?.address || '',
            alternate_number: profile?.alternate_number || '',
            village: profile?.village || '',
            district: profile?.district || '',
            state: profile?.state || '',
            pin_code: profile?.pin_code || '',
            business_types: businessTypesArray
        });
        setDocuments({ id_proof: null, business_license_doc: null, shop_image: null });
        setShowModal(true);
    };

    const handleCancel = () => {
        setShowModal(false);
        setDocuments({ id_proof: null, business_license_doc: null, shop_image: null });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Update supplier profile
            const profileFormData = new FormData();
            profileFormData.append('shop_name', formData.shop_name);
            profileFormData.append('owner_name', formData.owner_name);
            profileFormData.append('business_name', formData.business_name);
            profileFormData.append('gst_number', formData.gst_number);
            profileFormData.append('license_number', formData.license_number);
            profileFormData.append('description', formData.description);
            profileFormData.append('alternate_number', formData.alternate_number);
            profileFormData.append('village', formData.village);
            profileFormData.append('district', formData.district);
            profileFormData.append('state', formData.state);
            profileFormData.append('pin_code', formData.pin_code);
            profileFormData.append('business_types_list', JSON.stringify(formData.business_types));

            // Append documents if changed
            Object.keys(documents).forEach(key => {
                if (documents[key]) {
                    profileFormData.append(key, documents[key]);
                }
            });

            await api.patch('suppliers/profiles/update_profile/', profileFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Update user account details (email, phone, address)
            const userUpdateData = {
                phone_number: formData.phone_number,
                email: formData.email,
                address: formData.address
            };

            const userResponse = await api.patch('accounts/profile/', userUpdateData);
            setUser(userResponse.data);

            setShowModal(false);
            toast.success('Profile updated successfully!');
            await fetchProfile();
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="supplier-portal-layout">
                <SupplierSidebar />
                <div className="portal-main-content">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="supplier-portal-layout">
            <SupplierSidebar />

            <div className="portal-main-content">
                {/* Header */}
                <div className="portal-header">
                    <div>
                        <h1 className="portal-title">My Profile</h1>
                        <p className="portal-subtitle">Manage your business information and KYC details</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn-primary-supplier" onClick={openEditModal}>
                            <FaEdit /> Edit Profile
                        </button>
                    </div>
                </div>

                {/* Basic Details Section */}
                <div className="section-card">
                    <div className="section-header">
                        <h2><FaStore /> Basic Details</h2>
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label><FaStore /> Shop Name *</label>
                            <input
                                type="text"
                                value={profile?.shop_name || ''}
                                disabled
                                className="form-control"
                                placeholder="Shop name"
                            />
                        </div>

                        <div className="form-group">
                            <label><FaUser /> Owner Name *</label>
                            <input
                                type="text"
                                value={profile?.owner_name || ''}
                                disabled
                                className="form-control"
                                placeholder="Owner name"
                            />
                        </div>

                        <div className="form-group">
                            <label><FaStore /> Business Name *</label>
                            <input
                                type="text"
                                value={profile?.business_name || ''}
                                disabled
                                className="form-control"
                                placeholder="Business name"
                            />
                        </div>

                        <div className="form-group">
                            <label><FaPhone /> Phone Number</label>
                            <input
                                type="tel"
                                value={user?.phone_number || ''}
                                disabled
                                className="form-control"
                                placeholder="From user account"
                            />
                        </div>

                        <div className="form-group">
                            <label><FaPhone /> Alternate Number</label>
                            <input
                                type="tel"
                                value={profile?.alternate_number || ''}
                                disabled
                                className="form-control"
                                placeholder="Alternate number"
                            />
                        </div>

                        <div className="form-group">
                            <label><FaEnvelope /> Email</label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="form-control"
                                placeholder="From user account"
                            />
                        </div>

                        <div className="form-group">
                            <label><FaIdCard /> GST Number (Optional)</label>
                            <input
                                type="text"
                                value={profile?.gst_number || ''}
                                disabled
                                className="form-control"
                                placeholder="GST number"
                            />
                        </div>

                        <div className="form-group">
                            <label><FaIdCard /> License Number</label>
                            <input
                                type="text"
                                value={profile?.license_number || ''}
                                disabled
                                className="form-control"
                                placeholder="License number"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label><FaFileAlt /> Business Description</label>
                            <textarea
                                value={profile?.description || ''}
                                disabled
                                className="form-control"
                                rows="3"
                                placeholder="Business description..."
                            />
                        </div>
                    </div>
                </div>

                {/* Address Section */}
                <div className="section-card">
                    <div className="section-header">
                        <h2><FaMapMarkerAlt /> Address Details</h2>
                    </div>
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label><FaMapMarkerAlt /> Address</label>
                            <textarea
                                value={user?.address || ''}
                                disabled
                                className="form-control"
                                rows="2"
                                placeholder="From user account"
                            />
                        </div>

                        <div className="form-group">
                            <label>Village</label>
                            <input
                                type="text"
                                value={profile?.village || ''}
                                disabled
                                className="form-control"
                                placeholder="Village"
                            />
                        </div>

                        <div className="form-group">
                            <label>District</label>
                            <input
                                type="text"
                                value={profile?.district || ''}
                                disabled
                                className="form-control"
                                placeholder="District"
                            />
                        </div>

                        <div className="form-group">
                            <label>State</label>
                            <input
                                type="text"
                                value={profile?.state || ''}
                                disabled
                                className="form-control"
                                placeholder="State"
                            />
                        </div>

                        <div className="form-group">
                            <label>PIN Code</label>
                            <input
                                type="text"
                                value={profile?.pin_code || ''}
                                disabled
                                className="form-control"
                                placeholder="PIN code"
                                maxLength="6"
                            />
                        </div>
                    </div>

                    {/* Display full formatted address */}
                    {(formData.village || formData.district || formData.state || formData.pin_code) && (
                        <div className="location-display" style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#2c5f2d' }}>
                                <FaMapMarkerAlt size={18} />
                                <div>
                                    <strong style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Complete Location:</strong>
                                    <span style={{ fontSize: '15px' }}>
                                        {[formData.village, formData.district, formData.state, formData.pin_code].filter(Boolean).join(', ')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Business Type Section */}
                <div className="section-card">
                    <div className="section-header">
                        <h2><FaIndustry /> Business Type</h2>
                        <p>Your business categories</p>
                    </div>
                    <div className="business-type-grid">
                        {businessTypeOptions.map(option => {
                            const businessTypesArray = profile?.business_types 
                                ? profile.business_types.split(',').map(bt => bt.trim())
                                : [];
                            return (
                                <div
                                    key={option.value}
                                    className={`business-type-card ${businessTypesArray.includes(option.value) ? 'selected' : ''} disabled`}
                                >
                                    <div className="type-icon">{option.icon}</div>
                                    <span className="type-label">{option.label}</span>
                                    {businessTypesArray.includes(option.value) && (
                                        <div className="selected-badge">✓</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Documents Section */}
                <div className="section-card">
                    <div className="section-header">
                        <h2><FaIdCard /> Documents Upload</h2>
                        <p>Upload required business documents</p>
                    </div>
                    <div className="documents-grid">
                        <div className="document-upload-card">
                            <div className="upload-icon">
                                <FaIdCard />
                            </div>
                            <h3>ID Proof</h3>
                            <p className="upload-hint">
                                {profile?.id_proof ? 'Document uploaded' : 'No document uploaded'}
                            </p>
                        </div>

                        <div className="document-upload-card">
                            <div className="upload-icon">
                                <FaFileAlt />
                            </div>
                            <h3>Business License</h3>
                            <p className="upload-hint">
                                {profile?.business_license_doc ? 'Document uploaded' : 'No document uploaded'}
                            </p>
                        </div>

                        <div className="document-upload-card">
                            <div className="upload-icon">
                                <FaImage />
                            </div>
                            <h3>Shop Image</h3>
                            <p className="upload-hint">
                                {profile?.shop_image ? 'Document uploaded' : 'No document uploaded'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCancel}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2><FaEdit /> Edit Profile</h2>
                                <button className="modal-close-btn" onClick={handleCancel}>
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="modal-body">
                                {/* Account Information */}
                                <div className="modal-section">
                                    <h3><FaUser /> Account Information</h3>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label><FaEnvelope /> Email *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="form-control"
                                                placeholder="Enter email"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label><FaPhone /> Phone Number *</label>
                                            <input
                                                type="tel"
                                                name="phone_number"
                                                value={formData.phone_number}
                                                onChange={handleChange}
                                                className="form-control"
                                                placeholder="Enter phone number"
                                            />
                                        </div>
                                        <div className="form-group full-width">
                                            <label><FaMapMarkerAlt /> Address</label>
                                            <textarea
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                className="form-control"
                                                rows="2"
                                                placeholder="Enter complete address"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Business Details */}
                                <div className="modal-section">
                                    <h3><FaStore /> Business Details</h3>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label><FaStore /> Shop Name *</label>
                                            <input
                                                type="text"
                                                name="shop_name"
                                                value={formData.shop_name}
                                                onChange={handleChange}
                                                className="form-control"
                                                placeholder="Enter shop name"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label><FaUser /> Owner Name *</label>
                                            <input
                                                type="text"
                                                name="owner_name"
                                                value={formData.owner_name}
                                                onChange={handleChange}
                                                className="form-control"
                                                placeholder="Enter owner name"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label><FaStore /> Business Name *</label>
                                            <input
                                                type="text"
                                                name="business_name"
                                                value={formData.business_name}
                                                onChange={handleChange}
                                                className="form-control"
                                                placeholder="Enter business name"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label><FaPhone /> Alternate Number</label>
                                            <input
                                                type="tel"
                                                name="alternate_number"
                                                value={formData.alternate_number}
                                                onChange={handleChange}
                                                className="form-control"
                                                placeholder="Enter alternate number"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label><FaFileAlt /> GST Number</label>
                                            <input
                                                type="text"
                                                name="gst_number"
                                                value={formData.gst_number}
                                                onChange={handleChange}
                                                className="form-control"
                                                placeholder="Enter GST number"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label><FaFileAlt /> License Number</label>
                                            <input
                                                type="text"
                                                name="license_number"
                                                value={formData.license_number}
                                                onChange={handleChange}
                                                className="form-control"
                                                placeholder="Enter license number"
                                            />
                                        </div>
                                        <div className="form-group full-width">
                                            <label><FaFileAlt /> Business Description</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                className="form-control"
                                                rows="3"
                                                placeholder="Describe your business..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Location Details */}
                                <div className="modal-section">
                                    <h3><FaMapMarkerAlt /> Location Details</h3>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Village</label>
                                            <input
                                                type="text"
                                                name="village"
                                                value={formData.village}
                                                onChange={handleChange}
                                                className="form-control"
                                                placeholder="Enter village"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>District</label>
                                            <input
                                                type="text"
                                                name="district"
                                                value={formData.district}
                                                onChange={handleChange}
                                                className="form-control"
                                                placeholder="Enter district"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>State</label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleChange}
                                                className="form-control"
                                                placeholder="Enter state"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>PIN Code</label>
                                            <input
                                                type="text"
                                                name="pin_code"
                                                value={formData.pin_code}
                                                onChange={handleChange}
                                                className="form-control"
                                                placeholder="Enter PIN code"
                                                maxLength="6"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Business Type */}
                                <div className="modal-section">
                                    <h3><FaIndustry /> Business Type</h3>
                                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>Select all that apply</p>
                                    <div className="business-type-grid">
                                        {businessTypeOptions.map(option => (
                                            <div
                                                key={option.value}
                                                className={`business-type-card ${formData.business_types.includes(option.value) ? 'selected' : ''}`}
                                                onClick={() => handleBusinessTypeToggle(option.value)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="type-icon">{option.icon}</div>
                                                <span className="type-label">{option.label}</span>
                                                {formData.business_types.includes(option.value) && (
                                                    <div className="selected-badge">✓</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Documents Upload */}
                                <div className="modal-section">
                                    <h3><FaIdCard /> Documents Upload</h3>
                                    <div className="documents-grid">
                                        <div className="document-upload-card">
                                            <div className="upload-icon">
                                                <FaIdCard />
                                            </div>
                                            <h4>ID Proof</h4>
                                            <label className="upload-btn">
                                                <input
                                                    type="file"
                                                    name="id_proof"
                                                    onChange={handleFileChange}
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    style={{ display: 'none' }}
                                                />
                                                {documents.id_proof ? documents.id_proof.name : 'Choose File'}
                                            </label>
                                            {profile?.id_proof && !documents.id_proof && (
                                                <p style={{ fontSize: '12px', color: '#28a745', marginTop: '5px' }}>✓ Already uploaded</p>
                                            )}
                                        </div>

                                        <div className="document-upload-card">
                                            <div className="upload-icon">
                                                <FaFileAlt />
                                            </div>
                                            <h4>Business License</h4>
                                            <label className="upload-btn">
                                                <input
                                                    type="file"
                                                    name="business_license_doc"
                                                    onChange={handleFileChange}
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    style={{ display: 'none' }}
                                                />
                                                {documents.business_license_doc ? documents.business_license_doc.name : 'Choose File'}
                                            </label>
                                            {profile?.business_license_doc && !documents.business_license_doc && (
                                                <p style={{ fontSize: '12px', color: '#28a745', marginTop: '5px' }}>✓ Already uploaded</p>
                                            )}
                                        </div>

                                        <div className="document-upload-card">
                                            <div className="upload-icon">
                                                <FaImage />
                                            </div>
                                            <h4>Shop Image</h4>
                                            <label className="upload-btn">
                                                <input
                                                    type="file"
                                                    name="shop_image"
                                                    onChange={handleFileChange}
                                                    accept=".jpg,.jpeg,.png"
                                                    style={{ display: 'none' }}
                                                />
                                                {documents.shop_image ? documents.shop_image.name : 'Choose File'}
                                            </label>
                                            {profile?.shop_image && !documents.shop_image && (
                                                <p style={{ fontSize: '12px', color: '#28a745', marginTop: '5px' }}>✓ Already uploaded</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    className="btn-secondary-supplier"
                                    onClick={handleCancel}
                                    disabled={saving}
                                >
                                    <FaTimes /> Cancel
                                </button>
                                <button
                                    className="btn-success-supplier"
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    export default SupplierProfile;