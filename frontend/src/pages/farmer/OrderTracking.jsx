import React, { useState } from 'react';
import { FaClipboardList, FaCheck, FaClock, FaTruck, FaTimesCircle } from 'react-icons/fa';
import './FarmerPages.css';

const OrderTracking = () => {
    const [activeTab, setActiveTab] = useState('all');

    const orders = [
        {
            id: 'ORD-2024-001',
            type: 'Purchase',
            item: 'Organic Fertilizer - 2 bags',
            supplier: 'Green Valley Suppliers',
            date: '2024-02-15',
            status: 'delivered',
            amount: 1700,
            trackingSteps: [
                { label: 'Order Placed', completed: true },
                { label: 'Order Accepted', completed: true },
                { label: 'Out for Delivery', completed: true },
                { label: 'Delivered', completed: true }
            ]
        },
        {
            id: 'ORD-2024-002',
            type: 'Rental',
            item: 'Heavy Duty Tractor - 8 hours',
            supplier: 'Agro Tech Equipment',
            date: '2024-02-17',
            status: 'confirmed',
            amount: 4000,
            trackingSteps: [
                { label: 'Booking Placed', completed: true },
                { label: 'Booking Confirmed', completed: true },
                { label: 'Equipment Dispatched', completed: false },
                { label: 'Completed', completed: false }
            ]
        },
        {
            id: 'ORD-2024-003',
            type: 'Purchase',
            item: 'Rice Seeds - 5 kg',
            supplier: 'Farm Fresh Seeds Co.',
            date: '2024-02-17',
            status: 'pending',
            amount: 6000,
            trackingSteps: [
                { label: 'Order Placed', completed: true },
                { label: 'Order Accepted', completed: false },
                { label: 'Out for Delivery', completed: false },
                { label: 'Delivered', completed: false }
            ]
        }
    ];

    const filterOrders = () => {
        if (activeTab === 'all') return orders;
        return orders.filter(order => order.status === activeTab);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered': return <FaCheck className="status-icon delivered" />;
            case 'confirmed': return <FaClock className="status-icon confirmed" />;
            case 'pending': return <FaClock className="status-icon pending" />;
            case 'cancelled': return <FaTimesCircle className="status-icon cancelled" />;
            default: return <FaClock className="status-icon" />;
        }
    };

    return (
        <div className="farmer-content-container">
            <div className="farmer-page-header">
                <h1 className="farmer-page-title">
                    <FaClipboardList style={{ color: '#43A047' }} />
                    Order Tracking
                </h1>
                <p className="farmer-page-description">
                    Track your purchases, rentals, and bookings
                </p>
            </div>

            <div className="orders-tabs">
                <button 
                    className={activeTab === 'all' ? 'active' : ''}
                    onClick={() => setActiveTab('all')}
                >
                    All Orders
                </button>
                <button 
                    className={activeTab === 'pending' ? 'active' : ''}
                    onClick={() => setActiveTab('pending')}
                >
                    Pending
                </button>
                <button 
                    className={activeTab === 'confirmed' ? 'active' : ''}
                    onClick={() => setActiveTab('confirmed')}
                >
                    Confirmed
                </button>
                <button 
                    className={activeTab === 'delivered' ? 'active' : ''}
                    onClick={() => setActiveTab('delivered')}
                >
                    Completed
                </button>
            </div>

            <div className="orders-list">
                {filterOrders().map(order => (
                    <div key={order.id} className="order-card">
                        <div className="order-header">
                            <div className="order-id-section">
                                <h3>{order.id}</h3>
                                <span className="order-type">{order.type}</span>
                            </div>
                            <div className={`order-status ${order.status}`}>
                                {getStatusIcon(order.status)}
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </div>
                        </div>

                        <div className="order-details">
                            <div className="order-item">
                                <strong>{order.item}</strong>
                                <p className="supplier-name">From: {order.supplier}</p>
                            </div>
                            <div className="order-meta">
                                <span className="order-date">📅 {order.date}</span>
                                <span className="order-amount">💰 ₹{order.amount}</span>
                            </div>
                        </div>

                        <div className="order-tracking">
                            <div className="tracking-timeline">
                                {order.trackingSteps.map((step, index) => (
                                    <div key={index} className={`tracking-step ${step.completed ? 'completed' : ''}`}>
                                        <div className="step-indicator">
                                            {step.completed ? <FaCheck /> : <FaClock />}
                                        </div>
                                        <div className="step-label">{step.label}</div>
                                        {index < order.trackingSteps.length - 1 && <div className="step-line"></div>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="order-actions">
                            <button className="view-details-btn">View Details</button>
                            {order.status === 'delivered' && (
                                <button className="reorder-btn">Reorder</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filterOrders().length === 0 && (
                <div className="no-orders">
                    <FaClipboardList className="empty-icon" />
                    <p>No orders found</p>
                </div>
            )}
        </div>
    );
};

export default OrderTracking;
