
import React, { useState, useEffect, useCallback } from 'react';
import {
    FaPlus, FaEdit, FaTrash, FaTimes, FaSave, FaSearch,
    FaFilter, FaBoxOpen, FaClipboardList, FaCheckCircle,
    FaPauseCircle, FaPlayCircle, FaCalendarAlt, FaEyeSlash,
    FaEye, FaCheckSquare, FaRegSquare, FaLeaf
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
    { value: 'paddy', label: 'Paddy / Rice', icon: '🌾' },
    { value: 'wheat', label: 'Wheat', icon: '🍞' },
    { value: 'vegetables', label: 'Vegetables', icon: '🥦' },
    { value: 'fruits', label: 'Fruits', icon: '🍎' },
    { value: 'pulses', label: 'Pulses', icon: '🫘' },
    { value: 'spices', label: 'Spices', icon: '🌶️' },
    { value: 'other', label: 'Other', icon: '📦' },
];

const unitOptions = [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'quintal', label: 'Quintal (100 kg)' },
    { value: 'ton', label: 'Ton' },
    { value: 'bag', label: 'Bag' },
    { value: 'bunch', label: 'Bunch' },
    { value: 'dozen', label: 'Dozen' },
];

const categoryIcon = (cat) =>
    (produceTypes.find(t => t.value === cat) || { icon: '📦' }).icon;

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
                toast.success('✅ Listing updated successfully!');
            } else {
                const res = await api.post('farmers/produce/', payload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setListings(prev => [res.data, ...prev]);
                toast.success('🚀 Crop published to marketplace!');
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
                toast.success('💾 Draft saved (listing is paused).');
            } else {
                const res = await api.post('farmers/produce/save-draft/', payload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setListings(prev => [res.data, ...prev]);
                toast.success('💾 Saved as draft — not visible to buyers yet.');
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
            const word = updated.is_available ? 'Resumed ▶️' : 'Paused ⏸️';
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
            toast.success('🗑️ Listing deleted.');
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
            toast.success(`🗑️ ${selectedIds.length} listing(s) deleted.`);
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

    /* ── filter ── */
    const filtered = listings.filter(l => {
        const matchSearch =
            l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus =
            filterStatus === 'all' ? true :
                filterStatus === 'active' ? l.is_available :
                    filterStatus === 'draft' ? !l.is_available : true;
        return matchSearch && matchStatus;
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
            <header className="adv-header" style={{ marginBottom: 24, background: 'transparent', padding: 0, boxShadow: 'none' }}>
                <div>
                    <h1 style={{ color: '#111827', fontSize: 28, marginBottom: 4, fontWeight: 800 }}>
                        🌾 Sell Your Crops
                    </h1>
                    <p style={{ color: '#6B7280', fontSize: '1rem', margin: 0 }}>
                        Manage all your produce listings — publish, pause, edit or delete anytime.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {selectionMode ? (
                        <>
                            <span style={{ color: '#6B7280', fontSize: 14, alignSelf: 'center' }}>
                                {selectedIds.length} selected
                            </span>
                            <button
                                className="adv-btn-secondary"
                                onClick={toggleSelectAll}
                                style={{ padding: '10px 16px', fontSize: 14 }}
                            >
                                {filtered.every(l => selectedIds.includes(l.id)) ? '☑ Deselect All' : '☐ Select All'}
                            </button>
                            <button
                                className="adv-btn-secondary"
                                onClick={() => { setSelectionMode(false); setSelectedIds([]); }}
                                style={{ padding: '10px 16px', fontSize: 14 }}
                            >
                                Cancel
                            </button>
                            {selectedIds.length > 0 && (
                                <button
                                    style={{ padding: '10px 16px', fontSize: 14, background: '#DC2626', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
                                    onClick={() => setDeleteConfirm('bulk')}
                                >
                                    <FaTrash /> Delete Selected ({selectedIds.length})
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                            <button
                                className="adv-btn-secondary"
                                onClick={() => setSelectionMode(true)}
                                style={{ padding: '10px 16px', fontSize: 14 }}
                            >
                                <FaCheckSquare /> Select Multiple
                            </button>
                            <button
                                className="adv-btn-primary"
                                onClick={() => { resetForm(); setShowForm(true); }}
                                style={{ padding: '10px 20px', fontSize: 15 }}
                            >
                                <FaPlus /> Add New Crop
                            </button>
                        </>
                    )}
                </div>
            </header>

            {/* ── STATS ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 28 }}>
                {[
                    { icon: <FaClipboardList size={22} />, num: totalListings, label: 'Total Listings', bg: '#E8F5E9', color: '#2E7D32' },
                    { icon: <FaCheckCircle size={22} />, num: activeListings, label: 'Active', bg: '#DCFCE7', color: '#166534' },
                    { icon: <FaEyeSlash size={22} />, num: draftListings, label: 'Drafts / Paused', bg: '#FEF3C7', color: '#D97706' },
                    { icon: <MdShoppingBasket size={22} />, num: soldOut, label: 'Sold Out', bg: '#FEE2E2', color: '#DC2626' },
                ].map(({ icon, num, label, bg, color }) => (
                    <div key={label} style={{ background: '#fff', padding: '18px 20px', borderRadius: 12, border: '1px solid #E6EFEA', display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ background: bg, padding: 10, borderRadius: '50%', color }}>{icon}</div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: 22, color: '#1F2937' }}>{num}</h3>
                            <span style={{ fontSize: 13, color: '#6B7280' }}>{label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── SEARCH + FILTER BAR ── */}
            <div style={{ background: '#fff', padding: '14px 20px', borderRadius: 12, marginBottom: 24, border: '1px solid #E6EFEA', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
                    <FaSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                    <input
                        type="text"
                        placeholder="Search by name or category..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '9px 9px 9px 36px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid #D1D5DB', background: '#fff', cursor: 'pointer', color: '#374151', fontSize: 14 }}
                >
                    <option value="all">All Status</option>
                    <option value="active">Active Only</option>
                    <option value="draft">Drafts / Paused</option>
                </select>
                <span style={{ fontSize: 13, color: '#9CA3AF' }}>{filtered.length} result(s)</span>
            </div>

            {/* ── LISTINGS ── */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: '#6B7280', fontSize: 16 }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
                    Loading your listings...
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ background: '#fff', padding: '60px 20px', borderRadius: 16, border: '2px dashed #D1D5DB', textAlign: 'center' }}>
                    <div style={{ fontSize: 56, marginBottom: 16 }}>🌱</div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1F2937', marginBottom: 8 }}>
                        {searchTerm || filterStatus !== 'all' ? 'No matching listings' : 'No crops listed yet'}
                    </h3>
                    <p style={{ color: '#6B7280', marginBottom: 24 }}>
                        {searchTerm || filterStatus !== 'all'
                            ? 'Try adjusting your search or filter.'
                            : 'Add your first crop and start selling to buyers across the marketplace.'}
                    </p>
                    {!searchTerm && filterStatus === 'all' && (
                        <button className="adv-btn-primary" onClick={() => setShowForm(true)} style={{ padding: '12px 24px', fontSize: 15 }}>
                            <FaPlus /> Add First Crop
                        </button>
                    )}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                    {filtered.map(item => {
                        const isSelected = selectedIds.includes(item.id);
                        const isToggling = togglingId === item.id;
                        return (
                            <div
                                key={item.id}
                                style={{
                                    background: '#fff',
                                    padding: 20,
                                    borderRadius: 16,
                                    border: isSelected ? '2px solid #2E7D32' : '1px solid #E6EFEA',
                                    transition: 'all 0.2s',
                                    position: 'relative',
                                    opacity: item.is_available ? 1 : 0.82,
                                }}
                            >
                                {/* selection checkbox */}
                                {selectionMode && (
                                    <button
                                        onClick={() => toggleSelect(item.id)}
                                        style={{ position: 'absolute', top: 12, left: 12, background: 'none', border: 'none', cursor: 'pointer', color: isSelected ? '#2E7D32' : '#9CA3AF', fontSize: 20, padding: 0, zIndex: 2 }}
                                    >
                                        {isSelected ? <FaCheckSquare /> : <FaRegSquare />}
                                    </button>
                                )}

                                {/* header row */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', paddingLeft: selectionMode ? 28 : 0 }}>
                                        <span style={{ fontSize: '3rem', lineHeight: 1 }}>
                                            {item.image
                                                ? <img src={item.image} alt={item.name} style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover' }} />
                                                : categoryIcon(item.category)
                                            }
                                        </span>
                                        <div>
                                            <h3 style={{ margin: '0 0 4px 0', fontSize: 17, color: '#111827', fontWeight: 700 }}>{item.name}</h3>
                                            <span style={{ fontSize: 12, color: '#6B7280', background: '#F3F4F6', padding: '3px 8px', borderRadius: 4 }}>{item.category}</span>
                                            {item.is_organic && (
                                                <span style={{ marginLeft: 6, fontSize: 12, color: '#166534', background: '#DCFCE7', padding: '3px 8px', borderRadius: 4 }}>
                                                    🌿 Organic
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span style={{
                                        height: 'fit-content',
                                        fontSize: 12,
                                        fontWeight: 700,
                                        padding: '4px 10px',
                                        borderRadius: 20,
                                        background: item.is_available ? '#DCFCE7' : '#FEF3C7',
                                        color: item.is_available ? '#166534' : '#D97706',
                                    }}>
                                        {item.is_available ? '● Active' : '⏸ Draft'}
                                    </span>
                                </div>

                                {/* details */}
                                <div style={{ display: 'grid', gap: 10, borderTop: '1px solid #F3F4F6', paddingTop: 14 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                                        <span style={{ color: '#6B7280', display: 'flex', alignItems: 'center', gap: 6 }}><FaBoxOpen size={13} /> Available</span>
                                        <strong style={{ color: '#111827' }}>{item.available_quantity} {item.unit}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                                        <span style={{ color: '#6B7280', display: 'flex', alignItems: 'center', gap: 6 }}><MdDashboard size={13} /> Price</span>
                                        <strong style={{ color: '#166534', fontSize: 15 }}>₹{item.price_per_unit}/{item.unit}</strong>
                                    </div>
                                    {item.harvest_date && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                                            <span style={{ color: '#6B7280', display: 'flex', alignItems: 'center', gap: 6 }}><FaCalendarAlt size={13} /> Harvest</span>
                                            <strong style={{ color: '#111827' }}>{item.harvest_date}</strong>
                                        </div>
                                    )}
                                </div>

                                {/* action buttons */}
                                <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                                    {/* Edit */}
                                    <button
                                        className="adv-btn-secondary"
                                        onClick={() => openEdit(item)}
                                        disabled={selectionMode}
                                        title="Edit listing"
                                        style={{ padding: '8px 6px', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                                    >
                                        <FaEdit /> Edit
                                    </button>

                                    {/* Pause / Resume */}
                                    <button
                                        className="adv-btn-secondary"
                                        onClick={() => handleToggle(item.id)}
                                        disabled={isToggling || selectionMode}
                                        title={item.is_available ? 'Pause (hide from buyers)' : 'Resume (make visible)'}
                                        style={{
                                            padding: '8px 6px', fontSize: 13,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                                            color: item.is_available ? '#D97706' : '#166534',
                                            borderColor: item.is_available ? '#FDE68A' : '#BBF7D0',
                                        }}
                                    >
                                        {isToggling
                                            ? '...'
                                            : item.is_available
                                                ? <><FaPauseCircle /> Pause</>
                                                : <><FaPlayCircle /> Resume</>
                                        }
                                    </button>

                                    {/* Delete */}
                                    <button
                                        className="adv-btn-secondary"
                                        onClick={() => setDeleteConfirm(item.id)}
                                        disabled={selectionMode}
                                        title="Delete listing"
                                        style={{ padding: '8px 6px', fontSize: 13, color: '#DC2626', borderColor: '#FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                                    >
                                        <FaTrash /> Delete
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
                        <div style={{ padding: '22px 28px', background: '#fff', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
                            <div>
                                <h2 style={{ fontSize: 20, margin: 0, color: '#111827', fontWeight: 800 }}>
                                    {isEditing ? '✏️ Edit Crop Listing' : '🌾 Add New Crop'}
                                </h2>
                                <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: 13 }}>
                                    {isEditing ? 'Update the details below and publish or save as draft.' : 'Fill in the details to list your produce on the marketplace.'}
                                </p>
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
                                                <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
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
                                            <p style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
                                                📷 Selected: {formData.image.name}
                                            </p>
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
                    <div style={{ background: '#fff', borderRadius: 16, padding: '32px 28px', maxWidth: 420, width: '90%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>🗑️</div>
                        <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 8 }}>
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
