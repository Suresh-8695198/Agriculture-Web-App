import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    FaSearch, FaBox, FaHistory, FaExclamationTriangle, FaPlus, FaMinus,
    FaArrowUp, FaArrowDown, FaFilter, FaSyncAlt, FaChartPie, FaList
} from 'react-icons/fa';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import SupplierSidebar from '../../components/SupplierSidebar';
import '../SupplierPortal.css';

const InventoryManagement = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'activity'

    // Adjustment Modal State
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [adjustQuantity, setAdjustQuantity] = useState('');
    const [adjustType, setAdjustType] = useState('restock');
    const [adjustNote, setAdjustNote] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [productsRes, statsRes] = await Promise.all([
                api.get('suppliers/products/my_products/'),
                api.get('suppliers/products/inventory_stats/')
            ]);
            setProducts(productsRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Failed to fetch inventory data:', error);
            toast.error('Failed to load inventory');
        } finally {
            setLoading(false);
        }
    };

    const handleAdjustStock = async (e) => {
        e.preventDefault();
        try {
            const quantity = adjustType === 'restock' ? parseInt(adjustQuantity) : -parseInt(adjustQuantity);
            await api.post(`suppliers/products/${selectedProduct.id}/adjust_stock/`, {
                quantity: quantity,
                change_type: adjustType,
                note: adjustNote
            });
            toast.success('Inventory updated successfully');
            setShowAdjustModal(false);
            setAdjustQuantity('');
            setAdjustNote('');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update stock');
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ['seeds', 'fertilizer', 'manure', 'plant_food', 'tractor', 'equipment', 'pesticide', 'tools', 'other'];
    const COLORS = ['#8B6F47', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#1F2937'];

    if (loading && !stats) {
        return (
            <div className="supplier-portal-layout">
                <SupplierSidebar />
                <div className="portal-main-content">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading your inventory...</p>
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
                        <h1 className="portal-title">Inventory & Stock Control</h1>
                        <p className="portal-subtitle">Advanced warehouse management and batch tracking</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn-secondary-supplier" onClick={fetchData}>
                            <FaSyncAlt /> Refresh
                        </button>
                        <button className={`btn-icon-toggle ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="Item List">
                            <FaList />
                        </button>
                        <button className={`btn-icon-toggle ${viewMode === 'activity' ? 'active' : ''}`} onClick={() => setViewMode('activity')} title="Activity Logs">
                            <FaHistory />
                        </button>
                    </div>
                </div>

                {/* KPI Overview */}
                <div className="inventory-stats-row">
                    <div className="stat-box">
                        <div className="stat-icon-wrap blue">
                            <FaBox />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Total SKUs</span>
                            <span className="stat-number">{stats?.total_items}</span>
                        </div>
                    </div>
                    <div className="stat-box warning">
                        <div className="stat-icon-wrap orange">
                            <FaExclamationTriangle />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Low Stock Alerts</span>
                            <span className="stat-number">{stats?.low_stock_count}</span>
                        </div>
                    </div>
                    <div className="stat-box danger">
                        <div className="stat-icon-wrap red">
                            <FaBox />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Out of Stock</span>
                            <span className="stat-number">{stats?.out_of_stock_count}</span>
                        </div>
                    </div>
                    <div className="stat-box success">
                        <div className="stat-icon-wrap green">
                            <FaHistory />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Recent Updates</span>
                            <span className="stat-number">{stats?.recent_activity?.length || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="inventory-content-grid">
                    {/* Main Content Area */}
                    <div className="inventory-main-panel">
                        {viewMode === 'list' ? (
                            <div className="section-card no-padding overflow-hidden">
                                <div className="card-controls">
                                    <div className="search-pill">
                                        <FaSearch />
                                        <input
                                            type="text"
                                            placeholder="Search inventory..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <select
                                        className="filter-select"
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        <option value="all">All Categories</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat.replace('_', ' ').charAt(0).toUpperCase() + cat.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="modern-table-container">
                                    <table className="modern-table">
                                        <thead>
                                            <tr>
                                                <th>Product Details</th>
                                                <th>Category</th>
                                                <th>Stock Level</th>
                                                <th>Financials</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredProducts.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="empty-row">No matching products found</td>
                                                </tr>
                                            ) : (
                                                filteredProducts.map(product => (
                                                    <tr key={product.id}>
                                                        <td>
                                                            <div className="table-product-cell">
                                                                <img src={product.image || 'https://via.placeholder.com/40'} alt={product.name} />
                                                                <div>
                                                                    <div className="cell-title">{product.name}</div>
                                                                    <div className="cell-subline">ID: SKU-{product.id.toString().padStart(5, '0')}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className="badge-outline">{product.category}</span>
                                                        </td>
                                                        <td>
                                                            <div className="stock-level-cell">
                                                                <div className="stock-number">
                                                                    {product.stock_quantity} <span className="cell-unit">{product.unit}</span>
                                                                </div>
                                                                <div className="stock-progress-bg">
                                                                    <div
                                                                        className={`stock-progress-fill ${product.stock_quantity < 10 ? 'danger' : product.stock_quantity < 50 ? 'warning' : 'success'}`}
                                                                        style={{ width: `${Math.min(100, product.stock_quantity)}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="cell-title">₹{product.price}</div>
                                                            <div className="cell-subline">Net Value: ₹{(product.price * product.stock_quantity).toLocaleString()}</div>
                                                        </td>
                                                        <td>
                                                            <div className="table-actions">
                                                                <button
                                                                    className="btn-circle-adjust success"
                                                                    onClick={() => {
                                                                        setSelectedProduct(product);
                                                                        setAdjustType('restock');
                                                                        setShowAdjustModal(true);
                                                                    }}
                                                                    title="Restock"
                                                                >
                                                                    <FaPlus />
                                                                </button>
                                                                <button
                                                                    className="btn-circle-adjust danger"
                                                                    onClick={() => {
                                                                        setSelectedProduct(product);
                                                                        setAdjustType('adjustment');
                                                                        setShowAdjustModal(true);
                                                                    }}
                                                                    title="Deduct"
                                                                >
                                                                    <FaMinus />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="section-card activity-log-panel">
                                <h3 className="panel-title"><FaHistory /> Stock Movement History</h3>
                                <div className="activity-timeline">
                                    {stats?.recent_activity.length === 0 ? (
                                        <p className="empty-msg">No recent activity logs.</p>
                                    ) : (
                                        stats?.recent_activity.map(log => (
                                            <div key={log.id} className="timeline-item">
                                                <div className={`timeline-icon ${log.quantity > 0 ? 'plus' : 'minus'}`}>
                                                    {log.quantity > 0 ? <FaPlus /> : <FaMinus />}
                                                </div>
                                                <div className="timeline-content">
                                                    <div className="timeline-header">
                                                        <span className="log-product">{log.product_name}</span>
                                                        <span className="log-time">{new Date(log.created_at).toLocaleString()}</span>
                                                    </div>
                                                    <div className="log-details">
                                                        <span className={`log-qty ${log.quantity > 0 ? 'text-success' : 'text-danger'}`}>
                                                            {log.quantity > 0 ? '+' : ''}{log.quantity} units
                                                        </span>
                                                        <span className="log-type">{log.change_type_display}</span>
                                                        {log.note && <p className="log-note">"{log.note}"</p>}
                                                    </div>
                                                    <div className="log-footer">
                                                        Adjusted by: {log.updated_by_name || 'System'} •
                                                        Stock: {log.previous_stock} → {log.current_stock}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Area */}
                    <div className="inventory-side-panel">
                        <div className="section-card analytic-card">
                            <h4 className="panel-title"><FaChartPie /> Category Hub</h4>
                            <div style={{ height: '200px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats?.category_distribution || []}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={5}
                                            dataKey="count"
                                            nameKey="category"
                                        >
                                            {stats?.category_distribution?.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="category-legend">
                                {stats?.category_distribution?.map((entry, index) => (
                                    <div key={entry.category} className="legend-item">
                                        <span className="dot" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                        <span className="label text-capitalize">{entry.category}</span>
                                        <span className="value">{entry.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="section-card alert-card">
                            <h4 className="panel-title danger"><FaExclamationTriangle /> Critical Alerts</h4>
                            {stats?.low_stock_list.length === 0 ? (
                                <p className="success-msg">All stock levels are healthy.</p>
                            ) : (
                                <div className="alert-list">
                                    {stats?.low_stock_list.map(p => (
                                        <div key={p.id} className="alert-item">
                                            <div className="alert-info">
                                                <span className="name">{p.name}</span>
                                                <span className="stock">Only {p.stock_quantity} {p.unit} left</span>
                                            </div>
                                            <button
                                                className="btn-text-action"
                                                onClick={() => {
                                                    setSelectedProduct(p);
                                                    setAdjustType('restock');
                                                    setShowAdjustModal(true);
                                                }}
                                            >Quick Restock</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Adjustment Modal */}
            {showAdjustModal && (
                <div className="modal-overlay">
                    <div className="modal-content-supplier modern-modal">
                        <div className="modal-header-advanced">
                            <h3>Stock Adjustment</h3>
                            <button className="close-modal" onClick={() => setShowAdjustModal(false)}>&times;</button>
                        </div>
                        <div className="modal-subheader">
                            <p>Adjusting stock for: <strong>{selectedProduct?.name}</strong></p>
                            <p className="current-badge">Current Stock: {selectedProduct?.stock_quantity} {selectedProduct?.unit}</p>
                        </div>

                        <form onSubmit={handleAdjustStock} className="modern-form">
                            <div className="form-group-toggle">
                                <button
                                    type="button"
                                    className={`toggle-btn ${adjustType === 'restock' ? 'active success' : ''}`}
                                    onClick={() => setAdjustType('restock')}
                                >
                                    <FaPlus /> Restock
                                </button>
                                <button
                                    type="button"
                                    className={`toggle-btn ${adjustType !== 'restock' ? 'active danger' : ''}`}
                                    onClick={() => setAdjustType('adjustment')}
                                >
                                    <FaMinus /> Adjustment
                                </button>
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Quantity to {adjustType === 'restock' ? 'Add' : 'Deduct'}</label>
                                    <input
                                        type="number"
                                        className="form-control-advanced"
                                        required
                                        value={adjustQuantity}
                                        onChange={(e) => setAdjustQuantity(e.target.value)}
                                        placeholder="Enter amount..."
                                        min="1"
                                    />
                                </div>
                                {adjustType !== 'restock' && (
                                    <div className="form-group">
                                        <label>Adjustment Reason</label>
                                        <select
                                            className="form-control-advanced"
                                            value={adjustType}
                                            onChange={(e) => setAdjustType(e.target.value)}
                                        >
                                            <option value="adjustment">General Adjustment</option>
                                            <option value="damaged">Damage / Waste</option>
                                            <option value="return">Customer Return</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Internal Note (Optional)</label>
                                <textarea
                                    className="form-control-advanced"
                                    value={adjustNote}
                                    onChange={(e) => setAdjustNote(e.target.value)}
                                    placeholder="Add details about this change..."
                                    rows="1"
                                ></textarea>
                            </div>

                            <div className="modal-footer-advanced">
                                <button type="button" className="btn-secondary-flat" onClick={() => setShowAdjustModal(false)}>Cancel</button>
                                <button type="submit" className={`btn-primary-advanced ${adjustType === 'restock' ? 'success' : 'danger'}`}>
                                    Update Inventory
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .portal-main-content {
                    animation: fadeUp 0.6s ease-out;
                }

                .inventory-stats-row {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2.5rem;
                }

                .stat-box {
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(10px);
                    padding: 1.75rem;
                    border-radius: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }

                .stat-box:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.1);
                }

                .stat-box::after {
                    content: '';
                    position: absolute;
                    top: 0; right: 0;
                    width: 60px; height: 60px;
                    background: linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 100%);
                    border-radius: 0 0 0 100%;
                }

                .stat-icon-wrap {
                    width: 56px;
                    height: 56px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.08);
                }

                .stat-icon-wrap.blue { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; }
                .stat-icon-wrap.orange { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; }
                .stat-icon-wrap.red { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; }
                .stat-icon-wrap.green { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
                
                .stat-label { font-size: 0.75rem; color: #6b7280; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; }
                .stat-number { font-size: 1.75rem; font-weight: 800; color: #111827; }

                .inventory-content-grid {
                    display: grid;
                    grid-template-columns: 1fr 340px;
                    gap: 2rem;
                }

                .section-card {
                    background: white;
                    border-radius: 1.5rem;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
                    border: 1px solid #f3f4f6;
                    overflow: hidden;
                }

                .card-controls {
                    padding: 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    background: #ffffff;
                    border-bottom: 1px solid #f3f4f6;
                    gap: 1.5rem;
                }

                .search-pill {
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 1rem;
                    display: flex;
                    align-items: center;
                    padding: 0 1.25rem;
                    flex: 1;
                    max-width: 450px;
                    transition: all 0.3s ease;
                }

                .search-pill:focus-within {
                    background: white;
                    border-color: #8B6F47;
                    box-shadow: 0 0 0 4px rgba(139, 111, 71, 0.1);
                }

                .search-pill input {
                    border: none; outline: none; padding: 0.75rem 0; width: 100%;
                    font-size: 0.9375rem; background: transparent;
                }

                .filter-select {
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 1rem;
                    padding: 0 1.25rem;
                    font-size: 0.9375rem;
                    color: #374151;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .filter-select:hover { border-color: #d1d5db; }

                .modern-table th {
                    padding: 1.25rem 1.5rem;
                    background: #f9fafb;
                    color: #6b7280;
                    font-weight: 700;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .modern-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid #f3f4f6; }

                .table-product-cell img {
                    width: 52px; height: 52px;
                    border-radius: 12px;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
                }

                .cell-title { font-size: 1rem; font-weight: 700; color: #111827; }

                .stock-progress-bg {
                    height: 8px;
                    background: #f3f4f6;
                    border-radius: 10px;
                    margin-top: 0.5rem;
                }

                .btn-circle-adjust {
                    width: 36px; height: 36px;
                    border-radius: 10px;
                    font-size: 0.875rem;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                }

                .activity-log-panel { padding: 2rem; }
                .panel-title {
                    font-size: 1.25rem; font-weight: 800; color: #111827;
                    margin-bottom: 2rem; display: flex; align-items: center; gap: 0.75rem;
                }

                .timeline-icon {
                    width: 36px; height: 36px;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                }

                .analytic-card { padding: 1.5rem; }
                .category-legend {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 0.5rem;
                    margin-top: 1.5rem;
                    background: #f9fafb;
                    padding: 1rem;
                    border-radius: 1rem;
                }

                .alert-item {
                    border: none;
                    background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.08);
                    border-left: 4px solid #ef4444;
                    padding: 1rem;
                    margin-bottom: 1rem;
                    border-radius: 0 1rem 1rem 0;
                }

                .modern-modal {
                    border-radius: 2rem;
                    overflow: hidden;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                }

                .modal-header-advanced {
                    background: linear-gradient(135deg, #8B6F47 0%, #5d4a2f 100%);
                    color: white;
                    padding: 2rem;
                }
                
                .modal-header-advanced h3 { font-size: 1.5rem; font-weight: 800; }
                .close-modal { color: white; opacity: 0.8; }
                .close-modal:hover { opacity: 1; }

                .modal-subheader { background: #f9fafb; padding: 1.5rem 2rem; }

                .toggle-btn {
                    padding: 1rem;
                    border-radius: 1rem;
                    font-weight: 700;
                    letter-spacing: 0.025em;
                }

                .btn-primary-advanced {
                    padding: 1rem;
                    border-radius: 1rem;
                    font-size: 1rem;
                    letter-spacing: 0.05em;
                }

                @media (max-width: 1200px) {
                    .inventory-content-grid { grid-template-columns: 1fr; }
                }
            `}} />
        </div>
    );
};

export default InventoryManagement;
