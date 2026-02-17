import React from 'react';
import { Outlet } from 'react-router-dom';
import FarmerSidebar from '../components/FarmerSidebar';
import './FarmerLayout.css';

const FarmerLayout = () => {
    return (
        <div className="farmer-layout">
            <FarmerSidebar />
            <main className="farmer-main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default FarmerLayout;
