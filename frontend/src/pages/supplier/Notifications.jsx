import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaBell, FaCheckDouble, FaTrash } from 'react-icons/fa';
import api from '../../api/axios';
import SupplierSidebar from '../../components/SupplierSidebar';
import '../SupplierPortal.css';
import { toast } from 'react-toastify';

const Notifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/notifications/');
            const notificationsData = response.data.map(n => ({
                ...n,
                created_at: new Date(n.created_at).toLocaleString() // Format to local date time
            }));
            setNotifications(notificationsData);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            // toast.error('Failed to load notifications');
            setLoading(false);
        }
    };

    const markAllRead = async () => {
        try {
            await api.post('/notifications/mark_all_read/');
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Failed to mark all read:', error);
            toast.error('Failed to update notifications');
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.post(`/notifications/${id}/mark_read/`);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ));
        } catch (error) {
            console.error('Failed to mark read:', error);
        }
    };

    return (
        <div className="supplier-portal-layout">
            <SupplierSidebar />
            <div className="portal-main-content animate-fade-in">
                <header className="page-header">
                    <div>
                        <h1 className="page-title">Notifications</h1>
                        <p className="page-subtitle">Stay updated with your business activities</p>
                    </div>
                    <div>
                        <button className="btn-secondary" onClick={markAllRead}>
                            <FaCheckDouble /> Mark All Read
                        </button>
                    </div>
                </header>

                <div className="content-card">
                    {loading ? (
                        <div className="text-center p-4">Loading notifications...</div>
                    ) : notifications.length > 0 ? (
                        <div className="notifications-list">
                            {notifications.map((notification) => (
                                <div key={notification.id}
                                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                                    className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
                                    style={{
                                        padding: '1rem',
                                        borderBottom: '1px solid #eee',
                                        display: 'flex',
                                        gap: '1rem',
                                        backgroundColor: notification.is_read ? 'white' : '#f0fdf4',
                                        cursor: notification.is_read ? 'default' : 'pointer',
                                        transition: 'background-color 0.2s'
                                    }}>

                                    <div className="notification-icon" style={{
                                        color: notification.is_read ? '#6B7280' : '#10B981',
                                        fontSize: '1.2rem',
                                        marginTop: '0.2rem'
                                    }}>
                                        <FaBell />
                                    </div>
                                    <div className="notification-content" style={{ flex: 1 }}>
                                        <div className="notification-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <h4 style={{ margin: 0, color: '#1F2937' }}>{notification.title}</h4>
                                            <span className="notification-time" style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>{notification.created_at}</span>
                                        </div>
                                        <p style={{ margin: 0, color: '#4B5563' }}>{notification.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state" style={{ textAlign: 'center', padding: '3rem' }}>
                            <FaBell className="empty-icon" style={{ fontSize: '3rem', color: '#D1D5DB', marginBottom: '1rem' }} />
                            <h3 style={{ color: '#374151' }}>No Notifications</h3>
                            <p style={{ color: '#6B7280' }}>You are all caught up!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
