import React, { useState } from 'react';
import { FaSearchLocation, FaPhone, FaMapMarkerAlt, FaStar, FaRoute } from 'react-icons/fa';
import { MdLocationOn, MdCall } from 'react-icons/md';
import './FarmerPages.css';

const SearchSupplier = () => {
    const [searchLocation, setSearchLocation] = useState('');
    const [suppliers, setSuppliers] = useState([
        {
            id: 1,
            name: 'Green Valley Suppliers',
            distance: '2.5 km',
            rating: 4.5,
            phone: '+91 98765 43210',
            category: 'Seeds & Fertilizers',
            available: true
        },
        {
            id: 2,
            name: 'Agro Tech Supplies',
            distance: '5.8 km',
            rating: 4.8,
            phone: '+91 98765 43211',
            category: 'Equipment Rental',
            available: true
        },
        {
            id: 3,
            name: 'Farm Fresh Products',
            distance: '8.2 km',
            rating: 4.3,
            phone: '+91 98765 43212',
            category: 'Seeds & Manure',
            available: false
        }
    ]);

    const handleCall = (phone, supplierName) => {
        alert(`Calling ${supplierName} at ${phone}`);
    };

    return (
        <div className="farmer-content-container">
            <div className="farmer-page-header">
                <h1 className="farmer-page-title">
                    <FaSearchLocation style={{ color: '#43A047' }} />
                    Find Nearest Suppliers
                </h1>
                <p className="farmer-page-description">
                    Search and contact suppliers near your location
                </p>
            </div>

            <div className="search-section">
                <div className="search-box">
                    <FaMapMarkerAlt className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Enter your location or enable GPS"
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                    />
                    <button className="farmer-btn-primary">
                        <FaSearchLocation /> Search
                    </button>
                </div>
                <button className="location-btn">
                    <MdLocationOn /> Use Current Location
                </button>
            </div>

            <div className="suppliers-list">
                <h2 className="section-title">Nearby Suppliers</h2>
                {suppliers.map(supplier => (
                    <div key={supplier.id} className={`supplier-card ${!supplier.available ? 'unavailable' : ''}`}>
                        <div className="supplier-info">
                            <div className="supplier-header">
                                <h3>{supplier.name}</h3>
                                <span className={`status-badge ${supplier.available ? 'available' : 'unavailable'}`}>
                                    {supplier.available ? 'Available' : 'Unavailable'}
                                </span>
                            </div>
                            <p className="supplier-category">{supplier.category}</p>
                            <div className="supplier-details">
                                <div className="detail-item">
                                    <FaRoute className="detail-icon" />
                                    <span>{supplier.distance} away</span>
                                </div>
                                <div className="detail-item">
                                    <FaStar className="detail-icon star" />
                                    <span>{supplier.rating} Rating</span>
                                </div>
                                <div className="detail-item">
                                    <FaPhone className="detail-icon" />
                                    <span>{supplier.phone}</span>
                                </div>
                            </div>
                        </div>
                        <div className="supplier-actions">
                            <button 
                                className="call-btn"
                                onClick={() => handleCall(supplier.phone, supplier.name)}
                                disabled={!supplier.available}
                            >
                                <MdCall /> Call Now
                            </button>
                            <button className="view-btn">View Profile</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="info-banner">
                <p><strong>💡 Tip:</strong> If your preferred supplier is unavailable, we'll automatically show you the next nearest option!</p>
            </div>
        </div>
    );
};

export default SearchSupplier;
