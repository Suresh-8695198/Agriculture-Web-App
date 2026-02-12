import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
    FaWarehouse, FaShoppingCart, FaChartBar, FaCalendarCheck, 
    FaMoneyBillWave, FaExclamationTriangle, FaBoxOpen, FaTractor,
    FaPlus, FaClipboardList
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import SupplierSidebar from '../../components/SupplierSidebar';
import '../SupplierPortal.css';

const SupplierDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalProducts: 0,
        availableStock: 0,
        activeOrders: 0,
        activeRentals: 0,
        todayEarnings: 0,
        pendingRequests: 0,
        lowStockCount: 0,
        totalEarnings: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const response = await api.get('suppliers/profiles/dashboard_stats/');
            setStats({
                totalProducts: response.data.total_products,
                availableStock: response.data.available_stock,
                activeOrders: response.data.active_orders,
                activeRentals: response.data.active_rentals,
                todayEarnings: response.data.today_earnings,
                pendingRequests: response.data.pending_requests,
                lowStockCount: response.data.low_stock_count,
                totalEarnings: response.data.total_earnings
            });
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        { 
            label: 'Add Product', 
            icon: <FaBoxOpen />, 
            color: '#8B6F47',
            action: () => navigate('/supplier/products')
        },
        { 
            label: 'Add Equipment', 
            icon: <FaTractor />, 
            color: '#8B6F47',
            action: () => navigate('/supplier/equipment')
        },
        { 
            label: 'View Orders', 
            icon: <FaClipboardList />, 
            color: '#8B6F47',
            action: () => navigate('/supplier/orders')
        },
        { 
            label: 'My Profile', 
            icon: <FaPlus />, 
            color: '#8B6F47',
            action: () => navigate('/supplier/profile')
        }
    ];

    if (loading) {
        return (
            <div className="supplier-portal-layout">
                <SupplierSidebar />
                <div className="portal-main-content">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="supplier-portal-layout">
            <SupplierSidebar />
            
            <div className="portal-main-content">
                {/* Welcome Header */}
                <div className="portal-header">
                    <div>
                        <h1 className="portal-title">Dashboard Overview</h1>
                        <p className="portal-subtitle">Welcome back, {user?.username}! Here's your business summary.</p>
                    </div>
                    <div className="header-date">
                        {new Date().toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid-portal">
                    <div className="stat-card-portal supplier-theme">
                        <div className="stat-icon-portal">
                            <FaWarehouse />
                        </div>
                        <div className="stat-content-portal">
                            <h3>{stats.totalProducts}</h3>
                            <p>Total Products</p>
                        </div>
                    </div>

                    <div className="stat-card-portal supplier-theme">
                        <div className="stat-icon-portal">
                            <FaBoxOpen />
                        </div>
                        <div className="stat-content-portal">
                            <h3>{stats.availableStock}</h3>
                            <p>Available Stock</p>
                        </div>
                    </div>

                    <div className="stat-card-portal supplier-theme">
                        <div className="stat-icon-portal">
                            <FaShoppingCart />
                        </div>
                        <div className="stat-content-portal">
                            <h3>{stats.activeOrders}</h3>
                            <p>Active Orders</p>
                        </div>
                    </div>

                    <div className="stat-card-portal supplier-theme">
                        <div className="stat-icon-portal">
                            <FaCalendarCheck />
                        </div>
                        <div className="stat-content-portal">
                            <h3>{stats.activeRentals}</h3>
                            <p>Active Rentals</p>
                        </div>
                    </div>

                    <div className="stat-card-portal supplier-theme earning">
                        <div className="stat-icon-portal">
                            <FaMoneyBillWave />
                        </div>
                        <div className="stat-content-portal">
                            <h3>₹{stats.todayEarnings}</h3>
                            <p>Today's Earnings</p>
                        </div>
                    </div>

                    <div className="stat-card-portal supplier-theme">
                        <div className="stat-icon-portal">
                            <FaClipboardList />
                        </div>
                        <div className="stat-content-portal">
                            <h3>{stats.pendingRequests}</h3>
                            <p>Pending Requests</p>
                        </div>
                    </div>

                    <div className="stat-card-portal supplier-theme warning">
                        <div className="stat-icon-portal">
                            <FaExclamationTriangle />
                        </div>
                        <div className="stat-content-portal">
                            <h3>{stats.lowStockCount}</h3>
                            <p>Low Stock Alert</p>
                        </div>
                    </div>

                    <div className="stat-card-portal supplier-theme total">
                        <div className="stat-icon-portal">
                            <FaChartBar />
                        </div>
                        <div className="stat-content-portal">
                            <h3>₹{stats.totalEarnings}</h3>
                            <p>Total Earnings</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="section-card">
                    <div className="section-header">
                        <h2>Quick Actions</h2>
                        <p>Manage your business operations</p>
                    </div>
                    <div className="quick-actions-grid">
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                className="quick-action-btn supplier-theme"
                                onClick={action.action}
                            >
                                <div className="action-icon">{action.icon}</div>
                                <span>{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recent Activity Section */}
                <div className="section-card">
                    <div className="section-header">
                        <h2>Recent Activity</h2>
                        <p>Your latest business activities</p>
                    </div>
                    <div className="activity-list">
                        <div className="activity-item">
                            <div className="activity-icon supplier-theme">
                                <FaBoxOpen />
                            </div>
                            <div className="activity-content">
                                <p className="activity-title">No recent activities</p>
                                <span className="activity-time">Start by adding products or equipment</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupplierDashboard;
