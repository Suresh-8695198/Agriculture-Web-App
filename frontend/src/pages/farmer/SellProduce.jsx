import React, { useState } from 'react';
import { FaLeaf, FaPlus, FaEdit } from 'react-icons/fa';
import { GiWheat, GiTomato, GiCorn } from 'react-icons/gi';
import { MdShoppingBasket } from 'react-icons/md';
import './FarmerPages.css';

const SellProduce = () => {
    const [listings, setListings] = useState([
        {
            id: 1,
            name: 'Paddy Rice (Unhusked)',
            quantity: 500,
            unit: 'kg',
            pricePerUnit: 25,
            image: '🌾',
            status: 'active'
        },
        {
            id: 2,
            name: 'Fresh Tomatoes',
            quantity: 200,
            unit: 'kg',
            pricePerUnit: 40,
            image: '🍅',
            status: 'active'
        }
    ]);
    const [showAddForm, setShowAddForm] = useState(false);

    const produceTypes = [
        { value: 'paddy', label: 'Paddy/Unhusked Rice', icon: '🌾' },
        { value: 'wheat', label: 'Wheat', icon: '🌾' },
        { value: 'tomato', label: 'Tomatoes', icon: '🍅' },
        { value: 'potato', label: 'Potatoes', icon: '🥔' },
        { value: 'onion', label: 'Onions', icon: '🧅' },
        { value: 'corn', label: 'Corn', icon: '🌽' },
        { value: 'banana', label: 'Bananas', icon: '🍌' },
        { value: 'mango', label: 'Mangoes', icon: '🥭' }
    ];

    return (
        <div className="farmer-content-container">
            <div className="farmer-page-header">
                <h1 className="farmer-page-title">
                    <MdShoppingBasket style={{ color: '#43A047' }} />
                    Sell Your Produce
                </h1>
                <p className="farmer-page-description">
                    List your crops, vegetables, and fruits for sale
                </p>
            </div>

            <div className="action-bar">
                <button className="farmer-btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
                    <FaPlus /> Add New Listing
                </button>
            </div>

            <div className="listings-section">
                <h2 className="section-title">Your Active Listings</h2>
                <div className="listings-grid">
                    {listings.map(item => (
                        <div key={item.id} className="listing-card">
                            <div className="listing-header">
                                <span className="listing-image">{item.image}</span>
                                <span className={`status-badge ${item.status}`}>{item.status}</span>
                            </div>
                            <div className="listing-info">
                                <h3>{item.name}</h3>
                                <div className="listing-details">
                                    <div className="detail-row">
                                        <span>Quantity:</span>
                                        <strong>{item.quantity} {item.unit}</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>Price per {item.unit}:</span>
                                        <strong>₹{item.pricePerUnit}</strong>
                                    </div>
                                    <div className="detail-row total-value">
                                        <span>Total Value:</span>
                                        <strong>₹{item.quantity * item.pricePerUnit}</strong>
                                    </div>
                                </div>
                            </div>
                            <div className="listing-actions">
                                <button className="edit-listing-btn"><FaEdit /> Edit</button>
                                <button className="view-orders-btn">View Orders</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showAddForm && (
                <div className="form-modal">
                    <div className="form-card">
                        <h2>Add New Produce Listing</h2>
                        <form>
                            <div className="form-group">
                                <label>Produce Type</label>
                                <select>
                                    <option value="">Select produce type</option>
                                    {produceTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.icon} {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Quantity</label>
                                <div className="input-with-unit">
                                    <input type="number" placeholder="e.g., 500" />
                                    <select>
                                        <option>kg</option>
                                        <option>quintal</option>
                                        <option>ton</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Price per Unit (₹)</label>
                                <input type="number" placeholder="e.g., 25" />
                            </div>
                            <div className="form-group">
                                <label>Quality Grade</label>
                                <select>
                                    <option>A+ (Premium)</option>
                                    <option>A (Good)</option>
                                    <option>B (Standard)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Description (Optional)</label>
                                <textarea rows="3" placeholder="Add details about your produce..."></textarea>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="farmer-btn-secondary" onClick={() => setShowAddForm(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="farmer-btn-primary">
                                    Publish Listing
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="info-banner">
                <p><strong>📊 Market Tips:</strong> Current market price for paddy rice is ₹22-28/kg. List at competitive prices for faster sales!</p>
            </div>
        </div>
    );
};

export default SellProduce;
