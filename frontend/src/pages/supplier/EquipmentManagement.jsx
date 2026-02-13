import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    FaPlus, FaEdit, FaTrash, FaSearch, FaTractor, FaTools,
    FaCog, FaCheckCircle, FaTimesCircle, FaWrench, FaCalendar
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import SupplierSidebar from '../../components/SupplierSidebar';
import '../SupplierPortal.css';

const EquipmentManagement = () => {
    const { user } = useAuth();
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [formData, setFormData] = useState({
        name: '',
        equipment_type: 'tractor',
        brand: '',
        model: '',
        year_of_manufacture: '',
        description: '',
        hourly_rate: '',
        daily_rate: '',
        weekly_rate: '',
        monthly_rate: '',
        condition: 'good',
        status: 'available',
        fuel_type: '',
        horsepower: '',
        requires_operator: false,
        operator_charge_per_day: '',
        security_deposit: '',
        is_available: true,
        last_maintenance_date: '',
        next_maintenance_date: '',
        image: null
    });

    const equipmentTypes = [
        { value: 'tractor', label: 'Tractor', icon: <FaTractor /> },
        { value: 'harvester', label: 'Harvester', icon: <FaTools /> },
        { value: 'plough', label: 'Plough', icon: <FaTools /> },
        { value: 'seeder', label: 'Seeder', icon: <FaTools /> },
        { value: 'sprayer', label: 'Sprayer', icon: <FaTools /> },
        { value: 'thresher', label: 'Thresher', icon: <FaTools /> },
        { value: 'cultivator', label: 'Cultivator', icon: <FaTools /> },
        { value: 'rotavator', label: 'Rotavator', icon: <FaTools /> },
        { value: 'water_pump', label: 'Water Pump', icon: <FaCog /> },
        { value: 'other', label: 'Other', icon: <FaTools /> },
    ];

    const conditions = [
        { value: 'excellent', label: 'Excellent', color: '#10B981' },
        { value: 'good', label: 'Good', color: '#3B82F6' },
        { value: 'fair', label: 'Fair', color: '#F59E0B' },
        { value: 'needs_repair', label: 'Needs Repair', color: '#EF4444' },
    ];

    const statuses = [
        { value: 'available', label: 'Available', color: '#10B981' },
        { value: 'rented', label: 'Rented', color: '#F59E0B' },
        { value: 'maintenance', label: 'Under Maintenance', color: '#6B7280' },
        { value: 'unavailable', label: 'Unavailable', color: '#EF4444' },
    ];

    useEffect(() => {
        fetchEquipment();
    }, []);

    const fetchEquipment = async () => {
        try {
            const response = await api.get('suppliers/equipment/my_equipment/');
            setEquipment(response.data);
        } catch (error) {
            console.error('Failed to fetch equipment:', error);
            toast.error('Failed to load equipment');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === 'file') {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== '') {
                if (key === 'image' && formData[key] instanceof File) {
                    submitData.append(key, formData[key]);
                } else if (key !== 'image') {
                    submitData.append(key, formData[key]);
                }
            }
        });

        try {
            if (editingEquipment) {
                await api.patch(`suppliers/equipment/${editingEquipment.id}/`, submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Equipment updated successfully!');
            } else {
                await api.post('suppliers/equipment/', submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Equipment added successfully!');
            }

            fetchEquipment();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save equipment:', error);
            toast.error('Failed to save equipment');
        }
    };

    const handleEdit = (equip) => {
        setEditingEquipment(equip);
        setFormData({
            name: equip.name,
            equipment_type: equip.equipment_type,
            brand: equip.brand || '',
            model: equip.model || '',
            year_of_manufacture: equip.year_of_manufacture || '',
            description: equip.description,
            hourly_rate: equip.hourly_rate || '',
            daily_rate: equip.daily_rate,
            weekly_rate: equip.weekly_rate || '',
            monthly_rate: equip.monthly_rate || '',
            condition: equip.condition,
            status: equip.status,
            fuel_type: equip.fuel_type || '',
            horsepower: equip.horsepower || '',
            requires_operator: equip.requires_operator,
            operator_charge_per_day: equip.operator_charge_per_day || '',
            security_deposit: equip.security_deposit,
            is_available: equip.is_available,
            last_maintenance_date: equip.last_maintenance_date || '',
            next_maintenance_date: equip.next_maintenance_date || '',
            image: null
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this equipment?')) {
            try {
                await api.delete(`suppliers/equipment/${id}/`);
                toast.success('Equipment deleted successfully!');
                fetchEquipment();
            } catch (error) {
                console.error('Failed to delete equipment:', error);
                toast.error('Failed to delete equipment');
            }
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingEquipment(null);
        setFormData({
            name: '',
            equipment_type: 'tractor',
            brand: '',
            model: '',
            year_of_manufacture: '',
            description: '',
            hourly_rate: '',
            daily_rate: '',
            weekly_rate: '',
            monthly_rate: '',
            condition: 'good',
            status: 'available',
            fuel_type: '',
            horsepower: '',
            requires_operator: false,
            operator_charge_per_day: '',
            security_deposit: '',
            is_available: true,
            last_maintenance_date: '',
            next_maintenance_date: '',
            image: null
        });
    };

    const filteredEquipment = equipment.filter(equip => {
        const matchesSearch = equip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            equip.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (equip.brand && equip.brand.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = filterType === 'all' || equip.equipment_type === filterType;
        const matchesStatus = filterStatus === 'all' || equip.status === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    if (loading) {
        return (
            <div className="supplier-portal-layout">
                <SupplierSidebar />
                <div className="portal-main-content">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading equipment...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="supplier-portal-layout">
            <SupplierSidebar />

            <div className="portal-main-content">
                {/* Header */}
                <div className="portal-header">
                    <div>
                        <h1 className="portal-title">Equipment Management</h1>
                        <p className="portal-subtitle">Manage your rental equipment and machinery</p>
                    </div>
                    <button className="btn-primary-supplier" onClick={() => setShowModal(true)}>
                        <FaPlus /> Add New Equipment
                    </button>
                </div>

                {/* Filters */}
                <div className="section-card" style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '250px' }}>
                            <div style={{ position: 'relative' }}>
                                <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                                <input
                                    type="text"
                                    placeholder="Search equipment..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="form-control"
                                    style={{ paddingLeft: '2.5rem' }}
                                />
                            </div>
                        </div>
                        <div style={{ minWidth: '180px' }}>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="form-control"
                            >
                                <option value="all">All Types</option>
                                {equipmentTypes.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ minWidth: '180px' }}>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="form-control"
                            >
                                <option value="all">All Status</option>
                                {statuses.map(status => (
                                    <option key={status.value} value={status.value}>{status.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Equipment Grid */}
                {filteredEquipment.length === 0 ? (
                    <div className="section-card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <FaTractor style={{ fontSize: '4rem', color: '#D1D5DB', marginBottom: '1rem' }} />
                        <h3 style={{ color: '#6B7280', marginBottom: '0.5rem' }}>No equipment found</h3>
                        <p style={{ color: '#9CA3AF' }}>
                            {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                                ? 'Try adjusting your filters'
                                : 'Start by adding your first equipment'}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {filteredEquipment.map(equip => {
                            const statusInfo = statuses.find(s => s.value === equip.status);
                            const conditionInfo = conditions.find(c => c.value === equip.condition);

                            return (
                                <div key={equip.id} className="section-card" style={{ padding: '0', overflow: 'hidden' }}>
                                    {/* Equipment Image */}
                                    <div style={{
                                        height: '220px',
                                        background: equip.image ? `url(${equip.image})` : 'linear-gradient(135deg, #8B6F47 0%, #5D4A30 100%)',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative'
                                    }}>
                                        {!equip.image && <FaTractor style={{ fontSize: '4rem', color: 'white', opacity: 0.5 }} />}
                                        <div style={{
                                            position: 'absolute',
                                            top: '0.75rem',
                                            right: '0.75rem',
                                            display: 'flex',
                                            gap: '0.5rem'
                                        }}>
                                            <div style={{
                                                background: statusInfo?.color || '#6B7280',
                                                color: 'white',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '1rem',
                                                fontSize: '0.75rem',
                                                fontWeight: '600'
                                            }}>
                                                {equip.status_display}
                                            </div>
                                        </div>
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '0.75rem',
                                            left: '0.75rem',
                                            background: conditionInfo?.color || '#6B7280',
                                            color: 'white',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.75rem',
                                            fontWeight: '600'
                                        }}>
                                            {equip.condition_display}
                                        </div>
                                    </div>

                                    {/* Equipment Details */}
                                    <div style={{ padding: '1.5rem' }}>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', margin: '0 0 0.5rem 0' }}>
                                                {equip.name}
                                            </h3>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                <span style={{
                                                    background: '#F3F4F6',
                                                    color: '#6B7280',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '0.375rem',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {equip.equipment_type_display}
                                                </span>
                                                {equip.brand && (
                                                    <span style={{
                                                        background: '#EFF6FF',
                                                        color: '#1E40AF',
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '0.375rem',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600'
                                                    }}>
                                                        {equip.brand} {equip.model}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: '1.5' }}>
                                            {equip.description.length > 100
                                                ? equip.description.substring(0, 100) + '...'
                                                : equip.description}
                                        </p>

                                        {/* Rental Rates */}
                                        <div style={{
                                            background: '#F9FAFB',
                                            borderRadius: '0.5rem',
                                            padding: '1rem',
                                            marginBottom: '1rem'
                                        }}>
                                            <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '0.5rem', fontWeight: '600' }}>
                                                RENTAL RATES
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                                {equip.hourly_rate && (
                                                    <div>
                                                        <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>Hourly</div>
                                                        <div style={{ fontSize: '1rem', fontWeight: '700', color: '#8B6F47' }}>
                                                            ₹{equip.hourly_rate}
                                                        </div>
                                                    </div>
                                                )}
                                                <div>
                                                    <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>Daily</div>
                                                    <div style={{ fontSize: '1rem', fontWeight: '700', color: '#8B6F47' }}>
                                                        ₹{equip.daily_rate}
                                                    </div>
                                                </div>
                                                {equip.weekly_rate && (
                                                    <div>
                                                        <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>Weekly</div>
                                                        <div style={{ fontSize: '1rem', fontWeight: '700', color: '#8B6F47' }}>
                                                            ₹{equip.weekly_rate}
                                                        </div>
                                                    </div>
                                                )}
                                                {equip.monthly_rate && (
                                                    <div>
                                                        <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>Monthly</div>
                                                        <div style={{ fontSize: '1rem', fontWeight: '700', color: '#8B6F47' }}>
                                                            ₹{equip.monthly_rate}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Additional Info */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                                            {equip.horsepower && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280' }}>
                                                    <FaCog /> {equip.horsepower} HP
                                                </div>
                                            )}
                                            {equip.fuel_type && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280' }}>
                                                    <FaTools /> {equip.fuel_type}
                                                </div>
                                            )}
                                            {equip.requires_operator && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#F59E0B' }}>
                                                    <FaCheckCircle /> Operator Required (₹{equip.operator_charge_per_day}/day)
                                                </div>
                                            )}
                                            {equip.security_deposit > 0 && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280' }}>
                                                    <FaCheckCircle /> Security Deposit: ₹{equip.security_deposit}
                                                </div>
                                            )}
                                        </div>

                                        {/* Maintenance Info */}
                                        {equip.next_maintenance_date && (
                                            <div style={{
                                                background: '#FEF3C7',
                                                border: '1px solid #FCD34D',
                                                borderRadius: '0.5rem',
                                                padding: '0.5rem',
                                                marginBottom: '1rem',
                                                fontSize: '0.75rem',
                                                color: '#92400E',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <FaCalendar />
                                                Next Maintenance: {new Date(equip.next_maintenance_date).toLocaleDateString()}
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleEdit(equip)}
                                                className="btn-primary-supplier"
                                                style={{ flex: 1, fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                                            >
                                                <FaEdit /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(equip.id)}
                                                className="btn-secondary-supplier"
                                                style={{ flex: 1, fontSize: '0.875rem', padding: '0.5rem 1rem', color: '#EF4444', borderColor: '#EF4444' }}
                                            >
                                                <FaTrash /> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Add/Edit Modal */}
                {showModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem'
                    }}>
                        <div style={{
                            background: 'white',
                            borderRadius: '1rem',
                            maxWidth: '700px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflow: 'auto'
                        }}>
                            <div style={{ padding: '2rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>
                                    {editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
                                </h2>

                                <form onSubmit={handleSubmit}>
                                    <div className="form-grid">
                                        {/* Basic Information */}
                                        <div className="form-group full-width" style={{ gridColumn: '1 / -1', marginBottom: '1rem' }}>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#374151', borderBottom: '2px solid #E5E7EB', paddingBottom: '0.5rem' }}>
                                                Basic Information
                                            </h3>
                                        </div>

                                        <div className="form-group full-width">
                                            <label>Equipment Name *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="form-control"
                                                placeholder="e.g., John Deere 5050D Tractor"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Equipment Type *</label>
                                            <select
                                                name="equipment_type"
                                                value={formData.equipment_type}
                                                onChange={handleChange}
                                                className="form-control"
                                                required
                                            >
                                                {equipmentTypes.map(type => (
                                                    <option key={type.value} value={type.value}>{type.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Brand</label>
                                            <input
                                                type="text"
                                                name="brand"
                                                value={formData.brand}
                                                onChange={handleChange}
                                                className="form-control"
                                                placeholder="e.g., John Deere"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Model</label>
                                            <input
                                                type="text"
                                                name="model"
                                                value={formData.model}
                                                onChange={handleChange}
                                                className="form-control"
                                                placeholder="e.g., 5050D"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Year of Manufacture</label>
                                            <input
                                                type="number"
                                                name="year_of_manufacture"
                                                value={formData.year_of_manufacture}
                                                onChange={handleChange}
                                                className="form-control"
                                                min="1900"
                                                max={new Date().getFullYear()}
                                            />
                                        </div>

                                        <div className="form-group full-width">
                                            <label>Description *</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                className="form-control"
                                                rows="3"
                                                placeholder="Describe the equipment, its features, and condition..."
                                                required
                                            />
                                        </div>

                                        {/* Rental Rates */}
                                        <div className="form-group full-width" style={{ gridColumn: '1 / -1', marginTop: '1rem', marginBottom: '1rem' }}>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#374151', borderBottom: '2px solid #E5E7EB', paddingBottom: '0.5rem' }}>
                                                Rental Rates
                                            </h3>
                                        </div>

                                        <div className="form-group">
                                            <label>Hourly Rate (₹)</label>
                                            <input
                                                type="number"
                                                name="hourly_rate"
                                                value={formData.hourly_rate}
                                                onChange={handleChange}
                                                className="form-control"
                                                step="0.01"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Daily Rate (₹) *</label>
                                            <input
                                                type="number"
                                                name="daily_rate"
                                                value={formData.daily_rate}
                                                onChange={handleChange}
                                                className="form-control"
                                                step="0.01"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Weekly Rate (₹)</label>
                                            <input
                                                type="number"
                                                name="weekly_rate"
                                                value={formData.weekly_rate}
                                                onChange={handleChange}
                                                className="form-control"
                                                step="0.01"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Monthly Rate (₹)</label>
                                            <input
                                                type="number"
                                                name="monthly_rate"
                                                value={formData.monthly_rate}
                                                onChange={handleChange}
                                                className="form-control"
                                                step="0.01"
                                            />
                                        </div>

                                        {/* Equipment Details */}
                                        <div className="form-group full-width" style={{ gridColumn: '1 / -1', marginTop: '1rem', marginBottom: '1rem' }}>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#374151', borderBottom: '2px solid #E5E7EB', paddingBottom: '0.5rem' }}>
                                                Equipment Details
                                            </h3>
                                        </div>

                                        <div className="form-group">
                                            <label>Condition *</label>
                                            <select
                                                name="condition"
                                                value={formData.condition}
                                                onChange={handleChange}
                                                className="form-control"
                                                required
                                            >
                                                {conditions.map(cond => (
                                                    <option key={cond.value} value={cond.value}>{cond.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Status *</label>
                                            <select
                                                name="status"
                                                value={formData.status}
                                                onChange={handleChange}
                                                className="form-control"
                                                required
                                            >
                                                {statuses.map(stat => (
                                                    <option key={stat.value} value={stat.value}>{stat.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Fuel Type</label>
                                            <input
                                                type="text"
                                                name="fuel_type"
                                                value={formData.fuel_type}
                                                onChange={handleChange}
                                                className="form-control"
                                                placeholder="e.g., Diesel, Petrol, Electric"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Horsepower (HP)</label>
                                            <input
                                                type="number"
                                                name="horsepower"
                                                value={formData.horsepower}
                                                onChange={handleChange}
                                                className="form-control"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Security Deposit (₹) *</label>
                                            <input
                                                type="number"
                                                name="security_deposit"
                                                value={formData.security_deposit}
                                                onChange={handleChange}
                                                className="form-control"
                                                step="0.01"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    name="requires_operator"
                                                    checked={formData.requires_operator}
                                                    onChange={handleChange}
                                                />
                                                Requires Operator
                                            </label>
                                        </div>

                                        {formData.requires_operator && (
                                            <div className="form-group full-width">
                                                <label>Operator Charge per Day (₹)</label>
                                                <input
                                                    type="number"
                                                    name="operator_charge_per_day"
                                                    value={formData.operator_charge_per_day}
                                                    onChange={handleChange}
                                                    className="form-control"
                                                    step="0.01"
                                                />
                                            </div>
                                        )}

                                        {/* Maintenance */}
                                        <div className="form-group full-width" style={{ gridColumn: '1 / -1', marginTop: '1rem', marginBottom: '1rem' }}>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#374151', borderBottom: '2px solid #E5E7EB', paddingBottom: '0.5rem' }}>
                                                Maintenance Schedule
                                            </h3>
                                        </div>

                                        <div className="form-group">
                                            <label>Last Maintenance Date</label>
                                            <input
                                                type="date"
                                                name="last_maintenance_date"
                                                value={formData.last_maintenance_date}
                                                onChange={handleChange}
                                                className="form-control"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Next Maintenance Date</label>
                                            <input
                                                type="date"
                                                name="next_maintenance_date"
                                                value={formData.next_maintenance_date}
                                                onChange={handleChange}
                                                className="form-control"
                                            />
                                        </div>

                                        <div className="form-group full-width">
                                            <label>Equipment Image</label>
                                            <input
                                                type="file"
                                                name="image"
                                                onChange={handleChange}
                                                className="form-control"
                                                accept="image/*"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    name="is_available"
                                                    checked={formData.is_available}
                                                    onChange={handleChange}
                                                />
                                                Available for Rental
                                            </label>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                        <button type="submit" className="btn-success-supplier" style={{ flex: 1 }}>
                                            {editingEquipment ? 'Update Equipment' : 'Add Equipment'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="btn-secondary-supplier"
                                            style={{ flex: 1 }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EquipmentManagement;
