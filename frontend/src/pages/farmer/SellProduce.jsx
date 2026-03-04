
import React, { useState, useEffect, useCallback } from 'react';
import {
    FaPlus, FaEdit, FaTrash, FaTimes, FaSave, FaSearch,
    FaFilter, FaBoxOpen, FaClipboardList, FaCheckCircle,
    FaPauseCircle, FaPlayCircle, FaCalendarAlt, FaEyeSlash,
    FaEye, FaCheckSquare, FaRegSquare, FaLeaf,
    FaTractor, FaCarrot, FaAppleAlt, FaCube, FaSeedling,
    FaSortAmountDown, FaExclamationCircle
} from 'react-icons/fa';
import { MdShoppingBasket, MdDashboard, MdTimer, MdOutlineFileUpload } from 'react-icons/md';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import './FarmerPages.css';

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
    { value: 'paddy', label: 'Paddy / Rice', icon: <FaSeedling size={32} color="#166534" /> },
    { value: 'wheat', label: 'Wheat', icon: <FaSeedling size={32} color="#D97706" /> },
    { value: 'vegetables', label: 'Vegetables', icon: <FaCarrot size={32} color="#EA580C" /> },
    { value: 'fruits', label: 'Fruits', icon: <FaAppleAlt size={32} color="#DC2626" /> },
    { value: 'pulses', label: 'Pulses', icon: <FaCube size={32} color="#65A30D" /> },
    { value: 'spices', label: 'Spices', icon: <FaLeaf size={32} color="#991B1B" /> },
    { value: 'other', label: 'Other', icon: <FaBoxOpen size={32} color="#4B5563" /> },
];

const unitOptions = [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'quintal', label: 'Quintal (100 kg)' },
    { value: 'ton', label: 'Ton' },
    { value: 'bag', label: 'Bag' },
    { value: 'bunch', label: 'Bunch' },
    { value: 'dozen', label: 'Dozen' },
];

const categoryIcon = (cat) => {
    const found = produceTypes.find(t => t.value === cat);
    return found ? found.icon : <FaBoxOpen size={32} color="#4B5563" />;
};

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
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectionMode, setSelectionMode] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null); // {id} or 'bulk'
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

    /* ── save draft ── */
    const handleSaveDraft = async () => {
        if (!formData.name || !formData.category || !formData.price_per_unit || !formData.quantity) {
            toast.error('Please fill Name, Category, Price and Quantity before saving draft.');
            return;
        }
        setSubmitting(true);
        try {
            const payload = buildPayload(formData, false);
            if (isEditing) {
                // Update existing, mark inactive
                payload.set('is_available', false);
                const res = await api.patch(`farmers/produce/${currentId}/`, payload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setListings(prev => prev.map(l => l.id === currentId ? res.data : l));
                toast.success('Draft saved (listing is paused).');
            } else {
                const res = await api.post('farmers/produce/save-draft/', payload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setListings(prev => [res.data, ...prev]);
                toast.success('Saved as draft — not visible to buyers yet.');
            }
            resetForm();
        } catch (err) {
            const msg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
            toast.error(`Error: ${msg}`);
        } finally {
            setSubmitting(false);
        }
    };

    /* ── pause / resume toggle ── */
    const handleToggle = async (id) => {
        setTogglingId(id);
        try {
            const res = await api.patch(`farmers/produce/${id}/toggle_availability/`);
            const updated = res.data?.data || res.data;
            setListings(prev => prev.map(l => l.id === id ? { ...l, ...updated } : l));
            const word = updated.is_available ? 'Resumed' : 'Paused';
            toast.success(`${word} — listing updated.`);
        } catch (err) {
            toast.error('Failed to toggle listing status.');
        } finally {
            setTogglingId(null);
        }
    };

    /* ── delete (single) ── */
    const handleDelete = async (id) => {
        try {
            await api.delete(`farmers/produce/${id}/`);
            setListings(prev => prev.filter(l => l.id !== id));
            toast.success('Listing deleted.');
        } catch {
            toast.error('Failed to delete listing.');
        } finally {
            setDeleteConfirm(null);
        }
    };

    /* ── bulk delete ── */
    const handleBulkDelete = async () => {
        try {
            await api.delete('farmers/produce/bulk-delete/', { data: { ids: selectedIds } });
            setListings(prev => prev.filter(l => !selectedIds.includes(l.id)));
            setSelectedIds([]);
            setSelectionMode(false);
            toast.success(`${selectedIds.length} listing(s) deleted.`);
        } catch {
            toast.error('Bulk delete failed.');
        } finally {
            setDeleteConfirm(null);
        }
    };

    /* ── selection ── */
    const toggleSelect = (id) =>
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );

    const toggleSelectAll = () => {
        const visibleIds = filtered.map(l => l.id);
        const allSelected = visibleIds.every(id => selectedIds.includes(id));
        setSelectedIds(allSelected ? [] : visibleIds);
    };

    /* ── filter & sort ── */
    const filtered = listings.filter(l => {
        const matchSearch =
            l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus =
            filterStatus === 'all' ? true :
                filterStatus === 'active' ? l.is_available :
                    filterStatus === 'draft' ? !l.is_available : true;
        const matchCat = filterCategory === 'all' ? true : l.category === filterCategory;
        return matchSearch && matchStatus && matchCat;
    }).sort((a, b) => {
        if (sortBy === 'price_asc') return parseFloat(a.price_per_unit || 0) - parseFloat(b.price_per_unit || 0);
        if (sortBy === 'price_desc') return parseFloat(b.price_per_unit || 0) - parseFloat(a.price_per_unit || 0);
        if (sortBy === 'qty_desc') return parseFloat(b.available_quantity || 0) - parseFloat(a.available_quantity || 0);
        return 0;
    });

    /* ── stats ── */
    const totalListings = listings.length;
    const activeListings = listings.filter(l => l.is_available).length;
    const draftListings = listings.filter(l => !l.is_available).length;
    const soldOut = listings.filter(l => parseFloat(l.available_quantity) <= 0).length;

    /* ════════════════════════════════════════════════════════════ */
    return (
        <div className="adv-dashboard-container" style={{ background: '#F4F8F6', minHeight: '100vh' }}>

            {/* ── HEADER ── */}
            <header className="adv-header" style={{ marginBottom: 36, background: '#fff', padding: '32px 36px', borderRadius: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ background: '#F0FDF4', padding: 20, borderRadius: 20, color: '#15803D' }}>
                        <FaTractor size={36} />
                    </div>
                    <div>
                        <h1 style={{ color: '#111827', fontSize: 32, marginBottom: 8, fontWeight: 800, letterSpacing: '-0.5px' }}>
                            Sell Your Crops
                        </h1>
                        <p style={{ color: '#6B7280', fontSize: '1.05rem', margin: 0, fontWeight: 500 }}>
                            Easily manage all your produce listings in one place.
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                    {selectionMode ? (
                        <>
                            <span style={{ color: '#4B5563', fontSize: 15, alignSelf: 'center', fontWeight: 700, padding: '0 8px' }}>
                                {selectedIds.length} selected
                            </span>
                            <button
                                onClick={toggleSelectAll}
                                style={{ padding: '12px 24px', fontSize: 14, borderRadius: 14, fontWeight: 700, background: '#F3F4F6', color: '#374151', border: 'none', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}
                                onMouseEnter={e => e.target.style.background = '#E5E7EB'}
                                onMouseLeave={e => e.target.style.background = '#F3F4F6'}
                            >
                                {filtered.every(l => selectedIds.includes(l.id)) ? <><FaRegSquare size={16} /> Deselect All</> : <><FaCheckSquare size={16} /> Select All</>}
                            </button>
                            <button
                                onClick={() => { setSelectionMode(false); setSelectedIds([]); }}
                                style={{ padding: '12px 24px', fontSize: 14, borderRadius: 14, fontWeight: 700, background: '#fff', color: '#4B5563', border: '2px solid #E5E7EB', cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.target.style.background = '#F9FAFB'; e.target.style.borderColor = '#D1D5DB'; }}
                                onMouseLeave={e => { e.target.style.background = '#fff'; e.target.style.borderColor = '#E5E7EB'; }}
                            >
                                Cancel
                            </button>
                            {selectedIds.length > 0 && (
                                <button
                                    style={{ padding: '12px 24px', fontSize: 14, background: '#DC2626', color: '#fff', border: 'none', borderRadius: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)' }}
                                    onClick={() => setDeleteConfirm('bulk')}
                                >
                                    <FaTrash size={15} /> Delete Selected
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setSelectionMode(true)}
                                style={{ padding: '14px 24px', fontSize: 15, borderRadius: 14, fontWeight: 700, background: '#F3F4F6', color: '#111827', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.2s' }}
                                onMouseEnter={e => e.target.style.background = '#E5E7EB'}
                                onMouseLeave={e => e.target.style.background = '#F3F4F6'}
                            >
                                <FaCheckSquare size={18} color="#6B7280" /> Select Multiple
                            </button>
                            <button
                                onClick={() => { resetForm(); setShowForm(true); }}
                                style={{ padding: '14px 28px', fontSize: 15, borderRadius: 14, fontWeight: 800, background: '#15803D', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 20px rgba(21, 128, 61, 0.3)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                                onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 12px 24px rgba(21, 128, 61, 0.4)'; }}
                                onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 8px 20px rgba(21, 128, 61, 0.3)'; }}
                            >
                                <FaPlus size={16} /> Add New Crop
                            </button>
                        </>
                    )}
                </div>
            </header>

            {/* ── STATS ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, marginBottom: 36 }}>
                {[
                    { icon: <FaClipboardList size={26} />, num: totalListings, label: 'Total Listings', bg: '#F9FAFB', color: '#111827', accent: '#374151' },
                    { icon: <FaCheckCircle size={26} />, num: activeListings, label: 'Active', bg: '#F0FDF4', color: '#166534', accent: '#15803D' },
                    { icon: <FaPauseCircle size={26} />, num: draftListings, label: 'Paused', bg: '#FFFBEB', color: '#B45309', accent: '#D97706' },
                    { icon: <FaBoxOpen size={26} />, num: soldOut, label: 'Sold Out', bg: '#FEF2F2', color: '#991B1B', accent: '#DC2626' },
                ].map(({ icon, num, label, bg, color, accent }) => (
                    <div key={label} style={{ background: '#fff', padding: '28px', borderRadius: 24, border: 'none', display: 'flex', alignItems: 'center', gap: 20, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)' }}>
                        <div style={{ background: bg, width: 68, height: 68, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: accent }}>
                            {icon}
                        </div>
                        <div>
                            <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</span>
                            <h3 style={{ margin: 0, fontSize: 32, color: color, fontWeight: 800, lineHeight: 1 }}>{num}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── SEARCH + FILTER BAR ── */}
            <div style={{ background: '#fff', padding: '24px 32px', borderRadius: 24, marginBottom: 36, border: 'none', display: 'flex', flexDirection: 'column', gap: 24, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)' }}>
                {/* Search Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <FaSearch style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: 18 }} />
                        <input
                            type="text"
                            placeholder="Search your crops..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '16px 16px 16px 52px', borderRadius: 16, border: '2px solid #F3F4F6', fontSize: 16, outline: 'none', boxSizing: 'border-box', background: '#F9FAFB', fontWeight: 500, transition: 'border-color 0.2s' }}
                            onFocus={(e) => e.target.style.borderColor = '#2E7D32'}
                            onBlur={(e) => e.target.style.borderColor = '#F3F4F6'}
                        />
                    </div>
                </div>
                {/* Filters Row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, borderTop: '2px solid #F9FAFB', paddingTop: 24, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FaFilter color="#9CA3AF" size={16} />
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#374151' }}>Filter:</span>
                    </div>
                    <select
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        style={{ padding: '12px 20px', borderRadius: 12, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', color: '#111827', fontSize: 15, fontWeight: 600, outline: 'none' }}
                    >
                        <option value="all">All Categories</option>
                        {produceTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        style={{ padding: '12px 20px', borderRadius: 12, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', color: '#111827', fontSize: 15, fontWeight: 600, outline: 'none' }}
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active Listings</option>
                        <option value="draft">Paused</option>
                    </select>
                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        style={{ padding: '12px 20px', borderRadius: 12, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', color: '#111827', fontSize: 15, fontWeight: 600, outline: 'none' }}
                    >
                        <option value="newest">Sort: Newest</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="qty_desc">Quantity: High</option>
                    </select>
                    <span style={{ marginLeft: 'auto', fontSize: 14, color: '#2E7D32', fontWeight: 800, background: '#DCFCE7', padding: '10px 20px', borderRadius: 12 }}>
                        {filtered.length} Found
                    </span>
                </div>
            </div>

            {/* ── LISTINGS ── */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 80, color: '#6B7280', fontSize: 18, background: '#fff', borderRadius: 20, border: '1px solid #E6EFEA' }}>
                    <MdTimer style={{ fontSize: 64, color: '#10B981', marginBottom: 16, animation: 'pulse 2s infinite' }} />
                    <div style={{ fontWeight: 600 }}>Loading your listings...</div>
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ background: '#fff', padding: '80px 20px', borderRadius: 20, border: '2px dashed #D1D5DB', textAlign: 'center' }}>
                    <FaSeedling style={{ fontSize: 72, color: '#10B981', marginBottom: 20 }} />
                    <h3 style={{ fontSize: 24, fontWeight: 800, color: '#1F2937', marginBottom: 16 }}>
                        {searchTerm || filterStatus !== 'all' ? 'No matching listings' : 'No crops listed yet'}
                    </h3>
                    <p style={{ color: '#6B7280', marginBottom: 28, fontSize: 16 }}>
                        {searchTerm || filterStatus !== 'all'
                            ? 'Try adjusting your search or filter.'
                            : 'Add your first crop and start selling to buyers across the marketplace.'}
                    </p>
                    {!searchTerm && filterStatus === 'all' && (
                        <button className="adv-btn-primary" onClick={() => setShowForm(true)} style={{ padding: '14px 28px', fontSize: 16, fontWeight: 700 }}>
                            <FaPlus /> Add First Crop
                        </button>
                    )}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                    {filtered.map(item => {
                        const isSelected = selectedIds.includes(item.id);
                        const isToggling = togglingId === item.id;
                        return (
                            <div
                                key={item.id}
                                style={{
                                    background: '#fff',
                                    padding: 24,
                                    borderRadius: 24,
                                    border: isSelected ? '2px solid #2E7D32' : 'none',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    position: 'relative',
                                    opacity: item.is_available ? 1 : 0.82,
                                    boxShadow: isSelected ? '0 10px 25px -5px rgba(46, 125, 50, 0.25)' : '0 10px 30px rgba(0, 0, 0, 0.04)',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                {/* selection checkbox */}
                                {selectionMode && (
                                    <button
                                        onClick={() => toggleSelect(item.id)}
                                        style={{ position: 'absolute', top: 16, left: 16, background: 'none', border: 'none', cursor: 'pointer', color: isSelected ? '#2E7D32' : '#9CA3AF', fontSize: 24, padding: 0, zIndex: 2 }}
                                    >
                                        {isSelected ? <FaCheckSquare /> : <FaRegSquare />}
                                    </button>
                                )}

                                {/* header row */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', paddingLeft: selectionMode ? 28 : 0 }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {item.image
                                                ? <img src={item.image} alt={item.name} style={{ width: 68, height: 68, borderRadius: 16, objectFit: 'cover' }} />
                                                : <span style={{ width: 68, height: 68, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', borderRadius: 16, color: '#6B7280' }}>
                                                    {categoryIcon(item.category)}
                                                </span>
                                            }
                                        </span>
                                        <div>
                                            <h3 style={{ margin: '0 0 6px 0', fontSize: 18, color: '#111827', fontWeight: 800, letterSpacing: '-0.3px' }}>{item.name}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: 13, color: '#4B5563', background: '#F3F4F6', padding: '4px 10px', borderRadius: 8, fontWeight: 600 }}>{item.category}</span>
                                                {item.is_organic && (
                                                    <span style={{ fontSize: 13, color: '#15803D', background: '#DCFCE7', padding: '4px 10px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                                                        <FaLeaf /> Organic
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <span style={{
                                        height: 'fit-content',
                                        fontSize: 13,
                                        fontWeight: 700,
                                        padding: '6px 12px',
                                        borderRadius: 12,
                                        background: item.is_available ? '#F0FDF4' : '#F3F4F6',
                                        color: item.is_available ? '#15803D' : '#4B5563',
                                        display: 'flex', alignItems: 'center', gap: 6
                                    }}>
                                        {item.is_available ? <><FaCheckCircle size={14} /> Active</> : <><FaPauseCircle size={14} /> Paused</>}
                                    </span>
                                </div>

                                {/* details */}
                                <div style={{ display: 'grid', gap: 14, borderTop: '2px solid #F9FAFB', paddingTop: 20, flexGrow: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
                                        <span style={{ color: '#6B7280', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}><FaBoxOpen size={16} color="#9CA3AF" /> Stock</span>
                                        <strong style={{ color: '#111827' }}>{item.available_quantity} <span style={{ color: '#6B7280', fontWeight: 500 }}>{item.unit}</span></strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, alignItems: 'center' }}>
                                        <span style={{ color: '#6B7280', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}><MdDashboard size={18} color="#9CA3AF" /> Price</span>
                                        <strong style={{ color: '#15803D', fontSize: 18, background: '#F0FDF4', padding: '6px 12px', borderRadius: 8 }}>₹{item.price_per_unit}<span style={{ fontSize: 14, color: '#166534', fontWeight: 500 }}>/{item.unit}</span></strong>
                                    </div>
                                    {item.harvest_date && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
                                            <span style={{ color: '#6B7280', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}><FaCalendarAlt size={16} color="#9CA3AF" /> Harvest</span>
                                            <strong style={{ color: '#111827' }}>{item.harvest_date}</strong>
                                        </div>
                                    )}
                                </div>

                                {/* action buttons */}
                                <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                    {/* Edit */}
                                    <button
                                        onClick={() => openEdit(item)}
                                        disabled={selectionMode}
                                        title="Edit listing"
                                        style={{ padding: '12px', fontSize: 14, color: '#374151', backgroundColor: '#F9FAFB', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 12, fontWeight: 700, cursor: selectionMode ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
                                        onMouseEnter={(e) => { e.target.style.background = '#E5E7EB'; }}
                                        onMouseLeave={(e) => { e.target.style.background = '#F9FAFB'; }}
                                    >
                                        <FaEdit size={16} color="#4B5563" /> Edit
                                    </button>

                                    {/* Pause / Resume */}
                                    <button
                                        onClick={() => handleToggle(item.id)}
                                        disabled={isToggling || selectionMode}
                                        title={item.is_available ? 'Pause (hide from buyers)' : 'Resume (make visible)'}
                                        style={{
                                            padding: '12px', fontSize: 14, cursor: isToggling || selectionMode ? 'not-allowed' : 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 12, fontWeight: 700, transition: 'all 0.2s', border: 'none',
                                            color: item.is_available ? '#92400E' : '#15803D',
                                            backgroundColor: item.is_available ? '#FEF3C7' : '#DCFCE7'
                                        }}
                                        onMouseEnter={(e) => { e.target.style.opacity = 0.8; }}
                                        onMouseLeave={(e) => { e.target.style.opacity = 1; }}
                                    >
                                        {isToggling
                                            ? '...'
                                            : item.is_available
                                                ? <><FaPauseCircle size={16} /> Pause</>
                                                : <><FaPlayCircle size={16} /> Resume</>
                                        }
                                    </button>

                                    {/* Delete */}
                                    <button
                                        onClick={() => setDeleteConfirm(item.id)}
                                        disabled={selectionMode}
                                        title="Delete listing"
                                        style={{ padding: '12px', fontSize: 14, color: '#991B1B', backgroundColor: '#FEE2E2', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 12, fontWeight: 700, cursor: selectionMode ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
                                        onMouseEnter={(e) => { e.target.style.background = '#FECACA'; }}
                                        onMouseLeave={(e) => { e.target.style.background = '#FEE2E2'; }}
                                    >
                                        <FaTrash size={16} color="#DC2626" /> Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ══════════════════ ADD / EDIT FORM MODAL ══════════════════ */}
            {showForm && (
                <div className="modal-overlay" style={{ alignItems: 'flex-start', paddingTop: 32, overflowY: 'auto' }}>
                    <div className="modal-content adv-card" style={{ padding: 0, marginBottom: 40, maxWidth: 740, width: '100%' }}>

                        {/* Modal header */}
                        <div style={{ padding: '22px 28px', background: '#fff', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10, borderRadius: '16px 16px 0 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{ background: '#DCFCE7', padding: 10, borderRadius: 12, color: '#166534' }}>
                                    {isEditing ? <FaEdit size={24} /> : <FaSeedling size={24} />}
                                </div>
                                <div>
                                    <h2 style={{ fontSize: 22, margin: 0, color: '#111827', fontWeight: 800 }}>
                                        {isEditing ? 'Edit Crop Listing' : 'Add New Crop'}
                                    </h2>
                                    <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: 13 }}>
                                        {isEditing ? 'Update the details below and publish or save as draft.' : 'Fill in the details to list your produce on the marketplace.'}
                                    </p>
                                </div>
                            </div>
                            <button className="close-btn" onClick={resetForm}><FaTimes size={18} /></button>
                        </div>

                        {/* Form body */}
                        <form onSubmit={handleSubmit} style={{ padding: '28px', maxHeight: '65vh', overflowY: 'auto' }} noValidate>

                            {/* SECTION 1 — Basic Info */}
                            <div className="form-section" style={{ marginBottom: 28 }}>
                                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#374151', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ background: '#DCFCE7', color: '#166534', width: 24, height: 24, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>1</span>
                                    Basic Information
                                </h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Crop Name <span style={{ color: '#DC2626' }}>*</span></label>
                                        <input type="text" name="name" className="adv-form-input" value={formData.name} onChange={handleInput} placeholder="e.g. Basmati Rice" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Category <span style={{ color: '#DC2626' }}>*</span></label>
                                        <select name="category" className="adv-form-input" value={formData.category} onChange={handleInput} required>
                                            <option value="">Select Category</option>
                                            {produceTypes.map(t => (
                                                <option key={t.value} value={t.value}>{t.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Variety <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(Optional)</span></label>
                                        <input type="text" name="variety" className="adv-form-input" value={formData.variety} onChange={handleInput} placeholder="e.g. 1121 Steam" />
                                    </div>
                                    <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 12 }}>
                                        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontSize: '1rem', color: '#374151', fontWeight: 600 }}>
                                            <input type="checkbox" name="is_organic" checked={formData.is_organic} onChange={handleInput} style={{ width: 20, height: 20, accentColor: '#166534' }} />
                                            <FaLeaf style={{ color: '#16A34A' }} /> Organic Certified?
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2 — Quantity & Pricing */}
                            <div className="form-section" style={{ marginBottom: 28 }}>
                                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#374151', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ background: '#DCFCE7', color: '#166534', width: 24, height: 24, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>2</span>
                                    Quantity &amp; Pricing
                                </h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Total Quantity <span style={{ color: '#DC2626' }}>*</span></label>
                                        <input type="number" name="quantity" className="adv-form-input" value={formData.quantity} onChange={handleInput} placeholder="0.00" step="0.01" min="0" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Unit <span style={{ color: '#DC2626' }}>*</span></label>
                                        <select name="unit" className="adv-form-input" value={formData.unit} onChange={handleInput}>
                                            {unitOptions.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Price Per Unit (₹) <span style={{ color: '#DC2626' }}>*</span></label>
                                        <input type="number" name="price_per_unit" className="adv-form-input" value={formData.price_per_unit} onChange={handleInput} placeholder="0.00" step="0.01" min="0" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Min. Order Qty <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(Optional)</span></label>
                                        <input type="number" name="min_order_quantity" className="adv-form-input" value={formData.min_order_quantity} onChange={handleInput} placeholder="e.g. 10" step="0.01" min="0" />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 3 — Dates & Notes */}
                            <div className="form-section">
                                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#374151', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ background: '#DCFCE7', color: '#166534', width: 24, height: 24, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>3</span>
                                    Dates, Image &amp; Notes
                                </h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Harvest Date <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(Optional)</span></label>
                                        <input type="date" name="harvest_date" className="adv-form-input" value={formData.harvest_date} onChange={handleInput} />
                                    </div>
                                    <div className="form-group">
                                        <label>Available From <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(Optional)</span></label>
                                        <input type="date" name="available_from" className="adv-form-input" value={formData.available_from} onChange={handleInput} />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Crop Image <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(Optional — Max 5MB)</span></label>
                                        <input
                                            type="file"
                                            name="image"
                                            className="adv-form-input"
                                            accept="image/*"
                                            onChange={e => setFormData(prev => ({ ...prev, image: e.target.files[0] || null }))}
                                        />
                                        {formData.image instanceof File && (
                                            <div style={{ fontSize: 13, color: '#166534', marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, background: '#DCFCE7', padding: '8px 12px', borderRadius: 8, fontWeight: 600 }}>
                                                <MdOutlineFileUpload size={18} /> Selected: {formData.image.name}
                                            </div>
                                        )}
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Additional Notes / Description <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(Optional)</span></label>
                                        <textarea
                                            name="description"
                                            className="adv-form-input"
                                            rows="3"
                                            value={formData.description}
                                            onChange={handleInput}
                                            placeholder="Quality, storage details, grade, etc."
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* ── Modal footer (all three action buttons) ── */}
                        <div style={{ padding: '18px 28px', background: '#F9FAFB', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: 12, position: 'sticky', bottom: 0 }}>
                            {/* Cancel */}
                            <button
                                type="button"
                                className="adv-btn-secondary"
                                onClick={resetForm}
                                style={{ background: '#fff', padding: '10px 20px' }}
                                disabled={submitting}
                            >
                                <FaTimes /> Cancel
                            </button>

                            {/* Save Draft */}
                            <button
                                type="button"
                                onClick={handleSaveDraft}
                                disabled={submitting}
                                style={{
                                    padding: '10px 20px',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    background: '#fff',
                                    color: '#D97706',
                                    border: '1.5px solid #FDE68A',
                                    borderRadius: 8,
                                    cursor: submitting ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 7,
                                    transition: 'all 0.2s',
                                }}
                            >
                                <FaSave /> {submitting ? 'Saving…' : 'Save as Draft'}
                            </button>

                            {/* Publish / Update */}
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="adv-btn-primary"
                                style={{ padding: '10px 22px', display: 'flex', alignItems: 'center', gap: 7 }}
                            >
                                {isEditing
                                    ? (submitting ? 'Updating…' : <><FaSave /> Update Listing</>)
                                    : (submitting ? 'Publishing…' : <><FaPlayCircle /> Publish Now</>)
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════ DELETE CONFIRMATION MODAL ══════════════════ */}
            {deleteConfirm && (
                <div className="modal-overlay" style={{ zIndex: 2000 }}>
                    <div style={{ background: '#fff', borderRadius: 24, padding: '40px 32px', maxWidth: 460, width: '90%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ background: '#FEE2E2', padding: 24, borderRadius: '50%', color: '#DC2626', display: 'inline-flex', marginBottom: 20 }}>
                            <FaTrash size={48} />
                        </div>
                        <h3 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 12 }}>
                            {deleteConfirm === 'bulk'
                                ? `Delete ${selectedIds.length} listing(s)?`
                                : 'Delete this listing?'}
                        </h3>
                        <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 24 }}>
                            This action is <strong>permanent</strong> and cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                            <button
                                className="adv-btn-secondary"
                                onClick={() => setDeleteConfirm(null)}
                                style={{ padding: '10px 24px', background: '#fff' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() =>
                                    deleteConfirm === 'bulk'
                                        ? handleBulkDelete()
                                        : handleDelete(deleteConfirm)
                                }
                                style={{ padding: '10px 24px', background: '#DC2626', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellProduce;
