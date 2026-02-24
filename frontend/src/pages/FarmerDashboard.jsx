import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    LuLeaf, LuWallet, LuCalendar, LuSun,
    LuCloudRain, LuMapPin, LuArrowUpRight
} from 'react-icons/lu';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import './farmer/FarmerPages.css';

const FarmerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Mock Data for Charts
    const productionData = [
        { name: 'Wheat', value: 400, color: '#2E7D32' }, // Dark Green
        { name: 'Corn', value: 300, color: '#66BB6A' },  // Light Green
        { name: 'Rice', value: 200, color: '#A5D6A7' },  // Pale Green
        { name: 'Others', value: 100, color: '#E8F5E9' } // Very Light
    ];

    const yieldData = [
        { name: 'Jan', yield: 240 },
        { name: 'Feb', yield: 139 },
        { name: 'Mar', yield: 380 }, // Harvest season peak
        { name: 'Apr', yield: 290 },
        { name: 'May', yield: 200 },
        { name: 'Jun', yield: 250 },
        { name: 'Jul', yield: 310 },
    ];

    const tasks = [
        { id: 1, name: 'Fertilize Corn Field', assigned: 'Ram Kumar', due: 'Today', status: 'Pending' },
        { id: 2, name: 'Check Irrigation', assigned: 'Self', due: 'Tomorrow', status: 'In Progress' },
        { id: 3, name: 'Harvest Wheat', assigned: 'Team A', due: '25 Feb', status: 'Completed' },
    ];

    const harvests = [
        { name: 'Tomatoes', amount: '150 tons', icon: '🍅' },
        { name: 'Carrots', amount: '120 tons', icon: '🥕' },
        { name: 'Corn', amount: '200 tons', icon: '🌽' },
    ];

    if (!user) {
        return <div className="adv-loading">Loading Dashboard...</div>;
    }

    return (
        <div className="adv-dashboard-container">

            {/* 1️⃣ TOP HEADER BAR */}
            <header className="adv-header">
                <div>
                    <h1>Good Morning, {user?.username || 'Farmer'}!</h1>
                    <p className="adv-subtitle">Optimize Your Farm Operations with Real-Time Insights</p>
                </div>
                <div className="adv-header-actions">
                    <div className="adv-date-filter">
                        <LuCalendar className="adv-icon-sm" />
                        <span>This Month</span>
                    </div>
                    <button className="adv-btn-primary">
                        Export Report
                    </button>
                    <div className="adv-profile-pill">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                </div>
            </header>

            {/* MAIN GRID LAYOUT */}
            <div className="adv-grid-layout">

                {/* ROW 1: Weather (3) | Production (5) | KPI Stack (4) */}

                {/* 2️⃣ WEATHER CARD */}
                <div className="adv-card adv-weather-card">
                    <div className="adv-card-header-row">
                        <div className="adv-location-pill">
                            <LuMapPin /> Chicago, USA
                        </div>
                        <div className="adv-toggle-pill">°C / °F</div>
                    </div>
                    <div className="adv-weather-main">
                        <div className="adv-weather-temp">
                            24°C
                            <span className="adv-weather-desc">Cloudy</span>
                        </div>
                        <LuCloudRain className="adv-weather-icon-lg" />
                    </div>
                    <div className="adv-weather-footer">
                        <div>
                            <span className="label">Humidity</span>
                            <span className="value">65%</span>
                        </div>
                        <div>
                            <span className="label">Wind</span>
                            <span className="value">12 km/h</span>
                        </div>
                    </div>
                </div>

                {/* 3️⃣ PRODUCTION OVERVIEW CHART */}
                <div className="adv-card adv-production-card">
                    <div className="adv-card-header">
                        <h3>Production Overview</h3>
                        <select className="adv-select-sm">
                            <option>Yearly</option>
                            <option>Monthly</option>
                        </select>
                    </div>
                    <div className="adv-chart-container-production">
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={productionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {productionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="adv-chart-overlay-text">
                            <span className="value">1,000</span>
                            <span className="label">Tons</span>
                        </div>
                    </div>
                </div>

                {/* 4️⃣ LAND & REVENUE KPI STACK */}
                <div className="adv-kpi-stack">
                    <div className="adv-card adv-kpi-card">
                        <div className="adv-kpi-icon green">
                            <LuLeaf />
                        </div>
                        <div className="adv-kpi-content">
                            <span className="label">Total Land Area</span>
                            <div className="value-row">
                                <h3>1,200 acres</h3>
                                <span className="adv-badge positive">
                                    <LuArrowUpRight /> +8.08%
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="adv-card adv-kpi-card">
                        <div className="adv-kpi-icon purple">
                            <LuWallet />
                        </div>
                        <div className="adv-kpi-content">
                            <span className="label">Total Revenue</span>
                            <div className="value-row">
                                <h3>$50,000</h3>
                                <span className="adv-badge positive">
                                    <LuArrowUpRight /> +12.45%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ROW 2: Yield Chart (8) | Field Preview (4) */}

                {/* 5️⃣ MONTHLY YIELD ANALYSIS */}
                <div className="adv-card adv-yield-card">
                    <div className="adv-card-header">
                        <h3>Monthly Yield Analysis</h3>
                        <div className="adv-header-actions-sm">
                            <select className="adv-select-sm"><option>Corn</option><option>Wheat</option></select>
                            <select className="adv-select-sm"><option>2024</option></select>
                        </div>
                    </div>
                    <div className="adv-chart-container-yield">
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={yieldData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
                                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="yield" stroke="#2E7D32" strokeWidth={3} fillOpacity={1} fill="url(#colorYield)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 6️⃣ FIELD PREVIEW CARD */}
                <div className="adv-card adv-field-card" style={{ padding: 0, overflow: 'hidden', position: 'relative', minHeight: '360px', display: 'flex', alignItems: 'flex-end' }}>
                    <img
                        src="/crop_yeild.png"
                        alt="Corn Field"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            zIndex: 0
                        }}
                    />
                    <div className="adv-field-overlay" style={{ position: 'absolute', zIndex: 1, bottom: '24px', left: '24px', right: '24px', width: 'auto', margin: '0' }}>
                        <div className="adv-field-header">
                            <span className="adv-field-badge">Corn Field</span>
                            <button className="adv-btn-text">Details &gt;</button>
                        </div>
                        <div className="adv-field-stats-grid">
                            <div>
                                <span className="label">Crop Health</span>
                                <span className="value">Good 🌿</span>
                            </div>
                            <div>
                                <span className="label">Harvest Time</span>
                                <span className="value">6 Months</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ROW 3: Task Table (8) | Harvest Summary (4) */}

            {/* 7️⃣ TASK MANAGEMENT */}
            <div className="adv-card adv-task-card">
                <div className="adv-card-header">
                    <h3>Task Management</h3>
                    <button className="adv-btn-primary-sm">Add New Task +</button>
                </div>
                <table className="adv-table">
                    <thead>
                        <tr>
                            <th>Task Name</th>
                            <th>Assigned To</th>
                            <th>Due Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map(task => (
                            <tr key={task.id}>
                                <td className="fw-600">{task.name}</td>
                                <td>{task.assigned}</td>
                                <td>{task.due}</td>
                                <td>
                                    <span className={`adv-status-badge ${task.status.toLowerCase().replace(' ', '-')}`}>
                                        {task.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 8️⃣ HARVEST SUMMARY */}
            <div className="adv-card adv-harvest-card">
                <div className="adv-card-header">
                    <h3>Harvest Summary</h3>
                </div>
                <div className="adv-harvest-list">
                    {harvests.map((item, idx) => (
                        <div className="adv-harvest-item" key={idx}>
                            <div className="adv-harvest-icon">{item.icon}</div>
                            <div className="adv-harvest-info">
                                <span className="name">{item.name}</span>
                                <span className="amount">{item.amount}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>

    );
};

export default FarmerDashboard;
