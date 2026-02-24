import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import FarmerSidebar from '../components/FarmerSidebar';
import './FarmerLayout.css';

const FarmerLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className={`farmer-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            <FarmerSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(prev => !prev)} />
            <main className="farmer-main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default FarmerLayout;
