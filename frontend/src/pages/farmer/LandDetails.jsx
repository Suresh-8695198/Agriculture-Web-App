import React, { useState, useEffect } from 'react';
import { FaMapMarkedAlt, FaSeedling, FaRuler, FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import { GiField, GiWheat } from 'react-icons/gi';
import { MdLocationOn } from 'react-icons/md';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import './FarmerPages.css';

const LandDetails = () => {
    const [lands, setLands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingLand, setEditingLand] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        area: '',
        location: '',
        soil_type: 'loamy',
        current_crop: '',
        irrigation_type: 'rainfed',
        notes: ''
    });

    // Fetch lands on component mount
    useEffect(() => {
        fetchLands();
    }, []);

    const fetchLands = async () => {
        try {
            setLoading(true);
            const response = await api.get('/farmers/lands/');
            // Ensure we always have an array
            const landsData = Array.isArray(response.data) ? response.data : (response.data.results || []);
            setLands(landsData);
        } catch (error) {
            console.error('Error fetching lands:', error);
            toast.error('Failed to load land details');
            setLands([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.name || !formData.area || !formData.location) {
            toast.error('Please fill in all required fields');
            return;
        }

        console.log('Submitting form data:', formData);

        try {
            if (editingLand) {
                // Update existing land
                await api.put(`/farmers/lands/${editingLand.id}/`, formData);
                toast.success('Land updated successfully');
            } else {
                // Create new land
                const response = await api.post('/farmers/lands/', formData);
                console.log('Create response:', response.data);
                toast.success('Land added successfully');
            }
            
            // Reset form and refresh list
            resetForm();
            fetchLands();
        } catch (error) {
            console.error('Error saving land:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            console.error('Full error:', JSON.stringify(error.response?.data, null, 2));
            
            // Handle specific error messages
            if (error.response?.data) {
                const errorData = error.response.data;
                if (typeof errorData === 'string') {
                    toast.error(errorData);
                } else if (errorData.detail) {
                    toast.error(errorData.detail);
                } else if (errorData.non_field_errors) {
                    toast.error(errorData.non_field_errors[0]);
                } else {
                    // Show first field error
                    const firstError = Object.values(errorData)[0];
                    toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
                }
            } else {
                toast.error('Failed to save land details');
            }
        }
    };

    const handleEdit = (land) => {
        setEditingLand(land);
        setFormData({
            name: land.name,
            area: land.area,
            location: land.location,
            soil_type: land.soil_type,
            current_crop: land.current_crop || '',
            irrigation_type: land.irrigation_type,
            notes: land.notes || ''
        });
        setShowAddForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this land?')) {
            return;
        }

        try {
            await api.delete(`/farmers/lands/${id}/`);
            toast.success('Land deleted successfully');
            fetchLands();
        } catch (error) {
            console.error('Error deleting land:', error);
            toast.error('Failed to delete land');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            area: '',
            location: '',
            soil_type: 'loamy',
            current_crop: '',
            irrigation_type: 'rainfed',
            notes: ''
        });
        setEditingLand(null);
        setShowAddForm(false);
    };

    if (loading) {
        return (
            <div className="farmer-content-container">
                <div className="farmer-page-header">
                    <h1 className="farmer-page-title">
                        <GiField style={{ color: '#43A047' }} />
                        Land Details
                    </h1>
                </div>
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading land details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="farmer-content-container">
            <div className="farmer-page-header">
                <h1 className="farmer-page-title">
                    <GiField style={{ color: '#43A047' }} />
                    Land Details
                </h1>
                <p className="farmer-page-description">
                    Manage your farm land information, soil types, and crop details
                </p>
            </div>

            <div className="action-bar">
                <button className="farmer-btn-primary" onClick={() => setShowAddForm(true)}>
                    <FaPlus /> Add New Land
                </button>
            </div>

            {lands.length === 0 ? (
                <div className="empty-state">
                    <GiField className="empty-icon" />
                    <h3>No Land Details Added</h3>
                    <p>Start by adding your first farm land details</p>
                    <button className="farmer-btn-primary" onClick={() => setShowAddForm(true)}>
                        <FaPlus /> Add Your First Land
                    </button>
                </div>
            ) : (
                <div className="farmer-grid">
                    {lands.map(land => (
                        <div key={land.id} className="land-card">
                            <div className="land-card-header">
                                <h3>{land.name}</h3>
                                <div className="land-actions">
                                    <button 
                                        className="icon-btn edit" 
                                        onClick={() => handleEdit(land)}
                                        title="Edit"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button 
                                        className="icon-btn delete" 
                                        onClick={() => handleDelete(land.id)}
                                        title="Delete"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                            <div className="land-info">
                                <div className="info-item">
                                    <FaRuler className="info-icon" />
                                    <span><strong>Area:</strong> {land.area} acres</span>
                                </div>
                                <div className="info-item">
                                    <MdLocationOn className="info-icon" />
                                    <span><strong>Location:</strong> {land.location}</span>
                                </div>
                                <div className="info-item">
                                    <GiField className="info-icon" />
                                    <span><strong>Soil Type:</strong> {land.soil_type_display || land.soil_type}</span>
                                </div>
                                {land.current_crop && (
                                    <div className="info-item">
                                        <FaSeedling className="info-icon" />
                                        <span><strong>Current Crop:</strong> {land.current_crop}</span>
                                    </div>
                                )}
                                <div className="info-item">
                                    <FaMapMarkedAlt className="info-icon" />
                                    <span><strong>Irrigation:</strong> {land.irrigation_type_display || land.irrigation_type}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showAddForm && (
                <div className="form-modal" onClick={(e) => e.target.className === 'form-modal' && resetForm()}>
                    <div className="form-card">
                        <div className="form-card-header">
                            <h2>{editingLand ? 'Edit Land' : 'Add New Land'}</h2>
                            <button className="close-btn" onClick={resetForm}>
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Land Name <span className="required">*</span></label>
                                <input 
                                    type="text" 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g., North Field" 
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Area (in acres) <span className="required">*</span></label>
                                <input 
                                    type="number" 
                                    name="area"
                                    value={formData.area}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 5" 
                                    step="0.01"
                                    min="0"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Location <span className="required">*</span></label>
                                <input 
                                    type="text" 
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="Village, District" 
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Soil Type <span className="required">*</span></label>
                                <select 
                                    name="soil_type"
                                    value={formData.soil_type}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="loamy">Loamy</option>
                                    <option value="clay">Clay</option>
                                    <option value="sandy">Sandy</option>
                                    <option value="silt">Silt</option>
                                    <option value="peaty">Peaty</option>
                                    <option value="chalky">Chalky</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Current Crop</label>
                                <input 
                                    type="text" 
                                    name="current_crop"
                                    value={formData.current_crop}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Rice, Wheat" 
                                />
                            </div>
                            <div className="form-group">
                                <label>Irrigation Type</label>
                                <select 
                                    name="irrigation_type"
                                    value={formData.irrigation_type}
                                    onChange={handleInputChange}
                                >
                                    <option value="canal">Canal</option>
                                    <option value="well">Well</option>
                                    <option value="borewell">Borewell</option>
                                    <option value="drip">Drip Irrigation</option>
                                    <option value="sprinkler">Sprinkler</option>
                                    <option value="rainfed">Rainfed</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Notes</label>
                                <textarea 
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    placeholder="Additional information about the land"
                                    rows="3"
                                />
                            </div>
                            <div className="form-actions">
                                <button 
                                    type="button" 
                                    className="farmer-btn-secondary" 
                                    onClick={resetForm}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="farmer-btn-primary">
                                    {editingLand ? 'Update Land' : 'Add Land'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandDetails;
