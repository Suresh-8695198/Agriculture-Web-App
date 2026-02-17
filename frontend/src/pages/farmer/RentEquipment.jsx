import React, { useState } from 'react';
import { FaTractor, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { GiFarmTractor } from 'react-icons/gi';
import './FarmerPages.css';

const RentEquipment = () => {
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [bookingDate, setBookingDate] = useState('');
    const [duration, setDuration] = useState('');
    const [durationType, setDurationType] = useState('hours');

    const equipment = [
        {
            id: 1,
            name: 'Heavy Duty Tractor',
            type: 'Tractor',
            hourlyRate: 500,
            dailyRate: 3500,
            image: '🚜',
            features: ['70 HP', 'Diesel', 'With Operator'],
            available: true
        },
        {
            id: 2,
            name: 'Mini Tractor',
            type: 'Tractor',
            hourlyRate: 300,
            dailyRate: 2000,
            image: '🚜',
            features: ['35 HP', 'Diesel', 'Self-Drive'],
            available: true
        },
        {
            id: 3,
            name: 'Harvester Machine',
            type: 'Harvester',
            hourlyRate: 800,
            dailyRate: 5000,
            image: '🌾',
            features: ['Combine', 'With Operator', 'Maintains Load'],
            available: false
        },
        {
            id: 4,
            name: 'Plowing Machine',
            type: 'Plow',
            hourlyRate: 400,
            dailyRate: 2500,
            image: '🔨',
            features: ['Heavy Duty', 'Diesel', 'With Operator'],
            available: true
        }
    ];

    const handleBooking = () => {
        if (!selectedEquipment || !bookingDate || !duration) {
            alert('Please fill in all fields');
            return;
        }
        const rate = durationType === 'hours' ? selectedEquipment.hourlyRate : selectedEquipment.dailyRate;
        const total = rate * parseFloat(duration);
        alert(`Booking confirmed!\nEquipment: ${selectedEquipment.name}\nDate: ${bookingDate}\nDuration: ${duration} ${durationType}\nTotal: ₹${total}`);
    };

    return (
        <div className="farmer-content-container">
            <div className="farmer-page-header">
                <h1 className="farmer-page-title">
                    <GiFarmTractor style={{ color: '#43A047' }} />
                    Rent Equipment
                </h1>
                <p className="farmer-page-description">
                    Book tractors and machinery for your farming needs
                </p>
            </div>

            <div className="equipment-layout">
                <div className="equipment-list">
                    <h2 className="section-title">Available Equipment</h2>
                    <div className="equipment-grid">
                        {equipment.map(item => (
                            <div 
                                key={item.id} 
                                className={`equipment-card ${selectedEquipment?.id === item.id ? 'selected' : ''} ${!item.available ? 'unavailable' : ''}`}
                                onClick={() => item.available && setSelectedEquipment(item)}
                            >
                                <div className="equipment-image">{item.image}</div>
                                <div className="equipment-info">
                                    <h3>{item.name}</h3>
                                    <span className={`availability-badge ${item.available ? 'available' : 'unavailable'}`}>
                                        {item.available ? '✓ Available' : '✗ Booked'}
                                    </span>
                                    <div className="equipment-features">
                                        {item.features.map((feature, idx) => (
                                            <span key={idx} className="feature-tag">{feature}</span>
                                        ))}
                                    </div>
                                    <div className="equipment-pricing">
                                        <div className="price-item">
                                            <span>Hourly:</span>
                                            <strong>₹{item.hourlyRate}/hr</strong>
                                        </div>
                                        <div className="price-item">
                                            <span>Daily:</span>
                                            <strong>₹{item.dailyRate}/day</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="booking-section">
                    <div className="booking-card">
                        <h2>Booking Details</h2>
                        {selectedEquipment ? (
                            <>
                                <div className="selected-equipment-info">
                                    <span className="equipment-emoji">{selectedEquipment.image}</span>
                                    <div>
                                        <h3>{selectedEquipment.name}</h3>
                                        <p>{selectedEquipment.type}</p>
                                    </div>
                                </div>

                                <div className="booking-form">
                                    <div className="form-group">
                                        <label><FaCalendarAlt /> Select Date</label>
                                        <input 
                                            type="date" 
                                            value={bookingDate}
                                            onChange={(e) => setBookingDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label><FaClock /> Duration</label>
                                        <div className="duration-input">
                                            <input 
                                                type="number" 
                                                value={duration}
                                                onChange={(e) => setDuration(e.target.value)}
                                                placeholder="Enter duration"
                                                min="1"
                                            />
                                            <select 
                                                value={durationType}
                                                onChange={(e) => setDurationType(e.target.value)}
                                            >
                                                <option value="hours">Hours</option>
                                                <option value="days">Days</option>
                                            </select>
                                        </div>
                                    </div>

                                    {duration && (
                                        <div className="price-calculation">
                                            <div className="calc-row">
                                                <span>Rate:</span>
                                                <span>₹{durationType === 'hours' ? selectedEquipment.hourlyRate : selectedEquipment.dailyRate} / {durationType === 'hours' ? 'hour' : 'day'}</span>
                                            </div>
                                            <div className="calc-row">
                                                <span>Duration:</span>
                                                <span>{duration} {durationType}</span>
                                            </div>
                                            <div className="calc-row total">
                                                <span>Total:</span>
                                                <span>₹{(durationType === 'hours' ? selectedEquipment.hourlyRate : selectedEquipment.dailyRate) * parseFloat(duration)}</span>
                                            </div>
                                        </div>
                                    )}

                                    <button className="booking-btn" onClick={handleBooking}>
                                        <FaTractor /> Confirm Booking
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="no-selection">
                                <GiFarmTractor className="empty-icon" />
                                <p>Select equipment to book</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RentEquipment;
