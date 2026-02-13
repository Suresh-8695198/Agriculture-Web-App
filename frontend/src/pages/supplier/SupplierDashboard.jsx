import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    FaBox, FaClipboardList, FaTruck, FaRupeeSign,
    FaChartPie, FaChartBar, FaPlus, FaArrowUp, FaArrowDown,
    FaEllipsisV, FaBell
} from 'react-icons/fa';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
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

    // --- Mock Data for Advanced Analytics ---

    // 1. Revenue Trend (Area Chart)
    const revenueData = [
        { name: 'Mon', revenue: 4000, orders: 24 },
        { name: 'Tue', revenue: 3000, orders: 18 },
        { name: 'Wed', revenue: 5000, orders: 32 },
        { name: 'Thu', revenue: 2780, orders: 15 },
        { name: 'Fri', revenue: 1890, orders: 12 },
        { name: 'Sat', revenue: 6390, orders: 45 },
        { name: 'Sun', revenue: 3490, orders: 28 },
    ];

    // 2. Inventory Distribution (Donut Chart)
    const inventoryData = [
        { name: 'Vegetables', value: 45 },
        { name: 'Fruits', value: 25 },
        { name: 'Grains', value: 20 },
        { name: 'Equipment', value: 10 },
    ];
    const COLORS = ['#8B6F47', '#10B981', '#F59E0B', '#3B82F6'];

    // 3. Order Status (Donut Chart)
    const orderStatusData = [
        { name: 'Delivered', value: 65 },
        { name: 'Pending', value: 25 },
        { name: 'Cancelled', value: 10 },
    ];
    const STATUS_COLORS = ['#10B981', '#F59E0B', '#EF4444'];

    // 4. Monthly Performance (Bar Chart)
    const monthlyPerformance = [
        { name: 'Week 1', sales: 12000 },
        { name: 'Week 2', sales: 19000 },
        { name: 'Week 3', sales: 15000 },
        { name: 'Week 4', sales: 22000 },
    ];

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const response = await api.get('suppliers/profiles/dashboard_stats/');
            setStats({
                totalProducts: response.data.total_products || 0,
                availableStock: response.data.available_stock || 0,
                activeOrders: response.data.active_orders || 0,
                activeRentals: response.data.active_rentals || 0,
                todayEarnings: response.data.today_earnings || 0,
                pendingRequests: response.data.pending_requests || 0,
                lowStockCount: response.data.low_stock_count || 0,
                totalEarnings: response.data.total_earnings || 0
            });
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="supplier-portal-layout">
                <SupplierSidebar />
                <div className="portal-main-content">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading analytics...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="supplier-portal-layout">
            <SupplierSidebar />

            <div className="portal-main-content animate-fade-in">
                {/* Advanced Header */}
                <header className="advanced-header">
                    <div className="header-left">
                        <h1 className="header-title">Executive Overview</h1>
                        <p className="header-subtitle">Real-time data for {user?.username}</p>
                    </div>
                    <div className="header-actions">
                        <div className="date-filter">This Week <FaArrowDown className="xs-icon" /></div>
                        <button className="icon-btn-circle"><FaBell /></button>
                        <button className="btn-primary" onClick={() => navigate('/supplier/products')}>
                            <FaPlus /> Add Product
                        </button>
                    </div>
                </header>

                {/* Key Performance Indicators (KPIs) */}
                <div className="kpi-grid">
                    <div className="kpi-card" onClick={() => navigate('/supplier/payments')} style={{ cursor: 'pointer' }}>
                        <div className="kpi-top">
                            <span className="kpi-label">Total Revenue</span>
                            <div className="kpi-icon-bg brown"><FaRupeeSign /></div>
                        </div>
                        <div className="kpi-value">₹{stats.totalEarnings.toLocaleString()}</div>
                        <div className="kpi-trend positive">
                            <FaArrowUp /> 12.5% <span>vs last week</span>
                        </div>
                    </div>

                    <div className="kpi-card" onClick={() => navigate('/supplier/orders')} style={{ cursor: 'pointer' }}>
                        <div className="kpi-top">
                            <span className="kpi-label">Active Orders</span>
                            <div className="kpi-icon-bg blue"><FaClipboardList /></div>
                        </div>
                        <div className="kpi-value">{stats.activeOrders}</div>
                        <div className="kpi-trend positive">
                            <FaArrowUp /> 5.2% <span>vs last week</span>
                        </div>
                    </div>

                    <div className="kpi-card" onClick={() => navigate('/supplier/products')} style={{ cursor: 'pointer' }}>
                        <div className="kpi-top">
                            <span className="kpi-label">Total Inventory</span>
                            <div className="kpi-icon-bg green"><FaBox /></div>
                        </div>
                        <div className="kpi-value">{stats.totalProducts}</div>
                        <div className="kpi-trend neutral">
                            <span>Stable</span>
                        </div>
                    </div>

                    <div className="kpi-card" onClick={() => navigate('/supplier/orders')} style={{ cursor: 'pointer' }}>
                        <div className="kpi-top">
                            <span className="kpi-label">Pending Requests</span>
                            <div className="kpi-icon-bg orange"><FaClipboardList /></div>
                        </div>
                        <div className="kpi-value">{stats.pendingRequests}</div>
                        <div className="kpi-trend negative">
                            <FaArrowUp /> {stats.pendingRequests} New <span>needs attention</span>
                        </div>
                    </div>
                </div>

                {/* Main Charts Section */}
                <div className="charts-container-advanced">

                    {/* 1. Main Revenue Chart (Large) */}
                    <div className="chart-panel large-chart">
                        <div className="panel-header">
                            <h3>Revenue Analytics</h3>
                            <button className="icon-btn-flat"><FaEllipsisV /></button>
                        </div>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8B6F47" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#8B6F47" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#8B6F47" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 2. Donut Chart: Inventory Distribution */}
                    <div className="chart-panel">
                        <div className="panel-header">
                            <h3>Inventory Distribution</h3>
                        </div>
                        <div className="chart-wrapper donut-wrapper">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={inventoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {inventoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 3. Donut Chart: Order Status */}
                    <div className="chart-panel">
                        <div className="panel-header">
                            <h3>Order Status</h3>
                        </div>
                        <div className="chart-wrapper donut-wrapper">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={orderStatusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {orderStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 4. Bar Chart: Weekly Comparison */}
                    <div className="chart-panel large-chart">
                        <div className="panel-header">
                            <h3>Weekly Performance</h3>
                            <button className="icon-btn-flat"><FaEllipsisV /></button>
                        </div>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={monthlyPerformance} barSize={40}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                    <RechartsTooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="sales" fill="#8B6F47" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SupplierDashboard;
