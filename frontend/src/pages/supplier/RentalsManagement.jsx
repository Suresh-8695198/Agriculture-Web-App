import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    FaSearch, FaCalendarAlt, FaTractor, FaCheckCircle, FaClock,
    FaRegTimesCircle, FaCheck, FaPhone, FaMapMarkerAlt, FaHistory, FaUser
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import SupplierSidebar from '../../components/SupplierSidebar';
import '../SupplierPortal.css';

const RentalsManagement = () => {
    const { user } = useAuth();
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchRentals();
        fetchStats();
    }, [filterStatus]);

    const fetchRentals = async () => {
        try {
            setLoading(true);
            const url = filterStatus === 'all'
                ? 'suppliers/rentals/my_rentals/'
                : `suppliers/rentals/my_rentals/?status=${filterStatus}`;
            const response = await api.get(url);
            setRentals(response.data);
        } catch (error) {
            console.error('Failed to fetch rentals:', error);
            toast.error('Failed to load rentals');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('suppliers/rentals/statistics/');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch rental stats:', error);
        }
    };

    const handleStatusUpdate = async (rentalId, newStatus) => {
        try {
            await api.patch(`suppliers/rentals/${rentalId}/update_status/`, { status: newStatus });
            toast.success(`Rental status updated to ${newStatus}`);
            fetchRentals();
            fetchStats();
        } catch (error) {
            console.error('Failed to update rental status:', error);
            toast.error('Failed to update status');
        }
    };

    const handlePaymentUpdate = async (rentalId, newPaymentStatus) => {
        try {
            await api.patch(`suppliers/rentals/${rentalId}/update_payment_status/`, { payment_status: newPaymentStatus });
            toast.success('Payment status updated');
            fetchRentals();
        } catch (error) {
            console.error('Failed to update payment status:', error);
            toast.error('Failed to update payment status');
        }
    };

    const filteredRentals = rentals.filter(rental =>
        rental.rental_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.equipment_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#F59E0B';
            case 'confirmed': return '#3B82F6';
            case 'active': return '#8B5CF6';
            case 'completed': return '#059669';
            case 'cancelled':
            case 'rejected': return '#EF4444';
            default: return '#6B7280';
        }
    };

    if (loading && rentals.length === 0) {
        return (
            <div className="supplier-portal-layout">
                <SupplierSidebar />
                <div className="portal-main-content">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading rentals...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="supplier-portal-layout">
            <SupplierSidebar />

            <div className="portal-main-content">
                <div className="portal-header">
                    <div>
                        <h1 className="portal-title">Rentals Management</h1>
                        <p className="portal-subtitle">Track equipment bookings and manage rental periods</p>
                    </div>
                    {stats && (
                        <div className="header-stats-simple">
                            <div className="stat-pill">
                                <span>Total: {stats.total_rentals}</span>
                            </div>
                            <div className="stat-pill warning">
                                <span>Active: {stats.active_rentals}</span>
                            </div>
                            <div className="stat-pill success">
                                <span>Revenue: ₹{stats.total_revenue}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="section-card" style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '250px' }}>
                            <div style={{ position: 'relative' }}>
                                <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                                <input
                                    type="text"
                                    placeholder="Search by rental ID, customer or equipment..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="form-control"
                                    style={{ paddingLeft: '2.5rem' }}
                                />
                            </div>
                        </div>
                        <div style={{ minWidth: '200px' }}>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="form-control"
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Rentals List */}
                <div className="rentals-grid">
                    {filteredRentals.length === 0 ? (
                        <div className="section-card" style={{ textAlign: 'center', padding: '3rem', gridColumn: '1 / -1' }}>
                            <FaTractor style={{ fontSize: '4rem', color: '#D1D5DB', marginBottom: '1rem' }} />
                            <h3 style={{ color: '#6B7280' }}>No rentals found</h3>
                            <p style={{ color: '#9CA3AF' }}>Bookings will appear here when customers rent your machinery.</p>
                        </div>
                    ) : (
                        filteredRentals.map(rental => (
                            <div key={rental.id} className="section-card rental-card" style={{ padding: '0', overflow: 'hidden' }}>
                                <div style={{
                                    padding: '1.25rem',
                                    borderBottom: '1px solid #F3F4F6',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: '#F9FAFB'
                                }}>
                                    <div>
                                        <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#374151' }}>{rental.rental_number}</span>
                                        <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Booked on: {new Date(rental.created_at).toLocaleDateString()}</div>
                                    </div>
                                    <div style={{
                                        background: getStatusColor(rental.status),
                                        color: 'white',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        textTransform: 'capitalize'
                                    }}>
                                        {rental.status_display}
                                    </div>
                                </div>

                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <div style={{
                                            width: '80px',
                                            height: '80px',
                                            background: rental.equipment_image ? `url(${rental.equipment_image})` : '#E5E7EB',
                                            backgroundSize: 'cover',
                                            borderRadius: '0.5rem'
                                        }}></div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 0.25rem 0', color: '#111827' }}>{rental.equipment_name}</h4>
                                            <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                                                <FaCalendarAlt size={10} /> {new Date(rental.start_date).toLocaleDateString()} to {new Date(rental.end_date).toLocaleDateString()}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Duration: {rental.rental_duration_days} days</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#8B6F47', marginTop: '0.5rem' }}>Total: ₹{rental.total_amount}</div>
                                        </div>
                                    </div>

                                    <div style={{ background: '#F9FAFB', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div>
                                                <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280' }}>
                                                    <FaUser size={10} /> CUSTOMER
                                                </h5>
                                                <div style={{ fontSize: '0.875rem', color: '#1F2937', fontWeight: '600' }}>{rental.customer_name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>{rental.customer_phone}</div>
                                            </div>
                                            <div>
                                                <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280' }}>
                                                    <FaMapMarkerAlt size={10} /> LOCATION
                                                </h5>
                                                <div style={{ fontSize: '0.8rem', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {rental.delivery_address || 'Not specified'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {rental.status === 'pending' && (
                                            <>
                                                <button onClick={() => handleStatusUpdate(rental.id, 'confirmed')} className="btn-success-supplier" style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }}>
                                                    <FaCheck /> Confirm
                                                </button>
                                                <button onClick={() => handleStatusUpdate(rental.id, 'rejected')} className="btn-secondary-supplier" style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem', color: '#EF4444', borderColor: '#EF4444' }}>
                                                    <FaRegTimesCircle /> Reject
                                                </button>
                                            </>
                                        )}
                                        {rental.status === 'confirmed' && (
                                            <button onClick={() => handleStatusUpdate(rental.id, 'active')} className="btn-primary-supplier" style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }}>
                                                <FaTractor /> Handover & Start
                                            </button>
                                        )}
                                        {rental.status === 'active' && (
                                            <button onClick={() => handleStatusUpdate(rental.id, 'completed')} className="btn-success-supplier" style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }}>
                                                <FaCheckCircle /> Mark Completed
                                            </button>
                                        )}

                                        <div style={{ width: '100%', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #F3F4F6' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6B7280' }}>Payment: {rental.payment_status}</span>
                                                {rental.payment_status !== 'paid' && (
                                                    <button onClick={() => handlePaymentUpdate(rental.id, 'paid')} style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#3B82F6',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '700',
                                                        cursor: 'pointer',
                                                        textDecoration: 'underline'
                                                    }}>Mark as Paid</button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .rentals-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
                    gap: 1.5rem;
                }
                .header-stats-simple {
                    display: flex;
                    gap: 0.75rem;
                }
                .stat-pill {
                    background: #F3F4F6;
                    padding: 0.25rem 0.75rem;
                    border-radius: 2rem;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #4B5563;
                }
                .stat-pill.warning {
                    background: #FEF3C7;
                    color: #D97706;
                }
                .stat-pill.success {
                    background: #D1FAE5;
                    color: #059669;
                }
                @media (max-width: 768px) {
                    .rentals-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}} />
        </div>
    );
};

export default RentalsManagement;
