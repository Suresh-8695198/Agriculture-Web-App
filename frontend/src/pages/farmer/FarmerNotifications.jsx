import React, { useState } from 'react';
import { FaBell, FaCheck, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import './FarmerPages.css';

const FarmerNotifications = () => {
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'success',
            icon: <FaCheck />,
            title: 'Order Accepted',
            message: 'Your order for Organic Fertilizer (2 bags) has been accepted by Green Valley Suppliers',
            time: '2 hours ago',
            read: false
        },
        {
            id: 2,
            type: 'warning',
            icon: <FaExclamationTriangle />,
            title: 'Supplier Unavailable',
            message: 'Farm Fresh Seeds Co. is currently unavailable. We have notified the next nearest supplier.',
            time: '5 hours ago',
            read: false
        },
        {
            id: 3,
            type: 'info',
            icon: <FaInfoCircle />,
            title: 'Booking Confirmed',
            message: 'Your tractor booking for February 18, 2024 (8 hours) has been confirmed.',
            time: '1 day ago',
            read: true
        },
        {
            id: 4,
            type: 'success',
            icon: <FaCheck />,
            title: 'Payment Received',
            message: 'Payment of ₹12,500 received for Paddy Rice listing.',
            time: '2 days ago',
            read: true
        },
        {
            id: 5,
            type: 'info',
            icon: <FaInfoCircle />,
            title: 'New Feature Available',
            message: 'You can now track your rentals in real-time with live GPS tracking!',
            time: '3 days ago',
            read: true
        }
    ]);

    const markAsRead = (id) => {
        setNotifications(notifications.map(notif =>
            notif.id === id ? { ...notif, read: true } : notif
        ));
    };

    const deleteNotification = (id) => {
        setNotifications(notifications.filter(notif => notif.id !== id));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const getNotificationClass = (type) => {
        switch (type) {
            case 'success': return 'notification-success';
            case 'warning': return 'notification-warning';
            case 'info': return 'notification-info';
            default: return 'notification-info';
        }
    };

    return (
        <div className="farmer-content-container">
            <div className="farmer-page-header">
                <h1 className="farmer-page-title">
                    <FaBell style={{ color: '#43A047' }} />
                    Notifications
                    {unreadCount > 0 && <span className="cart-badge">{unreadCount}</span>}
                </h1>
                <p className="farmer-page-description">
                    Stay updated with your orders, bookings, and activities
                </p>
            </div>

            {unreadCount > 0 && (
                <div className="action-bar">
                    <button className="farmer-btn-secondary" onClick={markAllAsRead}>
                        <FaCheck /> Mark All as Read
                    </button>
                </div>
            )}

            <div className="notifications-container">
                {notifications.length === 0 ? (
                    <div className="no-notifications">
                        <FaBell className="empty-icon" />
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    <div className="notifications-list-page">
                        {notifications.map(notification => (
                            <div
                                key={notification.id}
                                className={`notification-card ${getNotificationClass(notification.type)} ${notification.read ? 'read' : 'unread'}`}
                            >
                                <div className="notification-icon-wrapper">
                                    {notification.icon}
                                </div>
                                <div className="notification-content">
                                    <div className="notification-header">
                                        <h3>{notification.title}</h3>
                                        {!notification.read && <span className="unread-badge">New</span>}
                                    </div>
                                    <p className="notification-message">{notification.message}</p>
                                    <span className="notification-time">{notification.time}</span>
                                </div>
                                <div className="notification-actions">
                                    {!notification.read && (
                                        <button
                                            className="mark-read-btn"
                                            onClick={() => markAsRead(notification.id)}
                                            title="Mark as read"
                                        >
                                            <FaCheck />
                                        </button>
                                    )}
                                    <button
                                        className="delete-notif-btn"
                                        onClick={() => deleteNotification(notification.id)}
                                        title="Delete"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FarmerNotifications;
