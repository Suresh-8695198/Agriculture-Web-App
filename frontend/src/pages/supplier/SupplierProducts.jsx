import React from 'react';
import SupplierSidebar from '../../components/SupplierSidebar';
import { FaBoxes } from 'react-icons/fa';
import '../SupplierPortal.css';

const SupplierProducts = () => {
    return (
        <div className="supplier-portal-layout">
            <SupplierSidebar />
            <div className="portal-main-content">
                <div className="portal-header">
                    <div>
                        <h1 className="portal-title"><FaBoxes /> Product Management</h1>
                        <p className="portal-subtitle">Manage your products and inventory</p>
                    </div>
                </div>
                <div className="section-card">
                    <div className="section-header">
                        <h2>Products</h2>
                        <p>Add and manage your products here</p>
                    </div>
                    <div className="activity-list">
                        <div className="activity-item">
                            <div className="activity-content">
                                <p className="activity-title">Coming Soon</p>
                                <span className="activity-time">Product management features will be available soon</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupplierProducts;
