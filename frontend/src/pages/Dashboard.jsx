import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                let endpoint = '';
                if (user.user_type === 'farmer') endpoint = 'farmers/profiles/my_profile/';
                else if (user.user_type === 'supplier') endpoint = 'suppliers/profiles/my_profile/';
                else if (user.user_type === 'consumer') endpoint = 'consumers/profiles/my_profile/';

                const response = await api.get(endpoint);
                setProfile(response.data);
            } catch (error) {
                console.error("Failed to fetch profile", error);
                // If profile doesn't exist, we might need to create it
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchProfile();
    }, [user]);

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="dashboard-container container animate-fade-in">
            <header className="dashboard-header glass">
                <h1>Welcome, {user?.first_name || user?.username}!</h1>
                <p className="role-badge">{user?.user_type.toUpperCase()}</p>
            </header>

            <div className="dashboard-grid">
                {/* Stats / Quick Actions */}
                <div className="dashboard-card glass">
                    <h3>Your Profile</h3>
                    {profile ? (
                        <div>
                            <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
                            <p><strong>Phone:</strong> {user.phone_number}</p>
                            <p><strong>Address:</strong> {user.address}</p>
                            {/* Role specific fields */}
                            {user.user_type === 'farmer' && <p><strong>Farm Name:</strong> {profile.farm_name}</p>}
                            {user.user_type === 'supplier' && <p><strong>Business:</strong> {profile.business_name}</p>}
                        </div>
                    ) : (
                        <div>
                            <p>Please complete your profile details.</p>
                            <button className="btn btn-primary btn-sm">Complete Profile</button>
                        </div>
                    )}
                </div>

                <div className="dashboard-card glass">
                    <h3>Quick Actions</h3>
                    <div className="action-buttons">
                        {user.user_type === 'farmer' && (
                            <>
                                <button className="btn btn-secondary">Add Produce</button>
                                <button className="btn btn-secondary">Find Suppliers</button>
                            </>
                        )}
                        {user.user_type === 'supplier' && (
                            <>
                                <button className="btn btn-secondary">Add Product</button>
                                <button className="btn btn-secondary">View Orders</button>
                            </>
                        )}
                        {user.user_type === 'consumer' && (
                            <>
                                <button className="btn btn-secondary">Browse Market</button>
                                <button className="btn btn-secondary">My Orders</button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
