import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaChartBar, FaFileDownload, FaSpinner, FaHistory } from 'react-icons/fa';
import api from '../../api/axios';
import SupplierSidebar from '../../components/SupplierSidebar';
import '../SupplierPortal.css';
import { toast } from 'react-toastify';

const Reports = () => {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [reportType, setReportType] = useState('sales');
    const [dateRange, setDateRange] = useState({ start_date: '', end_date: '' });

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await api.get('/reports/');
            setReports(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
            // toast.error('Failed to load reports history');
            setLoading(false);
        }
    };

    const handleGenerateReport = async (e) => {
        e.preventDefault();
        try {
            setGenerating(true);
            const response = await api.post('/reports/generate/', {
                report_type: reportType,
                ...dateRange
            });

            toast.success('Report generated successfully!');
            setReports([response.data, ...reports]); // Add new report to top
            setGenerating(false);
        } catch (error) {
            console.error('Failed to generate report:', error);
            toast.error('Failed to generate report');
            setGenerating(false);
        }
    };

    const getReportTypeName = (type) => {
        const types = {
            'sales': 'Sales & Earnings',
            'inventory': 'Inventory Status',
            'orders': 'Order History',
            'activity': 'User Activity'
        };
        return types[type] || type;
    };

    return (
        <div className="supplier-portal-layout">
            <SupplierSidebar />
            <div className="portal-main-content animate-fade-in">
                <header className="page-header">
                    <div>
                        <h1 className="page-title">Reports & Analytics</h1>
                        <p className="page-subtitle">Generate and download detailed business reports</p>
                    </div>
                </header>

                <div className="content-grid">
                    {/* Generator Card */}
                    <div className="content-card">
                        <div className="card-header">
                            <h3><FaChartBar /> Generate New Report</h3>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleGenerateReport}>
                                <div className="form-group">
                                    <label>Report Type</label>
                                    <select
                                        className="form-control"
                                        value={reportType}
                                        onChange={(e) => setReportType(e.target.value)}
                                    >
                                        <option value="sales">Sales & Earnings</option>
                                        <option value="inventory">Inventory Status</option>
                                        <option value="orders">Order History</option>
                                        {/* <option value="activity">User Activity</option> */}
                                    </select>
                                </div>

                                <div className="form-row">
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Start Date (Optional)</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={dateRange.start_date}
                                            onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>End Date (Optional)</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={dateRange.end_date}
                                            onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={generating}
                                    style={{ width: '100%', marginTop: '1rem' }}
                                >
                                    {generating ? <><FaSpinner className="spin" /> Generating...</> : 'Generate Report'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Report History */}
                    <div className="content-card">
                        <div className="card-header">
                            <h3><FaHistory /> Report History</h3>
                        </div>
                        <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Date Executed</th>
                                        <th>Report Type</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="4" className="text-center">Loading...</td></tr>
                                    ) : reports.length > 0 ? (
                                        reports.map((report) => (
                                            <tr key={report.id}>
                                                <td>{new Date(report.created_at).toLocaleString()}</td>
                                                <td>{getReportTypeName(report.report_type)}</td>
                                                <td>
                                                    <span className={`status-badge status-${report.status}`}>
                                                        {report.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {report.file ? (
                                                        <a
                                                            href={report.file}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn-text"
                                                            style={{ color: '#2563EB', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                                        >
                                                            <FaFileDownload /> Download
                                                        </a>
                                                    ) : (
                                                        <span className="text-muted">Processing...</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="4" className="text-center">No reports generated yet</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
