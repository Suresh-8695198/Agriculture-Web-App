import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaMoneyBillWave, FaArrowUp, FaArrowDown, FaHistory, FaFileInvoiceDollar } from 'react-icons/fa';
import api from '../../api/axios';
import SupplierSidebar from '../../components/SupplierSidebar';
import '../SupplierPortal.css';
import { toast } from 'react-toastify';

const PaymentsManagement = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({
        totalEarnings: 0,
        pendingPayouts: 0,
        availableBalance: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPaymentsData();
    }, []);

    const fetchPaymentsData = async () => {
        try {
            setLoading(true);
            const [statsRes, transactionsRes, payoutsRes] = await Promise.all([
                api.get('/suppliers/profiles/dashboard_stats/'),
                api.get('/finance/transactions/'),
                api.get('/finance/payouts/')
            ]);

            const statsData = statsRes.data;
            const transactionsData = transactionsRes.data;
            const payoutsData = payoutsRes.data;

            // Calculate pending payouts
            const pendingPayoutsTotal = payoutsData
                .filter(p => p.status === 'pending')
                .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

            // Calculate processed payouts to deduct from earnings
            const processedPayoutsTotal = payoutsData
                .filter(p => p.status === 'processed' || p.status === 'approved')
                .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

            // Available Balance = Total Earnings - Processed Payouts
            // Note: In a real system, you'd have a dedicated wallet balance field
            const availableBalance = (statsData.total_earnings || 0) - processedPayoutsTotal;

            setStats({
                totalEarnings: statsData.total_earnings || 0,
                pendingPayouts: pendingPayoutsTotal,
                availableBalance: Math.max(0, availableBalance) // Ensure non-negative
            });

            // Format transactions for display
            // We combine actual transactions and payout requests if needed, 
            // but for now let's just show the transactions endpoint data
            const formattedTransactions = transactionsData.map(tx => ({
                id: tx.id,
                date: new Date(tx.created_at).toLocaleDateString(),
                description: tx.description,
                type: tx.transaction_type, // 'credit' or 'debit'
                amount: parseFloat(tx.amount),
                status: tx.status
            }));

            setTransactions(formattedTransactions);
            setLoading(false);

        } catch (error) {
            console.error('Failed to fetch payments:', error);
            // toast.error('Failed to load payments data');
            setLoading(false);
        }
    };

    const handleRequestPayout = () => {
        if (stats.availableBalance <= 0) {
            toast.error('Insufficient balance for payout.');
            return;
        }
        toast.info('Payout request feature coming soon! You will be able to withdraw ₹' + stats.availableBalance);
    };

    return (
        <div className="supplier-portal-layout">
            <SupplierSidebar />
            <div className="portal-main-content animate-fade-in">
                <header className="page-header">
                    <div>
                        <h1 className="page-title">Payments & Earnings</h1>
                        <p className="page-subtitle">Track your revenue and transaction history</p>
                    </div>
                    <button className="btn-primary" onClick={handleRequestPayout}>
                        <FaFileInvoiceDollar /> Request Payout
                    </button>
                </header>

                {/* Stats Cards */}
                <div className="kpi-grid">
                    <div className="kpi-card">
                        <div className="kpi-top">
                            <span className="kpi-label">Total Earnings</span>
                            <div className="kpi-icon-bg green"><FaMoneyBillWave /></div>
                        </div>
                        <div className="kpi-value">₹{stats.totalEarnings.toLocaleString()}</div>
                        <div className="kpi-trend positive">
                            <FaArrowUp /> Lifetime
                        </div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-top">
                            <span className="kpi-label">Available Balance</span>
                            <div className="kpi-icon-bg blue"><FaMoneyBillWave /></div>
                        </div>
                        <div className="kpi-value">₹{stats.availableBalance.toLocaleString()}</div>
                        <div className="kpi-trend neutral">
                            Ready for payout
                        </div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-top">
                            <span className="kpi-label">Pending Payouts</span>
                            <div className="kpi-icon-bg orange"><FaHistory /></div>
                        </div>
                        <div className="kpi-value">₹{stats.pendingPayouts.toLocaleString()}</div>
                        <div className="kpi-trend negative">
                            Processing
                        </div>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="content-card">
                    <div className="card-header">
                        <h3>Transaction History</h3>
                    </div>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th>Type</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center">Loading...</td></tr>
                                ) : transactions.length > 0 ? (
                                    transactions.map((tx) => (
                                        <tr key={tx.id}>
                                            <td>{tx.date}</td>
                                            <td>{tx.description}</td>
                                            <td>
                                                <span className={`status-badge ${tx.type === 'credit' ? 'status-confirmed' : 'status-pending'}`}>
                                                    {tx.type === 'credit' ? 'Credit' : 'Debit'}
                                                </span>
                                            </td>
                                            <td className={tx.type === 'credit' ? 'text-green' : 'text-red'}>
                                                {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                            </td>
                                            <td>
                                                <span className={`status-badge status-${tx.status}`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" className="text-center">No transactions found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentsManagement;
