
import React, { useState, useEffect, useCallback } from 'react';
import {
    FaTractor, FaCalendarAlt, FaClock, FaHistory, FaSearch,
    FaFilter, FaMapMarkerAlt, FaCheckCircle, FaTimes, FaExclamationCircle,
    FaInfoCircle, FaShieldAlt, FaUserTie, FaFaucet, FaCut
} from 'react-icons/fa';
import { GiFarmTractor } from 'react-icons/gi';
import { MdOutlineReceiptLong, MdSettingsSuggest } from 'react-icons/md';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import './FarmerPages.css';

/* ─── helpers ─────────────────────────────────────────────────── */
const equipmentTypes = [
    { value: 'all', label: 'All Machinery', icon: <GiFarmTractor /> },
    { value: 'tractor', label: 'Tractors', icon: <GiFarmTractor /> },
    { value: 'harvester', label: 'Harvesters', icon: <FaCut /> },
    { value: 'water_pump', label: 'Water Pumps', icon: <FaFaucet /> },
    { value: 'other', label: 'Others', icon: <MdSettingsSuggest /> },
];

const typeIcon = (type) => {
    switch (type?.toLowerCase()) {
        case 'tractor': return <GiFarmTractor />;
        case 'harvester': return <FaCut />;
        case 'water_pump': return <FaFaucet />;
        default: return <GiFarmTractor />;
    }
};

const statusColors = {
    'pending': { bg: '#FEF3C7', text: '#D97706', label: 'Requested' },
    'confirmed': { bg: '#DBEAFE', text: '#1E40AF', label: 'Confirmed' },
    'active': { bg: '#DCFCE7', text: '#166534', label: 'Ongoing' },
    'completed': { bg: '#F3F4F6', text: '#4B5563', label: 'Returned' },
    'cancelled': { bg: '#FEE2E2', text: '#DC2626', label: 'Cancelled' },
    'rejected': { bg: '#F3F4F6', text: '#4B5563', label: 'Rejected' },
};

/* ─── component ───────────────────────────────────────────────── */
const RentEquipment = () => {
    // UI State
    const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'history'
    const [showBooking, setShowBooking] = useState(false);

    // Data State
    const [equipment, setEquipment] = useState([]);
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rentalsLoading, setRentalsLoading] = useState(false);

    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');

    // Booking Form State
    const [selectedItem, setSelectedItem] = useState(null);
    const [bookingForm, setBookingForm] = useState({
        start_date: '',
        end_date: '',
        operator_required: false,
        delivery_address: '',
        customer_notes: ''
    });
    const [submitting, setSubmitting] = useState(false);

    /* ── Fetch Data ── */
    const fetchEquipment = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('suppliers/equipment/');
            // Handle both paginated { results: [...] } and plain array responses
            const data = res.data?.results ?? res.data;
            setEquipment(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load available equipment.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRentals = useCallback(async () => {
        try {
            setRentalsLoading(true);
            const res = await api.get('suppliers/rentals/farmer_rentals/');
            // Handle both paginated { results: [...] } and plain array responses
            const data = res.data?.results ?? res.data;
            setRentals(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load your rental history.');
        } finally {
            setRentalsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'browse') fetchEquipment();
        else fetchRentals();
    }, [activeTab, fetchEquipment, fetchRentals]);

    /* ── Booking Logic ── */
    const openBooking = (item) => {
        setSelectedItem(item);
        setBookingForm({
            start_date: new Date().toISOString().split('T')[0],
            end_date: '',
            operator_required: item.requires_operator,
            delivery_address: '',
            customer_notes: ''
        });
        setShowBooking(true);
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        if (!bookingForm.start_date || !bookingForm.end_date) {
            toast.error('Please select both start and end dates.');
            return;
        }

        setSubmitting(true);
        try {
            await api.post('suppliers/rentals/request_rental/', {
                equipment_id: selectedItem.id,
                ...bookingForm
            });
            toast.success('🎉 Rental request submitted successfully!');
            setShowBooking(false);
            setActiveTab('history');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to submit rental request.');
        } finally {
            setSubmitting(false);
        }
    };

    const cancelRental = async (id) => {
        if (!window.confirm('Cancel this rental request?')) return;
        try {
            await api.patch(`suppliers/rentals/${id}/cancel_rental/`);
            toast.success('Rental request cancelled.');
            fetchRentals();
        } catch (err) {
            toast.error('Failed to cancel request.');
        }
    };

    /* ── Calculations ── */
    const calculateTotal = () => {
        if (!selectedItem || !bookingForm.start_date || !bookingForm.end_date) return 0;
        const d1 = new Date(bookingForm.start_date);
        const d2 = new Date(bookingForm.end_date);
        const nights = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
        if (nights <= 0) return 0;

        const base = parseFloat(selectedItem.daily_rate) * nights;
        const op = bookingForm.operator_required ? (parseFloat(selectedItem.operator_charge_per_day || 0) * nights) : 0;
        const deposit = parseFloat(selectedItem.security_deposit || 0);
        return { nights, base, op, deposit, total: base + op + deposit };
    };

    const filteredEquip = equipment.filter(e => {
        const matchesSearch = (e.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (e.brand || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === 'all' || (e.equipment_type || '').toLowerCase() === selectedType.toLowerCase();
        return matchesSearch && matchesType && e.is_available && e.status === 'available';
    });

    /* ── Render ── */
    return (
        <div className="adv-dashboard-container">

            {/* ── HEADER ── */}
            <header className="adv-header" style={{ marginBottom: 24, padding: 0, background: 'transparent', boxShadow: 'none' }}>
                <div>
                    <h1 style={{ color: '#111827', fontSize: 28, marginBottom: 4, fontWeight: 800 }}>
                        {activeTab === 'browse' ? '🚜 Equipment Rental' : '📋 My Rentals'}
                    </h1>
                    <p style={{ color: '#6B7280', fontSize: '1rem', margin: 0 }}>
                        {activeTab === 'browse'
                            ? 'Book tractors, harvesters and tools for your farm work.'
                            : 'Track your ongoing and upcoming machinery rentals.'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button
                        className={activeTab === 'browse' ? 'adv-btn-primary' : 'adv-btn-secondary'}
                        onClick={() => setActiveTab('browse')}
                        style={{ padding: '10px 20px', fontSize: 14 }}
                    >
                        <FaTractor /> Browse
                    </button>
                    <button
                        className={activeTab === 'history' ? 'adv-btn-primary' : 'adv-btn-secondary'}
                        onClick={() => setActiveTab('history')}
                        style={{ padding: '10px 20px', fontSize: 14 }}
                    >
                        <FaHistory /> Registry
                    </button>
                </div>
            </header>

            {activeTab === 'browse' ? (
                <>
                    {/* Filters */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                        <div style={{ flex: 1, minWidth: 280, position: 'relative' }}>
                            <FaSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                            <input
                                type="text"
                                placeholder="Search by brand or model..."
                                className="adv-form-input"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{ paddingLeft: 42, background: '#fff' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                            {equipmentTypes.map(type => (
                                <button
                                    key={type.value}
                                    onClick={() => setSelectedType(type.value)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, border: '1px solid', fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 0.2s',
                                        background: selectedType === type.value ? '#166534' : '#fff',
                                        borderColor: selectedType === type.value ? '#166534' : '#E5E7EB',
                                        color: selectedType === type.value ? '#fff' : '#4B5563',
                                    }}
                                >
                                    {typeIcon(type.value)} {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Equipment Grid */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px' }}>
                            <div className="loading-spinner"></div>
                            <p style={{ marginTop: 16, color: '#6B7280' }}>Loading available machinery...</p>
                        </div>
                    ) : filteredEquip.length === 0 ? (
                        <div style={{ background: '#fff', padding: '80px 20px', borderRadius: 20, textAlign: 'center', border: '1px solid #E5E7EB' }}>
                            <div style={{ fontSize: 60, marginBottom: 20 }}>🚜</div>
                            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>No machinery available</h3>
                            <p style={{ color: '#6B7280' }}>Try changing your filters or location.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                            {filteredEquip.map(item => (
                                <div key={item.id} className="adv-card equip-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ height: 200, background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 70, position: 'relative' }}>
                                        {(item.image_url || item.image) ? (
                                            <img src={item.image_url || item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span style={{ color: '#166534' }}>{typeIcon(item.equipment_type)}</span>
                                        )}
                                        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
                                            <span style={{ background: 'rgba(255,255,255,0.9)', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: '#111827', backdropFilter: 'blur(4px)' }}>
                                                {item.brand}
                                            </span>
                                            {item.requires_operator && (
                                                <span style={{ background: '#FEE2E2', color: '#DC2626', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                                                    With Operator
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>{item.name}</h3>
                                            <span style={{ fontSize: 13, color: '#166534', background: '#DCFCE7', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>{item.condition_display}</span>
                                        </div>

                                        <p style={{ margin: '0 0 16px 0', fontSize: 14, color: '#6B7280', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {item.description}
                                        </p>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                                            <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: 10 }}>
                                                <span style={{ fontSize: 11, color: '#64748B', display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>Daily Rate</span>
                                                <strong style={{ fontSize: 16, color: '#166534' }}>₹{item.daily_rate}</strong>
                                            </div>
                                            <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: 10 }}>
                                                <span style={{ fontSize: 11, color: '#64748B', display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>Deposit</span>
                                                <strong style={{ fontSize: 16, color: '#111827' }}>₹{item.security_deposit || 0}</strong>
                                            </div>
                                        </div>

                                        <button
                                            className="adv-btn-primary"
                                            onClick={() => openBooking(item)}
                                            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                /* ── Rental History View ── */
                <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                    {rentalsLoading ? (
                        <div style={{ textAlign: 'center', padding: '60px' }}>
                            <div className="loading-spinner"></div>
                            <p style={{ marginTop: 16, color: '#6B7280' }}>Loading active rentals...</p>
                        </div>
                    ) : rentals.length === 0 ? (
                        <div style={{ background: '#fff', padding: '80px 20px', borderRadius: 20, textAlign: 'center', border: '1px solid #E5E7EB' }}>
                            <div style={{ fontSize: 60, marginBottom: 20 }}>📋</div>
                            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>No rentals found</h3>
                            <button className="adv-btn-primary" onClick={() => setActiveTab('browse')} style={{ marginTop: 20 }}>Browse Machinery</button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: 16 }}>
                            {rentals.map(rental => {
                                const status = statusColors[rental.status] || statusColors.pending;
                                return (
                                    <div key={rental.id} className="adv-card" style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
                                        <div style={{ width: 80, height: 80, background: '#F9FAFB', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, flexShrink: 0 }}>
                                            {(rental.equipment_image_url || rental.equipment_image) ? (
                                                <img src={rental.equipment_image_url || rental.equipment_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 16 }} />
                                            ) : typeIcon(rental.equipment_type)}
                                        </div>

                                        <div style={{ flex: 1, minWidth: 250 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                                                <h4 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{rental.equipment_name}</h4>
                                                <span style={{ fontSize: 11, background: status.bg, color: status.text, padding: '2px 10px', borderRadius: 20, fontWeight: 800 }}>
                                                    {status.label}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', gap: 16, color: '#6B7280', fontSize: 13 }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FaCalendarAlt size={12} /> {rental.start_date} → {rental.end_date}</span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MdOutlineReceiptLong size={14} /> {rental.rental_number}</span>
                                            </div>
                                        </div>

                                        <div style={{ minWidth: 140 }}>
                                            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 2 }}>Duration: {rental.rental_duration_days} days</div>
                                            <div style={{ fontSize: 20, fontWeight: 800, color: '#166534' }}>₹{rental.total_amount}</div>
                                        </div>

                                        <div style={{ display: 'flex', gap: 10 }}>
                                            {rental.status === 'pending' && (
                                                <button
                                                    className="adv-btn-secondary"
                                                    onClick={() => cancelRental(rental.id)}
                                                    style={{ color: '#DC2626', borderColor: '#FECACA', fontSize: 13 }}
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            <button className="adv-btn-secondary" style={{ fontSize: 13 }}>Track</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ── BOOKING MODAL ── */}
            {showBooking && selectedItem && (
                <div className="modal-overlay">
                    <div className="modal-content adv-card" style={{ maxWidth: 600, width: '95%', padding: 0 }}>
                        <div style={{ padding: '24px 28px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Request Rental</h2>
                                <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: 13 }}>Book "{selectedItem.name}" for your farm.</p>
                            </div>
                            <button onClick={() => setShowBooking(false)} className="close-btn"><FaTimes /></button>
                        </div>

                        <form onSubmit={handleBookingSubmit} style={{ padding: '24px 28px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                                <div className="form-group">
                                    <label style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                        <FaCalendarAlt color="#166534" /> Start Date
                                    </label>
                                    <input
                                        type="date"
                                        className="adv-form-input"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={bookingForm.start_date}
                                        onChange={e => setBookingForm({ ...bookingForm, start_date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                        <FaCalendarAlt color="#166534" /> End Date
                                    </label>
                                    <input
                                        type="date"
                                        className="adv-form-input"
                                        min={bookingForm.start_date}
                                        value={bookingForm.end_date}
                                        onChange={e => setBookingForm({ ...bookingForm, end_date: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 12, marginBottom: 24 }}>
                                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, fontWeight: 600 }}>
                                    <input
                                        type="checkbox"
                                        checked={bookingForm.operator_required}
                                        onChange={e => setBookingForm({ ...bookingForm, operator_required: e.target.checked })}
                                        style={{ width: 18, height: 18, accentColor: '#166534' }}
                                    />
                                    <FaUserTie /> Need an Operator?
                                    <span style={{ fontSize: 11, fontWeight: 400, color: '#64748B' }}>(₹{selectedItem.operator_charge_per_day}/day extra)</span>
                                </label>
                            </div>

                            <div className="form-group" style={{ marginBottom: 24 }}>
                                <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, display: 'block' }}>Delivery Address</label>
                                <textarea
                                    className="adv-form-input"
                                    rows="2"
                                    placeholder="Where should the machinery be delivered?"
                                    value={bookingForm.delivery_address}
                                    onChange={e => setBookingForm({ ...bookingForm, delivery_address: e.target.value })}
                                ></textarea>
                            </div>

                            {/* Summary Box */}
                            <div style={{ border: '2px dashed #E2E8F0', borderRadius: 12, padding: 16, marginBottom: 24 }}>
                                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#64748B', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FaShieldAlt /> Cost Breakdown
                                </h4>
                                {calculateTotal() ? (
                                    <div style={{ display: 'grid', gap: 8 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                                            <span>Rental ({calculateTotal().nights} days)</span>
                                            <span>₹{calculateTotal().base}</span>
                                        </div>
                                        {bookingForm.operator_required && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                                                <span>Operator Charges</span>
                                                <span>₹{calculateTotal().op}</span>
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                                            <span>Security Deposit (Refundable)</span>
                                            <span>₹{calculateTotal().deposit}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, color: '#166534', marginTop: 8, paddingTop: 12, borderTop: '1px solid #E2E8F0' }}>
                                            <span>Est. Total Amount</span>
                                            <span>₹{calculateTotal().total}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p style={{ margin: 0, fontSize: 13, color: '#94A3B8' }}>Select dates to see estimated cost.</p>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button type="button" onClick={() => setShowBooking(false)} className="adv-btn-secondary" style={{ flex: 1, padding: '14px' }}>Cancel</button>
                                <button type="submit" disabled={submitting} className="adv-btn-primary" style={{ flex: 2, padding: '14px', justifyContent: 'center' }}>
                                    {submitting ? 'Submitting Request...' : 'Confirm Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .equip-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.08); }
                .loading-spinner { border: 4px solid #f3f3f3; border-top: 4px solid #166534; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: auto; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default RentEquipment;
