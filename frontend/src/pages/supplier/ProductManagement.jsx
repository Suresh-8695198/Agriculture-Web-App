import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaImage, FaBox,
    FaSeedling, FaIndustry, FaTint, FaLeaf, FaTractor, FaTools
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import SupplierSidebar from '../../components/SupplierSidebar';
import '../SupplierPortal.css';

const ProductManagement = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [formData, setFormData] = useState({
        name: '',
        category: 'seeds',
        description: '',
        price: '',
        unit: 'kg',
        stock_quantity: '',
        is_available: true,
        is_rental: false,
        rental_price_per_day: '',
        image: null
    });

    const categories = [
        { value: 'seeds', label: 'Seeds', icon: <FaSeedling /> },
        { value: 'fertilizer', label: 'Fertilizer', icon: <FaIndustry /> },
        { value: 'manure', label: 'Manure', icon: <FaLeaf /> },
        { value: 'plant_food', label: 'Plant Food', icon: <FaTint /> },
        { value: 'tractor', label: 'Tractor', icon: <FaTractor /> },
        { value: 'equipment', label: 'Equipment', icon: <FaTools /> },
        { value: 'pesticide', label: 'Pesticide', icon: <FaTint /> },
        { value: 'tools', label: 'Tools', icon: <FaTools /> },
        { value: 'other', label: 'Other', icon: <FaBox /> },
    ];

    const units = [
        { value: 'kg', label: 'Kilogram' },
        { value: 'liter', label: 'Liter' },
        { value: 'piece', label: 'Piece' },
        { value: 'bag', label: 'Bag' },
        { value: 'hour', label: 'Hour/Day' },
    ];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('suppliers/products/my_products/');
            setProducts(response.data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            toast.error('Failed to load products');
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
            if (editingProduct) {
                await api.patch(`suppliers/products/${editingProduct.id}/`, submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Product updated successfully!');
            } else {
                await api.post('suppliers/products/', submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Product added successfully!');
            }

            fetchProducts();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save product:', error);
            toast.error('Failed to save product');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            category: product.category,
            description: product.description,
            price: product.price,
            unit: product.unit,
            stock_quantity: product.stock_quantity,
            is_available: product.is_available,
            is_rental: product.is_rental,
            rental_price_per_day: product.rental_price_per_day || '',
            image: null
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`suppliers/products/${id}/`);
                toast.success('Product deleted successfully!');
                fetchProducts();
            } catch (error) {
                console.error('Failed to delete product:', error);
                toast.error('Failed to delete product');
            }
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingProduct(null);
        setFormData({
            name: '',
            category: 'seeds',
            description: '',
            price: '',
            unit: 'kg',
            stock_quantity: '',
            is_available: true,
            is_rental: false,
            rental_price_per_day: '',
            image: null
        });
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className="supplier-portal-layout">
                <SupplierSidebar />
                <div className="portal-main-content">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading products...</p>
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
                        <h1 className="portal-title">Product Management</h1>
                        <p className="portal-subtitle">Manage your products and inventory</p>
                    </div>
                    <button className="btn-primary-supplier" onClick={() => setShowModal(true)}>
                        <FaPlus /> Add New Product
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
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="form-control"
                                    style={{ paddingLeft: '2.5rem' }}
                                />
                            </div>
                        </div>
                        <div style={{ minWidth: '200px' }}>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="form-control"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                {filteredProducts.length === 0 ? (
                    <div className="section-card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <FaBox style={{ fontSize: '4rem', color: '#D1D5DB', marginBottom: '1rem' }} />
                        <h3 style={{ color: '#6B7280', marginBottom: '0.5rem' }}>No products found</h3>
                        <p style={{ color: '#9CA3AF' }}>
                            {searchTerm || filterCategory !== 'all'
                                ? 'Try adjusting your filters'
                                : 'Start by adding your first product'}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {filteredProducts.map(product => (
                            <div key={product.id} className="section-card" style={{ padding: '0', overflow: 'hidden' }}>
                                {/* Product Image */}
                                <div style={{
                                    height: '200px',
                                    background: product.image ? `url(${product.image})` : 'linear-gradient(135deg, #8B6F47 0%, #5D4A30 100%)',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative'
                                }}>
                                    {!product.image && <FaBox style={{ fontSize: '3rem', color: 'white', opacity: 0.5 }} />}
                                    <div style={{
                                        position: 'absolute',
                                        top: '0.75rem',
                                        right: '0.75rem',
                                        background: product.is_available ? '#10B981' : '#EF4444',
                                        color: 'white',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.75rem',
                                        fontWeight: '600'
                                    }}>
                                        {product.is_available ? 'Available' : 'Unavailable'}
                                    </div>
                                </div>

                                {/* Product Details */}
                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', margin: '0 0 0.25rem 0' }}>
                                                {product.name}
                                            </h3>
                                            <span style={{
                                                background: '#F3F4F6',
                                                color: '#6B7280',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '0.375rem',
                                                fontSize: '0.75rem',
                                                fontWeight: '600'
                                            }}>
                                                {categories.find(c => c.value === product.category)?.label || product.category}
                                            </span>
                                        </div>
                                    </div>

                                    <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: '1.5' }}>
                                        {product.description.length > 100
                                            ? product.description.substring(0, 100) + '...'
                                            : product.description}
                                    </p>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>Price</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#8B6F47' }}>
                                                ₹{product.price}/{product.unit}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>Stock</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: product.stock_quantity < 10 ? '#EF4444' : '#111827' }}>
                                                {product.stock_quantity} {product.unit}
                                            </div>
                                        </div>
                                    </div>

                                    {product.is_rental && product.rental_price_per_day && (
                                        <div style={{
                                            background: '#FEF3C7',
                                            border: '1px solid #FCD34D',
                                            borderRadius: '0.5rem',
                                            padding: '0.5rem',
                                            marginBottom: '1rem',
                                            fontSize: '0.875rem',
                                            color: '#92400E'
                                        }}>
                                            <strong>Rental:</strong> ₹{product.rental_price_per_day}/day
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="btn-primary-supplier"
                                            style={{ flex: 1, fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                                        >
                                            <FaEdit /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="btn-secondary-supplier"
                                            style={{ flex: 1, fontSize: '0.875rem', padding: '0.5rem 1rem', color: '#EF4444', borderColor: '#EF4444' }}
                                        >
                                            <FaTrash /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
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
                            maxWidth: '600px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflow: 'auto'
                        }}>
                            <div style={{ padding: '2rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>
                                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                                </h2>

                                <form onSubmit={handleSubmit}>
                                    <div className="form-grid">
                                        <div className="form-group full-width">
                                            <label>Product Name *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="form-control"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Category *</label>
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleChange}
                                                className="form-control"
                                                required
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Unit *</label>
                                            <select
                                                name="unit"
                                                value={formData.unit}
                                                onChange={handleChange}
                                                className="form-control"
                                                required
                                            >
                                                {units.map(unit => (
                                                    <option key={unit.value} value={unit.value}>{unit.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Price (₹) *</label>
                                            <input
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleChange}
                                                className="form-control"
                                                step="0.01"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Stock Quantity *</label>
                                            <input
                                                type="number"
                                                name="stock_quantity"
                                                value={formData.stock_quantity}
                                                onChange={handleChange}
                                                className="form-control"
                                                required
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
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Product Image</label>
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
                                                Available for Sale
                                            </label>
                                        </div>

                                        <div className="form-group">
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    name="is_rental"
                                                    checked={formData.is_rental}
                                                    onChange={handleChange}
                                                />
                                                Available for Rental
                                            </label>
                                        </div>

                                        {formData.is_rental && (
                                            <div className="form-group full-width">
                                                <label>Rental Price per Day (₹)</label>
                                                <input
                                                    type="number"
                                                    name="rental_price_per_day"
                                                    value={formData.rental_price_per_day}
                                                    onChange={handleChange}
                                                    className="form-control"
                                                    step="0.01"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                        <button type="submit" className="btn-success-supplier" style={{ flex: 1 }}>
                                            {editingProduct ? 'Update Product' : 'Add Product'}
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

export default ProductManagement;
