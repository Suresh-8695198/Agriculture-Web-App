import React, { useState, useEffect, useMemo } from 'react';
import { FaSearchLocation, FaPhone, FaMapMarkerAlt, FaStar, FaRoute, FaTimes, FaFilter, FaSearch, FaStore, FaMapPin, FaBuilding, FaClock, FaTruck, FaCheckCircle, FaIdCard } from 'react-icons/fa';
import { MdLocationOn, MdCall, MdMyLocation, MdBusinessCenter, MdVerified, MdEmail } from 'react-icons/md';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import './FarmerPages.css';

const SearchSupplier = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [searchRadius, setSearchRadius] = useState(50); // Default 50 km
    const [selectedBusinessType, setSelectedBusinessType] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('distance'); // distance, rating, name
    const [selectedSupplier, setSelectedSupplier] = useState(null); // For modal

    // Load suppliers on component mount
    useEffect(() => {
        loadSuppliers();
    }, []);

    // Automatically reload when filters change
    useEffect(() => {
        if (userLocation) {
            loadSuppliers(userLocation.latitude, userLocation.longitude);
        }
    }, [searchRadius, selectedBusinessType]);

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
            // Sort by distance (nearest first) by default
            const sortedSuppliers = response.data.sort((a, b) => {
                if (a.distance_km && b.distance_km) {
                    return a.distance_km - b.distance_km;
                }
                return 0;
            });
            setSuppliers(sortedSuppliers);
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

        toast.info('📍 Getting your location...', { autoClose: 2000 });
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ latitude, longitude });
                loadSuppliers(latitude, longitude);
                toast.success('✓ Location detected! Finding nearest suppliers...', { autoClose: 2000 });
            },
            (error) => {
                console.error('Error getting location:', error);
                toast.error('Unable to get your location. Please enable location access.');
            },
            { 
                enableHighAccuracy: true, 
                timeout: 10000, 
                maximumAge: 0 
            }
        );
    };

    const handleClearLocation = () => {
        setUserLocation(null);
        loadSuppliers();
        toast.info('Location cleared. Showing all suppliers.');
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
            toast.success(`📞 Calling ${supplierName}...`);
        } else {
            toast.error('Phone number not available');
        }
    };

    const handleViewProfile = (supplier) => {
        setSelectedSupplier(supplier);
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
    };

    const handleCloseModal = () => {
        setSelectedSupplier(null);
        // Re-enable body scroll
        document.body.style.overflow = 'unset';
    };

    // Filter and sort suppliers based on search query and sort option
    const filteredAndSortedSuppliers = useMemo(() => {
        let filtered = [...suppliers];

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(supplier => {
                const businessName = (supplier.business_name || supplier.shop_name || '').toLowerCase();
                const ownerName = (supplier.owner_name || '').toLowerCase();
                const address = (supplier.full_address || '').toLowerCase();
                const businessTypes = (supplier.business_types || '').toLowerCase();
                
                return businessName.includes(query) || 
                       ownerName.includes(query) || 
                       address.includes(query) ||
                       businessTypes.includes(query);
            });
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch(sortBy) {
                case 'distance':
                    if (a.distance_km && b.distance_km) {
                        return a.distance_km - b.distance_km;
                    }
                    return 0;
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                case 'name':
                    const nameA = (a.business_name || a.shop_name || '').toLowerCase();
                    const nameB = (b.business_name || b.shop_name || '').toLowerCase();
                    return nameA.localeCompare(nameB);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [suppliers, searchQuery, sortBy]);

    const formatDistance = (distance) => {
        if (!distance) return 'Distance unknown';
        if (distance < 1) {
            return `${(distance * 1000).toFixed(0)} m`;
        }
        return `${distance.toFixed(1)} km`;
    };

    const getBusinessTypeBadge = (businessTypes) => {
        if (!businessTypes) return 'General';
        const types = businessTypes.split(',').map(t => t.trim());
        return types[0] || 'General';
    };

    const getBusinessTypeColor = (businessType) => {
        const type = (businessType || '').toLowerCase();
        if (type.includes('seed')) return '#FF6B6B';
        if (type.includes('fertilizer')) return '#4ECDC4';
        if (type.includes('manure')) return '#95E1D3';
        if (type.includes('equipment')) return '#FFA07A';
        return '#A8DADC';
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
                    <p>Discovering suppliers for you...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="farmer-content-container search-supplier-container">
            {/* Header Section */}
            <div className="farmer-page-header modern-header">
                <div className="header-content">
                    <h1 className="farmer-page-title">
                        <FaSearchLocation className="header-icon" />
                        Find Nearest Suppliers
                    </h1>
                    <p className="farmer-page-description">
                        Discover and connect with trusted suppliers in your area
                    </p>
                </div>
                {userLocation && (
                    <div className="location-badge">
                        <MdMyLocation className="pulse-icon" />
                        <span>Using your location</span>
                        <button className="clear-location" onClick={handleClearLocation}>
                            <FaTimes />
                        </button>
                    </div>
                )}
            </div>

            {/* Search and Filter Bar */}
            <div className="search-filter-bar">
                <div className="search-input-wrapper">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by shop name, location, or business type..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="modern-search-input"
                    />
                    {searchQuery && (
                        <button 
                            className="clear-search"
                            onClick={() => setSearchQuery('')}
                        >
                            <FaTimes />
                        </button>
                    )}
                </div>
                
                <button 
                    className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <FaFilter /> Filters
                </button>

                <button
                    className="location-btn modern-location-btn"
                    onClick={handleUseCurrentLocation}
                    disabled={!!userLocation}
                >
                    <MdMyLocation /> {userLocation ? 'Location Active' : 'Use My Location'}
                </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="filters-panel">
                    <div className="filter-group-modern">
                        <label className="filter-label">
                            <MdBusinessCenter className="filter-icon" />
                            Business Type
                        </label>
                        <select
                            value={selectedBusinessType}
                            onChange={(e) => setSelectedBusinessType(e.target.value)}
                            className="filter-select-modern"
                        >
                            <option value="all">All Types</option>
                            <option value="seeds">🌱 Seeds</option>
                            <option value="fertilizer">🧪 Fertilizer</option>
                            <option value="manure">🌿 Manure</option>
                            <option value="equipment_rental">🚜 Equipment Rental</option>
                        </select>
                    </div>

                    <div className="filter-group-modern">
                        <label className="filter-label">
                            <FaRoute className="filter-icon" />
                            Search Radius
                        </label>
                        <div className="radius-selector">
                            {[10, 25, 50, 100].map((radius) => (
                                <button
                                    key={radius}
                                    className={`radius-btn ${searchRadius === radius ? 'active' : ''}`}
                                    onClick={() => setSearchRadius(radius)}
                                    disabled={!userLocation}
                                >
                                    {radius} km
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="filter-group-modern">
                        <label className="filter-label">
                            <FaStar className="filter-icon" />
                            Sort By
                        </label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="filter-select-modern"
                        >
                            <option value="distance">Distance (Nearest First)</option>
                            <option value="rating">Rating (Highest First)</option>
                            <option value="name">Name (A-Z)</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Results Count and Info */}
            <div className="results-info-bar">
                <div className="results-count">
                    <FaStore /> 
                    <span>
                        <strong>{filteredAndSortedSuppliers.length}</strong> supplier{filteredAndSortedSuppliers.length !== 1 ? 's' : ''} found
                        {userLocation && ` within ${searchRadius} km`}
                    </span>
                </div>
                {searchQuery && (
                    <div className="search-info">
                        Searching for: <strong>{searchQuery}</strong>
                    </div>
                )}
            </div>

            {/* Suppliers Grid */}
            {filteredAndSortedSuppliers.length === 0 ? (
                <div className="empty-state-modern">
                    <div className="empty-icon-wrapper">
                        <FaSearchLocation className="empty-icon" />
                    </div>
                    <h3>No Suppliers Found</h3>
                    <p>
                        {searchQuery 
                            ? `No suppliers match "${searchQuery}". Try different keywords.`
                            : userLocation 
                                ? `No suppliers found within ${searchRadius} km. Try increasing the search radius.`
                                : 'No suppliers available at the moment.'
                        }
                    </p>
                    {searchQuery && (
                        <button 
                            className="farmer-btn-primary"
                            onClick={() => setSearchQuery('')}
                        >
                            Clear Search
                        </button>
                    )}
                </div>
            ) : (
                <div className="suppliers-grid-modern">
                    {filteredAndSortedSuppliers.map((supplier, index) => (
                        <div 
                            key={supplier.id} 
                            className={`supplier-card-modern ${!supplier.is_active ? 'unavailable' : ''}`}
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            {/* Distance Badge */}
                            {supplier.distance_km && (
                                <div className="distance-badge-modern">
                                    <FaRoute />
                                    {formatDistance(supplier.distance_km)}
                                </div>
                            )}

                            {/* Supplier Header */}
                            <div className="supplier-card-header">
                                <div className="supplier-avatar">
                                    <FaStore />
                                </div>
                                <div className="supplier-title-section">
                                    <h3 className="supplier-name-modern">
                                        {supplier.business_name || supplier.shop_name || 'Unnamed Business'}
                                    </h3>
                                    <p className="supplier-owner-modern">
                                        <MdBusinessCenter /> {supplier.owner_name}
                                    </p>
                                </div>
                                <span className={`status-badge-modern ${supplier.is_active ? 'available' : 'unavailable'}`}>
                                    <span className="status-dot"></span>
                                    {supplier.is_active ? 'Available' : 'Closed'}
                                </span>
                            </div>

                            {/* Business Type Badge */}
                            <div className="business-type-section">
                                <span 
                                    className="business-type-badge-modern"
                                    style={{ 
                                        backgroundColor: `${getBusinessTypeColor(supplier.business_types)}20`,
                                        color: getBusinessTypeColor(supplier.business_types),
                                        borderColor: getBusinessTypeColor(supplier.business_types)
                                    }}
                                >
                                    {getBusinessTypeBadge(supplier.business_types)}
                                </span>
                            </div>

                            {/* Supplier Details */}
                            <div className="supplier-details-modern">
                                <div className="detail-row-modern">
                                    <FaStar className="detail-icon-modern star" />
                                    <span>{supplier.rating || '0.0'} Rating</span>
                                </div>
                                {supplier.user?.phone_number && (
                                    <div className="detail-row-modern">
                                        <FaPhone className="detail-icon-modern" />
                                        <span>{supplier.user.phone_number}</span>
                                    </div>
                                )}
                                {supplier.full_address && (
                                    <div className="detail-row-modern location">
                                        <FaMapMarkerAlt className="detail-icon-modern" />
                                        <span className="address-text">{supplier.full_address}</span>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            {supplier.description && (
                                <p className="supplier-description-modern">
                                    {supplier.description.length > 100 
                                        ? `${supplier.description.substring(0, 100)}...` 
                                        : supplier.description
                                    }
                                </p>
                            )}

                            {/* Actions */}
                            <div className="supplier-actions-modern">
                                <button
                                    className="call-btn-modern"
                                    onClick={() => handleCall(supplier.user?.phone_number, supplier.business_name)}
                                    disabled={!supplier.is_active || !supplier.user?.phone_number}
                                >
                                    <MdCall /> Call Now
                                </button>
                                <button 
                                    className="view-btn-modern"
                                    onClick={() => handleViewProfile(supplier)}
                                >
                                    <FaMapPin /> View Profile
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Info Banner */}
            {filteredAndSortedSuppliers.length > 0 && userLocation && (
                <div className="info-banner-modern">
                    <div className="banner-icon">💡</div>
                    <div className="banner-content">
                        <strong>Smart Results:</strong> Suppliers are automatically sorted by distance from your location. 
                        The nearest suppliers appear first!
                    </div>
                </div>
            )}

            {/* Supplier Profile Modal */}
            {selectedSupplier && (
                <div className="modal-overlay-supplier" onClick={handleCloseModal}>
                    <div className="modal-content-supplier" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="modal-header-supplier">
                            <div className="modal-header-left">
                                <div className="modal-business-icon">
                                    <FaStore />
                                </div>
                                <div>
                                    <h2>{selectedSupplier.business_name || selectedSupplier.shop_name || 'Business'}</h2>
                                    <p className="modal-owner-name">
                                        <MdBusinessCenter /> {selectedSupplier.owner_name}
                                    </p>
                                </div>
                            </div>
                            <button className="modal-close-btn" onClick={handleCloseModal}>
                                <FaTimes />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="modal-body-supplier">
                            {/* Status and Rating */}
                            <div className="modal-status-section">
                                <span className={`modal-status-badge ${selectedSupplier.is_active ? 'active' : 'inactive'}`}>
                                    <span className="status-dot"></span>
                                    {selectedSupplier.is_active ? 'Currently Available' : 'Currently Closed'}
                                </span>
                                {selectedSupplier.verification_status === 'verified' && (
                                    <span className="modal-verified-badge">
                                        <MdVerified /> Verified Business
                                    </span>
                                )}
                                <div className="modal-rating">
                                    <FaStar className="star-icon" />
                                    <span>{selectedSupplier.rating || '0.0'} / 5.0</span>
                                    {selectedSupplier.total_reviews > 0 && (
                                        <span className="reviews-count">({selectedSupplier.total_reviews} reviews)</span>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            {selectedSupplier.description && (
                                <div className="modal-section">
                                    <h3 className="modal-section-title">About This Business</h3>
                                    <p className="modal-description">{selectedSupplier.description}</p>
                                </div>
                            )}

                            {/* Business Information Grid */}
                            <div className="modal-section">
                                <h3 className="modal-section-title">Business Information</h3>
                                <div className="modal-info-grid">
                                    {selectedSupplier.business_types && (
                                        <div className="modal-info-item">
                                            <FaBuilding className="info-icon" />
                                            <div>
                                                <label>Business Types</label>
                                                <span>{selectedSupplier.business_types}</span>
                                            </div>
                                        </div>
                                    )}
                                    {selectedSupplier.years_of_experience && (
                                        <div className="modal-info-item">
                                            <FaCheckCircle className="info-icon" />
                                            <div>
                                                <label>Experience</label>
                                                <span>{selectedSupplier.years_of_experience} years</span>
                                            </div>
                                        </div>
                                    )}
                                    {selectedSupplier.gst_number && (
                                        <div className="modal-info-item">
                                            <FaIdCard className="info-icon" />
                                            <div>
                                                <label>GST Number</label>
                                                <span>{selectedSupplier.gst_number}</span>
                                            </div>
                                        </div>
                                    )}
                                    {selectedSupplier.license_number && (
                                        <div className="modal-info-item">
                                            <FaIdCard className="info-icon" />
                                            <div>
                                                <label>License Number</label>
                                                <span>{selectedSupplier.license_number}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="modal-section">
                                <h3 className="modal-section-title">Contact Information</h3>
                                <div className="modal-info-grid">
                                    {selectedSupplier.user?.phone_number && (
                                        <div className="modal-info-item">
                                            <FaPhone className="info-icon" />
                                            <div>
                                                <label>Phone Number</label>
                                                <span>{selectedSupplier.user.phone_number}</span>
                                            </div>
                                        </div>
                                    )}
                                    {selectedSupplier.alternate_number && (
                                        <div className="modal-info-item">
                                            <FaPhone className="info-icon" />
                                            <div>
                                                <label>Alternate Number</label>
                                                <span>{selectedSupplier.alternate_number}</span>
                                            </div>
                                        </div>
                                    )}
                                    {selectedSupplier.user?.email && (
                                        <div className="modal-info-item">
                                            <MdEmail className="info-icon" />
                                            <div>
                                                <label>Email</label>
                                                <span>{selectedSupplier.user.email}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Address */}
                            {selectedSupplier.full_address && (
                                <div className="modal-section">
                                    <h3 className="modal-section-title">Location</h3>
                                    <div className="modal-address">
                                        <FaMapMarkerAlt className="address-icon" />
                                        <div className="address-details">
                                            <p>{selectedSupplier.full_address}</p>
                                            {selectedSupplier.landmark && (
                                                <p className="landmark">Landmark: {selectedSupplier.landmark}</p>
                                            )}
                                            {selectedSupplier.distance_km && (
                                                <p className="distance-info">
                                                    <FaRoute /> {formatDistance(selectedSupplier.distance_km)} from your location
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Operating Hours */}
                            {(selectedSupplier.opening_time || selectedSupplier.working_days) && (
                                <div className="modal-section">
                                    <h3 className="modal-section-title">Operating Hours</h3>
                                    <div className="modal-info-grid">
                                        {selectedSupplier.opening_time && selectedSupplier.closing_time && (
                                            <div className="modal-info-item">
                                                <FaClock className="info-icon" />
                                                <div>
                                                    <label>Business Hours</label>
                                                    <span>{selectedSupplier.opening_time} - {selectedSupplier.closing_time}</span>
                                                </div>
                                            </div>
                                        )}
                                        {selectedSupplier.working_days && (
                                            <div className="modal-info-item">
                                                <FaClock className="info-icon" />
                                                <div>
                                                    <label>Working Days</label>
                                                    <span>{selectedSupplier.working_days}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Services */}
                            <div className="modal-section">
                                <h3 className="modal-section-title">Services Available</h3>
                                <div className="modal-services-grid">
                                    {selectedSupplier.enable_seeds && (
                                        <div className="service-badge">🌱 Seeds Supply</div>
                                    )}
                                    {selectedSupplier.enable_fertilizers && (
                                        <div className="service-badge">🧪 Fertilizers</div>
                                    )}
                                    {selectedSupplier.enable_manure && (
                                        <div className="service-badge">🌿 Manure</div>
                                    )}
                                    {selectedSupplier.enable_equipment_rental && (
                                        <div className="service-badge">🚜 Equipment Rental</div>
                                    )}
                                    {selectedSupplier.enable_agro_tools && (
                                        <div className="service-badge">🔧 Agro Tools</div>
                                    )}
                                </div>
                            </div>

                            {/* Delivery Information */}
                            {(selectedSupplier.home_delivery_available || selectedSupplier.pickup_available) && (
                                <div className="modal-section">
                                    <h3 className="modal-section-title">Delivery & Pickup</h3>
                                    <div className="modal-info-grid">
                                        {selectedSupplier.home_delivery_available && (
                                            <div className="modal-info-item">
                                                <FaTruck className="info-icon" />
                                                <div>
                                                    <label>Home Delivery</label>
                                                    <span>Available within {selectedSupplier.delivery_radius_km || 0} km</span>
                                                    {selectedSupplier.delivery_charges > 0 && (
                                                        <span className="small-text">Charges: ₹{selectedSupplier.delivery_charges}</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {selectedSupplier.pickup_available && (
                                            <div className="modal-info-item">
                                                <FaStore className="info-icon" />
                                                <div>
                                                    <label>Store Pickup</label>
                                                    <span>Available</span>
                                                </div>
                                            </div>
                                        )}
                                        {selectedSupplier.min_order_value > 0 && (
                                            <div className="modal-info-item">
                                                <FaCheckCircle className="info-icon" />
                                                <div>
                                                    <label>Minimum Order</label>
                                                    <span>₹{selectedSupplier.min_order_value}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Payment Methods */}
                            {selectedSupplier.upi_id && (
                                <div className="modal-section">
                                    <h3 className="modal-section-title">Payment Methods</h3>
                                    <div className="modal-info-grid">
                                        <div className="modal-info-item">
                                            <FaCheckCircle className="info-icon" />
                                            <div>
                                                <label>UPI ID</label>
                                                <span>{selectedSupplier.upi_id}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="modal-footer-supplier">
                            <button
                                className="modal-call-btn"
                                onClick={() => {
                                    handleCall(selectedSupplier.user?.phone_number, selectedSupplier.business_name);
                                    handleCloseModal();
                                }}
                                disabled={!selectedSupplier.is_active || !selectedSupplier.user?.phone_number}
                            >
                                <MdCall /> Call Now
                            </button>
                            <button className="modal-close-footer-btn" onClick={handleCloseModal}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchSupplier;
