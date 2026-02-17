import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import SupplierSidebar from '../../components/SupplierSidebar';
import '../SupplierPortal.css';
import { toast } from 'react-toastify';
import {
    FaUser, FaMapMarkerAlt, FaClock, FaUniversity, FaFileContract,
    FaTruck, FaBell, FaShieldAlt, FaTrash, FaCamera, FaSave,
    FaEdit, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaPhone,
    FaEnvelope, FaStar, FaBoxOpen, FaSeedling, FaTractor, FaPen, FaTimes, FaGlobe, FaCertificate, FaIdCard
} from 'react-icons/fa';

const SupplierProfile = () => {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState({});
    const [modalConfig, setModalConfig] = useState(null); // { type: 'basic', title: 'Edit Basic Info' }
    const [formData, setFormData] = useState({});

    // Fetch Profile Data
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await api.get('/suppliers/profiles/me/');
            setProfile(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            // toast.error('Failed to load profile data');
            setLoading(false);
        }
    };

    const handleOpenModal = (type, title) => {
        setFormData({ ...profile }); // Clone current profile to formData
        setModalConfig({ type, title });
    };

    const handleCloseModal = () => {
        setModalConfig(null);
        setFormData({});
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        setFormData(prev => ({
            ...prev,
            [name]: val
        }));
    };

    const handleFileChange = async (e) => {
        const { name, files } = e.target;
        if (files.length > 0) {
            const file = files[0];
            const formDataUpload = new FormData();
            formDataUpload.append(name, file);

            try {
                toast.info('Uploading document...');
                await api.patch('/suppliers/profiles/me/', formDataUpload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Document uploaded successfully');
                fetchProfile();
            } catch (error) {
                console.error('Upload failed:', error);
                toast.error('Failed to upload document');
            }
        }
    };

    const [saving, setSaving] = useState(false);

    const handleSaveChanges = async () => {
        try {
            setSaving(true);
            
            // Filter out file fields - they should only be uploaded via separate file upload handler
            const fileFields = ['id_proof', 'business_license_doc', 'gst_certificate', 
                               'shop_image', 'equipment_registration'];
            
            const dataToSend = { ...formData };
            fileFields.forEach(field => {
                // Remove file fields if they're URLs (strings) not actual File objects
                if (dataToSend[field] && typeof dataToSend[field] === 'string') {
                    delete dataToSend[field];
                }
            });
            
            await api.patch('/suppliers/profiles/me/', dataToSend);
            toast.success('Profile updated successfully');
            setProfile(formData);
            handleCloseModal();
        } catch (error) {
            console.error('Save failed:', error);
            const errorMsg = error.response?.data?.details 
                ? JSON.stringify(error.response.data.details) 
                : 'Failed to save changes';
            toast.error(errorMsg);
        } finally {
            setSaving(false);
        }
    };



    const calculateCompletion = () => {
        // Simple heuristic
        const fields = ['shop_name', 'owner_name', 'alternate_number', 'address_line_1', 'bank_account_holder', 'id_proof'];
        const filled = fields.filter(f => profile[f]).length;
        return Math.round((filled / fields.length) * 100);
    };

    // --- Modal Content Renderers ---
    const renderModalContent = () => {
        switch (modalConfig?.type) {
            case 'basic':
                return (
                    <div className="form-grid">
                        <div className="form-group"><label>Shop Name</label><input name="shop_name" value={formData.shop_name || ''} onChange={handleInputChange} className="form-control" /></div>
                        <div className="form-group"><label>Owner Name</label><input name="owner_name" value={formData.owner_name || ''} onChange={handleInputChange} className="form-control" /></div>
                        <div className="form-group"><label>Alternate Number</label><input name="alternate_number" value={formData.alternate_number || ''} onChange={handleInputChange} className="form-control" /></div>
                        <div className="form-group"><label>GST Number</label><input name="gst_number" value={formData.gst_number || ''} onChange={handleInputChange} className="form-control" /></div>
                        <div className="form-group"><label>Business License</label><input name="business_license" value={formData.business_license || ''} onChange={handleInputChange} className="form-control" /></div>
                        <div className="form-group"><label>Experience (Years)</label><input type="number" name="years_of_experience" value={formData.years_of_experience || ''} onChange={handleInputChange} className="form-control" /></div>
                        <div className="form-group full-width"><label>Description</label><textarea name="description" value={formData.description || ''} onChange={handleInputChange} className="form-control" rows="3" /></div>
                    </div>
                );
            case 'address':
                return (
                    <div className="form-grid">
                        <div className="form-group full-width"><label>Address Line 1</label><input name="address_line_1" value={formData.address_line_1 || ''} onChange={handleInputChange} className="form-control" /></div>
                        <div className="form-group full-width"><label>Address Line 2</label><input name="address_line_2" value={formData.address_line_2 || ''} onChange={handleInputChange} className="form-control" /></div>
                        <div className="form-group"><label>Village</label><input name="village" value={formData.village || ''} onChange={handleInputChange} className="form-control" /></div>
                        <div className="form-group"><label>Taluk</label><input name="taluk" value={formData.taluk || ''} onChange={handleInputChange} className="form-control" /></div>
                        <div className="form-group"><label>District</label><input name="district" value={formData.district || ''} onChange={handleInputChange} className="form-control" /></div>
                        <div className="form-group"><label>State</label><input name="state" value={formData.state || ''} onChange={handleInputChange} className="form-control" /></div>
                        <div className="form-group"><label>PIN Code</label><input name="pin_code" value={formData.pin_code || ''} onChange={handleInputChange} className="form-control" /></div>
                        <div className="form-group"><label>Landmark</label><input name="landmark" value={formData.landmark || ''} onChange={handleInputChange} className="form-control" /></div>
                        <div className="form-group full-width">
                            <button className="btn-secondary-supplier" type="button" onClick={() => {
                                navigator.geolocation.getCurrentPosition(pos => {
                                    // Round to 6 decimal places to fit database constraints (max_digits=9, decimal_places=6)
                                    const lat = Math.round(pos.coords.latitude * 1000000) / 1000000;
                                    const lon = Math.round(pos.coords.longitude * 1000000) / 1000000;
                                    setFormData(prev => ({ ...prev, latitude: lat, longitude: lon }));
                                    toast.success("Location detected!");
                                }, err => toast.error("Could not detect location"));
                            }}>
                                <FaMapMarkerAlt /> Auto-Detect GPS Location
                            </button>
                        </div>
                    </div>
                );
            case 'hours':
                return (
                    <div className="form-grid">
                        <div className="form-group"><label>Opening Time</label><input type="time" name="opening_time" value={formData.opening_time || ''} onChange={handleInputChange} className="form-control" /></div>
                        <div className="form-group"><label>Closing Time</label><input type="time" name="closing_time" value={formData.closing_time || ''} onChange={handleInputChange} className="form-control" /></div>
                        <div className="form-group full-width">
                            <label>Working Days</label>
                            <div className="checkbox-row" style={{ flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                    <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={(formData.working_days || '').includes(day)}
                                            onChange={(e) => {
                                                const currentDays = (formData.working_days || '').split(',').filter(d => d);
                                                const newDays = e.target.checked ? [...currentDays, day] : currentDays.filter(d => d !== day);
                                                setFormData(prev => ({ ...prev, working_days: newDays.join(',') }));
                                            }}
                                        />
                                        {day}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="form-group full-width checkbox-row">
                            <label><input type="checkbox" name="emergency_contact_available" checked={formData.emergency_contact_available || false} onChange={handleInputChange} /> Available for Emergency Contact</label>
                        </div>
                    </div>
                );
            case 'bank':
                return (
                    <div className="form-grid">
                        <div className="form-group"><label>Account Holder Name</label><input name="bank_account_holder" value={formData.bank_account_holder || ''} onChange={handleInputChange} className="form-control" /></div>
                        <div className="form-group"><label>Bank Name</label><input name="bank_name" value={formData.bank_name || ''} onChange={handleInputChange} className="form-control" /></div>
                        <div className="form-group"><label>Account Number</label><input type="password" name="account_number" value={formData.account_number || ''} onChange={handleInputChange} className="form-control" /></div>
                        <div className="form-group"><label>IFSC Code</label><input name="ifsc_code" value={formData.ifsc_code || ''} onChange={handleInputChange} className="form-control" /></div>
                        <div className="form-group"><label>UPI ID</label><input name="upi_id" value={formData.upi_id || ''} onChange={handleInputChange} className="form-control" /></div>
                        <div className="form-group"><label>PAN Number</label><input name="pan_number" value={formData.pan_number || ''} onChange={handleInputChange} className="form-control" /></div>
                    </div>
                );
            case 'services':
                return (
                    <div>
                        <h4>Service Categories</h4>
                        <div className="checkbox-grid mb-4">
                            <label className="toggle-item"><span>Seed Sales</span><input type="checkbox" name="enable_seeds" checked={formData.enable_seeds || false} onChange={handleInputChange} /></label>
                            <label className="toggle-item"><span>Fertilizer Sales</span><input type="checkbox" name="enable_fertilizers" checked={formData.enable_fertilizers || false} onChange={handleInputChange} /></label>
                            <label className="toggle-item"><span>Manure Sales</span><input type="checkbox" name="enable_manure" checked={formData.enable_manure || false} onChange={handleInputChange} /></label>
                            <label className="toggle-item"><span>Equipment Rental</span><input type="checkbox" name="enable_equipment_rental" checked={formData.enable_equipment_rental || false} onChange={handleInputChange} /></label>
                            <label className="toggle-item"><span>Agro Tools</span><input type="checkbox" name="enable_agro_tools" checked={formData.enable_agro_tools || false} onChange={handleInputChange} /></label>
                        </div>
                        <h4>Delivery Options</h4>
                        <div className="form-grid">
                            <div className="form-group checkbox-row full-width"><label><input type="checkbox" name="home_delivery_available" checked={formData.home_delivery_available || false} onChange={handleInputChange} /> Home Delivery Available</label></div>
                            <div className="form-group"><label>Delivery Radius (km)</label><input type="number" name="delivery_radius_km" value={formData.delivery_radius_km || 0} onChange={handleInputChange} className="form-control" /></div>
                            <div className="form-group"><label>Delivery Charges (₹)</label><input type="number" name="delivery_charges" value={formData.delivery_charges || 0} onChange={handleInputChange} className="form-control" /></div>
                            <div className="form-group"><label>Min Order Value (₹)</label><input type="number" name="min_order_value" value={formData.min_order_value || 0} onChange={handleInputChange} className="form-control" /></div>
                        </div>
                    </div>
                );
            case 'notifications':
                return (
                    <div className="checkbox-list">
                        <label className="toggle-item"><span>Order Alerts</span><input type="checkbox" name="notify_orders" checked={formData.notify_orders || false} onChange={handleInputChange} /></label>
                        <label className="toggle-item"><span>Rental Alerts</span><input type="checkbox" name="notify_rentals" checked={formData.notify_rentals || false} onChange={handleInputChange} /></label>
                        <label className="toggle-item"><span>Payment Notifications</span><input type="checkbox" name="notify_payments" checked={formData.notify_payments || false} onChange={handleInputChange} /></label>
                        <label className="toggle-item"><span>Low Stock Alerts</span><input type="checkbox" name="notify_low_stock" checked={formData.notify_low_stock || false} onChange={handleInputChange} /></label>
                    </div>
                );
            default: return null;
        }
    };

    const InfoRow = ({ label, value, icon }) => (
        <div className="info-row-v2">
            <span className="row-label">
                {icon && <span className="row-icon">{icon}</span>}
                {label}
            </span>
            <span className={`row-value ${!value ? 'empty-val' : ''}`}>
                {value || 'Not configured yet'}
            </span>
        </div>
    );

    if (loading) return (
        <div className="supplier-portal-layout">
            <SupplierSidebar />
            <div className="portal-main-content">
                <div className="skeleton-container animate-pulse">
                    <div className="skeleton-header"></div>
                    <div className="skeleton-grid">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="skeleton-card"></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="supplier-portal-layout">
            <SupplierSidebar />
            <div className="portal-main-content animate-fade-in">

                {/* 1. Header Section */}
                <div className="profile-header-card mb-4">
                    <div className="profile-cover"></div>
                    <div className="profile-identity">
                        <div className="profile-avatar-container">
                            <img
                                src={profile.shop_image || "https://ui-avatars.com/api/?name=" + (profile.shop_name || 'Store') + "&background=8B6F47&color=fff&size=150"}
                                alt="Shop Logo"
                                className="profile-avatar"
                            />
                            <label className="camera-icon" title="Change Logo">
                                <FaCamera />
                                <input type="file" name="shop_image" onChange={handleFileChange} hidden />
                            </label>
                        </div>
                        <div className="profile-info-header">
                            <h2>{profile.shop_name || "New Agri Store"}</h2>
                            <div className="owner-meta">
                                <span className="owner-label">Owner</span>
                                <span className="owner-val">{profile.owner_name || 'Setup Pending'}</span>
                                <span className="id-badge">ID: {profile.id || '---'}</span>
                            </div>
                            <div className="verification-badges">
                                <span className={`badge ${profile.verification_status === 'verified' ? 'badge-green' : 'badge-yellow'}`}>
                                    {profile.verification_status === 'verified' ? <FaCheckCircle /> : <FaInfoCircle />} {profile.verification_status || 'Pending'}
                                </span>
                                <span className="badge badge-purple"><FaStar /> {profile.rating} Rating</span>
                                <span className="badge badge-blue">{profile.subscription_plan || 'Free'} Plan</span>
                            </div>
                        </div>
                        <div className="profile-actions">
                            <div className="stat-card p-3">
                                <h4 className="m-0">Profile Completion</h4>
                                <div className="progress-bar-mini" style={{ width: '150px' }}>
                                    <div className="fill" style={{ width: `${calculateCompletion()}%` }}></div>
                                </div>
                                <div className="text-right small mt-1">{calculateCompletion()}%</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Masonry Grid Layout for Sections */}
                <div className="profile-grid-v2">

                    {/* Basic Info Card */}
                    <div className="profile-card-modern">
                        <div className="card-header-modern">
                            <h3><div className="icon-box blue"><FaUser /></div> Basic Information</h3>
                            <button className="btn-icon-soft" onClick={() => handleOpenModal('basic', 'Edit Basic Information')}><FaEdit /></button>
                        </div>
                        <div className="card-body-modern">
                            <InfoRow label="Shop Name" value={profile.shop_name} icon={<FaBoxOpen />} />
                            <InfoRow label="Owner Name" value={profile.owner_name} icon={<FaUser />} />
                            <InfoRow label="Mobile" value={user?.phone_number} icon={<FaPhone />} />
                            <InfoRow label="Alt Contact" value={profile.alternate_number} icon={<FaPhone />} />
                            <InfoRow label="Email" value={user?.email} icon={<FaEnvelope />} />
                            <InfoRow label="GST Number" value={profile.gst_number} icon={<FaCertificate />} />
                            <InfoRow label="Experience" value={profile.years_of_experience ? `${profile.years_of_experience} Years` : null} icon={<FaStar />} />
                        </div>
                    </div>

                    {/* Address Card */}
                    <div className="profile-card-modern">
                        <div className="card-header-modern">
                            <h3><div className="icon-box green"><FaMapMarkerAlt /></div> Business Address</h3>
                            <button className="btn-icon-soft" onClick={() => handleOpenModal('address', 'Edit Address')}><FaEdit /></button>
                        </div>
                        <div className="card-body-modern">
                            <InfoRow label="Address" value={profile.address_line_1 ? `${profile.address_line_1} ${profile.address_line_2 || ''}` : null} icon={<FaMapMarkerAlt />} />
                            <InfoRow label="Village" value={profile.village} icon={<FaGlobe />} />
                            <InfoRow label="District" value={profile.district} icon={<FaGlobe />} />
                            <InfoRow label="State" value={profile.state ? `${profile.state} - ${profile.pin_code || ''}` : null} icon={<FaGlobe />} />
                            <InfoRow label="Landmark" value={profile.landmark} icon={<FaMapMarkerAlt />} />
                            <InfoRow label="Coordinates" value={profile.latitude ? `${profile.latitude}, ${profile.longitude}` : null} icon={<FaMapMarkerAlt />} />
                        </div>
                    </div>

                    {/* Business Hours Card */}
                    <div className="profile-card-modern">
                        <div className="card-header-modern">
                            <h3><div className="icon-box orange"><FaClock /></div> Business Hours</h3>
                            <button className="btn-icon-soft" onClick={() => handleOpenModal('hours', 'Update Business Hours')}><FaEdit /></button>
                        </div>
                        <div className="card-body-modern">
                            <InfoRow label="Opening Time" value={profile.opening_time} icon={<FaClock />} />
                            <InfoRow label="Closing Time" value={profile.closing_time} icon={<FaClock />} />
                            <InfoRow label="Working Days" value={profile.working_days} icon={<FaClock />} />
                            <InfoRow label="Emergency" value={profile.emergency_contact_available ? "Available" : "Not Available"} icon={<FaPhone />} />
                        </div>
                    </div>

                    {/* Bank Details Card */}
                    <div className="profile-card-modern">
                        <div className="card-header-modern">
                            <h3><div className="icon-box purple"><FaUniversity /></div> Bank & Payment</h3>
                            <button className="btn-icon-soft" onClick={() => handleOpenModal('bank', 'Update Bank Details')}><FaEdit /></button>
                        </div>
                        <div className="card-body-modern">
                            <InfoRow label="Account Name" value={profile.bank_account_holder} icon={<FaUser />} />
                            <InfoRow label="Bank Name" value={profile.bank_name} icon={<FaUniversity />} />
                            <InfoRow label="Account No" value={profile.account_number ? "•••• •••• " + profile.account_number.slice(-4) : null} icon={<FaIdCard />} />
                            <InfoRow label="IFSC Code" value={profile.ifsc_code} icon={<FaIdCard />} />
                            <InfoRow label="UPI ID" value={profile.upi_id} icon={<FaPhone />} />
                            <div className={`mt-3 doc-status ${profile.is_bank_verified ? 'uploaded' : 'pending'}`}>
                                {profile.is_bank_verified ? <><FaCheckCircle /> Bank Verified</> : <><FaInfoCircle /> Verification Pending</>}
                            </div>
                        </div>
                    </div>

                    {/* Service Settings Card */}
                    <div className="profile-card-modern">
                        <div className="card-header-modern">
                            <h3><div className="icon-box blue"><FaTruck /></div> Services & Delivery</h3>
                            <button className="btn-icon-soft" onClick={() => handleOpenModal('services', 'Manage Services')}><FaEdit /></button>
                        </div>
                        <div className="card-body-modern">
                            <div className="flex flex-wrap gap-2 mb-4">
                                {profile.enable_seeds && <span className="badge badge-green">Seed Sales</span>}
                                {profile.enable_fertilizers && <span className="badge badge-green">Fertilizers</span>}
                                {profile.enable_manure && <span className="badge badge-green">Organic Manure</span>}
                                {profile.enable_equipment_rental && <span className="badge badge-blue">Equip Rentals</span>}
                                {profile.enable_agro_tools && <span className="badge badge-yellow">Agro Tools</span>}
                            </div>
                            <InfoRow label="Home Delivery" value={profile.home_delivery_available ? "Enabled" : "Disabled"} icon={<FaTruck />} />
                            <InfoRow label="Service Radius" value={profile.delivery_radius_km ? `${profile.delivery_radius_km} km` : null} icon={<FaMapMarkerAlt />} />
                            <InfoRow label="Standard Fee" value={profile.delivery_charges ? `₹${profile.delivery_charges}` : null} icon={<FaSave />} />
                        </div>
                    </div>

                    {/* Documents Card (Direct Uploads) */}
                    <div className="profile-card-modern">
                        <div className="card-header-modern">
                            <h3><div className="icon-box orange"><FaFileContract /></div> Verification Center</h3>
                        </div>
                        <div className="card-body-modern">
                            <div className="documents-grid-v2">
                                {[
                                    { key: 'id_proof', label: 'Identity Proof (Aadhar/Voter)', icon: <FaIdCard /> },
                                    { key: 'business_license_doc', label: 'Business License', icon: <FaFileContract /> },
                                    { key: 'gst_certificate', label: 'GST Certificate', icon: <FaCertificate /> },
                                ].map((doc) => (
                                    <div key={doc.key} className="doc-item-v2">
                                        <div className="doc-main">
                                            <div className="doc-icon-small">{doc.icon}</div>
                                            <div className="doc-meta">
                                                <span className="doc-name">{doc.label}</span>
                                                {profile[doc.key] ?
                                                    <span className="doc-tag verified">Verified</span> :
                                                    <span className="doc-tag missing">Missing</span>
                                                }
                                            </div>
                                        </div>
                                        <label className="doc-action-btn">
                                            {profile[doc.key] ? 'Replace' : 'Upload'}
                                            <input type="file" name={doc.key} onChange={handleFileChange} hidden />
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Notifications Card */}
                    <div className="profile-card-modern">
                        <div className="card-header-modern">
                            <h3><div className="icon-box purple"><FaBell /></div> Stay Updated</h3>
                            <button className="btn-icon-soft" onClick={() => handleOpenModal('notifications', 'Preferences')}><FaEdit /></button>
                        </div>
                        <div className="card-body-modern">
                            <InfoRow label="Order Alerts" value={profile.notify_orders ? "Instant SMS/App" : "Off"} icon={<FaBell />} />
                            <InfoRow label="Rental Inquiries" value={profile.notify_rentals ? "Enabled" : "Off"} icon={<FaBell />} />
                            <InfoRow label="Payment Logs" value={profile.notify_payments ? "Weekly Email" : "Off"} icon={<FaEnvelope />} />
                        </div>
                    </div>

                    {/* Security Card */}
                    <div className="profile-card-modern" style={{ borderColor: '#FCA5A5' }}>
                        <div className="card-header-modern" style={{ background: '#FEF2F2' }}>
                            <h3><div className="icon-box red"><FaShieldAlt /></div> Security Zone</h3>
                        </div>
                        <div className="card-body-modern">
                            <button className="btn-secondary-supplier w-100 mb-2">Change Password</button>
                            <button className="btn-secondary-supplier w-100 mb-2">Enable 2FA</button>
                            <button className="btn-secondary-supplier w-100" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                                <FaTrash /> Delete Account
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* MODERN MODAL COMPONENT */}
            {modalConfig && (
                <div className="modern-modal-overlay" onClick={handleCloseModal}>
                    <div className="modern-modal" onClick={e => e.stopPropagation()}>
                        <div className="modern-modal-header">
                            <h2>{modalConfig.title}</h2>
                            <button className="close-btn" onClick={handleCloseModal}><FaTimes /></button>
                        </div>
                        <div className="modern-modal-body">
                            {renderModalContent()}
                        </div>
                        <div className="modern-modal-footer">
                            <button className="btn-text cancel" onClick={handleCloseModal} disabled={saving}>Cancel</button>
                            <button className="btn-primary-supplier" onClick={handleSaveChanges} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierProfile;