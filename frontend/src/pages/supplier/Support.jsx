import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaQuestionCircle, FaPlus, FaTicketAlt, FaSpinner, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import api from '../../api/axios';
import SupplierSidebar from '../../components/SupplierSidebar';
import '../SupplierPortal.css';
import { toast } from 'react-toastify';

const Support = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showNewTicketForm, setShowNewTicketForm] = useState(false);

    const [newTicket, setNewTicket] = useState({
        subject: '',
        message: '',
        priority: 'medium'
    });

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await api.get('/support/tickets/');
            setTickets(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
            // toast.error('Failed to load support tickets');
            setLoading(false);
        }
    };

    const handleSubmitTicket = async (e) => {
        e.preventDefault();
        if (!newTicket.subject || !newTicket.message) {
            toast.error('Please fill in all required fields.');
            return;
        }

        try {
            setSubmitting(true);
            const response = await api.post('/support/tickets/', newTicket);
            toast.success('Support ticket created successfully!');
            setTickets([response.data, ...tickets]);
            setNewTicket({ subject: '', message: '', priority: 'medium' });
            setShowNewTicketForm(false);
            setSubmitting(false);
        } catch (error) {
            console.error('Failed to create ticket:', error);
            toast.error('Failed to submit ticket');
            setSubmitting(false);
        }
    };

    const TicketItem = ({ ticket }) => {
        const [expanded, setExpanded] = useState(false);

        return (
            <div className={`ticket-item ${expanded ? 'expanded' : ''}`} style={{
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                marginBottom: '1rem',
                backgroundColor: 'white',
                overflow: 'hidden'
            }}>
                <div
                    className="ticket-header"
                    onClick={() => setExpanded(!expanded)}
                    style={{
                        padding: '1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        backgroundColor: '#f9fafb'
                    }}
                >
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div className={`status-badge status-${ticket.status}`} style={{ textTransform: 'capitalize' }}>
                            {ticket.status.replace('_', ' ')}
                        </div>
                        <div>
                            <h4 style={{ margin: 0, color: '#111827' }}>{ticket.subject}</h4>
                            <small style={{ color: '#6B7280' }}>ID: {ticket.ticket_id} • {new Date(ticket.created_at).toLocaleDateString()}</small>
                        </div>
                    </div>
                    <div>
                        {expanded ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                </div>

                {expanded && (
                    <div className="ticket-body" style={{ padding: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <strong style={{ color: '#374151', display: 'block', marginBottom: '0.25rem' }}>Your Message:</strong>
                            <p style={{ color: '#4B5563', whiteSpace: 'pre-wrap' }}>{ticket.message}</p>
                        </div>

                        {ticket.admin_response && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '1rem',
                                backgroundColor: '#f0fdf4',
                                borderRadius: '0.5rem',
                                border: '1px solid #bbf7d0'
                            }}>
                                <strong style={{ color: '#166534', display: 'block', marginBottom: '0.25rem' }}>Support Response:</strong>
                                <p style={{ color: '#15803d', margin: 0 }}>{ticket.admin_response}</p>
                            </div>
                        )}

                        {!ticket.admin_response && (
                            <div style={{ marginTop: '1rem', fontStyle: 'italic', color: '#9CA3AF' }}>
                                Awaiting response from support team...
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="supplier-portal-layout">
            <SupplierSidebar />
            <div className="portal-main-content animate-fade-in">
                <header className="page-header">
                    <div>
                        <h1 className="page-title">Support & Help</h1>
                        <p className="page-subtitle">Get assistance with your account or orders</p>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={() => setShowNewTicketForm(!showNewTicketForm)}
                    >
                        {showNewTicketForm ? 'Cancel' : <><FaPlus /> New Ticket</>}
                    </button>
                </header>

                {showNewTicketForm && (
                    <div className="content-card mb-4 animate-fade-in">
                        <div className="card-header">
                            <h3>Create New Support Ticket</h3>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmitTicket}>
                                <div className="form-group">
                                    <label>Subject</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Briefly describe your issue"
                                        value={newTicket.subject}
                                        onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Priority</label>
                                    <select
                                        className="form-control"
                                        value={newTicket.priority}
                                        onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                                    >
                                        <option value="low">Low - General Question</option>
                                        <option value="medium">Medium - Standard Issue</option>
                                        <option value="high">High - Urgent Issue</option>
                                        <option value="critical">Critical - System Failure</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Message</label>
                                    <textarea
                                        className="form-control"
                                        rows="5"
                                        placeholder="Detailed explanation of your problem..."
                                        value={newTicket.message}
                                        onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                                        required
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={submitting}
                                >
                                    {submitting ? <><FaSpinner className="spin" /> Submitting...</> : 'Submit Ticket'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                <div className="content-grid">
                    <div className="content-card" style={{ gridColumn: '1 / -1' }}>
                        <div className="card-header">
                            <h3><FaTicketAlt /> My Support Tickets</h3>
                        </div>
                        <div className="card-body">
                            {loading ? (
                                <div className="text-center p-4">Loading tickets...</div>
                            ) : tickets.length > 0 ? (
                                <div className="tickets-list">
                                    {tickets.map((ticket) => (
                                        <TicketItem key={ticket.id} ticket={ticket} />
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state text-center p-5">
                                    <FaQuestionCircle size={48} color="#D1D5DB" />
                                    <h3 style={{ marginTop: '1rem', color: '#374151' }}>No Support Tickets</h3>
                                    <p style={{ color: '#6B7280' }}>You haven't raised any support requests yet.</p>
                                    <button
                                        className="btn-secondary mt-3"
                                        onClick={() => setShowNewTicketForm(true)}
                                    >
                                        Raise a Ticket
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Support;
