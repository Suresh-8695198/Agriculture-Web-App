import React, { useState, useEffect, useCallback } from 'react';
import { FaBell, FaCheck, FaExclamationTriangle, FaInfoCircle, FaTimes, FaInbox } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import './FarmerPages.css';

const FarmerNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('notifications/');
            // The API might return results in res.data or res.data.results if paginated
            const data = res.data.results || res.data;
            setNotifications(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
            toast.error('Failed to load notifications.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markAsRead = async (id) => {
        try {
            await api.post(`notifications/${id}/mark_read/`);
            setNotifications(notifications.map(notif =>
                notif.id === id ? { ...notif, is_read: true } : notif
            ));
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
            toast.error('Failed to update notification.');
        }
    };

    const deleteNotification = async (id) => {
        if (!window.confirm('Are you sure you want to delete this notification?')) return;
        try {
            await api.delete(`notifications/${id}/`);
            setNotifications(notifications.filter(notif => notif.id !== id));
            toast.success('Notification deleted');
        } catch (err) {
            console.error('Failed to delete notification:', err);
            toast.error('Failed to delete notification.');
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.post('notifications/mark_all_read/');
            setNotifications(notifications.map(notif => ({ ...notif, is_read: true })));
            toast.success('All notifications marked as read');
        } catch (err) {
            console.error('Failed to mark all as read:', err);
            toast.error('Failed to update notifications.');
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const getNotificationConfig = (type) => {
        switch (type) {
            case 'order':
                return { class: 'notification-success', icon: <FaCheck />, label: 'Order' };
            case 'rental':
                return { class: 'notification-info', icon: <FaInfoCircle />, label: 'Rental' };
            case 'payment':
                return { class: 'notification-success', icon: <FaCheck />, label: 'Payment' };
            case 'review':
                return { class: 'notification-warning', icon: <FaExclamationTriangle />, label: 'Review' };
            case 'system':
                return { class: 'notification-info', icon: <FaInfoCircle />, label: 'System' };
            default:
                return { class: 'notification-info', icon: <FaBell />, label: 'Notification' };
        }
    };

    const getTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="farmer-content-container">
            <div className="farmer-page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                        background: '#E8F5E9',
                        padding: '12px',
                        borderRadius: '12px',
                        display: 'flex',
                        color: '#43A047'
                    }}>
                        <FaBell size={24} />
                    </div>
                    <div>
                        <h1 className="farmer-page-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            Notifications
                            {unreadCount > 0 && <span className="cart-badge" style={{ position: 'relative', top: 0, right: 0 }}>{unreadCount}</span>}
                        </h1>
                        <p className="farmer-page-description" style={{ margin: '5px 0 0 0' }}>
                            Stay updated with your orders, bookings, and activities
                        </p>
                    </div>
                </div>
            </div>

            {notifications.length > 0 && (
                <div className="action-bar" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        className="farmer-btn-secondary"
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}
                        style={{ opacity: unreadCount === 0 ? 0.5 : 1 }}
                    >
                        <FaCheck /> Mark All as Read
                    </button>
                </div>
            )}

            <div className="notifications-container">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div className="loading-spinner"></div>
                        <p style={{ marginTop: '15px', color: '#666' }}>Loading notifications...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="no-notifications" style={{
                        background: 'white',
                        padding: '60px 20px',
                        borderRadius: '20px',
                        textAlign: 'center',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                    }}>
                        <FaInbox style={{ fontSize: '64px', color: '#E0E0E0', marginBottom: '20px' }} />
                        <h3 style={{ color: '#333', marginBottom: '10px' }}>No notifications yet</h3>
                        <p style={{ color: '#666' }}>We'll notify you when something important happens.</p>
                    </div>
                ) : (
                    <div className="notifications-list-page">
                        {notifications.map(notification => {
                            const config = getNotificationConfig(notification.notification_type);
                            return (
                                <div
                                    key={notification.id}
                                    className={`notification-card ${config.class} ${notification.is_read ? 'read' : 'unread'}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '15px',
                                        padding: '20px',
                                        background: notification.is_read ? '#f9f9f9' : 'white',
                                        borderRadius: '16px',
                                        marginBottom: '15px',
                                        border: '1px solid #eee',
                                        boxShadow: notification.is_read ? 'none' : '0 4px 12px rgba(0,0,0,0.05)',
                                        transition: 'all 0.3s ease',
                                        position: 'relative'
                                    }}
                                >
                                    <div className="notification-icon-wrapper" style={{
                                        width: '45px',
                                        height: '45px',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '20px',
                                        flexShrink: 0
                                    }}>
                                        {config.icon}
                                    </div>
                                    <div className="notification-content" style={{ flex: 1 }}>
                                        <div className="notification-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
                                                {notification.title}
                                            </h3>
                                            {!notification.is_read && (
                                                <span style={{
                                                    background: '#43A047',
                                                    color: 'white',
                                                    fontSize: '10px',
                                                    padding: '2px 8px',
                                                    borderRadius: '10px',
                                                    textTransform: 'uppercase',
                                                    fontWeight: 800
                                                }}>
                                                    New
                                                </span>
                                            )}
                                        </div>
                                        <p className="notification-message" style={{ margin: '0 0 10px 0', color: '#555', fontSize: '14px', lineHeight: '1.5' }}>
                                            {notification.message}
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <span className="notification-time" style={{ fontSize: '12px', color: '#999' }}>
                                                {getTimeAgo(notification.created_at)}
                                            </span>
                                            <span style={{
                                                fontSize: '11px',
                                                color: '#666',
                                                background: '#f0f0f0',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                fontWeight: 600
                                            }}>
                                                {config.label}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="notification-actions" style={{ display: 'flex', gap: '8px' }}>
                                        {!notification.is_read && (
                                            <button
                                                className="mark-read-btn"
                                                onClick={() => markAsRead(notification.id)}
                                                title="Mark as read"
                                                style={{
                                                    background: '#E8F5E9',
                                                    color: '#43A047',
                                                    border: 'none',
                                                    padding: '8px',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <FaCheck />
                                            </button>
                                        )}
                                        <button
                                            className="delete-notif-btn"
                                            onClick={() => deleteNotification(notification.id)}
                                            title="Delete"
                                            style={{
                                                background: '#fbe9e7',
                                                color: '#d32f2f',
                                                border: 'none',
                                                padding: '8px',
                                                borderRadius: '8px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <style>{`
                .loading-spinner { 
                    border: 4px solid #f3f3f3; 
                    border-top: 4px solid #43A047; 
                    border-radius: 50%; 
                    width: 40px; height: 40px; 
                    animation: spin 1s linear infinite; 
                    margin: auto; 
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                
                .notification-card.unread { border-left: 4px solid #43A047; }
                .notification-card.notification-success .notification-icon-wrapper { background: #E8F5E9; color: #2E7D32; }
                .notification-card.notification-info .notification-icon-wrapper { background: #E3F2FD; color: #1976D2; }
                .notification-card.notification-warning .notification-icon-wrapper { background: #FFF3E0; color: #F57C00; }
                
                .notification-card:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(0,0,0,0.08); }
            `}</style>
        </div>
    );
};

export default FarmerNotifications;

