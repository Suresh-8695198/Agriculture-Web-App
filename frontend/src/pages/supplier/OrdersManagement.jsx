import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    FaSearch, FaClipboardList, FaCheckCircle, FaTruck, FaClock,
    FaRegTimesCircle, FaCheck, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaEnvelope
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import SupplierSidebar from '../../components/SupplierSidebar';
import '../SupplierPortal.css';

const OrdersManagement = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchOrders();
        fetchStats();
    }, [filterStatus]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const url = filterStatus === 'all'
                ? 'suppliers/orders/my_orders/'
                : `suppliers/orders/my_orders/?status=${filterStatus}`;
            const response = await api.get(url);
            setOrders(response.data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('suppliers/orders/statistics/');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch order stats:', error);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await api.patch(`suppliers/orders/${orderId}/update_status/`, { status: newStatus });
            toast.success(`Order status updated to ${newStatus}`);
            fetchOrders();
            fetchStats();
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('Failed to update status');
        }
    };

    const handlePaymentUpdate = async (orderId, newPaymentStatus) => {
        try {
            await api.patch(`suppliers/orders/${orderId}/update_payment_status/`, { payment_status: newPaymentStatus });
            toast.success('Payment status updated');
            fetchOrders();
        } catch (error) {
            console.error('Failed to update payment status:', error);
            toast.error('Failed to update payment status');
        }
    };

    const filteredOrders = orders.filter(order =>
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#F59E0B';
            case 'confirmed': return '#3B82F6';
            case 'processing': return '#8B5CF6';
            case 'ready': return '#10B981';
            case 'delivered': return '#059669';
            case 'cancelled':
            case 'rejected': return '#EF4444';
            default: return '#6B7280';
        }
    };

    if (loading && orders.length === 0) {
        return (
            <div className="supplier-portal-layout">
                <SupplierSidebar />
                <div className="portal-main-content">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading orders...</p>
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
                        <h1 className="portal-title">Orders & Requests</h1>
                        <p className="portal-subtitle">Manage customer orders and track delivery status</p>
                    </div>
                    {stats && (
                        <div className="header-stats-simple">
                            <div className="stat-pill">
                                <span>Total: {stats.total_orders}</span>
                            </div>
                            <div className="stat-pill warning">
                                <span>Pending: {stats.pending_orders}</span>
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
                                    placeholder="Search by order ID, customer or product..."
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
                                <option value="processing">Processing</option>
                                <option value="ready">Ready for Pickup</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                <div className="orders-grid">
                    {filteredOrders.length === 0 ? (
                        <div className="section-card" style={{ textAlign: 'center', padding: '3rem', gridColumn: '1 / -1' }}>
                            <FaClipboardList style={{ fontSize: '4rem', color: '#D1D5DB', marginBottom: '1rem' }} />
                            <h3 style={{ color: '#6B7280' }}>No orders found</h3>
                            <p style={{ color: '#9CA3AF' }}>Orders will appear here once customers start purchasing your products.</p>
                        </div>
                    ) : (
                        filteredOrders.map(order => (
                            <div key={order.id} className="section-card order-card" style={{ padding: '0', overflow: 'hidden' }}>
                                <div style={{
                                    padding: '1.25rem',
                                    borderBottom: '1px solid #F3F4F6',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: '#F9FAFB'
                                }}>
                                    <div>
                                        <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#374151' }}>{order.order_number}</span>
                                        <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Placed on: {new Date(order.created_at).toLocaleDateString()}</div>
                                    </div>
                                    <div style={{
                                        background: getStatusColor(order.status),
                                        color: 'white',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        textTransform: 'capitalize'
                                    }}>
                                        {order.status_display}
                                    </div>
                                </div>

                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <div style={{
                                            width: '80px',
                                            height: '80px',
                                            background: order.product_image ? `url(${order.product_image})` : '#E5E7EB',
                                            backgroundSize: 'cover',
                                            borderRadius: '0.5rem'
                                        }}></div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 0.25rem 0', color: '#111827' }}>{order.product_name}</h4>
                                            <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Qty: {order.quantity} x ₹{order.unit_price}</div>
                                            <div style={{ fontSize: '1rem', fontWeight: '700', color: '#8B6F47', marginTop: '0.25rem' }}>Total: ₹{order.total_amount}</div>
                                        </div>
                                    </div>

                                    <div style={{ background: '#F9FAFB', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.5rem' }}>
                                        <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FaEnvelope size={12} color="#8B6F47" /> Customer Information
                                        </h5>
                                        <div style={{ fontSize: '0.875rem', color: '#1F2937', fontWeight: '600' }}>{order.customer_name}</div>
                                        <div style={{ fontSize: '0.875rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                            <FaPhone size={10} /> {order.customer_phone || 'No phone provided'}
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                            <FaMapMarkerAlt size={10} /> {order.delivery_method_display}: {order.delivery_address || 'Self Pickup'}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {order.status === 'pending' && (
                                            <>
                                                <button onClick={() => handleStatusUpdate(order.id, 'confirmed')} className="btn-success-supplier" style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }}>
                                                    <FaCheck /> Confirm
                                                </button>
                                                <button onClick={() => handleStatusUpdate(order.id, 'rejected')} className="btn-secondary-supplier" style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem', color: '#EF4444', borderColor: '#EF4444' }}>
                                                    <FaRegTimesCircle /> Reject
                                                </button>
                                            </>
                                        )}
                                        {order.status === 'confirmed' && (
                                            <button onClick={() => handleStatusUpdate(order.id, 'processing')} className="btn-primary-supplier" style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }}>
                                                <FaClock /> Start Processing
                                            </button>
                                        )}
                                        {order.status === 'processing' && (
                                            <button onClick={() => handleStatusUpdate(order.id, 'ready')} className="btn-primary-supplier" style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem', background: '#8B5CF6' }}>
                                                <FaTruck /> Ready for Delivery
                                            </button>
                                        )}
                                        {order.status === 'ready' && (
                                            <button onClick={() => handleStatusUpdate(order.id, 'delivered')} className="btn-success-supplier" style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }}>
                                                <FaCheckCircle /> Mark Delivered
                                            </button>
                                        )}

                                        <div style={{ width: '100%', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #F3F4F6' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6B7280' }}>Payment: {order.payment_status}</span>
                                                {order.payment_status !== 'paid' && (
                                                    <button onClick={() => handlePaymentUpdate(order.id, 'paid')} style={{
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
                .orders-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
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
                    .orders-grid {
                        grid-template-columns: 1fr;
                    }
                    .header-stats-simple {
                        display: none;
                    }
                }
            `}} />
        </div>
    );
};

export default OrdersManagement;
