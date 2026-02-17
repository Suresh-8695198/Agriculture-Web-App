import React, { useState } from 'react';
import { FaWallet, FaPlus, FaArrowUp, FaArrowDown, FaHistory } from 'react-icons/fa';
import { MdAccountBalance } from 'react-icons/md';
import './FarmerPages.css';

const Wallet = () => {
    const [balance] = useState(15750);
    const [showAddMoney, setShowAddMoney] = useState(false);

    const transactions = [
        {
            id: 1,
            type: 'credit',
            description: 'Payment received for Paddy Rice',
            amount: 12500,
            date: '2024-02-15',
            time: '10:30 AM'
        },
        {
            id: 2,
            type: 'debit',
            description: 'Purchase: Organic Fertilizer',
            amount: 1700,
            date: '2024-02-15',
            time: '02:15 PM'
        },
        {
            id: 3,
            type: 'debit',
            description: 'Rental: Heavy Duty Tractor',
            amount: 4000,
            date: '2024-02-16',
            time: '09:00 AM'
        },
        {
            id: 4,
            type: 'credit',
            description: 'Payment received for Fresh Tomatoes',
            amount: 8000,
            date: '2024-02-16',
            time: '04:45 PM'
        },
        {
            id: 5,
            type: 'debit',
            description: 'Purchase: Rice Seeds',
            amount: 6000,
            date: '2024-02-17',
            time: '11:20 AM'
        }
    ];

    return (
        <div className="farmer-content-container">
            <div className="farmer-page-header">
                <h1 className="farmer-page-title">
                    <FaWallet style={{ color: '#43A047' }} />
                    Wallet & Payments
                </h1>
                <p className="farmer-page-description">
                    Manage your finances and transaction history
                </p>
            </div>

            <div className="wallet-layout">
                <div className="wallet-cards">
                    <div className="balance-card">
                        <div className="balance-header">
                            <MdAccountBalance className="balance-icon" />
                            <span>Current Balance</span>
                        </div>
                        <div className="balance-amount">₹{balance.toLocaleString()}</div>
                        <div className="balance-actions">
                            <button className="add-money-btn" onClick={() => setShowAddMoney(true)}>
                                <FaPlus /> Add Money
                            </button>
                            <button className="withdraw-btn">
                                <FaArrowUp /> Withdraw
                            </button>
                        </div>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card-wallet earning">
                            <div className="stat-header">
                                <FaArrowDown className="stat-icon" />
                                <span>Total Earnings</span>
                            </div>
                            <div className="stat-value">₹20,500</div>
                            <div className="stat-label">This Month</div>
                        </div>
                        <div className="stat-card-wallet spending">
                            <div className="stat-header">
                                <FaArrowUp className="stat-icon" />
                                <span>Total Spending</span>
                            </div>
                            <div className="stat-value">₹11,700</div>
                            <div className="stat-label">This Month</div>
                        </div>
                    </div>
                </div>

                <div className="transactions-section">
                    <div className="transactions-header">
                        <h2><FaHistory /> Recent Transactions</h2>
                        <button className="view-all-btn">View All</button>
                    </div>
                    <div className="transactions-list">
                        {transactions.map(transaction => (
                            <div key={transaction.id} className={`transaction-item ${transaction.type}`}>
                                <div className="transaction-icon">
                                    {transaction.type === 'credit' ? <FaArrowDown /> : <FaArrowUp />}
                                </div>
                                <div className="transaction-details">
                                    <h4>{transaction.description}</h4>
                                    <p className="transaction-date">{transaction.date} • {transaction.time}</p>
                                </div>
                                <div className={`transaction-amount ${transaction.type}`}>
                                    {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showAddMoney && (
                <div className="form-modal">
                    <div className="form-card">
                        <h2>Add Money to Wallet</h2>
                        <form>
                            <div className="form-group">
                                <label>Amount (₹)</label>
                                <input type="number" placeholder="Enter amount" min="100" />
                            </div>
                            <div className="form-group">
                                <label>Payment Method</label>
                                <select>
                                    <option>UPI</option>
                                    <option>Net Banking</option>
                                    <option>Debit Card</option>
                                    <option>Credit Card</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="farmer-btn-secondary" onClick={() => setShowAddMoney(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="farmer-btn-primary">
                                    Add Money
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Wallet;
