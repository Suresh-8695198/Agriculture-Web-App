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
        latitude: null,
        longitude: null
    });

    const [error, setError] = useState('');
    const { register } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = parseFloat(position.coords.latitude).toFixed(6);
                    const lng = parseFloat(position.coords.longitude).toFixed(6);
                    setFormData(prev => ({
                        ...prev,
                        latitude: lat,
                        longitude: lng
                    }));
                    alert(`Location detected: ${lat}, ${lng}`);
                },
                (error) => {
                    alert("Error detecting location: " + error.message);
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Basic Validations
        const usernameRegex = /^[\w.@+-]+$/;
        if (!usernameRegex.test(formData.username)) {
            setError("Username can only contain letters, numbers, and @/./+/-/_ characters.");
            return;
        }

        if (formData.password !== formData.password2) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        if (/^\d+$/.test(formData.password)) {
            setError("Password cannot be entirely numeric.");
            return;
        }

        try {
            await register(formData);
            navigate('/');
        } catch (err) {
            console.error("Registration Error:", err);
            // Extract detailed error message from DRF response
            let errorMessage = "Registration failed.";
            if (err.response && err.response.data) {
                const data = err.response.data;
                if (typeof data === 'object') {
                    // Combine all error messages
                    errorMessage = Object.keys(data).map(key => {
                        const msg = Array.isArray(data[key]) ? data[key].join(' ') : data[key];
                        return `${key}: ${msg}`;
                    }).join(' | ');
                } else {
                    errorMessage = data;
                }
            }
            setError(errorMessage);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass animate-fade-in" style={{ maxWidth: '600px' }}>
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Join the AgriConnect Community</p>

                {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem', padding: '10px', background: 'rgba(255,0,0,0.1)', borderRadius: '4px' }}>{error}</div>}

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
                        <input
                            name="username"
                            type="text"
                            className="form-control"
                            onChange={handleChange}
                            required
                            pattern="[\w.@+-]+"
                            title="Letters, numbers and @/./+/-/_ characters only"
                        />
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
                        <button type="button" className="btn btn-secondary" onClick={handleLocation} style={{ width: '100%', marginBottom: '1rem' }}>
                            📍 Detect My Location {formData.latitude && '✅'}
                        </button>
                        {formData.latitude && <p className="text-sm text-gray-500">Lat: {formData.latitude}, Lng: {formData.longitude}</p>}
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

                    <div className="auth-footer" style={{ marginTop: '1rem', textAlign: 'center' }}>
                        <p>Already have an account? <a href="/login" style={{ color: 'var(--primary-color)' }}>Login</a></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
