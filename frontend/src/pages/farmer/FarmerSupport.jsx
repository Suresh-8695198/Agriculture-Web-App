import React, { useState } from 'react';
import { FaQuestionCircle, FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaBook } from 'react-icons/fa';
import './FarmerPages.css';

const FarmerSupport = () => {
    const [activeTab, setActiveTab] = useState('contact');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const faqs = [
        {
            id: 1,
            question: 'How do I search for nearest suppliers?',
            answer: 'Go to "Find Suppliers" and either enter your location or use GPS. The system will show suppliers sorted by distance. You can call them directly with one click.'
        },
        {
            id: 2,
            question: 'What if my preferred supplier is unavailable?',
            answer: 'Our system automatically shows the next nearest supplier. You can also see their availability status before calling.'
        },
        {
            id: 3,
            question: 'How do I rent a tractor?',
            answer: 'Visit "Rent Equipment", select your preferred tractor, choose date and duration (hours or days), and confirm the booking. You\'ll receive instant confirmation.'
        },
        {
            id: 4,
            question: 'How do I sell my crops?',
            answer: 'Go to "Sell Produce", click "Add New Listing", fill in details about your crop (type, quantity, price), and publish. Buyers will contact you directly.'
        },
        {
            id: 5,
            question: 'How do payments work?',
            answer: 'All transactions go through your wallet. You can add money via UPI, Net Banking, or Cards. Earnings from sales are automatically credited.'
        },
        {
            id: 6,
            question: 'Can I track my orders?',
            answer: 'Yes! Go to "Order Tracking" to see real-time status of all your purchases and rentals with visual timelines.'
        }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Support request submitted! We\'ll get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="farmer-content-container">
            <div className="farmer-page-header">
                <h1 className="farmer-page-title">
                    <FaQuestionCircle style={{ color: '#43A047' }} />
                    Support & Help
                </h1>
                <p className="farmer-page-description">
                    Get assistance with your queries and explore resources
                </p>
            </div>

            <div className="support-tabs">
                <button
                    className={activeTab === 'contact' ? 'active' : ''}
                    onClick={() => setActiveTab('contact')}
                >
                    <FaPhone /> Contact Us
                </button>
                <button
                    className={activeTab === 'faq' ? 'active' : ''}
                    onClick={() => setActiveTab('faq')}
                >
                    <FaBook /> FAQs
                </button>
            </div>

            {activeTab === 'contact' && (
                <>
                    <div className="farmer-grid">
                        <div className="support-card contact-info-card">
                            <h2>Contact Information</h2>
                            <div className="contact-info-list">
                                <div className="contact-info-item">
                                    <div className="contact-icon">
                                        <FaPhone />
                                    </div>
                                    <div className="contact-details">
                                        <strong>Phone</strong>
                                        <p>1800-XXX-XXXX (Toll Free)</p>
                                        <p>+91 98765 43210</p>
                                    </div>
                                </div>
                                <div className="contact-info-item">
                                    <div className="contact-icon">
                                        <FaEnvelope />
                                    </div>
                                    <div className="contact-details">
                                        <strong>Email</strong>
                                        <p>support@agriconnect.com</p>
                                        <p>farmers@agriconnect.com</p>
                                    </div>
                                </div>
                                <div className="contact-info-item">
                                    <div className="contact-icon">
                                        <FaMapMarkerAlt />
                                    </div>
                                    <div className="contact-details">
                                        <strong>Address</strong>
                                        <p>AgriConnect Headquarters</p>
                                        <p>123 Farm Lane, Agricultural District</p>
                                    </div>
                                </div>
                                <div className="contact-info-item">
                                    <div className="contact-icon">
                                        <FaClock />
                                    </div>
                                    <div className="contact-details">
                                        <strong>Working Hours</strong>
                                        <p>Monday - Saturday: 8 AM - 8 PM</p>
                                        <p>Sunday: 9 AM - 5 PM</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="support-card query-form-card">
                            <h2>Submit a Query</h2>
                            <form onSubmit={handleSubmit} className="support-form">
                                <div className="form-group">
                                    <label>Your Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter your name"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="your.email@example.com"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Subject</label>
                                    <select
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select a subject</option>
                                        <option value="order">Order Related</option>
                                        <option value="payment">Payment Issue</option>
                                        <option value="rental">Equipment Rental</option>
                                        <option value="account">Account Issues</option>
                                        <option value="technical">Technical Problem</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Your Message</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Describe your issue or question in detail..."
                                        rows="5"
                                        required
                                    ></textarea>
                                </div>
                                <button type="submit" className="farmer-btn-primary">
                                    Submit Query
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="quick-help-banner">
                        <h3>🚀 Quick Help Tips</h3>
                        <ul>
                            <li>For urgent issues, call our toll-free number</li>
                            <li>Email responses typically within 24 hours</li>
                            <li>Check FAQs for instant answers to common questions</li>
                            <li>Include order/booking ID in your message for faster resolution</li>
                        </ul>
                    </div>
                </>
            )}

            {activeTab === 'faq' && (
                <div className="faq-section">
                    <h2>Frequently Asked Questions</h2>
                    <div className="faq-list">
                        {faqs.map(faq => (
                            <details key={faq.id} className="faq-item">
                                <summary className="faq-question">
                                    <FaQuestionCircle className="faq-icon" />
                                    {faq.question}
                                </summary>
                                <div className="faq-answer">
                                    {faq.answer}
                                </div>
                            </details>
                        ))}
                    </div>
                    <div className="faq-footer">
                        <p>Can't find what you're looking for?</p>
                        <button
                            className="farmer-btn-primary"
                            onClick={() => setActiveTab('contact')}
                        >
                            Contact Support
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FarmerSupport;
