
import React, { useState, useEffect, useCallback } from 'react';
import {
    FaShoppingCart, FaSearch, FaPlus, FaMinus, FaHistory,
    FaStore, FaLeaf, FaTruck, FaMapMarkerAlt, FaCheckCircle,
    FaTimes, FaBoxOpen, FaClipboardList, FaArrowLeft, FaExclamationTriangle,
    FaTools
} from 'react-icons/fa';
import { GiFertilizerBag, GiSprout, GiCow, GiPowder } from 'react-icons/gi';
import { MdShoppingBasket, MdOutlineReceiptLong, MdDeleteOutline } from 'react-icons/md';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import './FarmerPages.css';

/* ─── helpers ─────────────────────────────────────────────────── */
const categories = [
    { value: 'all', label: 'All Products', icon: <FaStore /> },
    { value: 'seeds', label: 'Seeds', icon: <GiSprout /> },
    { value: 'fertilizer', label: 'Fertilizer', icon: <GiFertilizerBag /> },
    { value: 'manure', label: 'Manure', icon: <GiCow /> },
    { value: 'pesticide', label: 'Pesticide', icon: <GiPowder /> },
    { value: 'plant_food', label: 'Plant Food', icon: <FaLeaf /> },
    { value: 'tools', label: 'Tools', icon: <FaTools /> },
    { value: 'equipment', label: 'Equipment', icon: <FaTools /> },
    { value: 'tractor', label: 'Tractor', icon: <FaTools /> },
    { value: 'other', label: 'Other', icon: <FaLeaf /> },
];

const categoryIcon = (cat) => {
    switch (cat?.toLowerCase()) {
        case 'seeds': return <GiSprout />;
        case 'fertilizer': return <GiFertilizerBag />;
        case 'manure': return <GiCow />;
        case 'pesticide': return <GiPowder />;
        case 'tools': return <FaTools />;
        case 'plant_food': return <FaLeaf />;
        case 'tractor': return <FaTools />;
        case 'equipment': return <FaTools />;
        default: return <FaLeaf />;
    }
};

const statusColors = {
    'pending': { bg: '#FEF3C7', text: '#D97706', label: 'Pending' },
    'confirmed': { bg: '#DBEAFE', text: '#1E40AF', label: 'Confirmed' },
    'processing': { bg: '#E0E7FF', text: '#4338CA', label: 'Processing' },
    'ready': { bg: '#F3E8FF', text: '#7E22CE', label: 'Ready' },
    'delivered': { bg: '#DCFCE7', text: '#166534', label: 'Delivered' },
    'cancelled': { bg: '#FEE2E2', text: '#DC2626', label: 'Cancelled' },
    'rejected': { bg: '#F3F4F6', text: '#4B5563', label: 'Rejected' },
};

/* ─── component ───────────────────────────────────────────────── */
const BuyProducts = () => {
    // UI State
    const [activeTab, setActiveTab] = useState('shop'); // 'shop' | 'orders'
    const [showCart, setShowCart] = useState(false);

    // Data State
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ordersLoading, setOrdersLoading] = useState(false);

    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Checkout State
    const [placingOrder, setPlacingOrder] = useState(false);
    const [deliveryMethod, setDeliveryMethod] = useState('pickup');
    const [deliveryAddress, setDeliveryAddress] = useState('');

    /* ── Fetch Data ── */
    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('suppliers/products/');
            // Handle both paginated { results: [...] } and plain array responses
            const data = res.data?.results ?? res.data;
            setProducts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load marketplace products.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchOrders = useCallback(async () => {
        try {
            setOrdersLoading(true);
            const res = await api.get('suppliers/orders/farmer_orders/');
            // Handle both paginated { results: [...] } and plain array responses
            const data = res.data?.results ?? res.data;
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load your orders.');
        } finally {
            setOrdersLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'shop') fetchProducts();
        else fetchOrders();
    }, [activeTab, fetchProducts, fetchOrders]);

    /* ── Cart Logic ── */
    const addToCart = (product) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            if (existing.quantity >= product.stock_quantity) {
                toast.warn('Cannot add more than available stock.');
                return;
            }
            setCart(cart.map(item =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
        setShowCart(true);
        toast.info(`Added ${product.name} to cart.`);
    };

    const updateQuantity = (productId, change) => {
        const product = products.find(p => p.id === productId);
        setCart(cart.map(item => {
            if (item.id === productId) {
                const newQuantity = item.quantity + change;
                if (newQuantity > (product?.stock_quantity || 999)) {
                    toast.warn('Limit reached according to stock.');
                    return item;
                }
                return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryCharges = deliveryMethod === 'delivery' ? 50 : 0;
    const total = subtotal + deliveryCharges;

    /* ── Checkout ── */
    const handlePlaceOrder = async () => {
        if (cart.length === 0) return;
        if (deliveryMethod === 'delivery' && !deliveryAddress.trim()) {
            toast.error('Please provide a delivery address.');
            return;
        }

        setPlacingOrder(true);
        try {
            // In a real high-end system, we'd do a bulk create or sequential
            // Here we do sequential for simplicity and clear feedback per item
            for (const item of cart) {
                await api.post('suppliers/orders/place_order/', {
                    product_id: item.id,
                    quantity: item.quantity,
                    delivery_method: deliveryMethod,
                    delivery_address: deliveryAddress,
                    customer_notes: ''
                });
            }
            toast.success('🎉 Orders placed successfully!');
            setCart([]);
            setShowCart(false);
            setActiveTab('orders');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Failed to place order.');
        } finally {
            setPlacingOrder(false);
        }
    };

    /* ── Order Actions ── */
    const cancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        try {
            await api.patch(`suppliers/orders/${orderId}/cancel_order/`);
            toast.success('Order cancelled.');
            fetchOrders();
        } catch (err) {
            toast.error('Failed to cancel order.');
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.supplier_name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCat = selectedCategory === 'all' || (p.category || '').toLowerCase() === selectedCategory.toLowerCase();
        return matchesSearch && matchesCat && p.is_available;
    });

    /* ── Render ── */
    return (
        <div className="adv-dashboard-container">

            {/* ── HEADER ── */}
            <header className="adv-header" style={{ marginBottom: 24, padding: 0, background: 'transparent', boxShadow: 'none' }}>
                <div>
                    <h1 style={{ color: '#111827', fontSize: 28, marginBottom: 4, fontWeight: 800 }}>
                        {activeTab === 'shop' ? '🚜 Agri Marketplace' : '📦 My Purchases'}
                    </h1>
                    <p style={{ color: '#6B7280', fontSize: '1rem', margin: 0 }}>
                        {activeTab === 'shop'
                            ? 'Quality seeds, fertilizers and tools from verified suppliers.'
                            : 'Track and manage your orders for farm essentials.'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button
                        className={activeTab === 'shop' ? 'adv-btn-primary' : 'adv-btn-secondary'}
                        onClick={() => setActiveTab('shop')}
                        style={{ padding: '10px 20px', fontSize: 14 }}
                    >
                        <FaStore /> Shop
                    </button>
                    <button
                        className={activeTab === 'orders' ? 'adv-btn-primary' : 'adv-btn-secondary'}
                        onClick={() => setActiveTab('orders')}
                        style={{ padding: '10px 20px', fontSize: 14 }}
                    >
                        <FaHistory /> Order History
                    </button>
                    {cart.length > 0 && (
                        <button
                            className="adv-btn-primary"
                            onClick={() => setShowCart(true)}
                            style={{ position: 'relative', background: '#166534', padding: '10px 20px' }}
                        >
                            <FaShoppingCart />
                            <span style={{ position: 'absolute', top: -8, right: -8, background: '#DC2626', borderRadius: '50%', width: 22, height: 22, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {cart.length}
                            </span>
                        </button>
                    )}
                </div>
            </header>

            {/* ── MAIN CONTENT ── */}
            {activeTab === 'shop' ? (
                <>
                    {/* Filters */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                        <div style={{ flex: 1, minWidth: 280, position: 'relative' }}>
                            <FaSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                            <input
                                type="text"
                                placeholder="Search products or suppliers..."
                                className="adv-form-input"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{ paddingLeft: 42, background: '#fff' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                            {categories.map(cat => (
                                <button
                                    key={cat.value}
                                    onClick={() => setSelectedCategory(cat.value)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, border: '1px solid', fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 0.2s',
                                        background: selectedCategory === cat.value ? '#166534' : '#fff',
                                        borderColor: selectedCategory === cat.value ? '#166534' : '#E5E7EB',
                                        color: selectedCategory === cat.value ? '#fff' : '#4B5563',
                                    }}
                                >
                                    {cat.icon} {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Products Grid */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px' }}>
                            <div className="loading-spinner"></div>
                            <p style={{ marginTop: 16, color: '#6B7280' }}>Fetching seeds and supplies...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div style={{ background: '#fff', padding: '80px 20px', borderRadius: 20, textAlign: 'center', border: '1px solid #E5E7EB' }}>
                            <div style={{ fontSize: 60, marginBottom: 20 }}>🔍</div>
                            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>No products found</h3>
                            <p style={{ color: '#6B7280' }}>Try a different category or search term.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
                            {filteredProducts.map(product => (
                                <div key={product.id} className="adv-card product-item-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ height: 180, background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60, position: 'relative' }}>
                                        {(product.image_url || product.image) ? (
                                            <img src={product.image_url || product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span style={{ color: '#166534', opacity: 0.8 }}>{categoryIcon(product.category)}</span>
                                        )}
                                        <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.9)', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, color: '#166534', border: '1px solid #DCFCE7' }}>
                                            {(product.category || '').toUpperCase()}
                                        </div>
                                    </div>

                                    <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <h3 style={{ margin: '0 0 6px 0', fontSize: 18, fontWeight: 700, color: '#111827' }}>{product.name}</h3>
                                        <p style={{ margin: '0 0 6px 0', fontSize: 14, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <FaStore size={12} /> {product.supplier_name}
                                        </p>
                                        {product.supplier_location?.full_address && product.supplier_location.full_address !== 'Location not specified' && (
                                            <p style={{ margin: '0 0 8px 0', fontSize: 12, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <FaMapMarkerAlt size={10} /> {product.supplier_location.full_address}
                                            </p>
                                        )}
                                        {product.description && (
                                            <p style={{ margin: '0 0 10px 0', fontSize: 13, color: '#4B5563', lineHeight: 1.5 }}>
                                                {product.description.length > 80 ? product.description.substring(0, 80) + '...' : product.description}
                                            </p>
                                        )}

                                        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <span style={{ fontSize: 22, fontWeight: 800, color: '#166534' }}>₹{product.price}</span>
                                                <span style={{ fontSize: 13, color: '#6B7280' }}> / {product.unit}</span>
                                            </div>
                                            <span style={{ fontSize: 12, color: product.stock_quantity < 10 ? '#DC2626' : '#166534', fontWeight: 600 }}>
                                                {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                                            </span>
                                        </div>

                                        <button
                                            className="adv-btn-primary"
                                            onClick={() => addToCart(product)}
                                            disabled={product.stock_quantity <= 0}
                                            style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}
                                        >
                                            <FaPlus /> Add to Cart
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                /* ── Order History View ── */
                <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                    {ordersLoading ? (
                        <div style={{ textAlign: 'center', padding: '60px' }}>
                            <div className="loading-spinner"></div>
                            <p style={{ marginTop: 16, color: '#6B7280' }}>Loading your purchase history...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div style={{ background: '#fff', padding: '80px 20px', borderRadius: 20, textAlign: 'center', border: '1px solid #E5E7EB' }}>
                            <div style={{ fontSize: 60, marginBottom: 20 }}>📦</div>
                            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>No orders yet</h3>
                            <p style={{ color: '#6B7280' }}>Products you purchase will appear here.</p>
                            <button className="adv-btn-primary" onClick={() => setActiveTab('shop')} style={{ marginTop: 20 }}>Start Shopping</button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: 16 }}>
                            {orders.map(order => {
                                const status = statusColors[order.status] || statusColors.pending;
                                return (
                                    <div key={order.id} className="adv-card" style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' }}>
                                        <div style={{ width: 64, height: 64, background: '#F9FAFB', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                                            {order.product_image ? (
                                                <img src={order.product_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
                                            ) : categoryIcon(order.product_category)}
                                        </div>

                                        <div style={{ flex: 1, minWidth: 200 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                                                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{order.product_name}</h4>
                                                <span style={{ fontSize: 11, background: status.bg, color: status.text, padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
                                                    {status.label}
                                                </span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>
                                                Order ID: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{order.order_number}</span>
                                            </p>
                                            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>
                                                Ordered on: {new Date(order.created_at).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div style={{ minWidth: 120 }}>
                                            <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>Qty: {order.quantity}</p>
                                            <p style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 800, color: '#166534' }}>₹{order.total_amount}</p>
                                        </div>

                                        <div style={{ display: 'flex', gap: 10 }}>
                                            {order.status === 'pending' && (
                                                <button
                                                    className="adv-btn-secondary"
                                                    onClick={() => cancelOrder(order.id)}
                                                    style={{ color: '#DC2626', borderColor: '#FECACA', fontSize: 13 }}
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            <button className="adv-btn-secondary" style={{ fontSize: 13 }}>Details</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ── CART MODAL / SIDEBAR ── */}
            {showCart && (
                <div className="modal-overlay" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'stretch' }}>
                    <div
                        className="cart-sidebar"
                        style={{
                            width: '100%', maxWidth: 450, background: '#fff', padding: 0, height: '100%',
                            display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
                            animation: 'slideInRight 0.3s ease'
                        }}
                    >
                        {/* Cart Header */}
                        <div style={{ padding: '24px 28px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <FaShoppingCart style={{ color: '#166534' }} /> Your Cart
                            </h2>
                            <button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}><FaTimes size={24} /></button>
                        </div>

                        {/* Cart Items */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
                            {cart.length === 0 ? (
                                <div style={{ textAlign: 'center', paddingTop: 60 }}>
                                    <div style={{ fontSize: 50, marginBottom: 16 }}>🛒</div>
                                    <h4 style={{ margin: 0, color: '#4B5563' }}>Cart is empty</h4>
                                    <button className="adv-btn-secondary" onClick={() => setShowCart(false)} style={{ marginTop: 16 }}>Go Shop</button>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gap: 20 }}>
                                    {cart.map(item => (
                                        <div key={item.id} style={{ display: 'flex', gap: 16, paddingBottom: 20, borderBottom: '1px solid #F3F4F6' }}>
                                            <div style={{ width: 60, height: 60, background: '#F9FAFB', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                                                {item.image ? <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} alt="" /> : categoryIcon(item.category)}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <h4 style={{ margin: '0 0 4px 0', fontSize: 15, fontWeight: 700 }}>{item.name}</h4>
                                                    <button onClick={() => removeFromCart(item.id)} style={{ color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer' }}><MdDeleteOutline size={20} /></button>
                                                </div>
                                                <p style={{ margin: '0 0 12px 0', fontSize: 13, color: '#166534', fontWeight: 700 }}>₹{item.price} <span style={{ color: '#9CA3AF', fontWeight: 400 }}>/ {item.unit}</span></p>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
                                                        <button onClick={() => updateQuantity(item.id, -1)} style={{ padding: '4px 10px', background: '#F9FAFB', border: 'none', cursor: 'pointer' }}><FaMinus size={10} /></button>
                                                        <span style={{ width: 40, textAlign: 'center', fontSize: 14, fontWeight: 700 }}>{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.id, 1)} style={{ padding: '4px 10px', background: '#F9FAFB', border: 'none', cursor: 'pointer' }}><FaPlus size={10} /></button>
                                                    </div>
                                                    <span style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>₹{item.price * item.quantity}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Cart Footer / Checkout */}
                        {cart.length > 0 && (
                            <div style={{ padding: '28px', background: '#F9FAFB', borderTop: '1px solid #E5E7EB' }}>
                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8, display: 'block' }}>Delivery Method</label>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <button
                                            onClick={() => setDeliveryMethod('pickup')}
                                            style={{
                                                flex: 1, padding: '10px', borderRadius: 10, border: '1.5px solid', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: '0.2s',
                                                background: deliveryMethod === 'pickup' ? '#ECFDF5' : '#fff',
                                                borderColor: deliveryMethod === 'pickup' ? '#10B981' : '#E5E7EB',
                                                color: deliveryMethod === 'pickup' ? '#065F46' : '#6B7280'
                                            }}
                                        >
                                            🏪 Self Pickup
                                        </button>
                                        <button
                                            onClick={() => setDeliveryMethod('delivery')}
                                            style={{
                                                flex: 1, padding: '10px', borderRadius: 10, border: '1.5px solid', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: '0.2s',
                                                background: deliveryMethod === 'delivery' ? '#ECFDF5' : '#fff',
                                                borderColor: deliveryMethod === 'delivery' ? '#10B981' : '#E5E7EB',
                                                color: deliveryMethod === 'delivery' ? '#065F46' : '#6B7280'
                                            }}
                                        >
                                            🚚 Home Delivery
                                        </button>
                                    </div>
                                </div>

                                {deliveryMethod === 'delivery' && (
                                    <div style={{ marginBottom: 20 }}>
                                        <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6, display: 'block' }}>Delivery Address</label>
                                        <textarea
                                            value={deliveryAddress}
                                            onChange={e => setDeliveryAddress(e.target.value)}
                                            className="adv-form-input"
                                            rows="2"
                                            placeholder="House no, Street, Village, Taluk..."
                                            style={{ background: '#fff', fontSize: 13 }}
                                        ></textarea>
                                    </div>
                                )}

                                <div style={{ display: 'grid', gap: 10, marginBottom: 24 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6B7280' }}>
                                        <span>Subtotal</span>
                                        <span>₹{subtotal}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6B7280' }}>
                                        <span>{deliveryMethod === 'pickup' ? 'Delivery (Self Pickup)' : 'Delivery Charges'}</span>
                                        <span>₹{deliveryCharges}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, color: '#111827', marginTop: 4, paddingTop: 12, borderTop: '1px dashed #D1D5DB' }}>
                                        <span>Total Amount</span>
                                        <span>₹{total}</span>
                                    </div>
                                </div>

                                <button
                                    className="adv-btn-primary"
                                    onClick={handlePlaceOrder}
                                    disabled={placingOrder}
                                    style={{ width: '100%', padding: '16px', fontSize: 16, fontWeight: 800, justifyContent: 'center' }}
                                >
                                    {placingOrder ? 'Processing...' : 'Place Orders Now'}
                                </button>
                                <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 12 }}>
                                    Orders will be sent to respective suppliers.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Slide In Animation */}
            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .product-item-card:hover { transform: translateY(-5px); box-shadow: 0 12px 24px rgba(0,0,0,0.08); }
            `}</style>
        </div>
    );
};

export default BuyProducts;
