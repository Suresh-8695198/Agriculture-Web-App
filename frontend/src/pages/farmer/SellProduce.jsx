import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    FaPlus, FaEdit, FaTrash, FaTimes, FaSave, FaSearch,
    FaCheckCircle, FaPauseCircle, FaLeaf, FaSeedling,
    FaCarrot, FaAppleAlt, FaCube, FaBoxOpen
} from 'react-icons/fa';
import { MdOutlineFileUpload, MdDashboard } from 'react-icons/md';
import { toast } from 'react-toastify';
import api from '../../api/axios';

/* ─── helpers ─────────────────────────────────────────────────── */
const OPTIONAL_FIELDS = ['harvest_date', 'available_from', 'expiry_date', 'min_order_quantity'];
const IGNORED_FIELDS = ['quantity', 'village', 'district', 'state', 'grade', 'image'];

const buildPayload = (formData, isAvailable) => {
    const payload = new FormData();
    Object.keys(formData).forEach(key => {
        if (IGNORED_FIELDS.includes(key)) return;
        if (OPTIONAL_FIELDS.includes(key)) {
            if (formData[key]) payload.append(key, formData[key]);
        } else {
            payload.append(key, formData[key]);
        }
    });
    const qty = parseFloat(formData.quantity) || 0;
    payload.set('quantity', qty);
    payload.set('available_quantity', qty);
    payload.set('price_per_unit', parseFloat(formData.price_per_unit) || 0);
    payload.set('is_available', isAvailable);
    if (formData.min_order_quantity) {
        payload.set('min_order_quantity', parseFloat(formData.min_order_quantity));
    }
    if (formData.image instanceof File) {
        payload.set('image', formData.image);
    }
    return payload;
};

const EMPTY_FORM = {
    name: '', category: '', variety: '', is_organic: false,
    quantity: '', unit: 'kg', price_per_unit: '', min_order_quantity: '',
    harvest_date: '', available_from: '',
    description: '', is_available: true, image: null,
};

const produceTypes = [
    { value: 'all', label: 'All', icon: <MdDashboard /> },
    { value: 'paddy', label: 'Paddy', icon: <FaSeedling /> },
    { value: 'wheat', label: 'Wheat', icon: <FaCube /> },
    { value: 'vegetables', label: 'Vegetables', icon: <FaCarrot /> },
    { value: 'fruits', label: 'Fruits', icon: <FaAppleAlt /> },
    { value: 'pulses', label: 'Pulses', icon: <FaCube /> },
    { value: 'spices', label: 'Spices', icon: <FaLeaf /> },
    { value: 'other', label: 'Other', icon: <FaBoxOpen /> },
];

const unitOptions = [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'quintal', label: 'Quintal (100 kg)' },
    { value: 'ton', label: 'Ton' },
    { value: 'bag', label: 'Bag' },
    { value: 'bunch', label: 'Bunch' },
    { value: 'dozen', label: 'Dozen' },
];

/* ─── component ───────────────────────────────────────────────── */
const SellProduce = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [togglingId, setTogglingId] = useState(null);

    /* ── fetch ── */
    const fetchListings = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('farmers/my-listings/');
            setListings(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load listings.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchListings(); }, [fetchListings]);

    /* ── form helpers ── */
    const handleInput = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const resetForm = () => {
        setFormData(EMPTY_FORM);
        setIsEditing(false);
        setCurrentId(null);
        setShowForm(false);
    };

    const openEdit = (item) => {
        setFormData({
            name: item.name,
            category: item.category,
            variety: item.variety || '',
            is_organic: item.is_organic || false,
            quantity: item.available_quantity,
            unit: item.unit,
            price_per_unit: item.price_per_unit,
            min_order_quantity: item.min_order_quantity || '',
            harvest_date: item.harvest_date || '',
            available_from: item.available_from || '',
            description: item.description || '',
            is_available: item.is_available,
            image: null,
        });
        setCurrentId(item.id);
        setIsEditing(true);
        setShowForm(true);
    };

    /* ── submit (publish) ── */
    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (!formData.name || !formData.category || !formData.price_per_unit || !formData.quantity) {
            toast.error('Please fill in all required fields (Name, Category, Price, Quantity).');
            return;
        }
        setSubmitting(true);
        try {
            const payload = buildPayload(formData, true);
            if (isEditing) {
                const res = await api.patch(`farmers/produce/${currentId}/`, payload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setListings(prev => prev.map(l => l.id === currentId ? res.data : l));
                toast.success('Listing updated successfully!');
            } else {
                const res = await api.post('farmers/produce/', payload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setListings(prev => [res.data, ...prev]);
                toast.success('Crop published to marketplace!');
            }
            resetForm();
        } catch (err) {
            const msg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
            toast.error(`Error: ${msg}`);
        } finally {
            setSubmitting(false);
        }
    };

    /* ── delete ── */
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this listing?")) return;
        try {
            await api.delete(`farmers/produce/${id}/`);
            setListings(prev => prev.filter(l => l.id !== id));
            toast.success('Listing deleted.');
        } catch {
            toast.error('Failed to delete listing.');
        }
    };

    /* ── filter & sort ── */
    const filtered = useMemo(() => {
        return listings.filter(l => {
            const matchSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchCat = filterCategory === 'all' ? true : l.category === filterCategory;
            return matchSearch && matchCat;
        }).sort((a, b) => {
            if (sortBy === 'price_asc') return parseFloat(a.price_per_unit || 0) - parseFloat(b.price_per_unit || 0);
            if (sortBy === 'price_desc') return parseFloat(b.price_per_unit || 0) - parseFloat(a.price_per_unit || 0);
            return 0; // newest relies on default order from API
        });
    }, [listings, searchTerm, filterCategory, sortBy]);

    /* ── stats ── */
    const totalValue = listings.reduce((acc, curr) => acc + (parseFloat(curr.price_per_unit || 0) * parseFloat(curr.available_quantity || 0)), 0);

    /* ════════════════════════════════════════════════════════════ */
    return (
        <div style={{ display: 'flex', height: '100%', minHeight: '100vh', background: '#FAFAFB', fontFamily: '"Inter", "system-ui", sans-serif', color: '#111827', margin: '-24px', padding: 0 }}>
            {/* Inject minimal scrollbar styles for this component */}
            <style>{`
                .pos-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
                .pos-scroll::-webkit-scrollbar-track { background: transparent; }
                .pos-scroll::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
                .pos-scroll::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }
                .pos-input:focus { outline: none; border-color: #FF5A5F !important; box-shadow: 0 0 0 3px rgba(255, 90, 95, 0.1) !important; }
            `}</style>

            {/* MAIN CONTENT AREA */}
            <div className="pos-scroll" style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>

                {/* HEAD & SEARCH */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36, gap: 24 }}>
                    <div style={{ position: 'relative', maxWidth: 480, width: '100%' }}>
                        <FaSearch style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: 18 }} />
                        <input
                            className="pos-input"
                            type="text"
                            placeholder="Search menu..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%', padding: '16px 20px 16px 52px', boxSizing: 'border-box',
                                borderRadius: 16, border: '1px solid transparent', background: '#FFFFFF',
                                fontSize: 15, fontWeight: 500, color: '#111827',
                                boxShadow: '0 4px 14px rgba(0,0,0,0.02)', transition: 'all 0.2s'
                            }}
                        />
                    </div>
                </div>

                {/* CATEGORIES HORIZONTAL SCROLL */}
                <div style={{ marginBottom: 36 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 20px 0', color: '#111827' }}>Choose Category</h2>
                    <div className="pos-scroll" style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 12, marginRight: -20, paddingRight: 20 }}>
                        {produceTypes.map(type => {
                            const isActive = filterCategory === type.value;
                            return (
                                <div
                                    key={type.value}
                                    onClick={() => setFilterCategory(type.value)}
                                    style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
                                        minWidth: 100, height: 110, borderRadius: 20, flexShrink: 0,
                                        background: '#FFFFFF',
                                        border: isActive ? '2px solid #FF5A5F' : '2px solid transparent',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                                        cursor: 'pointer', transition: 'all 0.2s ease',
                                        transform: isActive ? 'translateY(-2px)' : 'none'
                                    }}
                                >
                                    <div style={{
                                        width: 44, height: 44, borderRadius: 14,
                                        background: isActive ? '#FFF0F0' : '#F3F4F6',
                                        color: isActive ? '#FF5A5F' : '#6B7280',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
                                    }}>
                                        {type.icon}
                                    </div>
                                    <span style={{ fontSize: 14, fontWeight: isActive ? 700 : 600, color: isActive ? '#FF5A5F' : '#6B7280' }}>
                                        {type.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* MENU / GRID AREA */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Crop Menu</h2>
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            style={{
                                background: 'transparent', border: 'none', color: '#9CA3AF',
                                fontSize: 14, fontWeight: 600, cursor: 'pointer', outline: 'none'
                            }}
                        >
                            <option value="newest">Sort by A-Z</option>
                            <option value="price_asc">Price Low to High</option>
                            <option value="price_desc">Price High to Low</option>
                        </select>
                    </div>

                    {loading ? (
                        <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontWeight: 600 }}>Loading menu...</div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF', fontWeight: 600, background: '#fff', borderRadius: 24, border: '2px dashed #E5E7EB' }}>
                            No crops found. Add a new crop to get started!
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
                            {filtered.map(item => (
                                <div key={item.id} style={{
                                    background: '#FFFFFF', borderRadius: 24, padding: 14,
                                    display: 'flex', flexDirection: 'column',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                                    transition: 'transform 0.2s', position: 'relative'
                                }}>
                                    {/* Image box */}
                                    <div style={{ height: 180, borderRadius: 18, background: '#F3F4F6', overflow: 'hidden', position: 'relative', marginBottom: 16 }}>
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 40 }}>
                                                <FaBoxOpen />
                                            </div>
                                        )}
                                        {/* Status badge */}
                                        <div style={{
                                            position: 'absolute', top: 12, right: 12,
                                            background: '#FFFFFF', padding: '4px 10px', borderRadius: 10,
                                            fontSize: 12, fontWeight: 700, color: item.is_available ? '#10B981' : '#F59E0B',
                                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                        }}>
                                            {item.is_available ? 'Active' : 'Paused'}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div style={{ padding: '0 6px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px 0', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {item.name}
                                        </h3>
                                        <div style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginBottom: 16 }}>
                                            ₹{item.price_per_unit} <span style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 600 }}>/ {item.unit}</span>
                                        </div>

                                        {/* Specs Row */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 600 }}>Type</span>
                                                <span style={{ fontSize: 13, color: item.is_organic ? '#10B981' : '#111827', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    {item.is_organic && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }}></span>}
                                                    {item.is_organic ? 'Organic' : 'Standard'}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                                                <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 600 }}>Stock Level</span>
                                                <span style={{ fontSize: 13, color: item.available_quantity > 0 ? '#111827' : '#EF4444', fontWeight: 600 }}>
                                                    {item.available_quantity} {item.unit}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action */}
                                        <button
                                            onClick={() => openEdit(item)}
                                            style={{
                                                marginTop: 'auto', width: '100%', padding: '14px', borderRadius: 14,
                                                background: '#FF5A5F', color: '#FFFFFF', border: 'none',
                                                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                                                transition: 'background 0.2s',
                                                boxShadow: '0 4px 12px rgba(255, 90, 95, 0.2)'
                                            }}
                                            onMouseEnter={e => e.target.style.background = '#F04C51'}
                                            onMouseLeave={e => e.target.style.background = '#FF5A5F'}
                                        >
                                            Edit Listing
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* SIDEBAR / SUMMARY AREA */}
            <div style={{ width: 380, background: '#FFFFFF', borderLeft: '1px solid #F3F4F6', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                <div style={{ padding: '36px 32px 20px', borderBottom: '1px solid transparent' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: '#111827' }}>Summary</h2>
                        <span style={{ color: '#9CA3AF' }}>•••</span>
                    </div>
                </div>

                {/* List of active standard items visually representing "Bills" */}
                <div className="pos-scroll" style={{ flex: 1, padding: '0 32px', overflowY: 'auto' }}>
                    {listings.slice(0, 6).map(l => (
                        <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                            <div style={{ width: 56, height: 56, borderRadius: 14, background: '#F3F4F6', overflow: 'hidden', flexShrink: 0 }}>
                                {l.image && <img src={l.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.name}</div>
                                <div style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 500, marginTop: 2 }}>{l.available_quantity} {l.unit}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>₹{l.price_per_unit}</div>
                            </div>
                        </div>
                    ))}
                    {listings.length === 0 && (
                        <div style={{ color: '#9CA3AF', fontSize: 14, textAlign: 'center', marginTop: 40 }}>No listings recorded yet.</div>
                    )}
                </div>

                {/* Totals & Action at Bottom */}
                <div style={{ padding: '24px 32px 32px', background: '#FFFFFF', borderTop: '2px dashed #F3F4F6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14, color: '#6B7280', fontWeight: 600 }}>
                        <span>Total Listings</span>
                        <span style={{ color: '#111827' }}>{listings.length} items</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, fontSize: 14, color: '#6B7280', fontWeight: 600 }}>
                        <span>Active Crops</span>
                        <span style={{ color: '#111827' }}>{listings.filter(l => l.is_available).length}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>Est. Total Value</span>
                        <span style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>
                            ₹{totalValue.toLocaleString('en-IN')}
                        </span>
                    </div>

                    {/* Payment Method equivalent -> Extra badges */}
                    <div style={{ marginBottom: 24 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Quick Actions</div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <div style={{ flex: 1, background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px', borderRadius: 12, textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                                Refresh
                            </div>
                            <div style={{ flex: 1, background: '#FFF0F0', border: '1px solid #FF5A5F', padding: '12px', borderRadius: 12, textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#FF5A5F', cursor: 'pointer' }}>
                                Reports
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => { resetForm(); setShowForm(true); }}
                        style={{
                            width: '100%', padding: '18px', borderRadius: 16,
                            background: '#FF5A5F', color: '#FFFFFF', border: 'none',
                            fontSize: 16, fontWeight: 800, cursor: 'pointer',
                            boxShadow: '0 8px 24px rgba(255, 90, 95, 0.25)',
                            transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8
                        }}
                        onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 12px 28px rgba(255, 90, 95, 0.35)'; }}
                        onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 8px 24px rgba(255, 90, 95, 0.25)'; }}
                    >
                        <FaPlus /> Add New Menu Item
                    </button>
                </div>
            </div>

            {/* ══════════════════ MODAL FORM (Solid & Clean) ══════════════════ */}
            {showForm && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(17,24,39,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: '#FFFFFF', width: '100%', maxWidth: 640, borderRadius: 24, display: 'flex', flexDirection: 'column', maxHeight: '90vh', boxShadow: '0 24px 48px rgba(0,0,0,0.1)' }}>
                        <div style={{ padding: '24px 32px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: '#111827' }}>{isEditing ? 'Edit Menu Item' : 'New Menu Item'}</h2>
                            <button onClick={resetForm} style={{ background: '#F3F4F6', border: 'none', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', cursor: 'pointer' }}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="pos-scroll" style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Item Name *</label>
                                    <input className="pos-input" type="text" name="name" value={formData.name} onChange={handleInput} style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #E5E7EB', background: '#F9FAFB', fontSize: 15, boxSizing: 'border-box' }} required />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Category *</label>
                                    <select className="pos-input" name="category" value={formData.category} onChange={handleInput} style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #E5E7EB', background: '#F9FAFB', fontSize: 15, boxSizing: 'border-box' }} required>
                                        <option value="">Select Category</option>
                                        {produceTypes.filter(t => t.value !== 'all').map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Price (₹) *</label>
                                    <input className="pos-input" type="number" name="price_per_unit" value={formData.price_per_unit} onChange={handleInput} style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #E5E7EB', background: '#F9FAFB', fontSize: 15, boxSizing: 'border-box' }} required />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Stock Quantity *</label>
                                    <input className="pos-input" type="number" name="quantity" value={formData.quantity} onChange={handleInput} style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #E5E7EB', background: '#F9FAFB', fontSize: 15, boxSizing: 'border-box' }} required />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Unit *</label>
                                    <select className="pos-input" name="unit" value={formData.unit} onChange={handleInput} style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #E5E7EB', background: '#F9FAFB', fontSize: 15, boxSizing: 'border-box' }} required>
                                        {unitOptions.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                                    </select>
                                </div>

                                <div style={{ gridColumn: '1 / -1', padding: '16px', borderRadius: 12, background: '#F3F4F6', display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <input type="checkbox" name="is_organic" checked={formData.is_organic} onChange={handleInput} style={{ width: 20, height: 20, accentColor: '#10B981', cursor: 'pointer' }} />
                                    <label style={{ fontSize: 15, fontWeight: 700, color: '#111827', cursor: 'pointer' }}>Mark as Organic Certified</label>
                                </div>

                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Item Image</label>
                                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 120, border: '2px dashed #D1D5DB', borderRadius: 12, background: '#F9FAFB', cursor: 'pointer', transition: 'all 0.2s', ...formData.image ? { borderColor: '#10B981', background: '#ECFDF5' } : {} }}>
                                        <input type="file" name="image" accept="image/*" style={{ display: 'none' }} onChange={e => setFormData(prev => ({ ...prev, image: e.target.files[0] || null }))} />
                                        <MdOutlineFileUpload size={28} color={formData.image ? '#10B981' : '#9CA3AF'} style={{ marginBottom: 8 }} />
                                        <span style={{ fontSize: 14, fontWeight: 600, color: formData.image ? '#10B981' : '#6B7280' }}>
                                            {formData.image instanceof File ? formData.image.name : 'Upload Image (Max 5MB)'}
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '24px 32px', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {isEditing ? (
                                <button onClick={() => handleDelete(currentId)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 12, background: '#FFF0F0', color: '#EF4444', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                                    <FaTrash /> Delete
                                </button>
                            ) : <div></div>}

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button onClick={resetForm} style={{ padding: '14px 24px', borderRadius: 12, background: '#F3F4F6', color: '#374151', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                                    Cancel
                                </button>
                                <button onClick={handleSubmit} disabled={submitting} style={{ padding: '14px 28px', borderRadius: 12, background: '#FF5A5F', color: '#FFFFFF', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 12px rgba(255, 90, 95, 0.25)' }}>
                                    {submitting ? 'Saving...' : 'Save to Menu'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellProduce;
