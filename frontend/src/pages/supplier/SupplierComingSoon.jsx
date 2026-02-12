import React from 'react';
import SupplierSidebar from '../../components/SupplierSidebar';
import '../SupplierPortal.css';

const SupplierComingSoon = ({ title, subtitle, icon }) => {
    return (
        <div className="supplier-portal-layout">
            <SupplierSidebar />
            <div className="portal-main-content">
                <div className="portal-header">
                    <div>
                        <h1 className="portal-title">{icon} {title}</h1>
                        <p className="portal-subtitle">{subtitle}</p>
                    </div>
                </div>
                <div className="section-card">
                    <div className="activity-list">
                        <div className="activity-item">
                            <div className="activity-content">
                                <p className="activity-title">Coming Soon</p>
                                <span className="activity-time">This feature will be available soon</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupplierComingSoon;
