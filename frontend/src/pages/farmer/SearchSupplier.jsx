import React, { useState, useEffect } from 'react';
import { FaSearchLocation, FaPhone, FaMapMarkerAlt, FaStar, FaRoute, FaTimes } from 'react-icons/fa';
import { MdLocationOn, MdCall } from 'react-icons/md';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import './FarmerPages.css';

const SearchSupplier = () => {
    const [searchLocation, setSearchLocation] = useState('');
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [searchRadius, setSearchRadius] = useState(50); // Default 50 km
    const [selectedBusinessType, setSelectedBusinessType] = useState('all');

    // Load suppliers on component mount
    useEffect(() => {
        loadSuppliers();
    }, []);

    const loadSuppliers = async (lat = null, lon = null) => {
        try {
            setLoading(true);
            let url = '/suppliers/profiles/search_nearby/';
            const params = new URLSearchParams();
            
            if (lat && lon) {
                params.append('latitude', lat);
                params.append('longitude', lon);
                params.append('max_distance', searchRadius);
            }
            
            if (selectedBusinessType && selectedBusinessType !== 'all') {
                params.append('business_type', selectedBusinessType);
            }
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            
            const response = await api.get(url);
            setSuppliers(response.data);
        } catch (error) {
            console.error('Error loading suppliers:', error);
            toast.error('Failed to load suppliers');
            setSuppliers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        toast.info('Getting your location...');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ latitude, longitude });
                loadSuppliers(latitude, longitude);
                toast.success('Location found! Searching nearby suppliers...');
            },
            (error) => {
                console.error('Error getting location:', error);
                toast.error('Unable to get your location. Please check your browser settings.');
            }
        );
    };

    const handleSearch = () => {
        if (userLocation) {
            loadSuppliers(userLocation.latitude, userLocation.longitude);
        } else {
            loadSuppliers();
        }
    };

    const handleCall = (phone, supplierName) => {
        if (phone) {
            window.location.href = `tel:${phone}`;
            toast.success(`Calling ${supplierName}...`);
        } else {
            toast.error('Phone number not available');
        }
    };

    const formatDistance = (distance) => {
        if (!distance) return 'Distance unknown';
        if (distance < 1) {
            return `${(distance * 1000).toFixed(0)} m away`;
        }
        return `${distance.toFixed(1)} km away`;
    };

    const getBusinessTypeBadge = (businessTypes) => {
        if (!businessTypes) return 'General';
        const types = businessTypes.split(',').map(t => t.trim());
        return types[0] || 'General';
    };

    if (loading) {
        return (
            <div className="farmer-content-container">
                <div className="farmer-page-header">
                    <h1 className="farmer-page-title">
                        <FaSearchLocation style={{ color: '#43A047' }} />
                        Find Nearest Suppliers
                    </h1>
                </div>
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading suppliers...</p>
                </div>
            </div>
        );
    }

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
                <div className="search-filters">
                    <div className="filter-group">
                        <label>Business Type</label>
                        <select 
                            value={selectedBusinessType}
                            onChange={(e) => {
                                setSelectedBusinessType(e.target.value);
                                if (userLocation) {
                                    loadSuppliers(userLocation.latitude, userLocation.longitude);
                                } else {
                                    loadSuppliers();
                                }
                            }}
                            className="filter-select"
                        >
                            <option value="all">All Types</option>
                            <option value="seeds">Seeds</option>
                            <option value="fertilizer">Fertilizer</option>
                            <option value="manure">Manure</option>
                            <option value="equipment_rental">Equipment Rental</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Search Radius</label>
                        <select 
                            value={searchRadius}
                            onChange={(e) => {
                                setSearchRadius(Number(e.target.value));
                                if (userLocation) {
                                    loadSuppliers(userLocation.latitude, userLocation.longitude);
                                }
                            }}
                            className="filter-select"
                        >
                            <option value="10">10 km</option>
                            <option value="25">25 km</option>
                            <option value="50">50 km</option>
                            <option value="100">100 km</option>
                        </select>
                    </div>
                </div>
                
                <div className="search-actions">
                    <button 
                        className="location-btn"
                        onClick={handleUseCurrentLocation}
                    >
                        <MdLocationOn /> Use Current Location
                    </button>
                    <button 
                        className="farmer-btn-primary"
                        onClick={handleSearch}
                    >
                        <FaSearchLocation /> Search
                    </button>
                </div>
            </div>

            {suppliers.length === 0 ? (
                <div className="empty-state">
                    <FaSearchLocation className="empty-icon" />
                    <h3>No Suppliers Found</h3>
                    <p>Try adjusting your search filters or increasing the search radius</p>
                </div>
            ) : (
                <>
                    <div className="suppliers-list">
                        <h2 className="section-title">
                            {userLocation ? 'Nearby Suppliers' : 'All Suppliers'} ({suppliers.length})
                        </h2>
                        {suppliers.map(supplier => (
                            <div key={supplier.id} className={`supplier-card ${!supplier.is_active ? 'unavailable' : ''}`}>
                                <div className="supplier-info">
                                    <div className="supplier-header">
                                        <div>
                                            <h3>{supplier.business_name || supplier.shop_name || 'Unnamed Business'}</h3>
                                            <p className="supplier-owner">{supplier.owner_name}</p>
                                        </div>
                                        <span className={`status-badge ${supplier.is_active ? 'available' : 'unavailable'}`}>
                                            {supplier.is_active ? 'Available' : 'Unavailable'}
                                        </span>
                                    </div>
                                    <p className="supplier-category">
                                        {getBusinessTypeBadge(supplier.business_types)}
                                    </p>
                                    <div className="supplier-details">
                                        {supplier.distance_km && (
                                            <div className="detail-item">
                                                <FaRoute className="detail-icon" />
                                                <span>{formatDistance(supplier.distance_km)}</span>
                                            </div>
                                        )}
                                        <div className="detail-item">
                                            <FaStar className="detail-icon star" />
                                            <span>{supplier.rating || '0.0'} Rating</span>
                                        </div>
                                        {supplier.user?.phone_number && (
                                            <div className="detail-item">
                                                <FaPhone className="detail-icon" />
                                                <span>{supplier.user.phone_number}</span>
                                            </div>
                                        )}
                                        {supplier.full_address && (
                                            <div className="detail-item">
                                                <FaMapMarkerAlt className="detail-icon" />
                                                <span>{supplier.full_address}</span>
                                            </div>
                                        )}
                                    </div>
                                    {supplier.description && (
                                        <p className="supplier-description">{supplier.description}</p>
                                    )}
                                </div>
                                <div className="supplier-actions">
                                    <button 
                                        className="call-btn"
                                        onClick={() => handleCall(supplier.user?.phone_number, supplier.business_name)}
                                        disabled={!supplier.is_active || !supplier.user?.phone_number}
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
                </>
            )}
        </div>
    );
};

export default SearchSupplier;
