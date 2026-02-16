import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaStar, FaRegStar, FaUserCircle } from 'react-icons/fa';
import api from '../../api/axios';
import SupplierSidebar from '../../components/SupplierSidebar';
import '../SupplierPortal.css';
import { toast } from 'react-toastify';

const ReviewsManagement = () => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [averageRating, setAverageRating] = useState(0);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await api.get('/suppliers/reviews/supplier/my_reviews/');
            const reviewsData = response.data;

            // Format data if needed (e.g. date)
            const formattedReviews = reviewsData.map(r => ({
                id: r.id,
                reviewer_name: r.reviewer_name || 'Anonymous',
                rating: r.rating,
                comment: r.comment,
                created_at: new Date(r.created_at).toLocaleDateString()
            }));

            setReviews(formattedReviews);

            if (formattedReviews.length > 0) {
                const avg = formattedReviews.reduce((acc, curr) => acc + curr.rating, 0) / formattedReviews.length;
                setAverageRating(avg.toFixed(1));
            } else {
                setAverageRating(0);
            }

            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
            // toast.error('Failed to load reviews'); // limit noise
            setLoading(false);
        }
    };

    return (
        <div className="supplier-portal-layout">
            <SupplierSidebar />
            <div className="portal-main-content animate-fade-in">
                <header className="page-header">
                    <div>
                        <h1 className="page-title">Ratings & Reviews</h1>
                        <p className="page-subtitle">See what customers are saying about you</p>
                    </div>
                </header>

                <div className="kpi-grid">
                    <div className="kpi-card" style={{ flex: '0 0 300px' }}>
                        <div className="kpi-top">
                            <span className="kpi-label">Average Rating</span>
                            <div className="kpi-icon-bg yellow"><FaStar /></div>
                        </div>
                        <div className="kpi-value">{averageRating} / 5.0</div>
                        <div className="kpi-trend positive">
                            Based on {reviews.length} reviews
                        </div>
                    </div>
                </div>

                <div className="content-card">
                    <div className="card-header">
                        <h3>Customer Reviews</h3>
                    </div>

                    {loading ? (
                        <div className="text-center p-4">Loading reviews...</div>
                    ) : (
                        <div className="reviews-list">
                            {reviews.map((review) => (
                                <div key={review.id} className="review-item" style={{
                                    padding: '1.5rem',
                                    borderBottom: '1px solid #f3f4f6',
                                    display: 'flex',
                                    gap: '1rem'
                                }}>
                                    <div className="reviewer-avatar">
                                        <FaUserCircle size={40} color="#9CA3AF" />
                                    </div>
                                    <div className="review-content" style={{ flex: 1 }}>
                                        <div className="review-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#111827' }}>{review.reviewer_name}</h4>
                                            <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>{review.created_at}</span>
                                        </div>
                                        <div className="review-rating" style={{ display: 'flex', gap: '2px', color: '#FBBF24', marginBottom: '0.5rem' }}>
                                            {[...Array(5)].map((_, i) => (
                                                i < review.rating ? <FaStar key={i} /> : <FaRegStar key={i} />
                                            ))}
                                        </div>
                                        <p style={{ color: '#4B5563', margin: 0, lineHeight: 1.5 }}>
                                            {review.comment}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewsManagement;
