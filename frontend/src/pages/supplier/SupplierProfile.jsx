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
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
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
        
        // Contact
        alternate_number: '',
        
        // Address
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

    const handleSave = async () => {
        setSaving(true);
        try {
            const formDataToSend = new FormData();
            
            // Append text fields
            Object.keys(formData).forEach(key => {
                if (key === 'business_types') {
                    formDataToSend.append('business_types_list', JSON.stringify(formData.business_types));
                } else {
                    formDataToSend.append(key, formData[key]);
                }
            });
            
            // Append documents if changed
            Object.keys(documents).forEach(key => {
                if (documents[key]) {
                    formDataToSend.append(key, documents[key]);
                }
            });

            const response = await api.patch('suppliers/profiles/update_profile/', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setProfile(response.data);
            setIsEditing(false);
            toast.success('Profile updated successfully!');
            await fetchProfile();
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error('Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        fetchProfile();
        setIsEditing(false);
        setDocuments({ id_proof: null, business_license_doc: null, shop_image: null });
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
                        {!isEditing ? (
                            <button className="btn-primary-supplier" onClick={() => setIsEditing(true)}>
                                <FaEdit /> Edit Profile
                            </button>
                        ) : (
                            <div className="btn-group">
                                <button 
                                    className="btn-success-supplier" 
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button 
                                    className="btn-secondary-supplier" 
                                    onClick={handleCancel}
                                    disabled={saving}
                                >
                                    <FaTimes /> Cancel
                                </button>
                            </div>
                        )}
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
                                name="shop_name"
                                value={formData.shop_name}
                                onChange={handleChange}
                                disabled={!isEditing}
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
                                disabled={!isEditing}
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
                                disabled={!isEditing}
                                className="form-control"
                                placeholder="Enter business name"
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
                                name="alternate_number"
                                value={formData.alternate_number}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="form-control"
                                placeholder="Enter alternate number"
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
                            <label><FaFileAlt /> GST Number</label>
                            <input
                                type="text"
                                name="gst_number"
                                value={formData.gst_number}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="form-control"
                                placeholder="Enter GST number (optional)"
                            />
                        </div>

                        <div className="form-group">
                            <label><FaFileAlt /> License Number</label>
                            <input
                                type="text"
                                name="license_number"
                                value={formData.license_number}
                                onChange={handleChange}
                                disabled={!isEditing}
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
                                disabled={!isEditing}
                                className="form-control"
                                rows="3"
                                placeholder="Describe your business..."
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
                            <label><FaMapMarkerAlt /> Shop Address</label>
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
                                name="village"
                                value={formData.village}
                                onChange={handleChange}
                                disabled={!isEditing}
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
                                disabled={!isEditing}
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
                                disabled={!isEditing}
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
                                disabled={!isEditing}
                                className="form-control"
                                placeholder="Enter PIN code"
                                maxLength="6"
                            />
                        </div>

                        <div className="form-group">
                            <label>GPS Latitude</label>
                            <input
                                type="text"
                                value={user?.latitude || 'Not captured'}
                                disabled
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label>GPS Longitude</label>
                            <input
                                type="text"
                                value={user?.longitude || 'Not captured'}
                                disabled
                                className="form-control"
                            />
                        </div>
                    </div>
                </div>

                {/* Business Type Section */}
                <div className="section-card">
                    <div className="section-header">
                        <h2><FaIndustry /> Business Type</h2>
                        <p>Select all that apply</p>
                    </div>
                    <div className="business-type-grid">
                        {businessTypeOptions.map(option => (
                            <div
                                key={option.value}
                                className={`business-type-card ${
                                    formData.business_types.includes(option.value) ? 'selected' : ''
                                } ${!isEditing ? 'disabled' : ''}`}
                                onClick={() => isEditing && handleBusinessTypeToggle(option.value)}
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
                            {isEditing && (
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
                            )}
                        </div>

                        <div className="document-upload-card">
                            <div className="upload-icon">
                                <FaFileAlt />
                            </div>
                            <h3>Business License</h3>
                            <p className="upload-hint">
                                {profile?.business_license_doc ? 'Document uploaded' : 'No document uploaded'}
                            </p>
                            {isEditing && (
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
                            )}
                        </div>

                        <div className="document-upload-card">
                            <div className="upload-icon">
                                <FaImage />
                            </div>
                            <h3>Shop Image</h3>
                            <p className="upload-hint">
                                {profile?.shop_image ? 'Image uploaded' : 'No image uploaded'}
                            </p>
                            {isEditing && (
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
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupplierProfile;
