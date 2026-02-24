import React, { useState, useEffect, useCallback } from 'react';
import {
    FaClipboardList, FaCheck, FaClock, FaTruck, FaTimesCircle,
    FaHistory, FaBox, FaTractor, FaMoneyBillWave, FaMapMarkerAlt,
    FaRegCalendarAlt, FaChevronRight, FaFilter
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import './FarmerPages.css';

const OrderTracking = () => {
    const [activeTab, setActiveTab] = useState('purchases'); // 'purchases' | 'rentals' | 'sales'
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            let res;
            if (activeTab === 'purchases') {
                res = await api.get('suppliers/orders/farmer_orders/');
            } else if (activeTab === 'rentals') {
                res = await api.get('suppliers/rentals/farmer_rentals/');
            } else if (activeTab === 'sales') {
                res = await api.get('consumers/orders/');
            }
            setOrders(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            toast.error(`Failed to load ${activeTab}.`);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered':
            case 'completed': return <FaCheck className="status-icon delivered" />;
            case 'confirmed':
            case 'active':
            case 'processing': return <FaTruck className="status-icon processing" />;
            case 'pending': return <FaClock className="status-icon pending" />;
            case 'cancelled':
            case 'rejected': return <FaTimesCircle className="status-icon cancelled" />;
            default: return <FaClock className="status-icon" />;
        }
    };

    const getTrackingSteps = (order, type) => {
        // Define tracking steps based on type and status
        if (type === 'purchases') {
            const steps = [
                { label: 'Placed', icon: <FaClipboardList />, completed: true },
                { label: 'Confirmed', icon: <FaCheck />, completed: ['confirmed', 'processing', 'ready', 'delivered'].includes(order.status) },
                { label: 'Processing', icon: <FaBox />, completed: ['processing', 'ready', 'delivered'].includes(order.status) },
                { label: 'Delivered', icon: <FaTruck />, completed: order.status === 'delivered' }
            ];
            return steps;
        } else if (type === 'rentals') {
            const steps = [
                { label: 'Requested', icon: <FaClipboardList />, completed: true },
                { label: 'Confirmed', icon: <FaCheck />, completed: ['confirmed', 'active', 'completed'].includes(order.status) },
                { label: 'In Use', icon: <FaTractor />, completed: ['active', 'completed'].includes(order.status) },
                { label: 'Returned', icon: <FaHistory />, completed: order.status === 'completed' }
            ];
            return steps;
        } else {
            // Sales (Produce Orders)
            const steps = [
                { label: 'Pending', icon: <FaClipboardList />, completed: true },
                { label: 'Confirmed', icon: <FaCheck />, completed: ['confirmed', 'packed', 'shipped', 'delivered'].includes(order.status) },
                { label: 'Shipped', icon: <FaTruck />, completed: ['shipped', 'delivered'].includes(order.status) },
                { label: 'Delivered', icon: <FaCheck />, completed: order.status === 'delivered' }
            ];
            return steps;
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await api.post(`consumers/orders/${orderId}/update_status/`, { status: newStatus });
            toast.success('Status updated successfully!');
            fetchOrders();
        } catch (err) {
            toast.error('Failed to update status.');
        }
    };

    const cancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        try {
            if (activeTab === 'purchases') {
                await api.patch(`suppliers/orders/${orderId}/cancel_order/`);
            } else if (activeTab === 'rentals') {
                await api.patch(`suppliers/rentals/${orderId}/cancel_rental/`);
            }
            toast.success('Cancelled successfully.');
            fetchOrders();
        } catch (err) {
            toast.error('Failed to cancel.');
        }
    };

    const filteredOrders = orders.filter(o => {
        if (filterStatus === 'all') return true;
        return o.status === filterStatus;
    });

    return (
        <div className="adv-dashboard-container">
            <div className="farmer-page-header" style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ background: '#E8F5E9', p: 12, borderRadius: 12, display: 'flex' }}>
                        <FaClipboardList style={{ color: '#2E7D32', fontSize: 32 }} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111827', margin: 0 }}>My Business Orders</h1>
                        <p style={{ color: '#6B7280', margin: '4px 0 0', fontSize: 15 }}>Track purchases, rentals, and sales receipts.</p>
                    </div>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="orders-tabs" style={{ background: 'white', padding: '6px', borderRadius: 16, display: 'inline-flex', gap: 4, marginBottom: 24, boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <button
                    className={activeTab === 'purchases' ? 'active' : ''}
                    onClick={() => setActiveTab('purchases')}
                    style={{ padding: '10px 24px', borderRadius: 12, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: activeTab === 'purchases' ? '#2E7D32' : 'transparent', color: activeTab === 'purchases' ? 'white' : '#6B7280', display: 'flex', alignItems: 'center', gap: 10 }}
                >
                    <FaBox /> Purchases
                </button>
                <button
                    className={activeTab === 'rentals' ? 'active' : ''}
                    onClick={() => setActiveTab('rentals')}
                    style={{ padding: '10px 24px', borderRadius: 12, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: activeTab === 'rentals' ? '#2E7D32' : 'transparent', color: activeTab === 'rentals' ? 'white' : '#6B7280', display: 'flex', alignItems: 'center', gap: 10 }}
                >
                    <FaTractor /> Rentals
                </button>
                <button
                    className={activeTab === 'sales' ? 'active' : ''}
                    onClick={() => setActiveTab('sales')}
                    style={{ padding: '10px 24px', borderRadius: 12, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: activeTab === 'sales' ? '#2E7D32' : 'transparent', color: activeTab === 'sales' ? 'white' : '#6B7280', display: 'flex', alignItems: 'center', gap: 10 }}
                >
                    <FaMoneyBillWave /> Sales Received
                </button>
            </div>

            {/* Filter Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 10 }}>
                    <select
                        className="adv-select-sm"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #E5E7EB', fontWeight: 600 }}
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
                <button className="adv-btn-secondary" onClick={fetchOrders} style={{ padding: '8px 16px' }}>
                    Refresh <FaHistory />
                </button>
            </div>

            <div className="orders-list" style={{ display: 'grid', gap: 24 }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                        <div className="loading-spinner"></div>
                        <p style={{ marginTop: 16, color: '#6B7280' }}>Loading orders history...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div style={{ background: 'white', padding: '80px 40px', borderRadius: 24, textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                        <div style={{ fontSize: 64, marginBottom: 24 }}>📜</div>
                        <h3 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>No orders found</h3>
                        <p style={{ color: '#6B7280', marginTop: 8 }}>Your activity for {activeTab} will appear here.</p>
                        <button className="adv-btn-primary" style={{ marginTop: 24 }} onClick={() => setActiveTab('purchases')}>Start Exploring</button>
                    </div>
                ) : (
                    filteredOrders.map(order => (
                        <div key={order.id} className="adv-card order-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
                            {/* Card Top */}
                            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFB' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                                    <div style={{ width: 44, height: 44, background: '#E8F5E9', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E7D32', fontSize: 20 }}>
                                        {activeTab === 'rentals' ? <FaTractor /> : <FaBox />}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>{order.order_number || order.rental_number || `#${order.id}`}</h3>
                                        <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 600 }}>{activeTab.toUpperCase()} • {new Date(order.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className={`order-tag ${order.status.toLowerCase()}`} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {getStatusIcon(order.status)}
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </div>
                            </div>

                            {/* Card Content */}
                            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 32 }}>
                                <div>
                                    <div style={{ display: 'flex', gap: 20 }}>
                                        <div style={{ width: 90, height: 90, background: '#F3F4F6', borderRadius: 16, overflow: 'hidden', flexShrink: 0 }}>
                                            <img
                                                src={order.product_image || order.equipment_image || order.produce_image || '/placeholder-crop.png'}
                                                alt="item"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => e.target.src = '/placeholder-crop.png'}
                                            />
                                        </div>
                                        <div>
                                            <h4 style={{ margin: '0 0 6px 0', fontSize: 18, fontWeight: 700, color: '#111827' }}>
                                                {order.product_name || order.equipment_name || order.produce_name || 'Item Name'}
                                            </h4>
                                            <p style={{ margin: '0 0 12px 0', fontSize: 14, color: '#6B7280' }}>
                                                {activeTab === 'sales' ? `Buyer: ${order.consumer_name || 'Consumer'}` : `Supplier: ${order.supplier_business_name || order.supplier_name || 'Partner'}`}
                                            </p>
                                            <div style={{ display: 'flex', gap: 16 }}>
                                                <div style={{ fontSize: 13, background: '#F1F5F9', padding: '4px 10px', borderRadius: 6, color: '#475569', fontWeight: 600 }}>
                                                    Qty: {order.quantity}
                                                </div>
                                                <div style={{ fontSize: 13, background: '#F0FDF4', padding: '4px 10px', borderRadius: 6, color: '#166534', fontWeight: 700 }}>
                                                    Total: ₹{order.total_amount || order.total_price}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="order-tracking-timeline" style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                                        <div style={{ position: 'absolute', top: 12, left: '10%', right: '10%', height: 2, background: '#E5E7EB', zIndex: 0 }}></div>
                                        {getTrackingSteps(order, activeTab).map((step, idx) => (
                                            <div key={idx} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '25%' }}>
                                                <div style={{
                                                    width: 26, height: 26, borderRadius: '50%', background: step.completed ? '#2E7D32' : 'white',
                                                    border: step.completed ? '2px solid #2E7D32' : '2px solid #D1D5DB',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: step.completed ? 'white' : '#9CA3AF', fontSize: 12, transition: 'all 0.3s'
                                                }}>
                                                    {step.completed ? <FaCheck size={10} /> : <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#D1D5DB' }}></div>}
                                                </div>
                                                <span style={{ fontSize: 11, fontWeight: 700, color: step.completed ? '#2E7D32' : '#9CA3AF', marginTop: 10, textAlign: 'center' }}>{step.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions Column */}
                                <div style={{ borderLeft: '1px solid #F3F4F6', paddingLeft: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div style={{ marginBottom: 12 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4B5563', fontSize: 13, marginBottom: 8 }}>
                                            <FaMapMarkerAlt /> <strong style={{ color: '#111827' }}>Delivery Address</strong>
                                        </div>
                                        <p style={{ margin: 0, fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>
                                            {order.delivery_address || 'AgriConnect Pickup Point'}
                                        </p>
                                    </div>

                                    {activeTab === 'sales' ? (
                                        <>
                                            {order.status === 'pending' && (
                                                <button className="adv-btn-primary" onClick={() => handleUpdateStatus(order.id, 'confirmed')} style={{ width: '100%', justifyContent: 'center' }}>Confirm Order</button>
                                            )}
                                            {order.status === 'confirmed' && (
                                                <button className="adv-btn-primary" onClick={() => handleUpdateStatus(order.id, 'shipped')} style={{ width: '100%', justifyContent: 'center' }}>Mark as Shipped</button>
                                            )}
                                            {order.status === 'shipped' && (
                                                <button className="adv-btn-primary" onClick={() => handleUpdateStatus(order.id, 'delivered')} style={{ width: '100%', justifyContent: 'center' }}>Mark Delivered</button>
                                            )}
                                            {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                                <button className="adv-btn-secondary" onClick={() => handleUpdateStatus(order.id, 'cancelled')} style={{ width: '100%', justifyContent: 'center', color: '#DC2626' }}>Reject Order</button>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <button className="adv-btn-primary-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>View Invoice</button>
                                            {order.status === 'pending' && (
                                                <button className="adv-btn-secondary" onClick={() => cancelOrder(order.id)} style={{ width: '100%', justifyContent: 'center', color: '#DC2626' }}>Cancel Request</button>
                                            )}
                                            {order.status === 'delivered' && (
                                                <button className="adv-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Rate Product</button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )
                }
            </div>

            <style>{`
                .order-tag.pending { background: #FEF3C7; color: #D97706; }
                .order-tag.confirmed, .order-tag.processing { background: #DBEAFE; color: #1E40AF; }
                .order-tag.shipped, .order-tag.active { background: #F3E8FF; color: #7E22CE; }
                .order-tag.delivered, .order-tag.completed { background: #DCFCE7; color: #166534; }
                .order-tag.cancelled, .order-tag.rejected { background: #FEE2E2; color: #DC2626; }
                
                .status-icon.delivered { color: #166534; }
                .status-icon.processing { color: #1E40AF; }
                .status-icon.pending { color: #D97706; }
                .status-icon.cancelled { color: #DC2626; }

                .loading-spinner { 
                    border: 4px solid #f3f3f3; 
                    border-top: 4px solid #2E7D32; 
                    border-radius: 50%; 
                    width: 40px; height: 40px; 
                    animation: spin 1s linear infinite; 
                    margin: auto; 
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                
                .order-card { transition: all 0.3s ease; }
                .order-card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
                
                .adv-btn-primary-ghost {
                    background: white;
                    border: 1px solid #2E7D32;
                    color: #2E7D32;
                    padding: 10px 20px;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s;
                }
                .adv-btn-primary-ghost:hover {
                    background: #F0FDF4;
                }
            `}</style>
        </div>
    );
};

export default OrderTracking;
