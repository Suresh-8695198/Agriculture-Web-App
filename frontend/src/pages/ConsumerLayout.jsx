import React from 'react';
import { Outlet } from 'react-router-dom';
import ConsumerSidebar from '../components/ConsumerSidebar';
import './FarmerLayout.css'; // Reusing layout CSS

const ConsumerLayout = () => {
    return (
        <div className="farmer-layout">
            <ConsumerSidebar />
            <main className="farmer-main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default ConsumerLayout;
