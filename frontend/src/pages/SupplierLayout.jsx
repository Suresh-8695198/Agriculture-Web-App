import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SupplierSidebar from '../components/SupplierSidebar';
import './SupplierPortal.css';

const SupplierLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className={`supplier-portal-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            <SupplierSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(prev => !prev)} />
            <div className="supplier-page-wrapper">
                <Outlet />
            </div>
        </div>
    );
};

export default SupplierLayout;
