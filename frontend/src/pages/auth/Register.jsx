import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css'; // Reusing Login styles

const Register = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialRole = queryParams.get('role') || 'farmer';

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
        user_type: initialRole,
        phone_number: '',
        first_name: '',
        last_name: '',
        address: '',
    });

    const [error, setError] = useState('');
    const { register } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.password2) {
            setError("Passwords do not match");
            return;
        }

        try {
            await register(formData);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please check your inputs.');
            console.error(err);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass animate-fade-in" style={{ maxWidth: '600px' }}>
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Join the AgriConnect Community</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="form-label">First Name</label>
                            <input name="first_name" type="text" className="form-control" onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Last Name</label>
                            <input name="last_name" type="text" className="form-control" onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input name="username" type="text" className="form-control" onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input name="email" type="email" className="form-control" onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input name="phone_number" type="tel" className="form-control" onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">I am a...</label>
                        <select name="user_type" className="form-control" value={formData.user_type} onChange={handleChange}>
                            <option value="farmer">Farmer</option>
                            <option value="supplier">Supplier</option>
                            <option value="consumer">Consumer</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Address</label>
                        <textarea name="address" className="form-control" rows="2" onChange={handleChange} placeholder="Enter full address"></textarea>
                    </div>

                    <div className="form-group">
                        <button type="button" className="btn btn-secondary" onClick={() => {
                            if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition((position) => {
                                    setFormData({
                                        ...formData,
                                        latitude: position.coords.latitude,
                                        longitude: position.coords.longitude
                                    });
                                    alert("Location detected successfully!");
                                }, (error) => {
                                    alert("Error detecting location: " + error.message);
                                });
                            } else {
                                alert("Geolocation is not supported by this browser.");
                            }
                        }} style={{ width: '100%', marginBottom: '1rem' }}>
                            📍 Detect My Location
                        </button>
                        <input type="hidden" name="latitude" value={formData.latitude || ''} />
                        <input type="hidden" name="longitude" value={formData.longitude || ''} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input name="password" type="password" className="form-control" onChange={handleChange} required minLength="8" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input name="password2" type="password" className="form-control" onChange={handleChange} required />
                        </div>
                    </div>

                    <button type="submit" className="auth-btn">Register</button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <a href="/login">Login</a></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
