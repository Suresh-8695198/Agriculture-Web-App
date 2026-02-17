import React, { useState } from 'react';
import { FaShoppingCart, FaSearch, FaPlus, FaMinus } from 'react-icons/fa';
import { GiFertilizerBag, GiWheat } from 'react-icons/gi';
import './FarmerPages.css';

const BuyProducts = () => {
    const [cart, setCart] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');

    const products = [
        {
            id: 1,
            name: 'Organic Fertilizer',
            category: 'fertilizer',
            price: 850,
            unit: 'bag (50kg)',
            image: '🌱',
            stock: 45
        },
        {
            id: 2,
            name: 'Rice Seeds (Premium)',
            category: 'seeds',
            price: 1200,
            unit: 'kg',
            image: '🌾',
            stock: 100
        },
        {
            id: 3,
            name: 'Cow Manure',
            category: 'manure',
            price: 400,
            unit: 'bag (25kg)',
            image: '🐄',
            stock: 30
        },
        {
            id: 4,
            name: 'NPK Fertilizer',
            category: 'fertilizer',
            price: 950,
            unit: 'bag (50kg)',
            image: '💚',
            stock: 60
        },
        {
            id: 5,
            name: 'Wheat Seeds',
            category: 'seeds',
            price: 800,
            unit: 'kg',
            image: '🌾',
            stock: 80
        },
        {
            id: 6,
            name: 'Vermicompost',
            category: 'manure',
            price: 600,
            unit: 'bag (25kg)',
            image: '🪱',
            stock: 25
        }
    ];

    const filteredProducts = selectedCategory === 'all' 
        ? products 
        : products.filter(p => p.category === selectedCategory);

    const addToCart = (product) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            setCart(cart.map(item => 
                item.id === product.id 
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const updateQuantity = (productId, change) => {
        setCart(cart.map(item => {
            if (item.id === productId) {
                const newQuantity = item.quantity + change;
                return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    return (
        <div className="farmer-content-container">
            <div className="farmer-page-header">
                <h1 className="farmer-page-title">
                    <FaShoppingCart style={{ color: '#43A047' }} />
                    Buy Products
                    {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
                </h1>
                <p className="farmer-page-description">
                    Purchase seeds, fertilizers, and manure for your farm
                </p>
            </div>

            <div className="products-layout">
                <div className="products-section">
                    <div className="products-header">
                        <div className="category-filters">
                            <button 
                                className={selectedCategory === 'all' ? 'active' : ''}
                                onClick={() => setSelectedCategory('all')}
                            >
                                All Products
                            </button>
                            <button 
                                className={selectedCategory === 'seeds' ? 'active' : ''}
                                onClick={() => setSelectedCategory('seeds')}
                            >
                                🌾 Seeds
                            </button>
                            <button 
                                className={selectedCategory === 'fertilizer' ? 'active' : ''}
                                onClick={() => setSelectedCategory('fertilizer')}
                            >
                                🌱 Fertilizer
                            </button>
                            <button 
                                className={selectedCategory === 'manure' ? 'active' : ''}
                                onClick={() => setSelectedCategory('manure')}
                            >
                                🐄 Manure
                            </button>
                        </div>
                    </div>

                    <div className="products-grid">
                        {filteredProducts.map(product => (
                            <div key={product.id} className="product-card">
                                <div className="product-image">{product.image}</div>
                                <div className="product-info">
                                    <h3>{product.name}</h3>
                                    <p className="product-price">₹{product.price} <span>/ {product.unit}</span></p>
                                    <p className="product-stock">In Stock: {product.stock}</p>
                                </div>
                                <button 
                                    className="add-to-cart-btn"
                                    onClick={() => addToCart(product)}
                                >
                                    <FaPlus /> Add to Cart
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="cart-section">
                    <div className="cart-card">
                        <h2>Shopping Cart</h2>
                        {cart.length === 0 ? (
                            <div className="empty-cart">
                                <FaShoppingCart className="empty-icon" />
                                <p>Your cart is empty</p>
                            </div>
                        ) : (
                            <>
                                <div className="cart-items">
                                    {cart.map(item => (
                                        <div key={item.id} className="cart-item">
                                            <div className="cart-item-info">
                                                <span className="item-image">{item.image}</span>
                                                <div>
                                                    <h4>{item.name}</h4>
                                                    <p>₹{item.price} / {item.unit}</p>
                                                </div>
                                            </div>
                                            <div className="quantity-controls">
                                                <button onClick={() => updateQuantity(item.id, -1)}>
                                                    <FaMinus />
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, 1)}>
                                                    <FaPlus />
                                                </button>
                                            </div>
                                            <p className="item-total">₹{item.price * item.quantity}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="cart-summary">
                                    <div className="summary-row">
                                        <span>Subtotal:</span>
                                        <span>₹{getTotalPrice()}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span>Delivery:</span>
                                        <span>₹50</span>
                                    </div>
                                    <div className="summary-row total">
                                        <span>Total:</span>
                                        <span>₹{getTotalPrice() + 50}</span>
                                    </div>
                                    <button className="checkout-btn">
                                        Proceed to Checkout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuyProducts;
