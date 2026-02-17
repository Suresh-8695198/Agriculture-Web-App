import React, { useState } from 'react';
import { FaMapMarkedAlt, FaSeedling, FaRuler, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { GiField, GiWheat } from 'react-icons/gi';
import { MdLocationOn } from 'react-icons/md';
import './FarmerPages.css';

const LandDetails = () => {
    const [lands, setLands] = useState([
        {
            id: 1,
            name: 'North Field',
            area: '5 acres',
            location: 'Village Road, District A',
            soilType: 'Loamy',
            cropType: 'Rice',
            irrigation: 'Canal'
        }
    ]);
    const [showAddForm, setShowAddForm] = useState(false);

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
                <button className="farmer-btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
                    <FaPlus /> Add New Land
                </button>
            </div>

            <div className="farmer-grid">
                {lands.map(land => (
                    <div key={land.id} className="land-card">
                        <div className="land-card-header">
                            <h3>{land.name}</h3>
                            <div className="land-actions">
                                <button className="icon-btn edit"><FaEdit /></button>
                                <button className="icon-btn delete"><FaTrash /></button>
                            </div>
                        </div>
                        <div className="land-info">
                            <div className="info-item">
                                <FaRuler className="info-icon" />
                                <span><strong>Area:</strong> {land.area}</span>
                            </div>
                            <div className="info-item">
                                <MdLocationOn className="info-icon" />
                                <span><strong>Location:</strong> {land.location}</span>
                            </div>
                            <div className="info-item">
                                <GiField className="info-icon" />
                                <span><strong>Soil Type:</strong> {land.soilType}</span>
                            </div>
                            <div className="info-item">
                                <FaSeedling className="info-icon" />
                                <span><strong>Current Crop:</strong> {land.cropType}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showAddForm && (
                <div className="form-modal">
                    <div className="form-card">
                        <h2>Add New Land</h2>
                        <form>
                            <div className="form-group">
                                <label>Land Name</label>
                                <input type="text" placeholder="e.g., North Field" />
                            </div>
                            <div className="form-group">
                                <label>Area (in acres)</label>
                                <input type="number" placeholder="e.g., 5" />
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input type="text" placeholder="Village, District" />
                            </div>
                            <div className="form-group">
                                <label>Soil Type</label>
                                <select>
                                    <option>Loamy</option>
                                    <option>Clay</option>
                                    <option>Sandy</option>
                                    <option>Silt</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Crop Type</label>
                                <input type="text" placeholder="e.g., Rice, Wheat" />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="farmer-btn-secondary" onClick={() => setShowAddForm(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="farmer-btn-primary">
                                    Add Land
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
